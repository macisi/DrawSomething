var Draw = Draw || {};
(function(doc){
    Draw.render = function(id, data){
        var tpl = doc.getElementById(id + "_tpl").innerHTML,
            wrap = doc.getElementById(id);
        wrap.innerHTML = _.template(tpl, data);
    };
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

    Draw.start = function(){
        var moving = false,
            prop = {
                color: "#000",
                shape: "line",
                width: 1,
                fill: "#fff"
            },
            pos = [],
            line,
            rect,
            circle,
            colorStatus = doc.getElementById("Js_color"),
            foreColor = colorStatus.querySelector(".foreground"),
            backColor = colorStatus.querySelector(".background");
        doc.getElementById("Js_palette").addEventListener("mousedown", function(evt){
            var color = evt.target.dataset.color;
            if(color) {
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
            }
        }, false);
        doc.getElementById("Js_shape").addEventListener("click", function(evt){
            if(evt.target.dataset.shape) {
                prop.shape = evt.target.dataset.shape;
            }
        }, false);
        doc.getElementById("Js_strokeWidth").addEventListener("change", function(evt){
            prop.width = this.value;
        }, false);
        stage.on("mousedown", function(){
            if (moving){
                moving = false;
                layer.draw();
            } else {
                var mousePos = stage.getMousePosition();
                switch(prop.shape) {
                    case "line":
                    default :
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
    }
    return Draw;
})(document);



