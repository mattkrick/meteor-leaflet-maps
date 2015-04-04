# meteor-leaflet-maps
Leaflet, now with lazy loading &amp; namespacing!

### Reasons to use:
 - Pulls files from the leaflet CDN, not your local copy
 - Can choose different versions manually (great in case I'm slow to update or if there's a regression)
 - Only loads when you need it
 - Supports multiple maps
 - Gives you a namespace to store markers change the map from a different file, etc.
 - Obviates the need for a `window.onload`

### Credits
 - This is basically a rip-off of DBurles' GoogleMaps, but with a couple perks. That, and it's for leaflet.

### Installation
    $ meteor add mattkrick:leaflet-maps

### Loading Scripts
Loading js & css when you don't need it isn't cool. Now, you can load it the first time it's called.

    var options = {version: '0.7.0'}; //optional, defaults to current version of 0.7.3
    Router.onBeforeAction(function() {
      leafletMaps.load({options});
      this.next();
    }, { only: ['routeOne', 'routeTwo'] });

You can check if the script is loaded by typing this in the console: `leafletMaps.isLoaded.get();`

### Putting it in a template
    {{>leafletMap name="exampleMap" options=leafletOptions}}
`name` is the namespace.

`options` includes, things like your tileLayer, latLng (optional), and zoom (optional)

You can always find your map globally at `leafletMaps.maps.name`.

Your map object has 2 properties. `instance` and `options`.

Make sure the parent Div has a height & width!

#### Creating a helper
Personally, I like to create a global helper so I can use the same basic options for all my maps. It looks like this:

    Template.registerHelper('leafletOptions', function() {
      if (leafletMaps && leafletMaps.isLoaded.get()) { //only necessary if you use an `L` method
        return {
          tileLayer: L.tileLayer('https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={token}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            subdomains: ['a','b','c','d'],
            mapId: 'Username.MapID',
            token: 'IAlwaysThoughtItWasOddToCallAuthorizationKeysTokens'
          }),
          center: [40,-122], //Remember, it's lat, then lng. Doesn't conform to geoJSON standards!
          zoom: 13
        };
      }
    });
### Workin' it
The magic happens inside a `ready` callback. `ready` means the scripts have been downloaded, loaded, and the map template has been rendered.
That means the map fully loads all its tiles, all the time. No race conditions, no ugly `window.onload`, and you can load as many maps as you want.

    Template.spots.onRendered(function() {
      leafletMaps.ready('exampleMap', function (map) {
        Spots.find().observeChanges({
          added: function (id, fields) {
            console.log(fields);
            L.marker(flipCoords(fields.loc.coordinates)).addTo(map.instance);
          }
        });
      });
    });

### License
MIT
