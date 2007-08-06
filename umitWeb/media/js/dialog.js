Dialog = new Class({
    options: {
        parentNode: "body",
        title: "Dialog",
        content: new Element("div"),
        width: 200,
        height: 100
    },
    initialize: function(options){
        self = this;
        this.options = $merge(this.options, options || {});
        this.window = new Element("div", {"class": "dialog"});
        header = new Element("h2");
	d = new Drag.Move(this.window, {handle: header});
        lblTitle = new Element("label");
        lblTitle.setText(this.options.title);
        header.adopt(lblTitle);
        lnk = new Element("a", {"href": "javascript: void(null)"});
        lnk.setText("X");
        lnk.setStyle("position", "absolute");
        lnk.setStyle("right", "0");
        lnk.setStyle("top", "0");
        lnk.addEvent("click", function(e){
            new Event(e).stop();
            self.close();
        });
        header.adopt(lnk);
        
        this.window.setStyle("position", "absolute");
        this.window.setStyle("left", "" + ((getViewportSize()[0]/2)-(this.options.width/2)) + "px");
        this.window.setStyle("top", "" + ((getViewportSize()[1]/2) - (this.options.height/2)) + "px");
        this.window.setStyle("width", this.options.width);
        this.window.setStyle("height", this.options.height);
        
        this.window.adopt(header);
        this.window.adopt(this.options.content);
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
