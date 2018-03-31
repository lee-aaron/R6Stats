/*

  Set Javascript specific to the extension configuration view in this file.

*/

//var ENDPOINT_BASE = 'https://twitch.tracker.network/r6';
//var ENDPOINT_BASE = 'https://localhost.twitch.tv:8000/r6';
var ENDPOINT_BASE = 'https://localhost';
Vue.http.options.root = ENDPOINT_BASE;

var app = new Vue({
  el: '#config',
  data: {
    initialized: false,
    twitch: {
      authorize: {
        channelId: '',
        clientId: '',
        token: '',
        userId: ''
      },
      context: null
    },
    profileNameLabel: 'Rainbow Six Siege Username',
    profile: {
      platform: 'uplay',
      name: ''
    },
    isSaving: false,
    error: null
  },
  mounted: function () {

  },
  watch: {
    'profile.platform': function (newVal, oldVal) {
      switch (newVal) {
        case 1:
          this.profileNameLabel = '';
          break;
        case 2:
          this.profileNameLabel = '';
          break;
        case 3:
          this.profileNameLabel = '';
          break;
      }
    },
    'twitch.authorize': function (newVal, oldVal) {
      // Set the Authorization Header.
      this.$http.headers.common['Authorization'] = 'Bearer ' + newVal.token;
      console.log("token", newVal.token);

      if (!this.initialized)
        this.initialize();
    }
  },
  methods: {
    initialize: function () {
      this.$http.get(this.twitch.authorize.channelId + '/config', {
        headers: {
          'Authorization': 'Bearer ' + this.twitch.authorize.token,
          'Content-Type': 'application/json'
        }
      }).then(
        response => {
          if (response.body.profile != undefined)
            this.profile = response.body.profile;
          this.initialized = true;
        },
        error => {
          this.error = 'Unable to retrieve your current Configuration.';
          this.initialized = true;
        }
      )
    },
    submitConfig: function (e) {
      var body = {
        "profile": this.profile
      }
      this.isSaving = true;
      this.$http.post(this.twitch.authorize.channelId + '/config', body, {
        headers: {
          'Authorization': 'Bearer ' + this.twitch.authorize.token,
          'Content-Type': 'application/json'
        }
      }).then(
        success => {
          setTimeout(() => this.isSaving = false, 500);
          this.error = null;
        },
        error => {
          setTimeout(() => this.isSaving = false, 500);
          this.error = 'Something went wrong while saving, try again.'
        }
      )
    },
    onTwitchError: function (error) {
      console.error("twitchError", error);
    },
  }
})

window.Twitch.ext.onAuthorized(function (auth) {
  console.log(auth);
});

window.Twitch.ext.onContext(function (context, contextFields) {
  console.log(context);
  console.log(contextFields);
});

window.Twitch.ext.onError(function (err) {
  console.error(err);
});