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
        lblTitle = new Element("label");
        lblTitle.setText(this.options.title);
        header.adopt(lblTitle);
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
        setInputStyles();
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
        self = this
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
        self = this;
        frm.addEvent("submit", function(e){
            if(txtFilename.value.trim().length == 0){
                alert("Select a filename!");
                new Event(e).stop();
                return;
            }
            saved = true;
            return;
        });
    }
});

CommandWizardDialog = Dialog.extend({
    options: {
        title: "UMIT Command Constructor Wizard",
        width: 500,
        height: 450,
        content: new Element("div")
    },
    
    initialize: function(options){
        this.parent(options);
        this.options.content.empty();
        //this.window.addClass("ajax-loading");
        self = this;
        title = new Element("h3");
        commandConstructorDiv = new Element("div");
        lbl = new Element("label");
        lbl.setHTML("<strong>Command: </strong>");
        divCommandConstructor = new Element("input", {"id": "divCommandConstructor",
                                            "style": "border:1px #DDD solid;margin: 5px;padding:4px; width: 95%;", "type": "text"});
        divCommandConstructor.value = "nmap <target>";
        commandConstructorDiv.adopt(lbl);
        commandConstructorDiv.adopt(divCommandConstructor);
        
        title.setText("UMIT Command Constructor Wizard");
        tabber = new Element("div", {"class": "tabber", "id": "tabberCommand"});
        
        
        tabBegin = new Element("div", {class: "tabbertab", style: "height: 285px"});
        tabBegin.setHTML("UMIT Allow user to construct powerful commands in two distinct ways:<p/>" +
                         "<input type='radio' id='novice' name='novice_expert' checked='checked'/><label for='novice'>Novice</label><p/>"+
                         "<input type='radio' id='expert' name='novice_expert'/><label for='expert'>Expert</label>");
        tabber.adopt(tabBegin);
        
        tabSelectType = new Element("div", {class: "tabbertab", style: "height: 285px"});
        htext = "You wish to create a new profile, or just want to quickly create a command and run it once?<p/>";
        htext += "<input type='radio' name='type' id='type_profile' checked='checked'/><label for='type_profile'>Profile</label><p/>";
        htext += "<input type='radio' name='type' id='type_command'/><label for='type_command'>Command</label><br/>";
        htext += "&nbsp;&nbsp;&nbsp;<label for='command_target'>Target:</label>"
        htext += "<input type='text' size='30' id='command_target' onfocus='$(\"type_command\").checked=true'/>";
        tabSelectType.setHTML(htext);
        tabber.adopt(tabSelectType);
        
        tabProfileDetails = new Element("div", {class: "tabbertab", style: "height: 285px;"});
        tabProfileDetails.setText("Please, enter the profile name, " +
                                  "and optionally, enter a hint, description and annotation for this " +
                                   "new profile:");
        spnProfile = new Element("table");
        spnProfile.setHTML("<tr><td valign='top'><label for='profile_name'><strong>Profile Name:</strong>&nbsp;&nbsp;</label></td>" +
                           "<td><input type='text' id='profile_name' size='47'/></td></tr>" +
                           "<tr><td valign='top'><label for='profile_int'>Hint:&nbsp;&nbsp;</label></td>" +
                           "<td><input type='text' id='profile_hint' size='47'/></td></tr>" +
                           "<tr><td valign='top'><label for='profile_description'>Description:&nbsp;&nbsp;</label></td>"+
                           "<td><textarea id='profile_description' rows='4' cols='47'></textarea></td></tr>" +
                           "<tr><td valign='top'><label for='profile_annotation'>Annotation:&nbsp;&nbsp;</label></td>" +
                           "<td><textarea id='profile_annotation' rows='4' cols='47'></textarea></td></tr>");
        tabProfileDetails.adopt(spnProfile);
        tabber.adopt(tabProfileDetails);
        
        new Json.Remote("/wizard/", {onComplete: function(sections){
            varData = sections;
            for(k in sections){
                s = sections[k]
                tab = new Element("div", {class: "tabbertab", style: "height: 285px;"});
                tab.setHTML("<b>" + s.label + "</b>");
                table = new Element("table", {width: "100%"});
                tableContent = "<tr>";
                s.options.each(function(op){
                    if(op.type == "list"){
                        tableContent += "<tr><td width='0'></td>"
                        tableContent += "<td><label for='" + op.label + "'>" + op.label + "</label></td>"
                        tableContent += "<td><select id='" + op.label + "'>"
                        for(y=0; y < op.options.length; y++){
                            lbl = op.options[y];
                            tableContent += "<option value='" + lbl.command + "'>" + ((lbl.name == "None")? "": lbl.name) + "</option>"
                        }
                        tableContent += "</select></td></tr>"
                    }else if(op.type == "check"){
                        tableContent += "<tr><td width='0'><input type='checkbox' id='" + op.label + "' value='" + op.command + "'/></td>"
                        tableContent += "<td><label for='" + op.label + "'>" + op.label + "</label></td>"
                        if(op.arg_type){
                            tableContent += "<td><input type='text' size='15' id='txt-" + op.label + "' class='wiz-input'/></td>"
                        }
                        tableContent += "</tr>"
                    }
                });
                tableContent += "</tr>";
                table.setHTML(tableContent);
                tab.adopt(table);
                tabber.adopt(tab);
                divLoading.addClass("hide");
                
                tabber.getElements("select").each(function(el){
                    el.addEvent("change", function(e){
                        for(i = 0; i < this.length; i++){
                            v = this[i].value;
                            if(i != this.selectedIndex){
                                removeCommand(v);
                            }
                        }
                        v = this[this.selectedIndex].value;
                        updateCommand(v);
                    });
                });
                
                
                tabber.getElements("input[type=checkbox]").each(function(el){
                    el.addEvent("change", function(e){
                        v = this.value;
                        cmpl = ($defined($("txt-" + v.id)))? $("txt-" + v.id).value: "";
                        if(this.checked){
                            updateCommand(v, cmpl);
                        }else{
                            removeCommand(v);
                        }
                    });
                });
                
                tabber.getElements("input[class='wiz-input']").each(function(el){
                    el.addEvent("focus", function(e){
                        $(this.id.substring("txt-".length)).checked = true;
                        v = $(this.id.substring("txt-".length)).value
                        cmpl = this.value;
                        updateCommand(v, cmpl);
                    });
                    
                    el.addEvent("keyup", function(e){
                        v = $(this.id.substring("txt-".length)).value
                        cmpl = this.value;
                        updateCommand(v, cmpl);
                    });
                });
            }
            
            tabFinish = new Element("div", {class: "tabbertab", style: "height: 285px;"});
            tabFinish.setHTML("UMIT generated the nmap command. Click Apply to finish this wizard.");
            tabber.adopt(tabFinish);
            
            btnNext.disabled = false;
            self.options.content.removeClass("hide");
            tabber.tabber = new tabberObj(to);
            setInputStyles();
        }}).send();
        this.options.content.addClass("hide");
        to = tabberOptions;
        this.options.content.adopt(title);
        this.options.content.adopt(commandConstructorDiv);
        this.options.content.adopt(new Element("hr"));
        this.options.content.setStyle("padding", "10px;");
        
        actionDiv = new Element("div", {style: "text-align: right"});
        btnNext = new Element("input", {type: "button", value:"Next"});
        btnPrevious = new Element("input", {type: "button", value:"Previous", style: "margin-right: 6px"});
        btnCancel = new Element("input", {type: "button", value:"Cancel", style: "margin-right: 20px"});
    
        actionDiv.adopt(btnCancel);
        actionDiv.adopt(btnPrevious);
        actionDiv.adopt(btnNext);
        
        btnCancel.addEvent("click", function(e){
            self.close();
        });
        
        this.options.content.adopt(tabber);
        this.options.content.adopt(actionDiv);
        to.div = tabber;
        to.classNav = "hide";
        to.classNavActive = "hide";
        tabber.tabberCount = 0;
        
        btnNext.disabled = true;
        btnPrevious.disabled = true;
        
        btnNext.addEvent("click", function(e){
            size = tabber.tabber.tabs.length-2;
            switch(tabber.tabberCount){
                case 0:
                    if(!$("novice").checked){
                        alert("* NOT implemented! *");
                        return;
                    
                        self.close();
                        rs = new ProfileEditorDialog();
                        rs.run();
                        return;
                    }
                    break;
                case 1:
                    if($("type_command").checked){
                        if($("command_target").value.trim().length == 0){
                            alert("No target selected!\nYou must provide a target to be scanned.");
                            return;
                        }else{
                            tabber.tabberCount++;
                            divCommandConstructor.value = divCommandConstructor.value.replace("<target>", $("command_target").value);
                        }
                    }else{
                        alert("* NOT implemented! *");
                        return;
                    }
                    break;
                case 2:
                    if($("profile_name").value.trim().length == 0){
                        alert("Unnamed profile!\nou must provide a name for this profile.");
                        return;
                    }
                    break;
                case size:
                    this.value = "Apply";
                    break;
                case size+1:
                    $("command").value = divCommandConstructor.value;
                    if($("type_command").checked){
                        $("target").value = $("command_target").value;
                        runScan(e);
                    }
                    self.close();
                    break;
            }
            tabber.tabberCount++;
            tabber.tabber.tabShow(tabber.tabberCount);
            btnPrevious.disabled = false;
        });
        
        
        btnPrevious.addEvent("click", function(e){
            size = tabber.tabber.tabs.length-2;
            switch(tabber.tabberCount){
                default:
                    btnNext.value = "Next";
            }
            tabber.tabberCount--;
            if(tabber.tabberCount == 2){
                if($("type_command").checked){
                    tabber.tabberCount--;
                }
            }
            if(tabber.tabberCount < 1){
                btnPrevious.disabled = true;
            }
            tabber.tabber.tabShow(tabber.tabberCount);
            btnNext.disabled = false;
        });
        divLoading = new Element("div", {class: 'ajax-loading', style: "float: left; width: 100%"});
        this.window.adopt(divLoading);
        
        //tabber.tabber.init(tabber);
    }
});

ProfileEditorDialog = Dialog.extend({
    options: {
        title: "UMIT Profile Editor",
        width: 350,
        height: 160,
        content: new Element("div")
    }
});

var rs = null;
