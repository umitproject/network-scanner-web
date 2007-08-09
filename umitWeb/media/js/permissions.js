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

        self = this;
        tabber = new Element("div", {"class": "tabber", "id": "tabberRole"});
        
        tabMain = new Element("div", {class: "tabbertab", style: "height: 175px;", title: "Main Information"});
        tabber.adopt(tabMain);
        tabConstraints = new Element("div", {class: "tabbertab", style: "height: 175px;", title: "Constraints"});
        tabber.adopt(tabConstraints);
        
        tbl = new Element("table");
        tabMain.adopt(tbl);
        divType = new Element("span");
        divType.setText("Base Type:* ");
        selectPermType = new Element("select");
        opt1 = new Element("option", {"value": "allow"});
        opt1.setText("Allow");
        opt2 = new Element("option", {"value": "deny"});
        opt2.setText("Deny");
        selectPermType.adopt(opt1);
        selectPermType.adopt(opt2);
        divType.adopt(selectPermType);
        inputId = new Element("input", {"size": "30", "type": "text", "style": "margin-right:10px;"});
        txtDescription = new Element("textarea", {"style": "width: 435px; height: 115px;"});
        fsDescription = new Element("fieldset", {"style": "padding:0;margin:0"});
        legend = new Element("legend");
        legend.setText("Description");
        fsDescription.adopt(legend);
        fsDescription.adopt(txtDescription);
        
        currentConstraints = [];
        
        tblContents = new Element("table");
        dvConstraints = new Element("div", {"styles": {"height": "167px", "width": "415px", "border": "#CCC 1px solid", "overflow": "auto"}});
        tblConstraints = new Element("table", {"id": "constraints_table", "class": "std_table"});
        dvConstraints.adopt(tblConstraints);
        
        lnkMoveUp = new Element("a", {"href": "javascript:void(null)"});
        imgMoveUp = new Element("img", {"src": "/media/images/up.png", "alt":"Move constraint up", "title":"Move constraint up"});
        lnkMoveUp.adopt(imgMoveUp);
        lnkMoveUp.addEvent("click", function(e){
            for(j = 1; j < currentConstraints.length; j++){
                if(currentConstraints[j]["check"].checked){
                    aux = currentConstraints[j-1];
                    currentConstraints[j-1] = currentConstraints[j];
                    currentConstraints[j] = aux;
                    fillConstraintTable();
                    break;
                }
            }
        });
        
        lnkMoveDown = new Element("a", {"href": "javascript:void(null)"});
        imgMoveDown = new Element("img", {"src": "/media/images/down.png", "alt":"Move constraint down", "title":"Move constraint down"});
        lnkMoveDown.adopt(imgMoveDown);
        lnkMoveDown.addEvent("click", function(e){
            for(j = currentConstraints.length - 2; j >= 0; j--){
                if(currentConstraints[j]["check"].checked){
                    aux = currentConstraints[j+1];
                    currentConstraints[j+1] = currentConstraints[j];
                    currentConstraints[j] = aux;
                    fillConstraintTable();
                    break;
                }
            }
        });
        
        lnkAdd = new Element("a", {"href": "javascript:void(null)"});
        imgAdd = new Element("img", {"src": "/media/images/plus.png", "alt":"Add new constraint", "title":"Add new constraint"});
        lnkAdd.adopt(imgAdd);
        lnkAdd.addEvent("click", function(e){
            addPermissionRow();
        });
        
        lnkRemove = new Element("a", {"href": "javascript:void(null)"});
        imgRemove = new Element("img", {"src": "/media/images/minus.png", "alt":"Remove constraint", "title":"Remove constraint"});
        lnkRemove.adopt(imgRemove);
        lnkRemove.addEvent("click", function(e){
            for(j = 0; j < currentConstraints.length; j++){
                if(currentConstraints[j]["check"].checked){
                    if(j > 0){
                        currentConstraints[j]["check"].checked = true;
                    }
                    delete currentConstraints[j];
                    break;
                }
            }
            cc = [];
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
            d = self.options.data;
            inputId.value = d.id;
            txtDescription.value = d.description;
            inputId.readOnly = true;
        }
        
        addTableRow(tbl, ["Id:*", inputId]);
        addTableRow(tbl, [{"value": fsDescription, "attrs": {"colSpan": "2"}}]);
        divType.injectAfter(inputId);
        
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
            reqFields = [inputId]
            saveURL = "add/"
            if(self.options.data){
                saveURL = "edit/" + self.options.data.id + "/"
            }
            
            for(k = 0; k < reqFields.length; k++){
                if(reqFields[k].value.trim().length == 0){
                    alert("Please, fill all the entries marked with a '*'.");
                    reqFields[k].focus();
                    return;
                }
            }
            
            constraint_types = []
            constraints = []
            currentConstraints.each(function(c){
                constraint_types.include(c["type"].value);
                constraints.include(c["content"].value);
            });
            
            if(constraint_types.length == 0){
                alert("You must put at least one constraint.");
                tabber.tabber.tabShow(1);
                return;
            }
            
            args = {
                id: inputId.value,
                description: txtDescription.value.trim(),
                constraint_types: constraint_types.join("\n"),
                constraints: constraints.join("\n")
            }
            
            alert(Object.toQueryString(args));
                        
            /*xhr = new XHR({method: "post",
                            onSuccess: function(req){
                                try{
                                    response = null;
                                    eval('response = ' + req);
                                    varData = req
                                }catch(e){
                                    alert("Error loading response.\nCheck umitweb.log for details.");
                                    varData = req
                                    return;
                                }
                                
                                if(response.result == "OK"){
                                    alert("Role information saved succefully!");
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
            }).send(saveURL, Object.toQueryString(args));*/
        });
        
        this.options.content.adopt(tabber);
        this.options.content.adopt(actionDiv);
        to = {
            "div": tabber
        }
        tabber.tabber = new tabberObj(to);
    }
});

