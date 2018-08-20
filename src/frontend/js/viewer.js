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
    rankStats: [],
    na: 0,
    sa: 0,
    as: 0,
    oc: 0,
    eu: 0
  },
  watch: {
    'twitch.authorize': function (newVal, oldVal) {
      if (!this.initialized)
        this.initialize();
    },
    selectedRegion: function() {     
      this.rankStats = this.data.Stats.filter(function(item) {
        return item.Region == this.app.selectedRegion && item.Season == this.app.data.defaultSeason; });

        this.na = this.data.Stats.filter(function(i) { return i.Region == 'na'; }).length;
        this.sa = this.data.Stats.filter(function(i) { return i.Region == 'sa'; }).length;
        this.as = this.data.Stats.filter(function(i) { return i.Region == 'as'; }).length;
        this.oc = this.data.Stats.filter(function(i) { return i.Region == 'oc'; }).length;
        this.eu = this.data.Stats.filter(function(i) { return i.Region == 'eu'; }).length;
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
              this.lastUpdated = new Date();
              this.data = response.body;
              if (!this.selectedRegion) {
                this.selectedRegion = response.body.selectedRegion;
                region = this.selectedRegion;
              }
              
              this.rankStats = response.body.Stats.filter(function(item) { return item.Region == region && item.Season == response.body.defaultSeason; });
              this.na = this.data.Stats.filter(function(i) { return i.Region == 'na'; }).length;
              this.sa = this.data.Stats.filter(function(i) { return i.Region == 'sa'; }).length;
              this.as = this.data.Stats.filter(function(i) { return i.Region == 'as'; }).length;
              this.oc = this.data.Stats.filter(function(i) { return i.Region == 'oc'; }).length;
              this.eu = this.data.Stats.filter(function(i) { return i.Region == 'eu'; }).length;
            } 
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
    getField: function(data, field) {
      if (data.Stats) {
        var field = data.Stats.filter(function(item) { return item.field == field })[0];
        return field;
      }
      return null;
    },
    getFieldDisplayValue: function(data, field) {
      if (data.Stats) {
        var field = this.getField(data,field);
        return field ? field.displayValue : '';
      }
      return '';
    },
    getFieldRank: function(data, field) {
      if (data.Stats) {
        var field = this.getField(data,field);
        return field && field.rank ? field.rank.toLocaleString() : '';
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
    },
    getPubgSeason: function(season) {
      switch(season) {
        case '2017-pre2':
          return 'Early Access #2';
        case '2017-pre3':
          return 'Early Access #3';
        default:
          return season;
      }
    },
    getPubgRegion: function(region) {
      switch(region) {
        case 'as':
          return 'Asia';
        case 'na':
          return 'North America';
        case 'eu':
          return 'Europe';
        case 'sa':
          return 'South America';
        case 'oc':
          return 'Oceania';
        case 'agg':
          return 'All Regions';
        default:
          return region;
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