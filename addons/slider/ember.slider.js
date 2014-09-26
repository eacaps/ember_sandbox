/*
	A simple pure html/css slider in EmberJS.
	
	Based off code from: http://jsfiddle.net/guilhermeaiolfi/NPkru/
*/

if('undefined' === typeof Slider) {
	Slider = Ember.Application.create();
	Slider.IndexView = Ember.View.extend({});
}

Slider.EmberSliderView = Ember.ContainerView.extend({
	classNames: ['slider-container'],
	childViews: ['bar','slidepath'],
	value: 0,
	orientation: 'horizontal',
	valueMax: 100,
	valueMin: 0,
	step: 1,
	size: 150,
	
	didInsertElement: function() {
		this.$().css('position', 'relative');
		var size = this.get('size');
		if(this.get('orientation') === 'horizontal') {
			this.$().css('width',size+'px');
			this.$().css('height','10px');
		} else {
			this.$().css('height',size+'px');
			this.$().css('width','10px');
		}
	},
	
	normalizeValue: function(val) {
		var step = this.get('step');
		var max = this.get('valueMax');
		var min = this.get('valueMin');
		if(val <= min) {
			return min;
		} else if(val >= max) {
			return max;
		}
		
		var valModStep = (val - min) % step;
		var alignValue = val - valModStep;
		
		if(Math.abs(valModStep) * 2 >= step) {
			alignValue += (valModStep > 0) ? step : (-step);
		}
		
		return parseFloat(alignValue.toFixed(5));
	},
	
	convertPositionToValue: function(x, y) {
		var pixelTotal;
		var pixelMouse;
		var percentMouse;
		var valueTotal;
		var valueMouse;
		
		var orientation = this.get('orientation');
		
		var offset = this.$().offset();
		
		if(orientation === 'horizontal') {
			pixelTotal = this.$().outerWidth();
			pixelMouse = x - offset.left - (this._clickOffset ? this._clickOffset.left : 0);
		} else {
			pixelTotal = this.$().outerHeight();
			pixelMouse = y - offset.top - (this._clickOffset ? this._clickOffset.top : 0);
		}
		
		percentMouse = (pixelMouse / pixelTotal);
		if(percentMouse > 1) {
			percentMouse = 1;
		} else if(percentMouse < 0) {
			percentMouse = 0;
		}
		
		if(orientation === 'vertical') {
			percentMouse = 1 - percentMouse;
		}
		
		valueTotal = this.get('valueMax') - this.get('valueMin');
		valueMouse = this.get('valueMin') + percentMouse * valueTotal;
		
		return this.normalizeValue(valueMouse);
	},
	
	bar: Ember.View.extend({
		classNames:['ember-slider-bar'],
		didInsertElement: function() {
			var slider = this.get('parentView');
			if(slider.get('orientation') === 'horizontal') {
				this.$().css('left', 0);
			} else {
				this.$().css('bottom', 0);
			}
			this.updatePosition();
		},
		updatePosition: function() {
			var value = this.get('parentView.value');
			if(value !== undefined) {
				var slider = this.get('parentView');
				var horizontal = slider.get('orientation') === 'horizontal';
				var size = 0;
				var pos = 0;
				var ratio = 1;
				if(horizontal) {
					size = slider.$().width();
				} else {
					size = slider.$().height();
				}
				ratio = size / slider.get('valueMax');
				pos = Math.ceil(value * ratio);
				
				if(size > 0) {
					this.$().css(horizontal ? 'width' : 'height', pos);
				}
			}
		}.observes('parentView.value'),
	}),
	
	slidepath: Ember.View.extend({
		classNames: ['ember-slider'],
		init: function() {
			this._super();
			this._mouseUpDelegate = $.proxy(this.mouseUp, this);
			this._mouseMoveDelegate = $.proxy(this.mouseMove, this);
		},
		didInsertElement: function() {
			this.$().css('position', 'relative');
			this.$().css('left', '0');
			var parentview = this.get('parentView');
			var size = parentview.get('size');
			if(parentview.get('orientation') === 'horizontal') {
				this.$().css('width', size+'px');
				this.$().css('height', '10px');
			} else {
				this.$().css('height', size+'px');
				this.$().css('width', '10px');
			}
		},
		drag: function(event) {
			var slider = this.get('parentView');
			var value = slider.convertPositionToValue(event.clientX, event.clientY);
			slider.set('value', value);
		},
		dragEnd: function(event) {
			return true;
		},
		mouseDown: function(event) {
			this.dragging = true;
			this._mouseDownEvent = event;
			
			$(window).bind('mousemove', this._mouseMoveDelegate)
				.bind('mouseup', this._mouseUpDelegate);
				
			event.preventDefault();
			return true;
		},
		mouseUp: function(event) {
			this.dragging = false;
			this.dragEnd(event);
			$(window).unbind('mousemove',this._mouseMoveDelegate)
				.unbind('mouseup', this._mouseUpDelegate);
		},
		mouseMove: function(event) {
			if($.browser && $.browser.msie && !(document.documentMode >= 9) && !event.button) {
				return this.mouseUp(event);
			}
			if(this.dragging) {
				this.drag(event);
			}
		}
	})
});