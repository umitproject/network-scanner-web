currentConstraints = [];

PermissionDialog = Dialog.extend({
    options: {
        title: "Permission Management",
        width: 480,
        height: 280,
        content: new Element("div")
    },
    initialize: function(options){
        this.parent(options);
        this.options.content.empty();

        var self = this;
        var tabber = new Element("div", {"class": "tabber", "id": "tabberPermission"});
        
        var tabMain = new Element("div", {"class": "tabbertab","style": "height: 175px;", "title": "Main Information"});
        tabber.adopt(tabMain);
        var tabConstraints = new Element("div", {"class": "tabbertab", "style": "height: 175px;", "title": "Constraints"});
        tabber.adopt(tabConstraints);
        
        var tbl = new Element("table");
        tabMain.adopt(tbl);
        var divType = new Element("span");
        divType.setText("Base Type:* ");
        var selectPermType = new Element("select");
        var opt1 = new Element("option", {"value": "allow"});
        opt1.setText("Allow");
        var opt2 = new Element("option", {"value": "deny"});
        opt2.setText("Deny");
        selectPermType.adopt(opt1);
        selectPermType.adopt(opt2);
        divType.adopt(selectPermType);
        var inputId = new Element("input", {"size": "30", "type": "text", "style": "margin-right:10px;"});
        var txtDescription = new Element("textarea", {"style": "width: 435px; height: 115px;"});
        var fsDescription = new Element("fieldset", {"style": "padding:0;margin:0"});
        var legend = new Element("legend");
        legend.setText("Description");
        fsDescription.adopt(legend);
        fsDescription.adopt(txtDescription);
        
        currentConstraints = [];
        
        var tblContents = new Element("table");
        var dvConstraints = new Element("div", {"styles": {"height": "167px", "width": "415px", "border": "#CCC 1px solid", "overflow": "auto"}});
        var tblConstraints = new Element("table", {"id": "constraints_table", "class": "std_table"});
        dvConstraints.adopt(tblConstraints);
        
        var lnkMoveUp = new Element("a", {"href": "javascript:void(null)"});
        var imgMoveUp = new Element("img", {"src": "/media/images/up.png", "alt":"Move constraint up", "title":"Move constraint up"});
        lnkMoveUp.adopt(imgMoveUp);
        lnkMoveUp.addEvent("click", function(e){
            for(var j = 1; j < currentConstraints.length; j++){
                if(currentConstraints[j]["check"].checked){
                    var aux = currentConstraints[j-1];
                    currentConstraints[j-1] = currentConstraints[j];
                    currentConstraints[j] = aux;
                    fillConstraintTable();
                    break;
                }
            }
        });
        
        var lnkMoveDown = new Element("a", {"href": "javascript:void(null)"});
        var imgMoveDown = new Element("img", {"src": "/media/images/down.png", "alt":"Move constraint down", "title":"Move constraint down"});
        lnkMoveDown.adopt(imgMoveDown);
        lnkMoveDown.addEvent("click", function(e){
            for(var j = currentConstraints.length - 2; j >= 0; j--){
                if(currentConstraints[j]["check"].checked){
                    var aux = currentConstraints[j+1];
                    currentConstraints[j+1] = currentConstraints[j];
                    currentConstraints[j] = aux;
                    fillConstraintTable();
                    break;
                }
            }
        });
        
        var lnkAdd = new Element("a", {"href": "javascript:void(null)"});
        var imgAdd = new Element("img", {"src": "/media/images/plus.png", "alt":"Add new constraint", "title":"Add new constraint"});
        lnkAdd.adopt(imgAdd);
        lnkAdd.addEvent("click", function(e){
            addPermissionRow();
        });
        
        var lnkRemove = new Element("a", {"href": "javascript:void(null)"});
        var imgRemove = new Element("img", {"src": "/media/images/minus.png", "alt":"Remove constraint", "title":"Remove constraint"});
        lnkRemove.adopt(imgRemove);
        lnkRemove.addEvent("click", function(e){
            for(var j = 0; j < currentConstraints.length; j++){
                if(currentConstraints[j]["check"].checked){
                    if(j > 0){
                        currentConstraints[j]["check"].checked = true;
                    }
                    delete currentConstraints[j];
                    break;
                }
            }
            var cc = [];
            currentConstraints.each(function(c){
                if(typeof c != "undefined"){
                    cc.include(c);
                }
            });
            currentConstraints = cc;
            fillConstraintTable();
        });
        
        addTableRow(tblContents, [{"value": dvConstraints, "attrs": {"rowSpan": "4"}},
                                  {"value": lnkAdd, "attrs": {"width": "0", "align":"center"}}]);
        addTableRow(tblContents, [{"value": lnkRemove, "attrs": {"width": "0", "align":"center"}}]);
        addTableRow(tblContents, [{"value": lnkMoveUp, "attrs": {"width": "0", "align":"center"}}]);
        addTableRow(tblContents, [{"value": lnkMoveDown, "attrs": {"width": "0", "align":"center"}}]);
        tabConstraints.adopt(tblContents);
        
        if(self.options.data){
            var d = self.options.data;
            inputId.value = d.id;
            txtDescription.value = d.description;
            inputId.readOnly = true;
            if(d.type == opt1.value){
                opt1.selected = true;
            }else{
                opt2.selected = true;
            }
        }
        
        addTableRow(tbl, ["Id:*", inputId]);
        addTableRow(tbl, [{"value": fsDescription, "attrs": {"colSpan": "2"}}]);
        divType.injectAfter(inputId);
        
        this.options.content.setStyle("padding", "10px;");
        
        actionDiv = new Element("div", {style: "text-align: right"});
        btnOK = new Element("input", {type: "button", "value":"OK", "styles": {"width": "80px;"}});
        btnCancel = new Element("input", {type: "button", "value":"Cancel", "style": "margin-right: 20px"});
    
        actionDiv.adopt(btnCancel);
        actionDiv.adopt(btnOK);
        
        btnCancel.addEvent("click", function(e){
            self.close();
        });
        
        btnOK.addEvent("click", function(e){
            var reqFields = [inputId]
            var saveURL = "add/"
            if(self.options.data){
                saveURL = "edit/" + self.options.data.id + "/"
            }
            
            for(var k = 0; k < reqFields.length; k++){
                if(reqFields[k].value.trim().length == 0){
                    alert("Please, fill all the entries marked with a '*'.");
                    reqFields[k].focus();
                    return;
                }
            }
            
            var constraint_types = []
            var constraints = []
            currentConstraints.each(function(c){
                constraint_types.extend([c["type"].value]);
                constraints.extend([c["content"].value]);
            });
            
            if(constraint_types.length == 0){
                alert("You must put at least one constraint.");
                tabber.tabber.tabShow(1);
                return;
            }
            
            var args = {
                "id": inputId.value,
                "type": selectPermType[selectPermType.selectedIndex].value,
                "description": txtDescription.value.trim(),
                "constraint_types": constraint_types.join("\n"),
                "constraints": constraints.join("\n")
            }
                        
            var xhr = new XHR({method: "post",
                            onSuccess: function(req){
                                try{
                                    var response = null;
                                    eval('response = ' + req);
                                    varData = req
                                }catch(e){
                                    alert("Error loading response.\nCheck umitweb.log for details.");
                                    varData = req
                                    return;
                                }
                                
                                if(response.result == "OK"){
                                    alert("Permission information saved succefully!");
                                    loadPermissionsTableData();
                                    self.close();
                                }else{
                                    alert(response.error);
                                    return;
                                }
                           },
                           onFailure: function(req){
                            alert("The user information could not be saved. See umitweb.log for details.");
                           }
            }).send(saveURL, Object.toQueryString(args));
        });
        
        this.options.content.adopt(tabber);
        this.options.content.adopt(actionDiv);
        var to = {
            "div": tabber
        }
        tabber.tabber = new tabberObj(to);
        if(self.options.data){
            var d = self.options.data;
            d.constraints.each(function(constraint){
                addPermissionRow(constraint.type, constraint.content, constraint, tblConstraints);
            });
        }
    }
});