function fillTableData(permissions){
    t = $("permissions_table").getElement("tbody").empty();

    for(index = 0; index < permissions.length; index++){
        p = permissions[index];
        if(p.id != "allow-all" && p.id != "deny-all"){
            ch = new Element("input", {"type": "checkbox", "id": "chk-" + p.id});
            lnkEdit = new Element("a", {"href": "javascript:void(null)", "id": "" + p.id});
            lnkEdit.setText(p.id);
            lnkEdit.addEvent("click", function(e){
                new Event(e).stop();
                openPermissionDialog(this.id);
            });
            
            constraints = [];
            for(j = 0; j < p.constraints.length; j++){
                c = p.constraints[j];
                constraints.include(c["content"] + " <span style='color:#505050'><i>(" + c["type"] + ")</i></span>");
            }
            line = [ch, lnkEdit, p.description, constraints.join("<br/>")]
            className = (index % 2 == 0)? "light": "dark";
            tr = addTableRow(t, line);
            tr.addClass(className);
        }
    }
}

var currentConstraints = [];

function fillConstraintTable(){
    t = $("constraints_table").empty();
    for(j = 0; j < currentConstraints.length; j++){
        c =  currentConstraints[j];
        args = {};
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

function addPermissionRow(type, content){
    type = (type)? type: "";
    content = (content)? content: "";
    inputCheck = new Element("input", {"type": "radio", "name": "current"});
    inputCheck.checked = true;
    selectType = new Element("select");
    optCommand = new Element("option");
    optCommand.setText("command");
    selectType.add(optCommand, null);
    inputContent = new Element("input", {"type": "text"});
    currentConstraints.include({"type": selectType, "content": inputContent.clone(), "check": inputCheck.clone()});
    delete inputCheck;
    delete inputContent;
    fillConstraintTable();
}

function loadPermissionsTableData(){
    new Json.Remote("search/", {
        onComplete: fillTableData,
        onFailure: function(req){
            t = $("permissions_table").getElement("tbody").empty();
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
        new Json.Remote("get_role/" + data + "/", {
            onComplete: function(role){
                rs = new PermissionDialog({"data": role});
                rs.run();
            },
            onFailure: function(req){
                alert("Error while UMIT loading role information. See umitweb.log for details.");
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
        if(confirm("Are you sure you want to delete the selected role(s)?")){
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
            t = $("permissions_table").getElement("tbody").empty();
            addTableRow(t, [{"value": "Error loading data. Please see umitweb.log for details.", "attrs": {"colSpan": "5"}} ], {"class": "error"});
        }});
    });
});
