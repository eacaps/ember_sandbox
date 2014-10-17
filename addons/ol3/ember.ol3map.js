function getMapHeight() {
	var windowHeight = $(window).height();
	return windowHeight;
}

if('undefined' === typeof Ol3Map) {
	Ol3Map = Ember.Application.create();
	Ol3Map.IndexView = Ember.View.extend({});
}

Ol3Map.Ol3MapController = Ember.Controller.extend({
	actions: {
		zoomToObject: function(object, type) {
			if(type == "layer") {
				var map = this.get('map');
				var vectorsource = object.getSource();
				var view = map.getView();
				view.fitExtent(vectorsource.getExtent(), map.getSize());
			} else if(tupe == "geom") {
				var map = this.get('map');
				var view = map.getView();
				view.fitExtent(object.getExtent(), map.getSize());
			}
		}
	}
})

Ol3Map.Ol3MapView = Ember.View.extend({
	didInsertElement: function() {
		var self = this;
		
		var height = getMapHeight();
		this.get('element').style['height'] = height + "px";
		$(window).resize(function() {
			self.get('element').style['height'] = getMapHeight() + "px";
			self.get('element').style['width'] = $(window).width() + "px";
		})
		if(this.get('element').style['width'] == '') {
			self.get('element').style['width'] = $(window).width() + "px";
		}
		
		var parentcontroller = this.controller.parentController;
		
		var mlon = parentcontroller.lon ? parentcontroller.lon : 0;
		var mlat = parentcontroller.lon ? parentcontroller.lat : 0;
		var mzoom = parentcontroller.lon ? parentcontroller.zoom : 0;
		var mrotate = parentcontroller.lon ? parentcontroller.rotate : 0;
		
		var view = new ol.View({
			center: [mlon,mlat],
			zoom: mzoom,
			projection: 'EPSG:4326',
			rotation: mrotate
		});
		
		var layers = [
		  new ol.layer.Tile({
			source: new ol.source.TileWMS({
			  url: 'http://demo.opengeo.org/geoserver/wms',
			  params: {
				'LAYERS': 'ne:NE1_HR_LC_SR_W_DR'
			  }
			})
		  })
		];
		
		var map = new ol.Map({
			target: this.get('element'),
			view: view,
			layers: layers
		});
		
		map.addControl(new ol.control.ZoomSlider());
		
		map.on('moveend', function() {
			var view = map.getView();
			var center = view.getCenter();
			var zoom = view.getZoom();
		})
		
		map.on('pointermove', function() {
		});
		
		view.on('change:rotation', function(evt) {
			var view = evt.target;
			var rads = view.getRotation();
			self.controller.parentController.set('rotate', rotation);
		})
		
		this.controller.set('map', map);
	}
});