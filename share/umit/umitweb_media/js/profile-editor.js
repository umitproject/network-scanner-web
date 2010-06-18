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

        var self = this;
        var title = new Element("h3");
        var commandConstructorDiv = new Element("div");
        var lbl = new Element("label");
        lbl.setHTML("<strong>Command: </strong>");
        divCommandConstructor = new Element("input", {"id": "divCommandConstructor",
                                            "style": "border:1px #DDD solid;margin: 5px;padding:4px; width: 95%;", "type": "text"});
        divCommandConstructor.value = "nmap <target>";
        commandConstructorDiv.adopt(lbl);
        commandConstructorDiv.adopt(divCommandConstructor);
        
        title.setText("UMIT Profile Editor");
        var tabber = new Element("div", {"class": "tabber", "id": "tabberCommand"});
        
        var tabProfileDetails = new Element("div", {'class': "tabbertab", 'style': "height: 305px;", 'title': "Profile"});
        
        tabProfileDetails.setHTML("<b>Profile Information</b><p/>Please, enter the profile name, " +
                                  "and optionally, enter a hint, description and annotation for this " +
                                   "new profile:");
        var spnProfile = new Element("table");
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
            
            for(var k in sections){
                var s = sections[k];
                var tab = new Element("div");
                tab.addClass("tabbertab");
                tab.title = k;
                tab.setStyle({"overflow": "auto", "height": "305px"});
                
                //tab.setHTML("<b>" + s.label + "</b>");
                
                var table = new Element("table", {width: "100%"});
                var tableContent = "<tr>";
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
                        for(var i = 0; i < this.length; i++){
                            var v = this[i].value;
                            if(i != this.selectedIndex){
                                removeCommand(v);
                            }
                        }
                        var v = this[this.selectedIndex].value;
                        updateProfile(v);
                    });
                });
                
                
                tabber.getElements("input[type=checkbox]").each(function(el){
                    el.addEvent("change", function(e){
                        var v = this.value;
                        var cmpl = ($defined($("txt-" + v.id)))? $("txt-" + v.id).value: "";
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
                        var v = $(this.id.substring("txt-".length)).value
                        var cmpl = this.value;
                        updateProfile(v, cmpl);
                    });
                    
                    el.addEvent("keyup", function(e){
                        var v = $(this.id.substring("txt-".length)).value
                        var cmpl = this.value;
                        updateProfile(v, cmpl);
                    });
                });
            }
            
            self.options.content.removeClass("hide");
            var to = {};
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
        
        var actionDiv = new Element("div", {style: "text-align: right"});
        var btnOK = new Element("input", {type: "button", value:"OK", styles: {"width": "80px;"}});
        var btnCancel = new Element("input", {type: "button", value:"Cancel", style: "margin-right: 20px"});
    
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
            var args = {
                name: $("pprofile_name").value,
                command: divCommandConstructor.value,
                hint: $("profile_hint").value,
                description: $("profile_description").value,
                annotation: $("profile_annotation").value
            }
                        
            var xhr = new XHR({method: "post",
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
        var divLoading = new Element("div");
        divLoading.addClass('ajax-loading');
        divLoading.setStyle({"float": "left", "width": "100%"});
        this.window.adopt(divLoading);
        
    }
});

function updateProfile(value, complement){
	var commandLine = $("divCommandConstructor");
	
	var target = "<target>"
	
	commandLine.value = commandLine.value.replace(" " + target, "");
	var oldValue = commandLine.value;

	var regex = new RegExp(value.replace(" ", "[ ]+").replace("%s", "[^ ^$]*"));
	
	var newValue = null;
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