// Helper functions
function fillTableData(permissions){
    var t = $("permissions_table").getElement("tbody");
    emptyTBody(t);

    for(var index = 0; index < permissions.length; index++){
        var p = permissions[index];
        if(p.id != "allow-all" && p.id != "deny-all"){
            var ch = new Element("input", {"type": "checkbox", "id": "chk-" + p.id});
            var lnkEdit = new Element("a", {"href": "javascript:void(null)", "id": "" + p.id});
            lnkEdit.setText(p.id);
            lnkEdit.addEvent("click", function(e){
                new Event(e).stop();
                openPermissionDialog(this.id);
            });
            
            var constraints = [];
            for(var j = 0; j < p.constraints.length; j++){
                var c = p.constraints[j];
                constraints.include(c["content"] + " <span style='color:#505050'><i>(" + c["type"] + ")</i></span>");
            }
            var imgType = new Element("img", {"src": "/media/images/" + (p.type=="allow"? "open": "closed") + ".png",
                                          "title": p.type, "alt": p.type});
            var line = [ch, lnkEdit, {"value": imgType, "attrs": {"align": "center"}}, p.description, constraints.join("<br/>")]
            var className = (index % 2 == 0)? "light": "dark";
            tr = addTableRow(t, line);
            tr.addClass(className);
        }
    }
}



