leafletMaps = {
  load: _.once(function (options) {
    options = options || {};
    var version = options.version || '0.7.3';
    var leafletCSS = document.createElement('link');
    leafletCSS.setAttribute('rel', 'stylesheet');
    leafletCSS.setAttribute('type', 'text/css');
    leafletCSS.setAttribute('href', 'http://cdn.leafletjs.com/leaflet-' + version + '/leaflet.css');
    document.head.appendChild(leafletCSS);

    var leafletJS = document.createElement('script');
    leafletJS.src = 'http://cdn.leafletjs.com/leaflet-' + version + '/leaflet.js';
    leafletJS.onload = function () {
      leafletMaps.isLoaded.set(true);
    };
    document.head.appendChild(leafletJS);
  }),
  //external JS loaded
  isLoaded: new ReactiveVar(false),
  //dict of map templates created
  isCreated: new ReactiveDict(),
  maps: {},
  ready: function (name, cb) {
    if (_.isFunction(cb)) {
      var self = this;
      Template.instance().autorun(function () {
        if (leafletMaps.isCreated.get(name)) {
          cb(self.maps[name]);
        }
      });
    }
  }
};

Template.leafletMap.onRendered(function () {
  var self = this;
  self.autorun(function () {
    if (leafletMaps.isLoaded.get()) {
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
    }
  });
});


