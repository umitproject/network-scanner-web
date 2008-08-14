ProfileEditorDialog = Dialog.extend({
    options: {
        title: "UMIT Profile Editor",
        width: 540,
        height: 500,
        content: new Element("div")
    },
    initialize: function(options){
        this.parent(options);
        this.options.content.empty();

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
        
        title.setText("UMIT Profile Editor");
        tabber = new Element("div", {"class": "tabber", "id": "tabberCommand"});
        
        tabProfileDetails = new Element("div", {class: "tabbertab", style: "height: 305px;", title: "Profile"});
        tabProfileDetails.setHTML("<b>Profile Information</b><p/>Please, enter the profile name, " +
                                  "and optionally, enter a hint, description and annotation for this " +
                                   "new profile:");
        spnProfile = new Element("table");
        spnProfile.setHTML("<tr><td valign='top'><label for='pprofile_name'><strong>Profile Name:</strong>&nbsp;&nbsp;</label></td>" +
                           "<td><input type='text' id='pprofile_name' size='40'/></td></tr>" +
                           "<tr><td valign='top'><label for='profile_int'>Hint:&nbsp;&nbsp;</label></td>" +
                           "<td><input type='text' id='profile_hint' size='40'/></td></tr>" +
                           "<tr><td valign='top'><label for='profile_description'>Description:&nbsp;&nbsp;</label></td>"+
                           "<td><textarea id='profile_description' rows='4' cols='37'></textarea></td></tr>" +
                           "<tr><td valign='top'><label for='profile_annotation'>Annotation:&nbsp;&nbsp;</label></td>" +
                           "<td><textarea id='profile_annotation' rows='4' cols='37'></textarea></td></tr>");
        tabProfileDetails.adopt(spnProfile);
        tabber.adopt(tabProfileDetails);
        
        new Json.Remote("/profile_editor/", {onComplete: function(sections){
            varData = sections;
            for(k in sections){
                s = sections[k]
                tab = new Element("div", {class: "tabbertab", title: k, styles: {"overflow": "auto", "height": "305px"}});
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
                        updateProfile(v);
                    });
                });
                
                
                tabber.getElements("input[type=checkbox]").each(function(el){
                    el.addEvent("change", function(e){
                        v = this.value;
                        cmpl = ($defined($("txt-" + v.id)))? $("txt-" + v.id).value: "";
                        if(this.checked){
                            updateProfile(v, cmpl);
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
                        updateProfile(v, cmpl);
                    });
                    
                    el.addEvent("keyup", function(e){
                        v = $(this.id.substring("txt-".length)).value
                        cmpl = this.value;
                        updateProfile(v, cmpl);
                    });
                });
            }
            
            self.options.content.removeClass("hide");
            to = {};
            to.div = tabber;
            tabber.tabber = new tabberObj(to);
            
            setInputStyles();
        },
        onFailure: function(req){
            alert("Error on wizard loading. See umitweb.log for details.");
            self.close();
        }}).send();
        
        this.options.content.addClass("hide");
        this.options.content.adopt(title);
        this.options.content.adopt(commandConstructorDiv);
        this.options.content.adopt(new Element("hr"));
        this.options.content.setStyle("padding", "10px;");
        
        actionDiv = new Element("div", {style: "text-align: right"});
        btnOK = new Element("input", {type: "button", value:"OK", styles: {"width": "80px;"}});
        btnCancel = new Element("input", {type: "button", value:"Cancel", style: "margin-right: 20px"});
    
        actionDiv.adopt(btnCancel);
        actionDiv.adopt(btnOK);
        
        btnCancel.addEvent("click", function(e){
            self.close();
        });
        
        btnOK.addEvent("click", function(e){
            if($("pprofile_name").value.trim().length == 0){
                alert("Unnamed profile!\nou must provide a name for this profile.");
                return;
            }
            args = {
                name: $("pprofile_name").value,
                command: divCommandConstructor.value,
                hint: $("profile_hint").value,
                description: $("profile_description").value,
                annotation: $("profile_annotation").value
            }
                        
            xhr = new XHR({method: "post",
                           onSuccess: function(req){
                           alert("Profile saved succefully!");
                           updateProfiles();
                           self.close();
                          },
                          onFailure: function(req){
                            alert("Your profile could not be saved. See umitweb.log for details.");
                          }
            }).send("/js/profiles/add/", Object.toQueryString(args));
        });
        
        this.options.content.adopt(tabber);
        this.options.content.adopt(actionDiv);
        divLoading = new Element("div", {class: 'ajax-loading', style: "float: left; width: 100%"});
        this.window.adopt(divLoading);
        
    }
});

function updateProfile(value, complement){
	commandLine = $("divCommandConstructor");
	
	target = "<target>"
	
	commandLine.value = commandLine.value.replace(" " + target, "");
	oldValue = commandLine.value;

	regex = new RegExp(value.replace(" ", "[ ]+").replace("%s", "[^ ^$]*"));
	
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