function fillConstraintTable(tbl){
    var t = tbl==null? $("constraints_table"): tbl;
    emptyTBody(t);
    for(var j = 0; j < currentConstraints.length; j++){
        var c =  currentConstraints[j];
        var args = {};
        addTableRow(t, [c["check"], "Type: ", c["type"], "Content: ", c["content"]]);
        
        c["check"].removeEvents();
        c["check"].addEvent("focus", function(e){
            this.checked = true;
            this.parentNode.parentNode.addClass("dark");
        });
        
        c["check"].addEvent("blur", function(e){
            this.parentNode.parentNode.removeClass("dark");
        });
        
        if(c["check"].checked == true){
            c["check"].fireEvent("focus");
        }else{
            c["check"].fireEvent("blur");
        }
        currentConstraints[j] = c;
    }
    setInputStyles();
}

function addPermissionRow(type, content, data, tbl){
    type = (type)? type: "";
    content = (content)? content: "";
    var inputCheck = new Element("input", {"type": "radio", "name": "current"});
    inputCheck.checked = true;
    var selectType = new Element("select");
    var optCommand = new Element("option");
    optCommand.setText("command");
    selectType.add(optCommand, null);
    var inputContent = new Element("input", {"type": "text"});
    if(data){
        inputContent.value = data["content"];
        if(optCommand.value == data["type"]){
            optCommand.selected = true;
        }
    }
    currentConstraints.include({"type": selectType, "content": inputContent.clone(), "check": inputCheck.clone()});
    delete inputCheck;
    delete inputContent;
    fillConstraintTable(tbl);
}

function loadPermissionsTableData(){
    new Json.Remote("search/", {
        onComplete: fillTableData,
        onFailure: function(req){
            var t = $("permissions_table").getElement("tbody");
            emptyTBody(t);
            addTableRow(t, [{"value": "Error loading data. Please see umitweb.log for details.", "attrs": {"colSpan": "4"}}], {"class": "error"});
        }
    }).send();
}

function openPermissionDialog(data){
    try{
        rs.close();
        delete rs;
    }catch(e){}
    
    if(!data){
        rs = new PermissionDialog();
        rs.run();
    }else{
        new Json.Remote("get_permission/" + data + "/", {
            onComplete: function(permission){
                rs = new PermissionDialog({"data": permission});
                rs.run();
            },
            onFailure: function(req){
                alert("Error while UMIT loading permission information. See umitweb.log for details.");
            }
        }).send();
    }
}

window.addEvent("domready", function(e){
    loadPermissionsTableData();
    
    $("delete-permission").addEvent("click", function(e){
        new Event(e).stop();
        ids = [];
        $$("input[type=checkbox]").each(function(inp){
            if(inp.checked){
                ids.include(inp.id.substring("chk-".length));
            }
        });
        if(ids.length == 0){
            alert("There are no records to be deleted.");
            return;
        }
        if(confirm("Are you sure you want to delete the selected permission(s)?")){
            ids.each(function(id){
                new Json.Remote("delete/" + id + "/", {onComplete: function(e){loadPermissionsTableData()}}).send();
            });
        }
    });
    
    $("frmSearch").addEvent("submit", function(e){
        new Event(e).stop();
        this.send({onComplete: function(req){
            permissions = null;
            eval("permissions = " + req);
            if(permissions.length == 0){
                addTableRow(t, [{"value": "The result has found no data.", "attrs": {"colSpan": "5"}} ], {"class": "error"});
            }else{
                fillTableData(permissions);
            }
        },
        onFailure: function(req){
            var t = $("permissions_table").getElement("tbody");
            emptyTBody(t);
            addTableRow(t, [{"value": "Error loading data. Please see umitweb.log for details.", "attrs": {"colSpan": "5"}} ], {"class": "error"});
        }});
    });
});
