Tinytest.add('leafletMaps is defined', function(test) {
    test.isNotUndefined(leafletMaps);
});

Tinytest.add('leafletMaps.addPlugins(plugins) should throw if plugins arg \
IS NOT an object', function(test) {
  test.throws(function() { leafletMaps.addPlugins([]) }, 'plugins-must-be-object');
  test.throws(function() { leafletMaps.addPlugins('') }, 'plugins-must-be-object');
});

Tinytest.add('leafletMaps.addPlugins(plugins) should NOT throw if plugins arg \
IS an object', function(test) {
  test.isUndefined(leafletMaps.addPlugins({}));
});

// XXX Throws exception on console but tinytest says it doesn't throw any error
//
//Tinytest.addAsync('leafletMaps.addPlugins(plugins) should throw if plugin \
//not defined', function(test, done) {
  //leafletMaps.isLeafletLoaded = false;
  //Meteor.settings.leafletMaps.plugins = { plugin1: {}, plugin3: {} };

  //var options = {
    //version: '0.7.3', 
    //local: false, 
    //plugins: ['plugin2']
  //};

  //setTimeout(function() {
      //test.throws(function() { leafletMaps.load(options); }, 'plugin-not-defined');
      //done();
  //}, 1000);
//});

Tinytest.addAsync('leafletMaps.addPlugins(plugins) will throw if called after \
leafletMaps.load()', function(test, done) {
    leafletMaps.isLeafletLoaded = false;
    leafletMaps.load({});

    // Wait a long time for script's onload event
    setTimeout(function() {
      test.throws(function() { leafletMaps.addPlugins({}) }, 'plugins-must-load-before-leaflet');
      done();
    }, 1000);

});
