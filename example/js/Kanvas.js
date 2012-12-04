var Kanvas = Kanvas || {};
Kanvas = (function(w){
    var Global = w,
        doc = document;

    /**
     * 初始化canvas
     * @param el
     * @param size 设置canvas尺寸 {width: w, height: h}, 可选
     * @return {*|CanvasRenderingContext2D}
     */
    function getCanvas(el, size) {
        var canvas = typeof el === "string" ? doc.querySelector(el) : el,
            context;
        if (size) {
            canvas.width = size.width;
            canvas.height = size.height;
        }
        return canvas;
    }

    var getAnimationFrame,
        cancelAnimationFrame;
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var i = 0; i < vendors.length && !getAnimationFrame; ++i) {
            getAnimationFrame = Global[vendors[i] + 'RequestAnimationFrame'];
            cancelAnimationFrame = Global[vendors[i] + 'CancelRequestAnimationFrame'];
        }
        if (!getAnimationFrame)
            getAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = Global.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        if (!cancelAnimationFrame) {
            cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());

    /**
     *  获取鼠标相对canvas的位置
     * @param canvas
     * @param evt
     * @return {Object}
     */
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = evt.clientX - rect.left;
        var mouseY = evt.clientY - rect.top;
        return {
            x: mouseX,
            y: mouseY
        };
    }

    var _3D = {
        rotateXAngle: 0,
        rotateYAngle: 0,
        rotateZAngle: 0,
        rotateRAngle: Math.PI / 8,
        rotateX: function(x, y, z, a) {
            return {
                x: x,
                y: y * Math.cos(a) - z * Math.sin(a),
                z: y * Math.sin(a) + z * Math.cos(a)
            }
        },
        rotateY: function(x, y, z, a) {
            return {
                x: x * Math.cos(a) + z * Math.sin(a),
                y: y,
                z: z * Math.cos(a) - x * Math.sin(a)
            };
        },
        rotateZ: function(x, y, z, a) {
            return {
                x: x * Math.cos(a) - y * Math.sin(a),
                y: x * Math.sin(a) + y * Math.cos(a),
                z: z
            };
        },
        /**
         * 球面坐标系转直角坐标系
         * @param a 仰角
         * @param b 转角
         * @param r 半径
         * @return {Object}
         */
        spherical: function(a, b, r) {
            return {
                x: r * Math.sin(a) * Math.cos(b + this.rotateRAngle),
                y: r * Math.sin(a) * Math.sin(b + this.rotateRAngle),
                z: r * Math.cos(a)
            }
        },
        /**
         * 投影到2d坐标
         * @param x
         * @param y
         * @param z
         * @return {Object}
         */
        projection: function(x, y, z) {
            var c1 = this.rotateX(x, y, z, this.rotateXAngle);
            var c2 = this.rotateY(c1.x, c1.y, c1.z, this.rotateYAngle);
            var c3 = this.rotateZ(c2.x, c2.y, c2.z, this.rotateZAngle);

            //平行投影至XOY平面
            //return {x: c3.x, y: c3.y};

            //透视投影至XOY平面，观察点(0, 0, 1000)
            var h = 1 - c3.z / 1000;
            return {x: c3.x / h , y: c3.y / h};
        }
    };

    return {
        getCanvas: getCanvas,
        requestAnimationFrame: getAnimationFrame,
        cancelAnimationFrame: cancelAnimationFrame,
        getMousePosition: getMousePos,
        _3D: _3D
    }

}(window));