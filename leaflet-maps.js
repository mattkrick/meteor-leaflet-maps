leafletMaps = {
  isLeafletLoaded: false,
  load: function (options) {
    var self = this;

    if(self.isLeafletLoaded) return true;

    var version = options.version || '0.7.3';
    options = options || {};

    var leafletCSS = document.createElement('link');
    leafletCSS.setAttribute('rel', 'stylesheet');
    leafletCSS.setAttribute('type', 'text/css');

    var leafletJS = document.createElement('script');
    if (options.local) {
      leafletCSS.setAttribute('href', '/leaflet/leaflet.css');
      leafletJS.src = '/leaflet/leaflet.js';
    } else {
      leafletCSS.setAttribute('href', 'http://cdn.leafletjs.com/leaflet-' 
        + version + '/leaflet.css');
      leafletJS.src = 'http://cdn.leafletjs.com/leaflet-' + version + '/leaflet.js';
    }
    document.head.appendChild(leafletCSS);
    document.head.appendChild(leafletJS);

    leafletJS.onload = function () {
      self.isLeafletLoaded = true;
      var load = loadPlugins(options);

      if(load && load.error)
        throw load;
    };
  },
  arePluginsLoaded: new ReactiveVar(false),
  isMapCreated: new ReactiveDict(),
  canSetOptions: function() {
    return this.arePluginsLoaded.get();
  },
  __pluginsReady: new ReactiveVar(0),
  maps: {},
  ready: function (name, cb) {
    if (_.isFunction(cb)) {
      var self = this;
      Tracker.autorun(function () {
        if (leafletMaps.isMapCreated.get(name) && leafletMaps.arePluginsLoaded.get()) {
          cb(self.maps[name]);
        }
      });
    }
  },
  addPlugins: function(plugins) {
    var self = this;

    if(! _.isObject(plugins) || _.isArray(plugins))
      throw new Meteor.Error('plugins-must-be-object', 
        'leafletMaps.addPlugins(plugins) requires plugins arg to be an object');

      if(self.arePluginsLoaded.get()) {
        throw new Meteor.Error('plugins-must-load-before-leaflet',
          'You must use leafletMaps.addPlugin() method before leafletMaps.load()'); 
      }

    _.extend(Meteor.settings.leafletMaps.plugins, plugins);
  }
};

function loadPlugins(options) {
  var pluginRoot = options.pluginRoot || '/leaflet/plugins/';
  var pluginsDict = getPlugins();
  var i, pluginCSS;
  var pluginJS = [];
  var cssFiles = [];
  var jsFiles = [];

  if(! options || ! options.plugins || options.plugins.length === 0) {
    leafletMaps.arePluginsLoaded.set(true);
    return;
  }

  for (i = 0; i < options.plugins.length; i++) {
    var plugin = options.plugins[i];
    if (! pluginsDict[plugin]) {
      return new Meteor.Error("plugin-not-defined", 
        "leafletMaps - Plugin: " + plugin + " does not exist on \
        Meteor.settings.leafletMaps.plugins object");
    }

    cssFiles = cssFiles.concat(pluginsDict[plugin].cssFiles);
    jsFiles = jsFiles.concat(pluginsDict[plugin].jsFiles);
  }

  for (i = 0; i < cssFiles.length; i++) {
    pluginCSS = document.createElement('link');
    pluginCSS.setAttribute('rel', 'stylesheet');
    pluginCSS.setAttribute('type', 'text/css');
    pluginCSS.setAttribute('href', pluginRoot + cssFiles[i]);

    document.head.appendChild(pluginCSS);
  }
  for (i = 0; i < jsFiles.length; i++) {
    pluginJS[i] = document.createElement('script');
    pluginJS[i].src = pluginRoot + jsFiles[i];

    pluginJS[i].onload = function() {
      var p = leafletMaps.__pluginsReady;
      p.set(p.get() + 1);      
    }

    document.head.appendChild(pluginJS[i]);
  }

  var pluginsFinishedLoad = Meteor.setInterval(function() {
    if(leafletMaps.__pluginsReady.get() === jsFiles.length) {
      Meteor.clearInterval(pluginsFinishedLoad);
      leafletMaps.arePluginsLoaded.set(true);
    }
  }, 10);
}

function getPlugins() {
  if(! Meteor.settings.leafletMaps.plugins) {
    throw new Meteor.Error("no-plugins-object", 
      "No plugins declaration found, you must define \
      plugins files at Meteor.settings.leafletMaps.plugins object. \
      Check package README for instruction");
  }
  return Meteor.settings.leafletMaps.plugins;
}

Template.leafletMap.onRendered(function () {
  var self = this;
  self.autorun(function (comp) {
    if (leafletMaps.arePluginsLoaded.get()) {
      var data = Template.currentData();
      if (! data.name)
        throw new Meteor.Error("missing-argument-name", "Missing argument: name");
      if ($.isEmptyObject(data.options))
        throw new Meteor.Error("missing-argument-options", "Missing argument: options");
      if (! (data.options instanceof Object))
        throw new Meteor.Error("options-must-be-object", "Options argument must be an object");
      var curMap = leafletMaps.maps[data.name] = {
        instance: window.L.map('leaflet-map'),
        options: data.options
      };
      curMap.options.tileLayer.addTo(curMap.instance);
      data.options = data.options || {};
      if (data.options.center && data.options.zoom) 
        curMap.instance.setView(data.options.center, data.options.zoom);

      leafletMaps.isMapCreated.set(data.name, true);
      comp.stop();
    }
  });
});
