RoleDialog = Dialog.extend({
    options: {
        title: "Role Management",
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
        tabPermissions = new Element("div", {class: "tabbertab", style: "height: 175px;", title: "Permissions"});
        tabber.adopt(tabPermissions);
        
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
        
        new Json.Remote("../permissions/get_all/", {onComplete: function(permissions){
            selectPermissions = new Element("select", {"style": "width: 160px"});
            selectedPermissions = new Element("select", {"style": "width: 160px"});
            selectPermissions.size = 6;
            selectPermissions.multiple = true;
            selectedPermissions.size = 6;
            selectedPermissions.multiple = true;
            lbl = new Element("label");
            lbl.setText("Hold ctrl+click to select multiple");
            lbl.addClass("hint");
            
            for(k=0; k < permissions.length; k++){
                p = permissions[k];
                if(p != "allow-all" && p != "deny-all"){
                    opt = new Element("option", {"value": p});
                    opt.setText(p);
                    selectPermissions.add(opt, null);
                }
            }
            
            imgBtnMoveUp = new Element("img", {"src": "/media/images/up.png"});
            btnMoveUp = new Element("a", {"href": "javascript:void(null)"});
            btnMoveUp.adopt(imgBtnMoveUp);
            btnMoveUp.addEvent("click", function(e){
                for(j = 1; j < selectedPermissions.length; j++){
                    if(selectedPermissions[j].selected){
                        opt = selectedPermissions[j];
                        optBefore = selectedPermissions[j-1];
                        selectedPermissions.add(opt, optBefore);
                    }
                }
            });
            
            imgBtnMoveDown = new Element("img", {"src": "/media/images/down.png"});
            btnMoveDown = new Element("a", {"href": "javascript:void(null)"});
            btnMoveDown.adopt(imgBtnMoveDown);
            btnMoveDown.addEvent("click", function(e){
                for(j = selectedPermissions.length-2; j >=0; j--){
                    if(selectedPermissions[j].selected){
                        opt = selectedPermissions[j];
                        optBefore = selectedPermissions[j+1];
                        opt.injectAfter(optBefore);
                    }
                }
            });
            
            imgBtnIn = new Element("img", {"src": "/media/images/right.png"});
            btnIn = new Element("a", {"href": "javascript:void(null)"});
            btnIn.adopt(imgBtnIn);
            btnIn.addEvent("click", function(e){
                options = []
                for(j = 0; j < selectPermissions.length; j++){
                    if(selectPermissions[j].selected){
                        options.include(selectPermissions[j]);
                    }
                }
                for(j = 0; j < options.length; j++){
                    selectedPermissions.add(options[j], null);
                }
            });
            
            imgBtnOut = new Element("img", {"src": "/media/images/left.png"});
            btnOut = new Element("a", {"href": "javascript:void(null)"});
            btnOut.adopt(imgBtnOut);
            btnOut.addEvent("click", function(e){
                options = []
                for(j = 0; j < selectedPermissions.length; j++){
                    if(selectedPermissions[j].selected){
                        options.include(selectedPermissions[j]);
                    }
                }
                for(j = 0; j < options.length; j++){
                    selectPermissions.add(options[j], null);
                }
            });
            
            fsSelectPermissions = new Element("fieldset", {"style": "padding: 0"});
            fsSelectPermissions.setHTML("<legend>Available Permissions</legend>");
            fsSelectedPermissions = new Element("fieldset", {"style": "padding: 0"});
            fsSelectedPermissions.setHTML("<legend>Selected Permissions</legend>");
            
            fsSelectPermissions.adopt(selectPermissions);
            fsSelectedPermissions.adopt(selectedPermissions);
            
            selectPermissionsTable = new Element("table");
            lines = [
                {"value": fsSelectPermissions, "attrs": {"rowSpan": "2"}},
                {"value": btnIn, "attrs": {"valign": "bottom"}},
                {"value": fsSelectedPermissions, "attrs": {"rowSpan": "2"}},
                {"value": btnMoveUp, "attrs": {"valign": "bottom"}}
            ]
            addTableRow(selectPermissionsTable, lines);
            addTableRow(selectPermissionsTable, [{"value": btnOut, "attrs": {"valign": "top"}},
                                                 {"value": btnMoveDown, "attrs": {"valign": "top"}}]);
            lblLast = new Element("label");
            lblLast.setText("Last Rule:");
            selectLast = new Element("select");
            optDeny = new Element("option", {"value": "deny-all"});
            optAllow = new Element("option", {"value": "allow-all"});
            optDeny.setText("Deny all commands");
            optAllow.setText("Allow all commands");
            selectLast.add(optDeny, null);
            selectLast.add(optAllow, null);
            addTableRow(selectPermissionsTable, [{"value": selectLast, "attrs": {"colSpan": "4"}}]);
            lblLast.injectBefore(selectLast);
            tabPermissions.adopt(selectPermissionsTable);
            tabPermissions.adopt(lbl);
            
            self.options.content.removeClass("hide");
            to = {};
            to.div = tabber;
            tabber.tabber = new tabberObj(to);
            
            divLoading.addClass("hide");
            self.options.content.removeClass("hide");
            setInputStyles();
            if(self.options.data){
                for(j = 0; j < self.options.data.permissions.length - 1; j++){
                    opt = $$("option[value=" + self.options.data.permissions[j] + "]")[0];
                    selectedPermissions.add(opt, null);
                }
                if(self.options.data.permissions[self.options.data.permissions.length-1] == "allow-all"){
                    optAllow.selected = true;
                }else{
                    optDeny.selected = true;
                }
            }
        },
        onFailure: function(req){
            alert("Error while UMIT loading roles. See umitweb.log for details.");
            self.close();
        }}).send();
        
        this.options.content.addClass("hide");
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
                                    loadRolesTableData();
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
        divLoading = new Element("div", {class: 'ajax-loading', style: "float: left; width: 100%"});
        this.window.adopt(divLoading);
        
    }
});

