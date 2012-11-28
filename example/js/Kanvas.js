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

    return {
        getCanvas: getCanvas,
        requestAnimationFrame: getAnimationFrame,
        cancelAnimationFrame: cancelAnimationFrame,
        getMousePosition: getMousePos
    }

}(window));