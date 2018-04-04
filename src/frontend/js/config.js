//var ENDPOINT_BASE = 'https://twitch.tracker.network/pubg';
var ENDPOINT_BASE = 'https://localhost:8080/pubg';
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

Twitch.ext.onAuthorized(function (authorize) {
  app.twitch.authorize = authorize;
  console.log("onAuthorized", authorize);
});

Twitch.ext.onContext(function (context) {
  app.twitch.context = context;
  console.log("onContext", context);
});

Twitch.ext.onError(function (e) {
  app.onTwitchError(e);
  console.log("onError", e);
});