function fillTableData(roles){
    t = $("roles_table").getElement("tbody").empty();

    for(index = 0; index < roles.length; index++){
        r = roles[index];
        ch = new Element("input", {"type": "checkbox", "id": "chk-" + r.id});
        lnkEdit = new Element("a", {"href": "javascript:void(null)", "id": "" + r.id});
        lnkEdit.setText(r.id);
        lnkEdit.addEvent("click", function(e){
            new Event(e).stop();
            openRoleDialog(this.id);
        });
        line = [ch, lnkEdit, r.description, r.permissions.join(", ")]
        className = (index % 2 == 0)? "light": "dark";
        tr = addTableRow(t, line);
        tr.addClass(className);
    }
}

function loadRolesTableData(){
    new Json.Remote("search/", {
        onComplete: fillTableData,
        onFailure: function(req){
            t = $("roles_table").getElement("tbody").empty();
            addTableRow(t, [{"value": "Error loading data. Please see umitweb.log for details.", "attrs": {"colSpan": "4"}}], {"class": "error"});
        }
    }).send();
}

function openRoleDialog(data){
    try{
        rs.close();
        delete rs;
    }catch(e){}
    
    if(!data){
        rs = new RoleDialog();
        rs.run();
    }else{
        new Json.Remote("get_role/" + data + "/", {
            onComplete: function(role){
                rs = new RoleDialog({"data": role});
                rs.run();
            },
            onFailure: function(req){
                alert("Error while UMIT loading role information. See umitweb.log for details.");
            }
        }).send();
    }
}

window.addEvent("domready", function(e){
    loadRolesTableData();
    
    $("delete-role").addEvent("click", function(e){
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
                new Json.Remote("delete/" + id + "/", {onComplete: function(e){loadRolesTableData()}}).send();
            });
        }
    });
    
    $("frmSearch").addEvent("submit", function(e){
        new Event(e).stop();
        this.send({onComplete: function(req){
            roles = null;
            eval("roles = " + req);
            if(roles.length == 0){
                addTableRow(t, [{"value": "The result has found no data.", "attrs": {"colSpan": "5"}} ], {"class": "error"});
            }else{
                fillTableData(roles);
            }
        },
        onFailure: function(req){
            t = $("roles_table").getElement("tbody").empty();
            addTableRow(t, [{"value": "Error loading data. Please see umitweb.log for details.", "attrs": {"colSpan": "5"}} ], {"class": "error"});
        }});
    });
});