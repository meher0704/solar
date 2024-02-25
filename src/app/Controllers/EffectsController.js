define(
[
    'jquery',
    'underscore',
    'backbone',
    'Modules/TemplateLoader'
],
function($, _, Backbone, TemplateLoader) {

  return Backbone.View.extend({
    initialize: function(options) {
      this.sceneObjects = options.sceneObjects || [];

        for (var i = 0; i < this.sceneObjects.length; i++) {
          var moons = this.sceneObjects[i]._moons;

          for (var n = 0; n < moons.length; n++) {
            var randomColor = '#'+ (Math.random().toString(16) + '000000').slice(2, 8);

            moons[n]._orbitLine.orbit.material.color = new THREE.Color(randomColor);
          }
        }
    },
  });
});
