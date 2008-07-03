function $(id){
    return document.getElementById(id);
}

function getByTemplate(templateId){
    elems = svgDoc.getElementsByTagName("use");
    ret = new Array();
    for(var i = 0; i < elems.length; i++){
        el = elems[i];
        if(el.getAttribute("xlink:href") == "#" + templateId){
            ret.push(el);
        }
    }
    return ret;
}

SVGUseElement.prototype.getSource = function(){
    return document.getElementById(this.getAttribute("xlink:href").replace("#", ""));
}

SVGUseElement.prototype.getTransformation = function(transformName){
    var regexp = new RegExp(transformName+"\\(([^)]+)\\)");
    return this.getAttribute("transform").match(regexp)[1];
}

SVGUseElement.prototype.timeout = null

Array.prototype.each = function(funcPoint){
    for(var i = 0; i < this.length; i++){
        funcPoint(this[i], i);
    }
}

//Class
Node = function(id){
    this.id = id;
    this.info = {};
}
