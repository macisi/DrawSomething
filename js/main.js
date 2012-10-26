var Draw = Draw || {};
(function(doc){
    Draw.render = function(id, data){
        var tpl = doc.getElementById(id + "_tpl").innerHTML,
            wrap = doc.getElementById(id);
        wrap.innerHTML = _.template(tpl, data);
    };
    return Draw;
})(document);
