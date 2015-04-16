/**
 * ColorPicker - pure JavaScript color picker without using images, external CSS or 1px divs.
 * Copyright © 2011 David Durman, All rights reserved.
 */
(function(window, document, undefined) {

    var picker, slide, svgNS = 'http://www.w3.org/2000/svg';

    // This HTML snippet is inserted into the innerHTML property of the passed color picker element
    // when the no-hassle call to ColorPicker() is used, i.e. ColorPicker(function(hex, hsv, rgb) { ... });

    var colorpickerHTMLSnippet = [
        '<div class="picker-wrapper">',
            '<div class="picker"></div>',
            '<div class="picker-indicator"></div>',
        '</div>',
        '<div class="slide-wrapper">',
            '<div class="slide"></div>',
            '<div class="slide-indicator"></div>',
        '</div>'
    ].join('');

    function restrictToBounds(value, minimum, maximum) {
        return Math.max(Math.min(value, maximum), minimum)
    }

    /**
     * Return mouse position relative to the element el.
     */
    function mousePosition(evt, element) {
        var rect = element.getBoundingClientRect();
        return {
            x: restrictToBounds(evt.clientX - rect.left, 0, element.clientWidth),
            y: restrictToBounds(evt.clientY - rect.top, 0, element.clientHeight)
        };
    }

    /**
     * Create SVG element.
     */
    function $(el, attrs, children) {
        el = document.createElementNS(svgNS, el);
        for (var key in attrs)
            el.setAttribute(key, attrs[key]);
        if (!Array.isArray(children)) children = [children];
        var i = 0, len = (children[0] && children.length) || 0;
        for (; i < len; i++)
            el.appendChild(children[i]);
        return el;
    }

    /**
     * Create slide and picker markup
     */
    var svgAttributes = { xmlns: svgNS, version: '1.1', width: '100%', height: '100%' };
    slide = $('svg', svgAttributes,
                [
                    $('defs', {},
                        $('linearGradient', { id: 'gradient-hsv', x1: '0%', y1: '100%', x2: '0%', y2: '0%'},
                            [
                                $('stop', { offset: '0%', 'stop-color': '#FF0000', 'stop-opacity': '1' }),
                                $('stop', { offset: '13%', 'stop-color': '#FF00FF', 'stop-opacity': '1' }),
                                $('stop', { offset: '25%', 'stop-color': '#8000FF', 'stop-opacity': '1' }),
                                $('stop', { offset: '38%', 'stop-color': '#0040FF', 'stop-opacity': '1' }),
                                $('stop', { offset: '50%', 'stop-color': '#00FFFF', 'stop-opacity': '1' }),
                                $('stop', { offset: '63%', 'stop-color': '#00FF40', 'stop-opacity': '1' }),
                                $('stop', { offset: '75%', 'stop-color': '#0BED00', 'stop-opacity': '1' }),
                                $('stop', { offset: '88%', 'stop-color': '#FFFF00', 'stop-opacity': '1' }),
                                $('stop', { offset: '100%', 'stop-color': '#FF0000', 'stop-opacity': '1' })
                            ]
                        )
                    ),
                    $('rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-hsv)'})
                ]
            );

    picker = $('svg', svgAttributes,
                [
                    $('defs', {},
                        [
                            $('linearGradient', { id: 'gradient-black', x1: '0%', y1: '100%', x2: '0%', y2: '0%'},
                                [
                                    $('stop', { offset: '0%', 'stop-color': '#000000', 'stop-opacity': '1' }),
                                    $('stop', { offset: '100%', 'stop-color': '#CC9A81', 'stop-opacity': '0' })
                                ]
                            ),
                            $('linearGradient', { id: 'gradient-white', x1: '0%', y1: '100%', x2: '100%', y2: '100%'},
                                [
                                    $('stop', { offset: '0%', 'stop-color': '#FFFFFF', 'stop-opacity': '1' }),
                                    $('stop', { offset: '100%', 'stop-color': '#CC9A81', 'stop-opacity': '0' })
                                ]
                            )
                        ]
                    ),
                    $('rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-white)'}),
                    $('rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-black)'})
                ]
            );


    /**
     * Convert HSV representation to RGB HEX string.
     * Credits to http://www.raphaeljs.com
     */
    function hsv2rgb(hsv) {
        var R, G, B, X, C;
        var h = (hsv.h % 360) / 60;

        C = hsv.v * hsv.s;
        X = C * (1 - Math.abs(h % 2 - 1));
        R = G = B = hsv.v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];

        var r = Math.floor(R * 255);
        var g = Math.floor(G * 255);
        var b = Math.floor(B * 255);
        return { r: r, g: g, b: b, hex: "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1) };
    }

    /**
     * Convert RGB representation to HSV.
     * r, g, b can be either in <0,1> range or <0,255> range.
     * Credits to http://www.raphaeljs.com
     */
    function rgb2hsv(rgb) {
        var r = rgb.r;
        var g = rgb.g;
        var b = rgb.b;

        if (rgb.r > 1 || rgb.g > 1 || rgb.b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
        }

        var H, S, V, C;
        V = Math.max(r, g, b);
        C = V - Math.min(r, g, b);
        H = (C == 0 ? null :
             V == r ? (g - b) / C + (g < b ? 6 : 0) :
             V == g ? (b - r) / C + 2 :
                      (r - g) / C + 4);
        H = (H % 6) * 60;
        S = C == 0 ? 0 : C / V;
        return { h: H, s: S, v: V };
    }

    /**
     * Return click event handler for the slider.
     * Sets picker background color and calls ctx.callback if provided.
     */
    function slideListener(ctx, slideElement, pickerElement) {
        return function(evt) {
            var mouse = mousePosition(evt, slideElement);
            ctx.h = mouse.y / slideElement.offsetHeight * 360;
            var pickerColor = hsv2rgb({ h: ctx.h, s: 1, v: 1 });
            var c = hsv2rgb({ h: ctx.h, s: ctx.s, v: ctx.v });
            pickerElement.style.backgroundColor = pickerColor.hex;
            ctx.callback && ctx.callback(c.hex, { h: ctx.h, s: ctx.s, v: ctx.v }, { r: c.r, g: c.g, b: c.b }, undefined, mouse);
        };
    }

    /**
     * Return click event handler for the picker.
     * Calls ctx.callback if provided.
     */
    function pickerListener(ctx, pickerElement) {
        return function(evt) {
            var mouse = mousePosition(evt, pickerElement),
                width = pickerElement.offsetWidth,
                height = pickerElement.offsetHeight;

            ctx.s = mouse.x / width;
            ctx.v = (height - mouse.y) / height;
            var c = hsv2rgb(ctx);
            ctx.callback && ctx.callback(c.hex, { h: ctx.h, s: ctx.s, v: ctx.v }, { r: c.r, g: c.g, b: c.b }, mouse);
        };
    }

    var uniqID = 0;

    /**
     * ColorPicker.
     * @param {DOMElement} slideElement HSV slide element.
     * @param {DOMElement} pickerElement HSV picker element.
     * @param {Function} callback Called whenever the color is changed provided chosen color in RGB HEX format as the only argument.
     */
    function ColorPicker(slideElement, pickerElement, callback) {

        if (!(this instanceof ColorPicker)) return new ColorPicker(slideElement, pickerElement, callback);

        this.h = 0;
        this.s = 1;
        this.v = 1;

        if (!callback) {
            // call of the form ColorPicker(element, funtion(hex, hsv, rgb) { ... }), i.e. the no-hassle call.

            var element = slideElement;
            element.innerHTML = colorpickerHTMLSnippet;

            this.slideElement = element.getElementsByClassName('slide')[0];
            this.pickerElement = element.getElementsByClassName('picker')[0];
            this.slideIndicator = element.getElementsByClassName('slide-indicator')[0];
            this.pickerIndicator = element.getElementsByClassName('picker-indicator')[0];

            ColorPicker.positionIndicators(
                this.slideIndicator,
                this.pickerIndicator,
                {x: 0, y: 0},
                {x: 0, y: 0}
            );
            this.callback = function(hex, hsv, rgb, pickerCoordinate, slideCoordinate) {
                ColorPicker.positionIndicators(this.slideIndicator, this.pickerIndicator, slideCoordinate, pickerCoordinate);
                pickerElement(hex, hsv, rgb);
            };

        } else {
            this.callback = callback;
            this.pickerElement = pickerElement;
            this.slideElement = slideElement;
        }
        this.slide_listener = slideListener(this, this.slideElement, this.pickerElement);
        this.picker_listener = pickerListener(this, this.pickerElement);
        if (!callback) {
            this.fixIndicators(this.slideIndicator, this.pickerIndicator);
        }

        // Generate uniq IDs for linearGradients so that we don't have the same IDs within one document.
        // Then reference those gradients in the associated rectangles.

        var slideClone = slide.cloneNode(true);
        var pickerClone = picker.cloneNode(true);

        var hsvGradient = slideClone.getElementById('gradient-hsv');

        var hsvRect = slideClone.getElementsByTagName('rect')[0];

        hsvGradient.id = 'gradient-hsv-' + uniqID;
        hsvRect.setAttribute('fill', 'url(#' + hsvGradient.id + ')');

        var blackAndWhiteGradients = [pickerClone.getElementById('gradient-black'), pickerClone.getElementById('gradient-white')];
        var whiteAndBlackRects = pickerClone.getElementsByTagName('rect');

        blackAndWhiteGradients[0].id = 'gradient-black-' + uniqID;
        blackAndWhiteGradients[1].id = 'gradient-white-' + uniqID;

        whiteAndBlackRects[0].setAttribute('fill', 'url(#' + blackAndWhiteGradients[1].id + ')');
        whiteAndBlackRects[1].setAttribute('fill', 'url(#' + blackAndWhiteGradients[0].id + ')');

        this.slideElement.appendChild(slideClone);
        this.pickerElement.appendChild(pickerClone);

        uniqID++;

        enableDragging(this.slideElement, this.slide_listener);
        enableDragging(this.pickerElement, this.picker_listener);
    }

   /**
    * Enable drag&drop color selection.
    * @param {DOMElement} element HSV slide element or HSV picker element.
    * @param {Function} listener Function that will be called whenever mouse is dragged over the element with event object as argument.
    */
    function enableDragging(element, listener) {
        var mousedown = false;
        function mouseDown(evt) {
            mousedown = true;
            evt.preventDefault();
            // listen to mouse move/up on document only after mouse down on element
            document.addEventListener('mouseup', mouseUp, true);
            document.addEventListener('mousemove', mouseMove, false);
        }
        function mouseMove(evt) {if (mousedown) listener(evt);}
        function mouseUp(evt) {
            mouseMove(evt);
            mousedown = false;
            // stop listening to mouse move/up on document after mouse up
            document.removeEventListener('mouseup', mouseUp, false);
            document.removeEventListener('mousemove', mouseMove, false);
        }
        element.addEventListener('mousedown', mouseDown, false);
    }

    ColorPicker.hsv2rgb = function(hsv) {
        var rgbHex = hsv2rgb(hsv);
        delete rgbHex.hex;
        return rgbHex;
    };

    ColorPicker.hsv2hex = function(hsv) {
        return hsv2rgb(hsv).hex;
    };

    ColorPicker.rgb2hsv = rgb2hsv;

    ColorPicker.rgb2hex = function(rgb) {
        return hsv2rgb(rgb2hsv(rgb)).hex;
    };

    ColorPicker.hex2hsv = function(hex) {
        return rgb2hsv(ColorPicker.hex2rgb(hex));
    };

    ColorPicker.hex2rgb = function(hex) {
        return { r: parseInt(hex.substr(1, 2), 16), g: parseInt(hex.substr(3, 2), 16), b: parseInt(hex.substr(5, 2), 16) };
    };

    /**
     * Sets color of the picker in hsv/rgb/hex format.
     * @param {object} ctx ColorPicker instance.
     * @param {object} hsv Object of the form: { h: <hue>, s: <saturation>, v: <value> }.
     * @param {object} rgb Object of the form: { r: <red>, g: <green>, b: <blue> }.
     * @param {string} hex String of the form: #RRGGBB.
     */
    function setColor(ctx, hsv, rgb, hex) {
        ctx.h = hsv.h % 360;
        ctx.s = hsv.s;
        ctx.v = hsv.v;

        var c = hsv2rgb(ctx);

        var mouseSlide = {
            y: (ctx.h * ctx.slideElement.offsetHeight) / 360,
            x: 0    // not important
        };

        var pickerHeight = ctx.pickerElement.offsetHeight;
        var mousePicker = {
            x: ctx.s * ctx.pickerElement.offsetWidth,
            y: pickerHeight - ctx.v * pickerHeight
        };
        ctx.pickerElement.style.backgroundColor = hsv2rgb({ h: ctx.h, s: 1, v: 1 }).hex;
        ctx.callback && ctx.callback(hex || c.hex, { h: ctx.h, s: ctx.s, v: ctx.v }, rgb || { r: c.r, g: c.g, b: c.b }, mousePicker, mouseSlide);

        return ctx;
    }

    /**
     * Sets color of the picker in rgb format.
     * @param {object} rgb Object of the form: { r: <red>, g: <green>, b: <blue> }.
     */
    ColorPicker.prototype.setHsv = function(hsv) {
        return setColor(this, hsv);
    };

    /**
     * Sets color of the picker in rgb format.
     * @param {object} rgb Object of the form: { r: <red>, g: <green>, b: <blue> }.
     */
    ColorPicker.prototype.setRgb = function(rgb) {
        return setColor(this, rgb2hsv(rgb), rgb);
    };

    /**
     * Sets color of the picker in hex format.
     * @param {string} hex Hex color format #RRGGBB.
     */
    ColorPicker.prototype.setHex = function(hex) {
        return setColor(this, ColorPicker.hex2hsv(hex), undefined, hex);
    };

    /**
     * Helper to position indicators.
     * @param {HTMLElement} slideIndicator DOM element representing the indicator of the slide area.
     * @param {HTMLElement} pickerIndicator DOM element representing the indicator of the picker area.
     * @param {object} mouseSlide Coordinates of the mouse cursor in the slide area.
     * @param {object} mousePicker Coordinates of the mouse cursor in the picker area.
     */
    ColorPicker.positionIndicators = function(slideIndicator, pickerIndicator, mouseSlide, mousePicker) {
        if (mouseSlide) {
            slideIndicator.style.top = (mouseSlide.y - slideIndicator.offsetHeight/2) + 'px';
        }
        if (mousePicker) {
            pickerIndicator.style.top = (mousePicker.y - pickerIndicator.offsetHeight/2) + 'px';
            pickerIndicator.style.left = (mousePicker.x - pickerIndicator.offsetWidth/2) + 'px';
        }
    };

    /**
     * Helper to enable dragging on indicators.
     */
    ColorPicker.prototype.fixIndicators = function(slideIndicator, pickerIndicator) {
        enableDragging(slideIndicator, this.slide_listener);
        enableDragging(pickerIndicator, this.picker_listener);
    };

    window.ColorPicker = ColorPicker;

})(window, window.document);