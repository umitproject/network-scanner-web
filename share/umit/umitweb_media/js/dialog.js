Dialog = new Class({
    options: {
        parentNode: "body",
        title: "Dialog",
        content: new Element("div"),
        width: 200,
        height: 100
    },
    initialize: function(options){
        var self = this;
        this.options = $merge(this.options, options || {});
        this.window = new Element("div", {"class": "dialog"});
        var thisHeader = new Element("h2");
        var lblTitle = new Element("label");
        lblTitle.setText(this.options.title);
        thisHeader.adopt(lblTitle);
        var lnk = new Element("a", {"href": "javascript: void(null)"});
        lnk.setText("X");
        lnk.setStyle("position", "absolute");
        lnk.setStyle("right", "0");
        lnk.setStyle("top", "0");
        lnk.addEvent("click", function(e){
            new Event(e).stop();
            self.close();
        });
        thisHeader.adopt(lnk);
        
        this.window.setStyle("position", "absolute");
        this.window.setStyle("left", "" + ((getViewportSize()[0]/2)-(this.options.width/2)) + "px");
        this.window.setStyle("top", "" + ((getViewportSize()[1]/2) - (this.options.height/2)) + "px");
        this.window.setStyle("width", this.options.width);
        this.window.setStyle("height", this.options.height);
        this.window.setStyle("zIndex", "101")
        
        this.window.adopt(thisHeader);
        this.window.adopt(this.options.content);
        var d = new Drag.Move(this.window, {'handle': thisHeader});
        
        if(window.ie){
            var iFrame = new Element("iframe", {"id": "__false_ifame__", "name": "__false_iframe__"});
            iFrame.src = "javascript:false";
            iFrame.scrolling = "no";
            iFrame.frameBorder = "0";
            iFrame.setStyle("width", this.options.width);
            iFrame.setStyle("height", this.options.height);
            iFrame.style.zIndex = "-1";
            iFrame.setStyle("position", "absolute");
            iFrame.injectBefore(thisHeader);
        }
    },
    
    run: function(){
        $(this.options.parentNode).adopt(this.window);
        setInputStyles();
    },
    
    close: function(){
        $(this.options.parentNode).removeChild(this.window);
    }
});

var rs = null;
