# WargamingStats

A Twitch Extension for displaying Wargaming Statistics

[Twitch Dev Rig](https://github.com/twitchdev/developer-rig#getting-started)

Put 127.0.0.1 localhost.rig.twitch.tv into /etc/hosts and run yarn install in developer-rig folder

In another terminal -- hosts frontend
`yarn host -d [local_dir] -p [port]`

Below line starts the GUI to see panels
`EXT_CLIENT_ID=<client id> EXT_SECRET=<secret> EXT_VERSION=<version> EXT_CHANNEL=<channel> EXT_OWNER_NAME=<owner> yarn start`

Another terminal -- EBS (backend)
`cd src && sudo docker-compose up --build`

Make sure there are security certs in the ssl folder of developer-rig and your extension

Create an appid.js file in src/backend
`const app_id = 'xxxxxx';`
`exports.app_id = app_id;`