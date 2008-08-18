var divLoading = null;

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

        var self = this;
        var tabber = new Element("div", {"class": "tabber", "id": "tabberRole"});
        
        var tabMain = new Element("div", {"class": "tabbertab", "style": "height: 175px;", "title": "Main Information"});
        tabber.adopt(tabMain);
        tabPermissions = new Element("div", {"class": "tabbertab", "style": "height: 175px;", "title": "Permissions"});
        tabber.adopt(tabPermissions);
        
        var tbl = new Element("table");
        tabMain.adopt(tbl);
        var inputId = new Element("input", {"size": "30", "type": "text"});
        var txtDescription = new Element("textarea", {"style": "width: 385px; height: 110px;"});
        var fsDescription = new Element("fieldset", {"style": "padding:0;margin:0"});
        var legend = new Element("legend");
        legend.setText("Description");
        fsDescription.adopt(legend);
        fsDescription.adopt(txtDescription);
        
        if(self.options.data){
            var d = self.options.data;
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
            
            for(var k=0; k < permissions.length; k++){
                var p = permissions[k];
                if(p != "allow-all" && p != "deny-all"){
                    var opt = new Element("option", {"value": p});
                    if(window.ie){
                        opt.text = p;
                        selectPermissions.add(opt);
                    }else{
                        opt.setText(p);
                        selectPermissions.add(opt, null);
                    }
                }
            }
            
            var imgBtnMoveUp = new Element("img", {"src": "/media/images/up.png"});
            var btnMoveUp = new Element("a", {"href": "javascript:void(null)"});
            btnMoveUp.adopt(imgBtnMoveUp);
            btnMoveUp.addEvent("click", function(e){
                for(var j = 1; j < selectedPermissions.length; j++){
                    if(selectedPermissions[j].selected){
                        var opt = selectedPermissions[j];
                        var optBefore = selectedPermissions[j-1];
                        selectedPermissions.add(opt, optBefore);
                    }
                }
            });
            
            var imgBtnMoveDown = new Element("img", {"src": "/media/images/down.png"});
            var btnMoveDown = new Element("a", {"href": "javascript:void(null)"});
            btnMoveDown.adopt(imgBtnMoveDown);
            btnMoveDown.addEvent("click", function(e){
                for(var j = selectedPermissions.length-2; j >=0; j--){
                    if(selectedPermissions[j].selected){
                        var opt = selectedPermissions[j];
                        var optBefore = selectedPermissions[j+1];
                        opt.injectAfter(optBefore);
                    }
                }
            });
            
            var imgBtnIn = new Element("img", {"src": "/media/images/right.png"});
            var btnIn = new Element("a", {"href": "javascript:void(null)"});
            btnIn.adopt(imgBtnIn);
            btnIn.addEvent("click", function(e){
                var options = []
                for(var j = 0; j < selectPermissions.length; j++){
                    if(selectPermissions[j].selected){
                        options.include(selectPermissions[j]);
                    }
                }
                for(var j = 0; j < options.length; j++){
                    try{
                        selectedPermissions.add(options[j], null);
                    }catch(exception){
                        selectedPermissions.add(options[j]);
                    }
                }
            });
            
            var imgBtnOut = new Element("img", {"src": "/media/images/left.png"});
            var btnOut = new Element("a", {"href": "javascript:void(null)"});
            btnOut.adopt(imgBtnOut);
            btnOut.addEvent("click", function(e){
                var options = []
                for(var j = 0; j < selectedPermissions.length; j++){
                    if(selectedPermissions[j].selected){
                        options.include(selectedPermissions[j]);
                    }
                }
                for(var j = 0; j < options.length; j++){
                    try{
                        selectPermissions.add(options[j], null);
                    }catch(exception){
                        selectPermissions.add(options[j]);
                    }
                }
            });
            
            var fsSelectPermissions = new Element("fieldset", {"style": "padding: 0"});
            fsSelectPermissions.setHTML("<legend>Available Permissions</legend>");
            var fsSelectedPermissions = new Element("fieldset", {"style": "padding: 0"});
            fsSelectedPermissions.setHTML("<legend>Selected Permissions</legend>");
            
            fsSelectPermissions.adopt(selectPermissions);
            fsSelectedPermissions.adopt(selectedPermissions);
            
            var selectPermissionsTable = new Element("table");
            var lines = [
                {"value": fsSelectPermissions, "attrs": {"rowSpan": "2"}},
                {"value": btnIn, "attrs": {"valign": "bottom"}},
                {"value": fsSelectedPermissions, "attrs": {"rowSpan": "2"}},
                {"value": btnMoveUp, "attrs": {"valign": "bottom"}}
            ]
            addTableRow(selectPermissionsTable, lines);
            addTableRow(selectPermissionsTable, [{"value": btnOut, "attrs": {"valign": "top"}},
                                                 {"value": btnMoveDown, "attrs": {"valign": "top"}}]);
            var lblLast = new Element("label");
            lblLast.setText("Last Rule:");
            var selectLast = new Element("select");
            var optDeny = new Element("option", {"value": "deny-all"});
            var optAllow = new Element("option", {"value": "allow-all"});
            
            if(window.ie){
                optDeny.text = "Deny all commands";
                optAllow.text = "Allow all commands";
                selectLast.add(optDeny);
                selectLast.add(optAllow);
            }else{
                optDeny.setText("Deny all commands");
                optAllow.setText("Allow all commands");
                selectLast.add(optDeny, null);
                selectLast.add(optAllow, null);
            }
            addTableRow(selectPermissionsTable, [{"value": selectLast, "attrs": {"colSpan": "4"}}]);
            lblLast.injectBefore(selectLast);
            tabPermissions.adopt(selectPermissionsTable);
            tabPermissions.adopt(lbl);
            
            self.options.content.removeClass("hide");
            var to = {};
            to.div = tabber;
            tabber.tabber = new tabberObj(to);
            
            divLoading.addClass("hide");
            self.options.content.removeClass("hide");
            setInputStyles();
            if(self.options.data){
                for(var j = 0; j < self.options.data.permissions.length - 1; j++){
                    var opt = $$("option[value=" + self.options.data.permissions[j] + "]")[0];
                    if(window.ie){
                        selectedPermissions.add(opt);
                    }else{
                        selectedPermissions.add(opt, null);
                    }
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
        
        var actionDiv = new Element("div", {"style": "text-align: right"});
        var btnOK = new Element("input", {"type": "button", "value":"OK", "styles": {"width": "80px;"}});
        var btnCancel = new Element("input", {"type": "button", "value":"Cancel", "style": "margin-right: 20px"});
    
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
            
            
            var selectedOptions = []
            for(var k = 0; k < selectedPermissions.length; k++){
                var opt = selectedPermissions[k];
                selectedOptions.include(opt.value);
            }
            selectedOptions.include(selectLast[selectLast.selectedIndex].value);
            
            if(selectedOptions.length == 0){
                alert("You must select at least one Permission.");
                tabber.tabber.tabShow(1);
                return;
            }
            
            var args = {
                id: inputId.value,
                description: txtDescription.value.trim(),
                permissions: selectedOptions.join(",")
            }
                        
            var xhr = new XHR({method: "post",
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
        divLoading = new Element("div", {"class": 'ajax-loading', "style": "float: left; width: 100%"});
        this.window.adopt(divLoading);
        
    }
});

function fillTableData(roles){
    var t = $("roles_table").getElement("tbody");
    emptyTBody(t);

    for(var index = 0; index < roles.length; index++){
        var r = roles[index];
        var ch = new Element("input", {"type": "checkbox", "id": "chk-" + r.id});
        var lnkEdit = new Element("a", {"href": "javascript:void(null)", "id": "" + r.id});
        lnkEdit.setText(r.id);
        lnkEdit.addEvent("click", function(e){
            new Event(e).stop();
            openRoleDialog(this.id);
        });
        var line = [ch, lnkEdit, r.description, r.permissions.join(", ")]
        var className = (index % 2 == 0)? "light": "dark";
        var tr = addTableRow(t, line);
        tr.addClass(className);
    }
}

function loadRolesTableData(){
    new Json.Remote("search/", {
        onComplete: fillTableData,
        onFailure: function(req){
            var t = $("roles_table").getElement("tbody");
            emptyTBody(t);
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
        var ids = [];
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
            var roles = null;
            eval("roles = " + req);
            if(roles.length == 0){
                addTableRow(t, [{"value": "The result has found no data.", "attrs": {"colSpan": "5"}} ], {"class": "error"});
            }else{
                fillTableData(roles);
            }
        },
        onFailure: function(req){
            var t = $("roles_table").getElement("tbody");
            emptyTBody(t);
            addTableRow(t, [{"value": "Error loading data. Please see umitweb.log for details.", "attrs": {"colSpan": "5"}} ], {"class": "error"});
        }});
    });
});