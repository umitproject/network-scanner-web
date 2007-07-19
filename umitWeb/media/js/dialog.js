Dialog = new Class({
    options: {
        parentNode: "body",
        title: "Dialog",
        content: new Element("div"),
        width: 200,
        height: 100
    },
    initialize: function(options){
        this.options = $merge(this.options, options || {});
        this.window = new Element("div", {"class": "dialog"});
        header = new Element("h2");
	d = new Drag.Move(this.window, {handle: header});
	d.addEvent("onStart", function(e){
		//new Fx.Style(this.window, "opacity").start(1, 0.7);
	});
	d.addEvent("onComplete", function(e){
		//new Fx.Style(this.window, "opacity").start(0.7, 1);
	});
        header.setText(this.options.title);
        lnk = new Element("a", {"href": "javascript: void(null)"});
        lnk.setText("X");
        lnk.setStyle("position", "absolute");
        lnk.setStyle("right", "0");
        lnk.setStyle("top", "0");
        p = this;
        lnk.addEvent("click", function(e){
            p.close();
            new Event(e).stop();
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
    },
    
    close: function(){
        $(this.options.parentNode).removeChild(this.window);
        //delete this;
    }
});

UploadResultDialog = Dialog.extend({
    options: {
        title: "Open Scan",
        height: 195,
        width: 400
    },
    
    initialize: function(options){
        this.parent(options);
        this.options.content.empty();
        this.options.content.setHTML("<strong>Choose the source</strong>");
        frm = new Element("form", {"method": "POST", "action": "/scan/upload/", "enctype": "multipart/form-data", "target": "iframe_result"});
        
        rdFile = new Element("input", {"type": "radio", "name": "type", "value": "file", "id": "rdFile"});
        spnFile = new Element("span");
        inputFile = new Element("input", {"type": "file", "name": "scan_result", "id": "scan_result"});
        inputFile.addEvent("focus", function(e){
            rdFile.checked = true;
        });
        
        inputFile.setStyle("width", "100px");
        spnFile.adopt(rdFile);
        spnFile.adopt(inputFile);
        fieldSetFile = new Element("fieldset");
        fieldSetFile.setHTML("<legend>Upload File:</legend>");
        fieldSetFile.adopt(spnFile);
        
        rdDatabase = new Element("input", {"type": "radio", "name": "type", "value": "database", "id": "rdDatabase", "checked": "checked"});
        selectScan = new Element("select");
        opt = new Element("option");
        opt.setText("--- Select an option ---");
        selectScan.add(opt, null);
        selectScan.setStyle("width", "300px;");
        selectScan.addEvent("focus", function(e){
            rdDatabase.checked = true;
        });
        spnDatabase = new Element("span");
        spnDatabase.adopt(rdDatabase);
        spnDatabase.adopt(selectScan);
        fieldSetDatabase = new Element("fieldset");
        fieldSetDatabase.setHTML("<legend>Previous saved scan:</legend>");
        fieldSetDatabase.adopt(spnDatabase);
        
        btnSubmit = new Element("input", {"type": "submit", "value": "Open", "id": "scan_result_submit_button"});
        btnSubmit.addClass("float-right");
        
        frm.adopt(fieldSetFile);
        frm.adopt(fieldSetDatabase);
        //frm.adopt(new Element("br"));
        frm.adopt(btnSubmit);
        
        //thisDialog = this
        frm.addEvent("submit", function(e){
            clearScanData();
            iFrame.addEvent("load", function(e2){
                result = Json.evaluate(this.contentDocument.getElementsByTagName("pre")[0].textContent);
                if(result.result == "OK" && $defined(result.output.full)){
                    varData = result.output.full;
                    loadScanData(varData);
                    nmapOutput = result.output.plain;
                    $("command").value = varData.nmap_command;
                    if(!$("highlight_out").checked){
                            $("nmap-output").setText(nmapOutput);
                    }else{
                            $("nmap-output").setHTML(formatNmapOutput(nmapOutput));
                    }
                }else{
                    div = new Element("div", {'class': "error"});
                    div.setText(result.output);
                    $("nmap-output").empty().adopt(div);
                }
            });
        });
        
        this.options.content.setStyle("padding", "3px;");
        iFrame = new Element("iframe", {"name": "iframe_result"});
        iFrame.setStyle("width", "0");
        iFrame.setStyle("height", "0");
        iFrame.setStyle("display", "none");
        
        this.options.content.adopt(iFrame);
        this.options.content.adopt(frm);
        frm.target = "iframe_result";
    }
});
var rs = null;
