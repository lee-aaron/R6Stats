//var ENDPOINT_BASE = 'https://twitch.tracker.network/pubg';
var ENDPOINT_BASE = 'https://localhost.rig.twitch.tv:8080/';
Vue.http.options.root = ENDPOINT_BASE;

var app = new Vue({
  el: '#view',
  data: {
    state: 'loading',
    twitch: {
      authorize: {
        channelId: '',
        clientId: '',
        token: '',
        userId: ''
      },
      context: null
    },
    activeTab: 'stats',
    startTime: null,
    lastUpdated: null,
    selectedRegion: null,
    data: {},
    na: 0,
    eu: 0,
    as: 0,
    ru: 0
  },
  watch: {
    'twitch.authorize': function (newVal, oldVal) {
      if (!this.initialized)
        this.initialize();
    },
    selectedRegion: function() {
      this.na = this.data.selectedRegion == 'na' ? this.data.selectedRegion.length : 0;
      this.ru = this.data.selectedRegion == 'ru' ? this.selectedRegion.length : 0;
      this.as = this.data.selectedRegion == 'as' ? this.selectedRegion.length : 0;
      this.eu = this.data.selectedRegion == 'eu' ? this.selectedRegion.length : 0;
    }
  },
  computed: {
    platformName: function () {
      switch (this.player.PlatformId) {
        case 1:
          return 'Xbox';
        case 2:
          return 'PlayStation';
        case 3:
          return 'Steam';
        case 4:
          return 'Steam';
        default:
          return 'Unknown';
      }
    }
  },
  methods: {
    initialize: function () {
      this.$http.get(this.twitch.authorize.channelId + '/stats', {
        headers: {
          'Authorization': 'Bearer ' + this.twitch.authorize.token,
          'Content-Type': 'application/json'
        }
      }).then(
        response => {
          if (response.body != undefined) {
            // TEMPFIX: Sometimes the response is just a single player.
            if (response.body != null) {
              var region = this.selectedRegion;
              this.startTime = response.body.startTime || 'Now';
              this.lastUpdated = moment().format();
              this.data = response.body;
              if (!this.selectedRegion) {
                this.selectedRegion = response.body.selectedRegion;
                region = this.selectedRegion;
              }
            }
            console.log(this.data.statistics.all);
            this.state = 'loaded';
          } else {
            this.state = 'failed';
          }
        },
        error => {
          this.state = 'failed';
        }
        )
    },
    formatSeason: function(season) {
      return season
      .replace("_", " ")
      .replace(/^./, function(str){ return str.toUpperCase(); })
      .trim();
    },
    getField: function(data, field) {
      if (data) {
        return data[field.toLowerCase()];
      }
      return '';
    },
    changeTab: function (newTab) {
      this.activeTab = newTab;
    },
    onTwitchError: function (e) {
      console.error("onTwitchError", e);
    },
    onListenBroadcast: function(topic, contentType, message) {
      var response = JSON.parse(message).message;

      if (response && response.update) {
        this.initialize();
      }
    }
  },
  directives: {
    // Translates the given Date string into something human readable
    // e.g. 5 hours ago, 2 minutes ago.
    humanTime: function (el, binding) {
      var date = moment(binding.value).fromNow();
      el.innerText = date;
    },
    delta: function(el, binding) {
      if (binding.value) {
        if (binding.value > 0) {
          el.innerHTML  = "&#x25b2; " + Math.abs(parseInt(binding.value));
        } else if (binding.value < 0) {
          el.innerHTML  = "&#x25bc; " + Math.abs(parseInt(binding.value));
        }
      }
    },
    // Takes a string similar to "ThisIsAwesome" and converts it so it
    // says "This Is Awesome", good for User readability.
    camelPad: function(el, binding) {
      el.innerText = binding.value
        // Look for long acronyms and filter out the last letter
        .replace(/([A-Z]+)([A-Z][a-z])/g, ' $1 $2')
        // Look for lower-case letters followed by upper-case letters
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        // Look for lower-case letters followed by numbers
        .replace(/([a-zA-Z])(\d)/g, '$1 $2')
        .replace(/^./, function(str){ return str.toUpperCase(); })
        // Remove any white space left around the word
        .trim();
    }
  },
  components: {
    'ScaleLoader': VueSpinner.ScaleLoader
  }
});

Twitch.ext.onAuthorized(function (authorize) {
  app.twitch.authorize = authorize;
  console.log(authorize);
});

Twitch.ext.onContext(function (context) {
  app.twitch.context = context;
  console.log(context);
});

Twitch.ext.onError(function (e) {
  app.onTwitchError(e);
  console.log(e);
});

Twitch.ext.listen('broadcast', function (topic, contentType, message) {  
  app.onListenBroadcast(topic, contentType, message);
});