leafletMaps = {
  load: _.once(function (options) {
    options = options || {};
    var version = options.version || '0.7.3';

    var leafletCSS = document.createElement('link');
    leafletCSS.setAttribute('rel', 'stylesheet');
    leafletCSS.setAttribute('type', 'text/css');

    var leafletJS = document.createElement('script');
    if (options.local) {
      leafletCSS.setAttribute('href', '/leaflet/leaflet.css');
      leafletJS.src = '/leaflet/leaflet.js';
    } else {
      leafletCSS.setAttribute('href', 'http://cdn.leafletjs.com/leaflet-' + version + '/leaflet.css');
      leafletJS.src = 'http://cdn.leafletjs.com/leaflet-' + version + '/leaflet.js';
    }
    document.head.appendChild(leafletCSS);
    document.head.appendChild(leafletJS);

    leafletJS.onload = function () {
      loadPlugins(options);
    };
  }),
  //external JS loaded
  isLoaded: new ReactiveVar(false),
  //dict of map templates created
  isCreated: new ReactiveDict(),
  maps: {},
  markers: {},
  ready: function (name, cb) {
    if (_.isFunction(cb)) {
      var self = this;
      Tracker.autorun(function () {
        if (leafletMaps.isCreated.get(name)) {
          cb(self.maps[name]);
        }
      });
    }
  }
};

function loadPlugins(options) {
  var pluginRoot = options.pluginRoot || '/leaflet/plugins/';
  var pluginsDict = getPlugins();
  var i, pluginJS, pluginCSS;
  var cssFiles = [];
  var jsFiles = [];
  console.log(pluginsDict);
  for (i = 0; i < options.plugins.length; i++) {
    var plugin = options.plugins[i];
    if (!pluginsDict[plugin]) {
      throw new Meteor.Error("leafletMaps - Unknown plugin: " + plugin);
    }
    cssFiles = cssFiles.concat(pluginsDict[plugin].cssFiles);
    jsFiles = jsFiles.concat(pluginsDict[plugin].jsFiles);
    console.log(jsFiles);
  }
  for (i = 0; i < cssFiles.length; i++) {
    pluginCSS = document.createElement('link');
    pluginCSS.setAttribute('rel', 'stylesheet');
    pluginCSS.setAttribute('type', 'text/css');
    pluginCSS.setAttribute('href', pluginRoot + cssFiles[i]);
    document.head.appendChild(pluginCSS);
  }
  for (i = 0; i < jsFiles.length; i++) {
    pluginJS = document.createElement('script');
    pluginJS.src = pluginRoot + jsFiles[i];
    console.log(pluginJS);
    document.head.appendChild(pluginJS);
  }
  pluginJS.onload = function () {
    leafletMaps.isLoaded.set(true);
  };
}

function getPlugins() {
  return {
    awesomeMarkers: {
      cssFiles: ['leaflet.awesome-markers.css'],
      jsFiles: ['leaflet.awesome-markers.js']
    },
    markerCluster: {
      cssFiles: ['MarkerCluster.css', 'MarkerCluster.Default.css'],
      jsFiles: ['leaflet.markercluster-src.js']
    }
  };
}

Template.leafletMap.onRendered(function () {
  var self = this;
  self.autorun(function (comp) {
    if (leafletMaps.isLoaded.get()) {
      //console.log('loading leafletmap');
      var data = Template.currentData();
      if (!data.name)
        throw new Meteor.Error("leafletMaps - Missing argument: name");
      if ($.isEmptyObject(data.options))
        throw new Meteor.Error("leafletMaps - Missing argument: options");
      if (!(data.options instanceof Object))
        throw new Meteor.Error("leafletMaps - options argument is not an object");
      var curMap = leafletMaps.maps[data.name] = {
        instance: window.L.map('leaflet-map'),
        options: data.options
      };
      curMap.options.tileLayer.addTo(curMap.instance);
      data.options = data.options || {};
      if (data.options.center && data.options.zoom) curMap.instance.setView(data.options.center, data.options.zoom);
      leafletMaps.isCreated.set(data.name, true);
      comp.stop();
    }
  });
});
