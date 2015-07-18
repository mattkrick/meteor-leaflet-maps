Package.describe({
  name: 'mattkrick:leaflet-maps',
  version: '0.2.0',
  summary: 'Leaflet, now with lazy loading & namespacing!',
  git: 'https://github.com/mattkrick/meteor-leaflet-maps.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.1');
  api.use(['reactive-var','reactive-dict','underscore','templating'], 'client');
  api.addFiles([
    'leaflet-maps.html',
    'leaflet-maps.js'], 'client');
  api.export(['L','leafletMaps'], 'client');
});

Package.onTest(function(api) {
  api.use(['tinytest', 'test-helpers']);
  api.use('mattkrick:leaflet-maps');
  api.addFiles(['tests/client/leaflet-maps.js'], 'client');
});
