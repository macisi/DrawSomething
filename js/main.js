var Draw = Draw || {};
(function(doc){
    Draw.render = function(id, data){
        var tpl = doc.getElementById(id + "_tpl").innerHTML,
            wrap = doc.getElementById(id);
        wrap.innerHTML = _.template(tpl, data);
    };

    var prop = {
            color: "#000",
            shape: "line",
            width: 1,
            fill: "#fff",
            lock: false
        },
        line,
        rect,
        circle,
        colorStatus = doc.getElementById("Js_color"),
        foreColor = colorStatus.querySelector(".foreground"),
        backColor = colorStatus.querySelector(".background");

    var stage = new Kinetic.Stage({
        container: "Js_canvas",
        width: 960,
        height: 400
    });
    var layer = new Kinetic.Layer();
    var background = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: stage.getWidth(),
        height: stage.getHeight(),
        fill: "white"
    });
    layer.add(background);
    stage.add(layer);

    doc.getElementById("Js_shape").addEventListener("click", function(evt){
        var shape = evt.target.dataset.shape;
        if(shape) {
            if (shape === "eraser") {
                prop.shape = "line";
                prop.color = "#fff";
                prop.lock = true;
                return;
            }
            prop.shape = shape;
            prop.lock = false;
        }
    }, false);
    doc.getElementById("Js_strokeWidth").addEventListener("change", function(){
        prop.width = this.value;
    }, false);

    Draw.init = function(){
        var moving = false,
            pos = [];

        stage.on("mousedown", function(){
            if (moving){
                moving = false;
                layer.draw();
            } else {
                var mousePos = stage.getMousePosition();
                switch(prop.shape) {
                    case "line":
                    default :
                        prop.color = prop.lock ? "#fff": prop.color;
                        line = new Kinetic.Line({
                            points: [mousePos.x, mousePos.y, mousePos.x, mousePos.y],
                            stroke: prop.color,
                            strokeWidth: prop.width
                        });
                        layer.add(line);
                        moving = true;
                        //layer.drawScene();
                        break;
                    case "rect":
                        rect = new Kinetic.Rect({
                            x: mousePos.x,
                            y: mousePos.y,
                            stroke: prop.color,
                            strokeWidth: prop.width,
                            fill: prop.fill
                        });
                        pos.push(mousePos.x);
                        pos.push(mousePos.y);
                        layer.add(rect);
                        moving = true;
                        break;
                    case "circle":
                        circle = new Kinetic.Circle({
                            x: mousePos.x,
                            y: mousePos.y,
                            stroke: prop.color,
                            strokeWidth: prop.width,
                            fill: prop.fill
                        });
                        pos.push(mousePos.x);
                        pos.push(mousePos.y);
                        layer.add(circle);
                        moving = true;
                        break;
                }
            }
        });

        stage.on("mousemove", function(){
            if (moving) {
                var mousePos = stage.getMousePosition();
                switch(prop.shape) {
                    case "line":
                    default :
                        pos.push(mousePos.x);
                        pos.push(mousePos.y);
                        line.setPoints(pos);
                        break;
                    case "rect":
                        rect.setSize([mousePos.x - pos[0], mousePos.y - pos[1]]);
                        break;
                    case "circle":
                        var radius = Math.sqrt(Math.pow(mousePos.x - pos[0], 2) + Math.pow(mousePos.y - pos[1], 2));
                        circle.setRadius(radius);
                        break;
                }
                layer.drawScene();
                moving = true;
            }
        });

        stage.on("mouseup", function(){
            moving = false;
            pos = [];
        });
    };

    var palette = (function(){
        var color,
            isIn = false;
        var paletteStage = new Kinetic.Stage({
            container: "Js_palette",
            width: 480,
            height: 320
        });
        var barLayer = new Kinetic.Layer();
        var maskLayer = new Kinetic.Layer();
        var bar = new Kinetic.Rect({
            x: 50,
            y: 30,
            width: 20,
            height: 256,
            stroke: "#000",
            fill: {
                start: {
                    x: 0,
                    y: 2
                },
                end: {
                    x: 0,
                    y: 254
                },
                colorStops: [0, '#f00', 1/6, "#f0f", 1/3, '#00f', 1/2, '#0ff', 2/3, '#0f0', 5/6, '#ff0', 1, '#f00']
            }
        });
        var blackMask = new Kinetic.Rect({
            x: 80,
            y: 30,
            width: 256,
            height: 256,
            stroke: "#000",
            fill: {
                start: {
                    x: 0,
                    y: 2
                },
                end: {
                    x: 0,
                    y: 254
                },
                colorStops: [0, 'rgba(0, 0, 0, 0)', 1, 'rgba(0, 0, 0, 1)']
            }
        });
        var whiteMask = new Kinetic.Rect({
            x: 80,
            y: 30,
            width: 256,
            height: 256,
            stroke: "#000",
            fill: {
                start: {
                    x: 2,
                    y: 0
                },
                end: {
                    x: 254,
                    y: 0
                },
                colorStops: [0, 'rgba(255, 255, 255, 1)', 1, 'rgba(255, 255, 255, 0)']
            }
        });
        var colorMask = new Kinetic.Rect({
            x: 80,
            y: 30,
            width: 256,
            height: 256,
            stroke: "#000",
            fill: "#f00"
        });
        barLayer.add(bar);
        maskLayer.add(colorMask);
        maskLayer.add(whiteMask);
        maskLayer.add(blackMask);
        paletteStage.add(barLayer);
        paletteStage.add(maskLayer);
        bar.on("mousedown mousemove", function(evt){
            if (isIn || evt.type === "mousedown") {
                isIn = true;
                color = getColor.call(this, paletteStage.getMousePosition());
                if (color !== "rgb(0,0,0)") {
                    colorMask.setFill(color);
                }
                maskLayer.drawScene();
            }
        });
        bar.on("mouseup", function(){
            isIn = false;
        });


        maskLayer.on("mousedown", function(evt){
            color = getColor.call(this, paletteStage.getMousePosition());
            console.log(color);
            if (evt.button === 0) {
                prop.color = color;
                foreColor.style.backgroundColor = color;
            } else if(evt.button === 2) {
                prop.fill = color;
                backColor.style.backgroundColor = color;
                evt.target.oncontextmenu = function(){
                    return false; //屏蔽右键菜单
                };
            }
        });
        function getColor(pos) {
            var data = this.getContext().getImageData(pos.x, pos.y, 1, 1).data;
            data = _.first(data, 3).toString();
            return "rgb(" + data + ")";
        }
    })();
    return Draw;
})(document);



