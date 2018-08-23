"use strict";

/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser');
const request = require('sync-request');
const app_id = require('./appid');
const app = express();

app.use((req, res, next) => {
  console.log('Got request', req.path, req.method);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return next();
});

app.use(express.static('../frontend'));

app.use(bodyParser.json());

app.get("/:userID/config", (req, res, next) => {

  if (!fs.existsSync(req.params['userID'] + '.json')) {
    res.status(404);
    return;
  }

  fs.readFile(req.params['userID'] + '.json', 'utf8', (err, data) => {
    if (err) throw err;
    console.log(data);
    res.status(200);
    res.send(data);
  });

});

app.post("/:userID/config", (req, res, next) => {

  fs.writeFile(req.params['userID'] + '.json', JSON.stringify(req.body), (err) => {
    if (err) throw err;
    console.log("Saved!");
    res.status(200);
  });

});

app.get("/:userID/stats", (req, res, next) => {

  console.log(req.params['userID'] + ' GET');

  if (!fs.existsSync(req.params['userID'] + '.json')) {
    res.status(404);
    return;
  }

  // get platform from readFile
  var json = fs.readFileSync(req.params['userID'] + '.json', 'utf8');
  json = JSON.parse(json);

  // go to wargaming api
  let game = '';
  switch (json["profile"]["game"]) {
    case "wot":
      game = "worldoftanks";
      break;
    case "wows":
      game = "worldofwarships";
      break;
  }

  let server = '';
  switch (json["profile"]["server"]) {
    case "na":
      server = "com";
      break;
    case "ru":
      server = "ru";
      break;
    case "eu":
      server = "eu";
      break;
    case "as":
      server = "asia";
      break;
  }


  let account = `https://api.${game}.${server}/${json["profile"]["game"]}/account/list/?application_id=${app_id.app_id}&search=${json["profile"]["name"]}`;
  
  // return player data
  let player_data = getData(account);

  if ( player_data["status"] != "ok" ) {
    res.status(player_data["error"]["code"]);
    res.send(player_data["error"]["message"]);
    return;
  }

  let account_id = player_data["data"][0]["account_id"];
  let info = `https://api.${game}.${server}/${json["profile"]["game"]}/account/info/?application_id=${app_id.app_id}&account_id=${account_id}`;
  let account_info = getData(info);

  if ( account_info["status"] != "ok") {
    res.status(account_info["error"]["code"]);
    res.send(account_info["error"]["message"]);
  }

  let season_api = `https://api.${game}.${server}/${json["profile"]["game"]}/globalmap/seasons/?application_id=${app_id.app_id}`;
  let current_season = getData(season_api);

  if ( current_season["status"] != "ok") {
    res.status(current_season["error"]["code"]);
    res.send(current_season["error"]["message"]);
  }

  let data = {
    "global_rating": account_info["data"][`${account_id}`]["global_rating"],
    "statistics": account_info["data"][`${account_id}`]["statistics"],
    "selectedRegion": `${json["profile"]["server"]}`,
    "season": current_season["data"][0]["season_name"],
    "playerName": `${json["profile"]["name"]}`
  };
  
  res.status(200);
  res.send(data);
});

function getData(api) {
  return JSON.parse(request('GET', api).getBody());
}

let options = {
  key: fs.readFileSync('/src/certs/testing.key'),
  cert: fs.readFileSync('/src/certs/testing.crt')
};

const PORT = 8080;
https.createServer(options, app).listen(PORT, function () {
  console.log('Extension Boilerplate service running on https', PORT);
});