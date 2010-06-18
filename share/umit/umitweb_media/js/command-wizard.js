CommandWizardDialog = Dialog.extend({
    options: {
        title: "UMIT Command Constructor Wizard",
        width: 500,
        height: 460,
        content: new Element("div")
    },
    
    initialize: function(options){
        this.parent(options);
        this.options.content.empty();

        var self = this;
        var title = new Element("h3");
        var commandConstructorDiv = new Element("div");
        var lbl = new Element("label");
        lbl.setHTML("<strong>Command: </strong>");
        var divCommandConstructor = new Element("input", {"id": "divCommandConstructor",
                                            "style": "border:1px #DDD solid;margin: 5px;padding:4px; width: 95%;", "type": "text"});
        divCommandConstructor.value = "nmap <target>";
        commandConstructorDiv.adopt(lbl);
        commandConstructorDiv.adopt(divCommandConstructor);
        
        title.setText("UMIT Command Constructor Wizard");
        var tabber = new Element("div", {"class": "tabber", "id": "tabberCommand"});
        
        
        var tabBegin = new Element("div", {"class": "tabbertab", "style": "height: 285px"});
        tabBegin.setHTML("UMIT Allow user to construct powerful commands in two distinct ways:<p/>" +
                         "<input type='radio' id='novice' name='novice_expert' checked='checked'/><label for='novice'>Novice</label><p/>"+
                         "<input type='radio' id='expert' name='novice_expert'/><label for='expert'>Expert</label>");
        tabber.adopt(tabBegin);
        
        var tabSelectType = new Element("div", {"class": "tabbertab", "style": "height: 285px"});
        var htext = "You wish to create a new profile, or just want to quickly create a command and run it once?<p/>";
        htext += "<input type='radio' name='type' id='type_profile' checked='checked'/><label for='type_profile'>Profile</label><p/>";
        htext += "<input type='radio' name='type' id='type_command'/><label for='type_command'>Command</label><br/>";
        htext += "&nbsp;&nbsp;&nbsp;<label for='command_target'>Target:</label>"
        htext += "<input type='text' size='30' id='command_target' onfocus='$(\"type_command\").checked=true'/>";
        tabSelectType.setHTML(htext);
        tabber.adopt(tabSelectType);
        
        var tabProfileDetails = new Element("div", {"class": "tabbertab", "style": "height: 285px;"});
        tabProfileDetails.setText("Please, enter the profile name, " +
                                  "and optionally, enter a hint, description and annotation for this " +
                                   "new profile:");
        var spnProfile = new Element("table");
        tabProfileDetails.adopt(spnProfile);
        addTableRow(spnProfile, [{'valign': 'top', 
                                  'value': "<label for='pprofile_name'><strong>Profile Name:</strong>&nbsp;&nbsp;</label>"},
                                  "<input type='text' id='pprofile_name' size='40'/>"]);
                                  
        addTableRow(spnProfile, [{'valign': 'top',
                                  'value': "<label for='pprofile_name'><strong>Profile Name:</strong>&nbsp;&nbsp;</label>"},
                                  "<input type='text' id='profile_hint' size='40'/>"]);
        addTableRow(spnProfile, [{'valign': 'top',
                                  'value': "<label for='profile_description'>Description:&nbsp;&nbsp;</label>"},
                                  "<textarea id='profile_description' rows='4' cols='37'></textarea>"]);
                                  
        addTableRow(spnProfile, [{'valign': 'top',
                                  'value': "<label for='profile_annotation'>Annotation:&nbsp;&nbsp;</label>"},
                                  "<textarea id='profile_annotation' rows='4' cols='37'></textarea>"]);
        
                                
        /*spnProfile.setHTML("<tbody><tr><td valign='top'><label for='pprofile_name'><strong>Profile Name:</strong>&nbsp;&nbsp;</label></td>" +
                           "<td><input type='text' id='pprofile_name' size='40'/></td></tr>" +                           
                           "<tr><td valign='top'><label for='profile_int'>Hint:&nbsp;&nbsp;</label></td>" +
                           "<td><input type='text' id='profile_hint' size='40'/></td></tr>" +                          
                           "<tr><td valign='top'><label for='profile_description'>Description:&nbsp;&nbsp;</label></td>"+
                           "<td><textarea id='profile_description' rows='4' cols='37'></textarea></td></tr>" +
                           
                           "<tr><td valign='top'><label for='profile_annotation'>Annotation:&nbsp;&nbsp;</label></td>" +
                           "<td><textarea id='profile_annotation' rows='4' cols='37'></textarea></td></tr></tbody>");*/
        
        tabber.adopt(tabProfileDetails);
        
        new Json.Remote("/wizard/", {onComplete: function(sections){
            varData = sections;
            for(var k in sections){
                var s = sections[k];
                var tab = new Element("div", {"class": "tabbertab", "style": "height: 285px;"});
                tab.setHTML("<b>" + s.label + "</b>");
                var table = new Element("table", {"width": "100%"});
                
                s.options.each(function(op){
                    var row = [];
                    if(op.type == "list"){
                        row.push({"width": "0", "value": ""});
                        row.push("<label for='" + op.label + "'>" + op.label + "</label>");
                        
                        var selectTag = new Element("select", {"id": op.label});
                        for(var y=0; y < op.options.length; y++){
                            var lbl = op.options[y];
                            var opt = new Element("option", {"value": lbl.command});
                            opt.text = (lbl.name == "None")? "": lbl.name;
                            try{
                                selectTag.add(opt, null);
                            }catch(e){
                                // IE only
                                selectTag.add(opt);
                            }
                        }
                        row.push({"value": selectTag});
                        addTableRow(table, row);

                    }else if(op.type == "check"){
                        row.push({"width": "0", "value": "input type='checkbox' id='" + op.label + "' value='" + op.command + "'/>"});
                        row.push("<label for='" + op.label + "'>" + op.label + "</label>");
                        if(op.arg_type){
                            row.push("<input type='text' size='15' id='txt-" + op.label + "' class='wiz-input'/>");
                        }
                        addTableRow(table, row);
                    }
                });

                tab.adopt(table);
                tabber.adopt(tab);
                divLoading.addClass("hide");
                
                tabber.getElements("select").each(function(el){
                    el.addEvent("change", function(e){
                        for(var i = 0; i < this.length; i++){
                            var v = this[i].value;
                            if(i != this.selectedIndex){
                                removeCommand(v);
                            }
                        }
                        var v = this[this.selectedIndex].value;
                        updateCommand(v);
                    });
                });
                
                
                tabber.getElements("input[type=checkbox]").each(function(el){
                    el.addEvent("change", function(e){
                        var v = this.value;
                        var cmpl = ($defined($("txt-" + v.id)))? $("txt-" + v.id).value: "";
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
                        var v = $(this.id.substring("txt-".length)).value;
                        var cmpl = this.value;
                        updateCommand(v, cmpl);
                    });
                    
                    el.addEvent("keyup", function(e){
                        var v = $(this.id.substring("txt-".length)).value;
                        var cmpl = this.value;
                        updateCommand(v, cmpl);
                    });
                });
            }
            
            var tabFinish = new Element("div", {"class": "tabbertab", "style": "height: 285px;"});
            tabFinish.setHTML("UMIT generated the nmap command. Click Apply to finish this wizard.");
            tabber.adopt(tabFinish);
            
            btnNext.disabled = false;
            self.options.content.removeClass("hide");
            tabber.tabber = new tabberObj(to);
            setInputStyles();
        },
        onFailure: function(req){
            alert("Error on wizard loading. See umitweb.log for details.");
            self.close();
        }}).send();
        this.options.content.addClass("hide");
        var to = tabberOptions;
        this.options.content.adopt(title);
        this.options.content.adopt(commandConstructorDiv);
        this.options.content.adopt(new Element("hr"));
        this.options.content.setStyle("padding", "10px;");
        
        var actionDiv = new Element("div", {"style": "text-align: right"});
        var btnNext = new Element("input", {"type": "button", "value":"Next"});
        var btnPrevious = new Element("input", {"type": "button", "value":"Previous", "style": "margin-right: 6px"});
        var btnCancel = new Element("input", {"type": "button", "value":"Cancel", "style": "margin-right: 20px"});
    
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
            var size = tabber.tabber.tabs.length-2;
            switch(tabber.tabberCount){
                case 0:
                    if(!$("novice").checked){
                        /*alert("* NOT implemented! *");
                        return;*/
                    
                        self.close();
                        var rs = new ProfileEditorDialog();
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
                        /*alert("* NOT implemented! *");
                        return;*/
                    }
                    break;
                case 2:
                    if($("pprofile_name").value.trim().length == 0){
                        alert("Unnamed profile!\nYou must provide a name for this profile.");
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
                        var lastHost = $("target").value;
                        runScan(e);
                        self.close();
                    }else if($("type_profile").checked){
                        var args = {
                            name: $("pprofile_name").value,
                            command: divCommandConstructor.value,
                            hint: $("profile_hint").value,
                            description: $("profile_description").value,
                            annotation: $("profile_annotation").value
                        }
                        
                        var xhr = new XHR({method: "post",
                                      onSuccess: function(req){
                                        alert("Profile saved succefull!");
                                        updateProfiles();
                                        self.close();
                                      },
                                      onFailure: function(req){
                                        alert("Your profile could not be sent. See umitweb.log for details.");
                                      }}).send("/js/profiles/add/", Object.toQueryString(args));
                    }
                    break;
            }
            tabber.tabberCount++;
            tabber.tabber.tabShow(tabber.tabberCount);
            btnPrevious.disabled = false;
        });
        
        
        btnPrevious.addEvent("click", function(e){
            var size = tabber.tabber.tabs.length-2;
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
        divLoading = new Element("div", {"class": 'ajax-loading', "style": "float: left; width: 100%"});
        this.window.adopt(divLoading);
    }
});


function updateCommand(value, complement){
	var commandLine = $("divCommandConstructor");
	var target = "";
	if($("type_command").checked){
		target = $("command_target").value.trim();
	}else{
		target = "<target>";
	}
	
	commandLine.value = commandLine.value.replace(" " + target, "");
	var oldValue = commandLine.value;

	var regex = new RegExp(value.replace(" ", "[ ]+").replace("%s", "[^ ^$]*"));
	var newValue = "";
	if($defined(complement)){
		newValue = value.replace("%s", complement);
	}else{
		newValue = value;
	}
	
	if(oldValue.match(regex)){
		commandLine.value = oldValue.replace(regex, newValue);
	}else{
		commandLine.value += " " + newValue;
	}
	commandLine.value += " " + target;
}