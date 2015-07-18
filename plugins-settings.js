if (_.isUndefined(Meteor.settings))
  Meteor.settings = {};

// Those are the default plugin settings shipped with the package.
// You can overwrite those by directly overwriting 
// Meteor.settings.leafletMaps.plugins.name or by using leaflet.addPugins(pluginObj),
// ALWAYS before leafletMaps.load()
_.defaults(Meteor.settings, {
  leafletMaps: { 
    plugins: {
      omnivore: {
        cssFiles: [],
        jsFiles: ['Omnivore/leaflet-omnivore.min.js']
      },
      awesomeMarkers: {
        cssFiles: ['AwesomeMarkers/leaflet.awesome-markers.css'],
        jsFiles: ['AwesomeMarkers/leaflet.awesome-markers.js']
      },
      markerCluster: {
        cssFiles: ['MarkerCluster/MarkerCluster.css', 'MarkerCluster/MarkerCluster.Default.css'],
        jsFiles: ['MarkerCluster/leaflet.markercluster-src.js']
      }
    }
  }
});
