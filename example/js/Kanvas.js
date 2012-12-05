/**
 * Kanvas
 * 自建canvas库
 * @author macisi528@gmail.com
 */

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





    var _3D = (function(){
        var centerPoint = {
            x: 0,
            y: 0,
            z: 0
        };
        var vanishPoint = {
            x: 0,
            y: 0
        };

        var rotateXAngle = 0,
            rotateYAngle = 0,
            rotateZAngle = 0,
            rotateRAngle = Math.PI / 8,
            focalLength = 250;

        function _setRotateAngle(angles) {
            rotateXAngle = angles.rotateXAngle ? angles.rotateXAngle : rotateXAngle;
            rotateYAngle = angles.rotateYAngle ? angles.rotateYAngle : rotateYAngle;
            rotateZAngle = angles.rotateZAngle ? angles.rotateZAngle : rotateZAngle;
            rotateRAngle = angles.rotateRAngle ? angles.rotateRAngle : rotateRAngle;
        }
        function _getRotateAngle() {
            return {
                x: rotateXAngle,
                y: rotateYAngle,
                z: rotateZAngle,
                r: rotateRAngle
            }
        }
        // 设定旋转中心
        function _setVanishPoint(x, y) {
            vanishPoint.x = x;
            vanishPoint.y = y;
        }
        // 获取旋转中心
        function _getVanishPoint(x, y) {
            return vanishPoint;
        }
        //设定坐标中心点
        function _setCenterPoint(x, y, z) {
            centerPoint.x = x;
            centerPoint.y = y;
            centerPoint.z = z;
        }
        //获取坐标中心点
        function _getCenterPoint() {
            return centerPoint;
        }
        /**
         * 球面坐标系转直角坐标系
         * @param a 仰角
         * @param b 转角
         * @param r 半径
         * @return {Object}
         */
        function _spherical(a, b, r) {
            return {
                x: r * Math.sin(a) * Math.cos(b + rotateRAngle),
                y: r * Math.sin(a) * Math.sin(b + rotateRAngle),
                z: r * Math.cos(a)
            }
        };
        /**
         * 投影到2d坐标
         * @param x
         * @param y
         * @param z
         * @return {Object}
         */
        function _projection(x, y, z) {
            var c1 = rotateX(x, y, z, rotateXAngle);
            var c2 = rotateY(c1.x, c1.y, c1.z, rotateYAngle);
            var c3 = rotateZ(c2.x, c2.y, c2.z, rotateZAngle);
            var scale = focalLength / (focalLength + c3.z + centerPoint.z);

            return {
                x: vanishPoint.x + (centerPoint.x + c3.x) * scale,
                y: vanishPoint.y + (centerPoint.y + c3.y) * scale
            };
        }

        function rotateX(x, y, z, a) {
            var sina = Math.sin(a),
                cosa = Math.cos(a);
            return {
                x: x,
                y: y * cosa - z * sina,
                z: y * sina + z * cosa
            }
        }

        function rotateY(x, y, z, a) {
            var sina = Math.sin(a),
                cosa = Math.cos(a);
            return {
                x: x * cosa + z * sina,
                y: y,
                z: z * cosa - x * sina
            };
        }

        function rotateZ(x, y, z, a) {
            var sina = Math.sin(a),
                cosa = Math.cos(a);
            return {
                x: x * cosa - y * sina,
                y: x * sina + y * cosa,
                z: z
            };
        }

        return {
            getRotateAngle: _getRotateAngle,
            setRotateAngle: _setRotateAngle,
            getVanishPoint: _getVanishPoint,
            setVanishPoint: _setVanishPoint,
            getCenterPoint: _getCenterPoint,
            setCenterPoint: _setCenterPoint,
            spherical: _spherical,
            projection: _projection
        };
    })();

    return {
        getCanvas: getCanvas,
        requestAnimationFrame: getAnimationFrame,
        cancelAnimationFrame: cancelAnimationFrame,
        getMousePosition: getMousePos,
        _3D: _3D
    }

}(window));