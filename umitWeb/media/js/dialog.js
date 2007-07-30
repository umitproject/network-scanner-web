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
    }
});

UploadResultDialog = Dialog.extend({
    options: {
        title: "Open Scan",
        height: 195,
        width: 400,
        content: new Element("div")
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
        frm.adopt(btnSubmit);
        
        frm.addEvent("submit", function(e){
            iFrame.addEvent("load", function(e2){
                try{
                    result = Json.evaluate(this.contentDocument.getElementsByTagName("pre")[0].textContent);
                    if(result.result == "OK" && $defined(result.output.full)){
                        varData = result.output.full;
                        loadScanData(varData);
                        nmapOutput = result.output.plain;
                        $("command").value = varData.nmap_command;
                        scanId = result.id;
                        if(!$("highlight_out").checked){
                                $("nmap-output").setText(nmapOutput);
                        }else{
                                $("nmap-output").setHTML(formatNmapOutput(nmapOutput));
                        }
                    }else{
                        alert(result.output);
                    }
                }catch(e){
                    $("nmap-output").setText(this.contentDocument.getElementsByTagName("pre")[0].textContent);
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

SaveResultDialog = Dialog.extend({
    options: {
        title: "Save Scan",
        width: 350,
        height: 160,
        content: new Element("div")
    },
    
    initialize: function(options){
        this.parent(options);
        this.options.content.empty();
        
        iFrame = new Element("iframe", {"name": "iframe_scan"});
        iFrame.setStyle("width", "0");
        iFrame.setStyle("height", "0");
        iFrame.setStyle("display", "none");
        value = $("profiles")[$("profiles").selectedIndex].textContent + " on " + $("target").value;
        frm = new Element("form", {"method": "POST", "action": "/scan/" + scanId + "/save/", "target": 'iframe_scan'});
        lblDatabase = new Element("label", {"for": "rdDatabase"});
        lblDatabase.setText("Save into Umit's database.");
        lblDisc = new Element("label", {"for": "rdDisc"});
        lblDisc.setText("Download to you machine.");
        lblFilename = new Element("label", {"for": "filename"});
        lblFilename.setText("Scan name: ");
        rdDatabase = new Element("input", {"type": "radio", "name": "destination", "value": "database", "id": "rdDatabase"});
        rdDisc = new Element("input", {"type": "radio", "name": "destination", "value": "disc", "checked": "checked", "id": "rdDisc"});
        txtFilename = new Element("input", {"type": "text", "name": "filename", "size": "25", "value": value, "id": "filename", "style": "border: solid 1px black"});
        fs = new Element("fieldset");
        lg = new Element("legend");
        lg.setText("Choose the Destination");
        
        fs.adopt(lg);
        fs.adopt(rdDatabase);
        fs.adopt(lblDatabase);
        fs.adopt(new Element("br"));
        fs.adopt(rdDisc);
        fs.adopt(lblDisc);
        fs.adopt(new Element("br"));
        fs.adopt(lblFilename);
        fs.adopt(txtFilename);
        
        frm.adopt(fs);
        frm.adopt(new Element("input", {"type": "submit", "value": "Save", "style": "float:right"}));
        this.options.content.setStyle("padding", "3px;");
        this.options.content.adopt(iFrame);
        this.options.content.adopt(frm);
        
        frm.addEvent("submit", function(e){
            if(txtFilename.value.trim().length == 0){
                alert("Select a filename!");
                new Event(e).stop();
                return;
            }
            saved = true;
            
            iFrame.addEvent("load", function(e2){
                try{
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
                        alert(result.output);
                    }
                }catch(e){}
            });
        });
    }
});

var rs = null;
