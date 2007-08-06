var constraintCount = 0;

PermissionDialog = Dialog.extend({
    options: {
        title: "Permission Management",
        width: 430,
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
        inputId = new Element("input", {"size": "30", "type": "text"});
        txtDescription = new Element("textarea", {"style": "width: 385px; height: 110px;"});
        fsDescription = new Element("fieldset", {"style": "padding:0;margin:0"});
        legend = new Element("legend");
        legend.setText("Description");
        fsDescription.adopt(legend);
        fsDescription.adopt(txtDescription);
        
        if(self.options.data){
            d = self.options.data;
            inputId.value = d.id;
            txtDescription.value = d.description;
            inputId.readOnly = true;
        }
        
        addTableRow(tbl, ["Id:*", inputId]);
        addTableRow(tbl, [{"value": fsDescription, "attrs": {"colSpan": "2"}}]);
        
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
            
            
            selectedOptions = []
            for(k = 0; k < selectedPermissions.length; k++){
                opt = selectedPermissions[k];
                selectedOptions.include(opt.value);
            }
            selectedOptions.include(selectLast[selectLast.selectedIndex].value);
            
            if(selectedOptions.length == 0){
                alert("You must select at least one Permission.");
                tabber.tabber.tabShow(1);
                return;
            }
            
            args = {
                id: inputId.value,
                description: txtDescription.value.trim(),
                permissions: selectedOptions.join(",")
            }
                        
            xhr = new XHR({method: "post",
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
            }).send(saveURL, Object.toQueryString(args));
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
            className = (index % 2 == 0)? "dark": "light";
            addTableRow(t, line, {"class": className});
        }
    }
}

function addPermissionRow(tbl, type, content){
    type = (type)? type: "";
    content = (content)? content: "";
    
    selectType = new Element("select", {"id": "type-" + constraintCount});
    inputContent = new Element("input", {"type": "text", "id": "content-" + constraintCount});
    lblType = new Element("label");
    lblContent = new Element("content");
    
    constraintCount++;
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
