/*
 * LBS showIMG
 * Date: 2011-06-24
 */
(function() {
	var DOM = {
		getStyle: function(el, attr) {
			return el.currentStyle ? el.currentStyle[attr] : getComputedStyle(el, null)[attr];
		},
		setStyle: function(el, name, value) {
			el.style[name] = value + 'px';
		},
		setOpacity: function(e, v) {
			e.style.filter = 'alpha(opacity=' + v + ')';
			e.style.opacity = v / 100;
		}
	};
	window.FX = function(el, json, opt) {
		var _opt = {
			duration: 400,
			fps: 40,
			tween: FX.tween.linear,
			callback: function() {}
		};
		for (var key in opt) {
			_opt[key] = opt[key];
		}
		var isOK = jsonlen = 0;
		for (var j in json) jsonlen++;
		for (attr in json) {
			(function(attr) {
				var start = (attr == 'opacity') ? parseInt(100 * DOM.getStyle(el, 'opacity')) : parseInt(DOM.getStyle(el, attr));
				var end = json[attr],
					change = end - start,
					startTime = new Date().getTime(),
					duration = _opt.duration,
					ease = _opt.tween;
				(function() {
					var newTime = new Date().getTime(),
						timestamp = newTime - startTime,
						delta = ease(timestamp / duration);
					(attr == 'opacity') ? DOM.setOpacity(el, start + delta * change): DOM.setStyle(el, attr, start + delta * change);
					if (duration <= timestamp) {
						(attr == 'opacity') ? DOM.setOpacity(el, end): DOM.setStyle(el, attr, end);
						if (++isOK == jsonlen) _opt.callback && _opt.callback();
					} else {
						setTimeout(arguments.callee, 1000 / _opt.fps);
					}
				})();
			})(attr);
		}
	};
	FX.tween = {
		linear: function(pos) {
			return pos;
		},
		swing: function(pos) {
			return 0.5 - Math.cos(pos * Math.PI) / 2;
		}
	};
})();
(function() {
	var LBS = {
		$: function(id) {
			return typeof id == "string" ? document.getElementById(id) : id;
		},
		$tag: function(tag, elem) {
			return (elem || document).getElementsByTagName(tag);
		},
		getStyle: function(el, attr) {
			return el.currentStyle ? el.currentStyle[attr] : getComputedStyle(el, null)[attr];
		},
		setStyle: function(el, styles) {
			for (name in styles) {
				el.style[name] = styles[name];
			}
		},
		setOpacity: function(e, v) {
			e.style.filter = 'alpha(opacity=' + v + ')';
			e.style.opacity = v / 100;
		},
		create: function(elem) {
			return document.createElement(elem);
		},
		hide: function(elem) {
			elem.style.display = 'none';
		},
		show: function(elem) {
			elem.style.display = 'block';
		},
		on: function(el, type, handler) {
			if (el.addEventListener)
				el.addEventListener(type, handler, false);
			else
				el.attachEvent('on' + type, function() {
					return handler.call(el, event)
				});
		},
		getScrollInPage: function() {
			var d = document,
				x = d.documentElement.scrollLeft || d.body.scrollLeft,
				y = d.documentElement.scrollTop || d.body.scrollTop;
			return {
				x: x,
				y: y
			};
		},
		getWindowSize: function() {
			var d = document;
			w = d.documentElement.clientWidth || d.body.clientWidth,
				h = d.documentElement.clientHeight || d.body.clientHeight;
			return {
				w: w,
				h: h
			};
		},
		getPageSize: function() {
			var d = document,
				w = d.documentElement.scrollWidth || d.body.scrollWidth,
				h = d.documentElement.scrollHeight || d.body.scrollHeight;
			return {
				w: w,
				h: h
			};
		}
	};
	var imgReady = function(url, callback, error) {
		var width, height, intervalId, check, div,
			img = new Image(),
			body = document.body;
		img.src = url;
		if (img.complete) {
			return callback(img.width, img.height);
		};
		if (body) {
			div = document.createElement('div');
			div.style.cssText = 'visibility:hidden;position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden';
			div.appendChild(img)
			body.appendChild(div);
			width = img.offsetWidth;
			height = img.offsetHeight;
			check = function() {
				if (img.offsetWidth !== width || img.offsetHeight !== height) {
					clearInterval(intervalId);
					callback(img.offsetWidth, img.clientHeight);
					img.onload = null;
					div.innerHTML = '';
					div.parentNode.removeChild(div);
				};
			};
			intervalId = setInterval(check, 150);
		};
		img.onload = function() {
			callback(img.width, img.height);
			img.onload = img.onerror = null;
			clearInterval(intervalId);
			body && img.parentNode.removeChild(img);
		};
		img.onerror = function() {
			error && error();
			clearInterval(intervalId);
			body && img.parentNode.removeChild(img);
		};
	};
	window.showIMG = function(opt) {
		if (typeof(arguments[0]) == 'undefined') return false;
		var _opt = {
			where: document.body,
			mouse: false,
			keyboard: false,
			title: false,
			callback: function() {}
		};
		for (var key in opt) {
			_opt[key] = opt[key];
		}
		this.Box = LBS.$(_opt.where);
		this.mouse = _opt.mouse;
		this.keyboard = _opt.keyboard;
		this.title = _opt.title;
		this.fn = _opt.callback;
		this.images = LBS.$tag('img', this.Box) || [];
		if (this.images.length == 0) return false;
		this.num = this.images.length;
		this.index = 0;

		this.srcArr = [];
		this.titleArr = [];
		this.imgSrc = 'images/blank.gif';
		this.doc = document.documentElement;
		this.docBody = LBS.$tag('body')[0];
		this.Width = this.Height = 300;
		this.pageH = LBS.getPageSize().h;
		this.windowW = LBS.getWindowSize().w;
		this.windowH = LBS.getWindowSize().h;
		this.scrollY = LBS.getScrollInPage().y;
		this.time = new Date() - 0;
		this.showOK = true;

		this.init();

	}
	showIMG.prototype = {
		init: function() {
			this.setImage();
			this.click();
		},
		setImage: function() {
			for (var i = 0; i < this.num; i++) {
				var img = this.images[i];
				this.srcArr.push(img.src);
				img.lbsIndex = i + 1;
				this.title && (img.title ? this.titleArr.push(img.title) : this.titleArr.push(''));
			}
		},
		click: function() {
			var _this = this;
			LBS.on(this.Box, 'click', function(e) {
				e = e || window.event;
				target = e.target || e.srcElement;
				if (target.tagName.toUpperCase() === 'IMG' && target.lbsIndex) {
					_this.index = target.lbsIndex - 1;
					_this.show();
					_this.playImg();
					_this.bind();
					e.preventDefault ? e.preventDefault() : e.returnValue = false;
					e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
					return false;
				}
			});
		},
		playImg: function() {
			var _this = this;
			this.showOK = false;
			this.time = new Date() - 0;
			this.index == this.num - 1 ? LBS.hide(this.nextBtn) : LBS.show(this.nextBtn);
			this.index == 0 ? LBS.hide(this.prevBtn) : LBS.show(this.prevBtn);
			this.title && (this.titleLayer.innerHTML = '<b>' + (this.index + 1) + '/' + this.num + '</b>' + this.titleArr[this.index]);
			this.fn && this.fn(this.index);
			this.loadImg(this.srcArr[this.index], function(width, height) {
				_this.setPosition(width, height);
			});
		},
		nextImg: function() {
			this.index++;
			this.playImg();
		},
		prevImg: function() {
			this.index--;
			this.playImg();
		},
		create: function() {
			this.maskLayer = LBS.create('div'); //遮罩层
			this.maskLayer.className = 'lbsbox_maskLayer';
			LBS.setStyle(this.maskLayer, {
				height: Math.max(this.pageH, this.windowH) + 'px'
			});
			this.docBody.appendChild(this.maskLayer);

			this.showLayer = LBS.create('div'); //显示图片容器层
			this.showLayer.className = 'lbsbox_showLayer';
			LBS.setStyle(this.showLayer, {
				left: (this.windowW - 300) / 2 + 'px',
				top: this.scrollY + (this.windowH - 300) / 2 + 'px'
			});
			this.docBody.appendChild(this.showLayer);

			this.showImg = LBS.create('img'); //显示的图片
			this.showImg.src = this.imgSrc;
			this.showLayer.appendChild(this.showImg);

			this.nextBtn = LBS.create('a'); //下
			this.nextBtn.href = 'javascript:;';
			this.nextBtn.className = 'lbsbox_next';
			this.showLayer.appendChild(this.nextBtn);

			this.prevBtn = LBS.create('a'); //上 
			this.prevBtn.href = 'javascript:;';
			this.prevBtn.className = 'lbsbox_prev';
			this.showLayer.appendChild(this.prevBtn);

			this.closeBtn = LBS.create('a'); //关闭
			this.closeBtn.href = 'javascript:;';
			this.closeBtn.innerHTML = 'X';
			this.closeBtn.className = 'lbsbox_close';
			this.showLayer.appendChild(this.closeBtn);

			this.title && this.createTitle();

		},
		createTitle: function() {
			this.titleLayer = LBS.create('div');
			this.titleLayer.className = 'lbsbox_titleLayer';
			this.showLayer.appendChild(this.titleLayer);
		},
		loadImg: function(src, fn) {
			this.showImg.src = src;
			LBS.setOpacity(this.showImg, 0);
			this.title && LBS.setOpacity(this.titleLayer, 0);
			this.title && LBS.setStyle(this.titleLayer, {
				'bottom': '15px',
				'height': 0
			});
			imgReady(src, function(width, height) {
				fn && fn(width, height);
			});
		},
		show: function() {
			if (!this.maskLayer) {
				this.create();
				LBS.setOpacity(this.maskLayer, 0);
				LBS.setOpacity(this.showLayer, 0);
			}
			LBS.show(this.maskLayer);
			LBS.show(this.showLayer);
			LBS.setStyle(this.doc, {
				overflow: 'hidden'
			});
			LBS.setStyle(this.docBody, {
				overflow: 'hidden'
			});
			FX(this.maskLayer, {
				'opacity': 75
			}, {
				duration: 300
			});
			FX(this.showLayer, {
				'opacity': 100
			}, {
				'duration': 300
			});
			this.ok = true;
		},
		hide: function() {
			var _this = this;
			LBS.setStyle(this.doc, {
				overflow: 'auto'
			});
			LBS.setStyle(this.docBody, {
				overflow: 'auto'
			});
			FX(this.maskLayer, {
				'opacity': 0
			}, {
				duration: 300,
				callback: function() {
					LBS.hide(_this.maskLayer)
				}
			});
			FX(this.showLayer, {
				'opacity': 0
			}, {
				duration: 300,
				callback: function() {
					LBS.hide(_this.showLayer)
				}
			});
			this.ok = false;
		},
		bind: function() {
			var _this = this;
			LBS.on(this.maskLayer, 'click', function() {
				_this.hide();
			});
			LBS.on(this.closeBtn, 'click', function() {
				if (!_this.ok) return;
				_this.hide();
			});
			LBS.on(this.prevBtn, 'click', function() {
				if (!_this.ok) return;
				_this.showOK && _this.prevImg();
			});
			LBS.on(this.nextBtn, 'click', function() {
				if (!_this.ok) return;
				_this.showOK && _this.nextImg();
			});
			LBS.on(window, 'resize', function() {
				if (!_this.ok) return;
				_this.pageH = LBS.getPageSize().h;
				_this.windowW = LBS.getWindowSize().w;
				_this.windowH = LBS.getWindowSize().h;
				_this.scrollY = LBS.getScrollInPage().y;
				LBS.setStyle(_this.maskLayer, {
					height: Math.max(_this.pageH, _this.windowH) + 'px'
				});
				LBS.setStyle(_this.showLayer, {
					left: (_this.windowW - _this.Width - 20) / 2 + 'px',
					top: _this.scrollY + (_this.windowH - _this.Height - 10) / 2 + 'px'
				});
			});
			this.mouse && this.mouseImg();
			this.keyboard && this.keyboardImg();
		},
		setPosition: function(width, height) {
			this.scrollY = LBS.getScrollInPage().y;
			this.windowW = LBS.getWindowSize().w;
			this.windowH = LBS.getWindowSize().h;
			var _this = this,
				oW = this.windowW - 20,
				oH = this.windowH - 20,
				x = width / height,
				y = height / width;
			if (width > oW) {
				width = oW - 10;
				height = width * y - 10;
			}
			if (height > oH) {
				height = oH - 10;
				width = height * x - 10;
			}
			this.Width = width;
			this.Height = height;
			var left = (this.windowW - width - 20) / 2,
				top = this.scrollY + (this.windowH - height - 20) / 2;
			left < 10 && (left = 10);
			top < this.scrollY + 10 && (top = this.scrollY + 10);
			LBS.setStyle(this.showImg, {
				'width': width + 'px',
				'height': height + 'px'
			});
			LBS.setStyle(this.prevBtn, {
				'height': height + 'px'
			});
			LBS.setStyle(this.nextBtn, {
				'height': height + 'px'
			});
			this.title && LBS.setStyle(this.titleLayer, {
				'width': width + 'px'
			});
			FX(this.showLayer, {
				'width': width,
				'height': height,
				'left': left,
				'top': top
			}, {
				duration: 300,
				tween: FX.tween.swing,
				callback: function() {
					FX(_this.showImg, {
						'opacity': 100
					}, {
						duration: 300,
						callback: function() {
							_this.title && FX(_this.titleLayer, {
								'bottom': 5,
								'opacity': 100,
								'height': 35
							}, {
								duration: 200
							});
							_this.showOK = true;
						}
					});
				}
			});
		},
		mouseImg: function() {
			var _this = this,
				roll = function(e) {
					if (!_this.ok) return;
					var x = 0,
						e = e || window.event;
					x = e.wheelDelta ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
					if (_this.showOK && +new Date() - _this.time > 800) {
						x < 0 ? _this.index++ : _this.index--;
						_this.index < 0 && (_this.index = _this.num - 1) || _this.index > _this.num - 1 && (_this.index = 0);
						_this.playImg();
					}
					return false;
				};
			window.netscape ? LBS.on(document, 'DOMMouseScroll', roll) : LBS.on(document, 'mousewheel', roll);
		},
		keyboardImg: function() {
			var _this = this;
			LBS.on(document, 'keydown', function(e) {
				if (!_this.ok) return;
				e = e || window.event;
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
				//e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
				if (_this.showOK && +new Date() - _this.time > 800) {
					if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 33) {
						_this.index--;
						_this.index < 0 && (_this.index = _this.num - 1);
						_this.playImg();
						return false;
					}
					if (e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 34) {
						_this.index++;
						_this.index > _this.num - 1 && (_this.index = 0);
						_this.playImg();
						return false;
					}
				}
				e.keyCode == 27 && _this.hide();
			});
		}
	}
})();