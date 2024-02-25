define(
[
	'jquery',
	'underscore',
	'backbone',
	'Controllers/TravelController',
  'Controllers/MoonMenuController',
	'Modules/TemplateLoader',
  'Models/Planet',
  'Models/Moon'
],
function(
  $,
  _,
  Backbone,
  TravelController,
  MoonMenuController,
  TemplateLoader,
  Planet,
  Moon,
  MoonData
) {
  'use strict';

  const ORBIT_COLOR_DEFAULT = '#000000';
  const ORBIT_COLOR_HIGHLIGHT = '#FFFFFF';
  const ORBIT_COLOR_ACTIVE = '#FF0000';

  return Backbone.View.extend({
    events: {
      'click a[data-id]': 'onClick',
      'mouseenter a[data-id]': 'onMouseEnter',
      'mouseleave a[data-id]': 'onMouseLeave'
    },

    initialize: function(options) {
      this.scene = options.scene || null;
      this.camera = this.scene ? this.scene.camera : null;
      this.data = options.data || {};
      this.sceneObjects = options.sceneObjects || [];
      this.travelController = new TravelController(this.scene);
      this.templateLoader = new TemplateLoader();
      this.moonDataModel = null;
      this.isTraveling = false;
      this.hasTraveled = false;
      this.currentTarget = options.currentTarget || this.sceneObjects[0];
      this.template = this.templateLoader.get('planets', 'src/app/Views/menu.twig').then((template)=> {
        this.template = template;
        this.render();
        this.initializePlugins();
        this.initializeListeners();

        this.moonMenuController = new MoonMenuController({
          el: $('#moons'),
          scene: this.scene,
          data: this.data,
          sceneObjects: this.sceneObjects.moons
        });
      });
    },

    initializePlugins: function() {
      this.accordion = new Foundation.Accordion(this.$('.accordion'), { allowAllClosed: true });
    },

    render: function() {
      this.$el.html(this.template.render({ planets: this.data.planets }));
    },

    onClick: function(e) {

      console.log("Here")
      var id = Number.parseInt(e.currentTarget.dataset.id);
      var target = this.matchTarget(id);



      if (this.isCurrentTarget(target)) {
        e.stopImmediatePropagation();
        return false;
      }

      this.travelToObject(target);
      
      console.log("Here")

      if (target.name === 'Mercury') {
        // Trigger the overlay function when the condition is met
        this.showOverlay();
        setTimeout(delayedFunction, 10000);
      } 
    },

    showOverlay: function() {
      // Code to overlay the page with another page
      // For example, you can add a div element with a high z-index to cover the entire page and display another page within it
      var overlayDiv = document.createElement('div');
      overlayDiv.style.position = 'fixed';
      overlayDiv.style.top = '0';
      overlayDiv.style.left = '0';
      overlayDiv.style.width = '100%';
      overlayDiv.style.height = '100%';
      overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlayDiv.style.zIndex = '9999';
      overlayDiv.innerHTML = '<iframe id="overlayFrame" src="src/app/Controllers/html/m.html" style="width: 100%; height: 100%; border: none;"></iframe>'; // Change overlayPage.html to the desired overlay page URL
      document.body.appendChild(overlayDiv);
    
      // Close the overlay after 10 seconds
      setTimeout(function() {
        var overlayFrame = document.getElementById('overlayFrame');
        overlayFrame.parentNode.removeChild(overlayFrame); // Remove the overlay iframe
        overlayDiv.parentNode.removeChild(overlayDiv); // Remove the overlay div
      }, 10000); // 10 seconds in milliseconds
    },
    

    onMouseEnter: function(e) {
      var id = Number.parseInt(e.currentTarget.dataset.id);
      var target = this.matchTarget(id);

      if (this.isCurrentTarget(target)) {
        if (!this.isTraveling) {
          this.highlightTarget(target);
        }

        return true;
      }

      this.highlightObject(e);
    },

    onMouseLeave: function(e) {
      var id = Number.parseInt(e.currentTarget.dataset.id);
      var target = this.matchTarget(id);

      if (this.isCurrentTarget(target)) {
        if (!this.isTraveling) {
          this.unhighlightTarget(target);
        }

        return true;
      }

      this.unhighlightObject(e);
    },

    travelToObject: function(target) {
      // Return old target to default orbit line color
      if (this.currentTarget && this.currentTarget.orbitLine) {
        this.currentTarget.orbitLine.orbit.material.color = new THREE.Color(ORBIT_COLOR_DEFAULT);
      }

      // Change new target orbit line color
      target.orbitLine.orbit.material.color = new THREE.Color(ORBIT_COLOR_ACTIVE); // same color as hover and active state
      target.orbitLine.orbit.material.needsUpdate = true;

      this.travelController.travelToObject(
        this.scene.camera.parent.position,
        target,
        target.threeDiameter * 2.5
      );

      this.currentTarget = target;
    },

    matchTarget: function(id) {
      var target = null;

      for (var i = 0; i < this.sceneObjects.planets.length; i++) {
        if (this.sceneObjects.planets[i].id === id) {
          return this.sceneObjects.planets[i];
      	}
      }

      return target;
    },

    isCurrentTarget: function(target) {
      return this.currentTarget && _.isEqual(this.currentTarget.id, target.id);
    },

  	highlightObject: function(e) {
		  var target = this.matchTarget(Number.parseInt(e.currentTarget.dataset.id));

      this.highlightTarget(target);
      this.highlightOrbit(target);
    },

    unhighlightObject: function(e) {
      var target = this.matchTarget(Number.parseInt(e.currentTarget.dataset.id));

      this.unhighlightTarget(target);
      this.unhighlightOrbit(target);
    },

    highlightTarget: function(target) {
      var distanceTo = this.scene.camera.position.distanceTo(target.threeObject.position);
      var highlightDiameter = distanceTo * 0.011; // 1.1% of distance to target

      target.highlight = highlightDiameter;
      target.highlight.material.opacity = 0.9;
    },

    highlightOrbit: function(target) {
      var hightlightColor = '#197eaa'; // target.orbitHighlightColor || #216883

      target.orbitLine.orbit.material.color = new THREE.Color(ORBIT_COLOR_HIGHLIGHT); // new THREE.Color('#d3d3d3');
      target.orbitLine.orbit.material.needsUpdate = true;
    },

    unhighlightTarget: function(target) {
      target.core.remove(target.highlight);
    },

    unhighlightOrbit: function(target) {
      target.orbitLine.orbit.material.color = new THREE.Color(ORBIT_COLOR_DEFAULT);
      target.orbitLine.orbit.material.needsUpdate = true;
    },

    initializeListeners: function() {
      document.addEventListener('solarsystem.travel.planet.start', this.handleTravelStart.bind(this));
      document.addEventListener('solarsystem.travel.planet.complete', this.handleTravelComplete.bind(this));
      document.addEventListener('solarsystem.focalpoint.change', this.handleTravelComplete.bind(this));
    },

    handleTravelStart: function(e) {
      this.isTraveling = true;

      $('#current-target-title').removeClass('active').html('');
    },

    handleTravelComplete: function(e) {
      var object = e.detail;

      $('#current-target-title').html(object.name).addClass('active');

      this.moonMenuController.setModel(object._moons);
      this.isTraveling = false;
    }
  });
});
