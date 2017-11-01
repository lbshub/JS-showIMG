/*
 * LBS showIMG
 * Date: 2012-03-10
 */
(function(global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && (define.amd || define.cmd) ? define(factory) :
		(global.showIMG = factory());
}(this, (function() {
	'use strict';

	var utils = (function() {

		function getOpacity(el) {
			var hasOpacity = (el.style.opacity != null),
				reAlpha = /alpha\(opacity=([\d.]+)\)/i,
				filter, opacity;
			if (hasOpacity) {
				opacity = el.style.opacity || getComputedStyle(el, null).opacity;
				return (opacity == '') ? 100 : opacity * 100;
			} else {
				filter = el.style.filter || el.currentStyle.filter;
				if (filter) opacity = filter.match(reAlpha);
				return (opacity == null || filter == null) ? 100 : (opacity[1]);
			}
		}

		function setOpacity(el, v) {
			el.style.opacity != null ? el.style.opacity = v / 100 : el.style.filter = 'alpha(opacity=' + v + ')';
		}

		function getStyle(el, n) {
			if (n.toLowerCase() === 'opacity') return getOpacity(el);
			return el.currentStyle ? el.currentStyle[n] : getComputedStyle(el, null)[n];
		}

		function setStyle(el, n, v) {
			switch (n) {
				case 'left':
				case 'right':
				case 'top':
				case 'bottom':
					v = parseFloat(v) + 'px';
					break;
				case 'width':
				case 'height':
					v = parseFloat(v) < 0 ? 0 : parseFloat(v) + 'px';
					break;
			}
			n.toLowerCase() === 'opacity' ? setOpacity(el, v) : el.style[n] = v;
		}

		function animate(el, props, opts) {
			el = typeof el === 'string' ? document.getElementById(el) : el;
			if (!el) return;
			var opts = opts || {};
			var duration = opts.duration || 400;
			var fps = opts.fps || 60;
			var easing = opts.easing || function(k) {
				return k;
			};
			var callback = opts.callback || function() {};
			var args = arguments;
			var p, prop, count = 0,
				amount = 0;
			var setProp = function(prop) {
				var start = parseInt(getStyle(el, prop)),
					end = parseInt(props[prop]),
					change = end - start,
					startTime = new Date() - 0;
				if (start == end) {
					return stop();
				}

				function play() {
					var newTime = new Date() - 0,
						timestamp = newTime - startTime,
						delta = easing(timestamp / duration);
					setStyle(el, prop, parseInt(start + delta * change));
					if (timestamp > duration) {
						stop();
					} else {
						setTimeout(play, 1000 / fps);
					}
				}

				function stop() {
					setStyle(el, prop, end);
					if (++count === amount) {
						callback && callback();
					}
				}

				play();
			};
			if (args.length === 3) {
				if (typeof args[2] === 'number') duration = args[2];
				if (typeof args[2] === 'function') callback = args[2];
			} else if (args.length === 4) {
				if (typeof args[2] === 'number') duration = args[2];
				if (typeof args[3] === 'function') callback = args[3];
			}
			for (p in props) amount++;
			for (prop in props) {
				setProp(prop);
			}
		}

		function on(el, type, handler) {
			if (el.addEventListener) {
				return el.addEventListener(type, handler, false);
			} else if (el.attachEvent) {
				return el.attachEvent('on' + type, handler);
			} else {
				return el['on' + type] = handler;
			}
		}

		function off(el, type, handler) {
			if (el.removeEventListener) {
				return el.removeEventListener(type, handler, false);
			} else if (el.detachEvent) {
				return el.detachEvent('on' + type, handler);
			} else {
				return el['on' + type] = null;
			}
		}

		function create(tagName) {
			return document.createElement(tagName);
		}

		function setStyles(el, styles) {
			for (var key in styles) {
				setStyle(el, key, styles[key]);
			}
		}

		function getClass(cls, target) {
			if (document.getElementsByClassName) return (target || document).getElementsByClassName(cls);
			var arr = [],
				re = new RegExp('(^| )' + cls + '( |$)'),
				els = (target || document).getElementsByTagName('*'),
				i = 0,
				l = els.length;
			for (; i < l; i++) {
				if (re.test(els[i].className)) arr.push(els[i]);
			}
			return arr;
		}

		return {
			on: on,
			off: off,
			create: create,
			css: setStyles,
			getClass: getClass,
			animate: animate
		};
	}());

	var showIMG = function(opts) {
		opts = opts || {};
		this.doc = document.documentElement;
		this.body = document.body;
		this.wrapper = (typeof opts.el === 'string' ? document.getElementById(opts.el) : opts.el) || this.body;
		this.images = utils.getClass(opts.boxClass || 'boxClass', this.wrapper);
		if (this.images.length < 1) {
			this.images = this.wrapper.getElementsByTagName('img');
		}
		this.length = this.images.length;
		if (this.length < 1) return;

		this.showTitle = opts.showTitle || false;
		this.useMouse = opts.useMouse || false;
		this.useKeyboard = opts.useKeyboard || false;
		this.before = opts.before || function() {};
		this.after = opts.after || function() {};

		this.index = 0;
		this.imgSrc = [];
		this.imgTitle = [];

		this._init();
	};
	showIMG.prototype = {
		_init: function() {
			this._initEvent();
		},
		_initEvent: function() {
			var _this = this;
			this._getSize();
			this._getImage();
			utils.on(this.wrapper, 'click', function(e) {
				var e = e || window.event;
				var target = e.target || e.srcElement;
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
				e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
				if (target.tagName.toUpperCase() === 'IMG' && target.getAttribute('data-box-index')) {
					_this.index = target.getAttribute('data-box-index') - 1;
					_this._show();
				}
			});
		},
		_getImage: function() {
			for (var i = 0, img = null; i < this.length; i++) {
				img = this.images[i];
				this.imgSrc.push(img.src);
				img.setAttribute('data-box-index', i + 1);
				this.showTitle && (img.title ? this.imgTitle.push(img.title) : this.imgTitle.push(''));
			}
		},
		_getSize: function() {
			this.windowW = this.doc.clientWidth || this.body.clientWidth;
			this.windowH = this.doc.clientHeight || this.body.clientHeight;
			if (document.compatMode != 'CSS1Compat') {
				this.windowW = this.body.clientWidth;
				this.windowH = this.body.clientHeight;
			}
		},
		_bindEvent: function() {
			var _this = this;
			utils.on(this.maskLayer, 'click', function() {
				_this._hide();
			});
			utils.on(this.closeLayer, 'click', function() {
				_this._hide();
			});
			utils.on(this.prevLayer, 'click', function() {
				_this._prevImg();
			});
			utils.on(this.nextLayer, 'click', function() {
				_this._nextImg();
			});
			utils.on(window, 'resize', function() {
				_this._resize();
			});
			this.useMouse && this._mouseImg();
			this.useKeyboard && this._keyboardImg();
		},
		_initCreate: function() {
			this.maskLayer = utils.create('div');
			this.maskLayer.className = 'lbsbox_maskLayer';
			this.showLayer = utils.create('div');
			this.showLayer.className = 'lbsbox_showLayer';

			this.imgLayer = utils.create('img');
			this.prevLayer = utils.create('div');
			this.prevLayer.className = 'lbsbox_prev';
			this.nextLayer = utils.create('div');
			this.nextLayer.className = 'lbsbox_next';
			this.closeLayer = utils.create('div');
			this.closeLayer.className = 'lbsbox_close';

			utils.css(this.showLayer, {
				opacity: 0,
				width: 300,
				height: 300,
				left: (this.windowW - 300) / 2,
				top: (this.windowH - 300) / 2
			});

			utils.css(this.maskLayer, {
				opacity: 0,
				height: this.windowH
			});

			this.showLayer.appendChild(this.imgLayer);
			this.showLayer.appendChild(this.prevLayer);
			this.showLayer.appendChild(this.nextLayer);
			this.showLayer.appendChild(this.closeLayer);
			if (this.showTitle) this._createTitle();
		},
		_createTitle: function() {
			this.titleLayer = utils.create('div');
			this.titleLayer.className = 'lbsbox_titleLayer';
			this.showLayer.appendChild(this.titleLayer);
		},
		_show: function() {
			if (!this.showLayer) {
				this._initCreate();
				this._bindEvent();
			}
			this.status = 'show';
			this.body.appendChild(this.maskLayer);
			this.body.appendChild(this.showLayer);
			utils.css(this.doc, {
				overflow: 'hidden'
			});
			utils.css(this.body, {
				overflow: 'hidden'
			});
			utils.animate(this.maskLayer, {
				opacity: 75
			}, 300);
			utils.animate(this.showLayer, {
				opacity: 100
			}, 300);
			this._playImg();
		},
		_hide: function() {
			var _this = this;
			this.status = 'hide';
			utils.css(this.doc, {
				overflow: ''
			});
			utils.css(this.body, {
				overflow: ''
			});
			utils.animate(this.maskLayer, {
				opacity: 0
			}, 300, function() {
				_this.body.removeChild(_this.maskLayer);
			});
			utils.animate(this.showLayer, {
				opacity: 0
			}, 300, function() {
				_this.body.removeChild(_this.showLayer);
			});
		},
		_playImg: function() {
			var _this = this;
			this.showTitle && (this.titleLayer.innerHTML = '<b>' + (this.index + 1) + '/' + this.length + '</b>' + this.imgTitle[this.index]);
			this.before && this.before(this.index);
			this._src = this.imgSrc[this.index];
			this._loadImg(this._src, function(width, height) {
				_this.status = 'play';
				_this._animateImg(width, height);
			});
		},
		_loadImg: function(src, fn) {
			var img = new Image();
			img.onload = function() {
				fn(img.width, img.height);
				img.onload = null;
			};
			img.src = src;
		},
		_animateImg: function(width, height) {
			var _this = this,
				oW = this.windowW - 20,
				oH = this.windowH - 20,
				x = width / height,
				y = height / width,
				left, top;
			if (width > oW) {
				width = oW - 10;
				height = width * y - 10;
			}
			if (height > oH) {
				height = oH - 10;
				width = height * x - 10;
			}
			this._width = width;
			this._height = height;
			left = (this.windowW - width - 20) / 2;
			top = (this.windowH - height - 20) / 2;
			left < 10 && (left = 10);
			top < 10 && (top = 10);

			this.showTitle && utils.css(this.titleLayer, {
				height: 0,
				opacity: 0
			});
			utils.css(this.imgLayer, {
				width: width,
				height: height,
				opacity: 0
			});
			this.imgLayer.src = this._src;
			utils.animate(this.showLayer, {
				width: width,
				height: height,
				left: left,
				top: top
			}, 250, function() {
				utils.animate(_this.imgLayer, {
					opacity: 100
				}, 250, function() {
					_this.showTitle && utils.animate(_this.titleLayer, {
						height: 35,
						opacity: 100
					}, 200);
					_this.status = 'stop';
					_this.after && _this.after(_this.index);
				});
			});
		},
		_nextImg: function() {
			if (this.status === 'play') return;
			this.index++;
			this.index > this.length - 1 && (this.index = 0);
			this._playImg();
		},
		_prevImg: function() {
			if (this.status === 'play') return;
			this.index--;
			this.index < 0 && (this.index = this.length - 1);
			this._playImg();
		},
		_resize: function() {
			var _this = this;
			clearTimeout(this.timer);
			this.timer = setTimeout(function() {
				_this._getSize();
				utils.css(_this.maskLayer, {
					height: _this.windowH
				});
				utils.css(_this.showLayer, {
					left: (_this.windowW - _this._width - 20) / 2,
					top: (_this.windowH - _this._height - 10) / 2
				});
			}, 60);
		},
		_mouseImg: function() {
			var _this = this,
				wheel = function(e) {
					if (_this.status === 'hide') return;
					var x = 0,
						e = e || window.event;
					x = e.wheelDelta ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
					x < 0 ? _this._nextImg() : _this._prevImg();
				};
			window.netscape ? utils.on(document, 'DOMMouseScroll', wheel) : utils.on(document, 'mousewheel', wheel);
		},
		_keyboardImg: function() {
			var _this = this;
			utils.on(document, 'keydown', function(e) {
				if (_this.status === 'hide') return;
				e = e || window.event;
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
				switch (e.keyCode) {
					case 37:
					case 38:
					case 33:
						_this._prevImg();
						break;
					case 39:
					case 40:
					case 34:
						_this._nextImg();
						break;
					case 27:
						_this._hide();
						break;
				};
			});
		}
	};
	return showIMG;
})));