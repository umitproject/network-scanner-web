UserDialog = Dialog.extend({
    options: {
        title: "User Management",
        width: 430,
        height: 250,
        content: new Element("div")
    },
    initialize: function(options){
        this.parent(options);
        this.options.content.empty();

        var thisObj = this;
        tabber = new Element("div", {"class": "tabber", "id": "tabberUser"});
        
        tabMain = new Element("div", {"class": "tabbertab", "style": "height: 145px;", "title": "Main Information"});
        tabber.adopt(tabMain);
        tabRoles = new Element("div", {"class": "tabbertab", "style": "height: 145px;", "title": "Roles"});
        tabber.adopt(tabRoles);
        
        tbl = new Element("table");
        tabMain.adopt(tbl);
        inputName = new Element("input", {"size": "30", "type": "text"});
        inputLogin = new Element("input", {"size": "30", "type": "text"});
        inputPassword = new Element("input", {"size": "30", "type": "password"});
        inputConfirmPassword = new Element("input", {"size": "30", "type": "password"});
        inputSuperuser = new Element("input", {"type": "checkbox", "id": "check_superuser"});
        lblSuperuser = new Element("label", {"for": "check_superuser"});
        lblSuperuser.setText("User can create other users?");
        
        if(thisObj.options.data){
            d = thisObj.options.data;
            inputName.value = d.name;
            inputLogin.value = d.login;
            inputSuperuser.checked = d.superuser;
            inputLogin.readOnly = true;
        }
        
        addTableRow(tbl, ["", "Name:*", inputName]);
        addTableRow(tbl, ["", "Login:*", inputLogin]);
        addTableRow(tbl, ["", "Password:*", inputPassword]);
        if(thisObj.options.data){
            hintPassword = new Element("span", {"class": "hint"});
            hintPassword.setText("Fill the field above ONLY if you want to change the password.");
            addTableRow(tbl, [{"value": hintPassword, "attrs": {"colSpan": "3"}}]);
            this.window.setStyle("height", (this.options.height + 20) + "px");
            tabMain.setStyle("height", "165px");
            tabRoles.setStyle("height", "165px");
        }
        addTableRow(tbl, ["", "Confirm password:", inputConfirmPassword]);
        addTableRow(tbl, [{"value": inputSuperuser, "attrs": {"width": "0"}}, {"value": lblSuperuser, "attrs": {"colSpan": "2"}}]);
        
        new Json.Remote("../roles/get_all/", {onComplete: function(roles){
            selectRoles = new Element("select", {"style": "width: 160px"});
            selectedRoles = new Element("select", {"style": "width: 160px"});
            selectRoles.size = 6;
            selectRoles.multiple = true;
            selectedRoles.size = 6;
            selectedRoles.multiple = true;
            lbl = new Element("label");
            lbl.setText("Hold ctrl+click to select multiple");
            lbl.addClass("hint");
            
            for(k=0; k < roles.length; k++){
                r = roles[k];
                opt = new Element("option", {"value": r.value});
                opt.setText(r.description + " (" + r.value + ")");
                selectRoles.add(opt, null);
            }
            
            /* TODO */
            imgBtnMoveUp = new Element("img", {"src": "/media/images/up.png"});
            btnMoveUp = new Element("a", {"href": "javascript:void(null)"});
            btnMoveUp.adopt(imgBtnMoveUp);
            btnMoveUp.addEvent("click", function(e){
                for(j = 1; j < selectedRoles.length; j++){
                    if(selectedRoles[j].selected){
                        opt = selectedRoles[j];
                        optBefore = selectedRoles[j-1];
                        selectedRoles.add(opt, optBefore);
                    }
                }
            });
            
            imgBtnMoveDown = new Element("img", {"src": "/media/images/down.png"});
            btnMoveDown = new Element("a", {"href": "javascript:void(null)"});
            btnMoveDown.adopt(imgBtnMoveDown);
            btnMoveDown.addEvent("click", function(e){
                for(j = selectedRoles.length-2; j >= 0; j--){
                    if(selectedRoles[j].selected){
                        var opt = selectedRoles[j];
                        optBefore = selectedRoles[j+1];
                        opt.injectAfter(optBefore);
                    }
                }
            });
            
            imgBtnIn = new Element("img", {"src": "/media/images/right.png"});
            btnIn = new Element("a", {"href": "javascript:void(null)"});
            btnIn.adopt(imgBtnIn);
            btnIn.addEvent("click", function(e){
                options = []
                for(j = 0; j < selectRoles.length; j++){
                    if(selectRoles[j].selected){
                        options.include(selectRoles[j]);
                    }
                }
                for(j = 0; j < options.length; j++){
                    selectedRoles.add(options[j], null);
                }
            });
            
            imgBtnOut = new Element("img", {"src": "/media/images/left.png"});
            btnOut = new Element("a", {"href": "javascript:void(null)"});
            btnOut.adopt(imgBtnOut);
            btnOut.addEvent("click", function(e){
                options = []
                for(j = 0; j < selectedRoles.length; j++){
                    if(selectedRoles[j].selected){
                        options.include(selectedRoles[j]);
                    }
                }
                for(j = 0; j < options.length; j++){
                    selectRoles.add(options[j], null);
                }
            });
            
            fsSelectRoles = new Element("fieldset", {"style": "padding: 0"});
            fsSelectRoles.setHTML("<legend>Available Roles</legend>");
            fsSelectedRoles = new Element("fieldset", {"style": "padding: 0"});
            fsSelectedRoles.setHTML("<legend>Selected Roles</legend>");
            
            fsSelectRoles.adopt(selectRoles);
            fsSelectedRoles.adopt(selectedRoles);
            
            selectRolesTable = new Element("table");
            lines = [
                {"value": fsSelectRoles, "attrs": {"rowSpan": "2"}},
                {"value": btnIn, "attrs": {"align": "bottom"}},
                {"value": fsSelectedRoles, "attrs": {"rowSpan": "2"}},
                {"value": btnMoveUp, "attrs": {"align": "top"}}
            ]
            addTableRow(selectRolesTable, lines);
            addTableRow(selectRolesTable, [btnOut, btnMoveDown]);
            tabRoles.adopt(selectRolesTable);
            tabRoles.adopt(lbl);
            
            thisObj.options.content.removeClass("hide");
            to = {};
            to.div = tabber;
            tabber.tabber = new tabberObj(to);
            
            divLoading.addClass("hide");
            thisObj.options.content.removeClass("hide");
            setInputStyles();
            if(thisObj.options.data){
                for(j = 0; j < thisObj.options.data.roles.length; j++){
                    opt = $$("option[value=" + thisObj.options.data.roles[j] + "]")[0];
                    selectedRoles.add(opt, null);
                }
            }
        },
        onFailure: function(req){
            alert("Error while UMIT loading roles. See umitweb.log for details.");
            thisObj.close();
        }}).send();
        
        this.options.content.addClass("hide");
        this.options.content.setStyle("padding", "10px;");
        
        actionDiv = new Element("div", {style: "text-align: right"});
        btnOK = new Element("input", {type: "button", value:"OK", styles: {"width": "80px;"}});
        btnCancel = new Element("input", {type: "button", value:"Cancel", style: "margin-right: 20px"});
    
        actionDiv.adopt(btnCancel);
        actionDiv.adopt(btnOK);
        
        btnCancel.addEvent("click", function(e){
            thisObj.close();
        });
        
        btnOK.addEvent("click", function(e){
            reqFields = [inputName, inputLogin]
            saveURL = "add/"
            if(thisObj.options.data){
                saveURL = "edit/" + thisObj.options.data.login + "/"
            }else{
                reqFields.include(inputPassword)
            }
            
            for(k = 0; k < reqFields.length; k++){
                if(reqFields[k].value.trim().length == 0){
                    alert("Please, fill all the entries marked with a '*'.");
                    reqFields[k].focus();
                    return;
                }
            }
            
            if(inputPassword.value != inputConfirmPassword.value){
                alert("The passwords are not the same");
                return;
            }
            
            selectedOptions = []
            for(k = 0; k < selectedRoles.length; k++){
                opt = selectedRoles[k];
                selectedOptions.include(opt.value);
            }
            
            if(selectedOptions.length == 0){
                alert("You must select at least one role.");
                tabber.tabber.tabShow(1);
                return;
            }
            
            args = {
                name: inputName.value,
                login: inputLogin.value,
                password: inputPassword.value,
                superuser: inputSuperuser.checked? "yes": "no",
                roles: selectedOptions.join(",")
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
                                    alert("User information saved succefully!");
                                    
                                    loadUsersTableData();
                                    thisObj.close();
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

function fillTableData(users){
    var t = $("users_table").getElement("tbody");
    emptyTBody(t);

    for(index = 0; index < users.length; index++){
        u = users[index];
        ch = new Element("input", {"type": "checkbox", "id": "chk-" + u.login});
        lnkEdit = new Element("a", {"href": "javascript:void(null)", "id": "" + u.login});
        lnkEdit.setText(u.name);
        lnkEdit.addEvent("click", function(e){
            new Event(e).stop();
            openUserDialog(this.id);
        });
        imgSrc = u.superuser ? "open": "closed";
        imgAlt = u.superuser ? "yes": "no";
        imgSuperuser = new Element("img", {"src": "/media/images/" + imgSrc + ".png", "title": imgAlt, "alt": imgAlt});
        line = [ch, lnkEdit, u.login, {"value": imgSuperuser, "attrs": {"align": "center"}}, u.roles.join(", ")]
        className = (index % 2 == 0)? "light": "dark";
        tr = addTableRow(t, line);
        tr.addClass(className);
    }
}

function loadUsersTableData(){
    new Json.Remote("get_all/", {
        onComplete: fillTableData,
        onFailure: function(req){
            var t = $("users_table").getElement("tbody");
            emptyTBody(t);
            addTableRow(t, [{"value": "Error loading data. Please see umitweb.log for details.", "attrs": {"colSpan": "5"}} ], {"class": "error"});
        }
    }).send();
}

function openUserDialog(data){
    try{
        rs.close();
        delete rs;
    }catch(e){}
    
    if(!data){
        rs = new UserDialog();
        rs.run();
    }else{
        new Json.Remote("get_user/" + data + "/", {
            onComplete: function(user){
                rs = new UserDialog({"data": user});
                rs.run();
            },
            onFailure: function(req){
                alert("Error while UMIT loading user information. See umitweb.log for details.");
                thisObj.close();
            }
        }).send();
    }
}

window.addEvent("domready", function(e){
    loadUsersTableData();
    
    $("delete-user").addEvent("click", function(e){
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
        if(confirm("Are you sure you want to delete the selected user(s)?")){
            ids.each(function(id){
                new Json.Remote("delete/" + id + "/", {onComplete: function(e){loadUsersTableData()}}).send();
            });
        }
    });
    
    $("frmSearch").addEvent("submit", function(e){
        new Event(e).stop();
        this.send({onComplete: function(req){
            users = null;
            eval("users = " + req);
            if(users.length == 0){
                addTableRow(t, [{"value": "The result has found no data.", "attrs": {"colSpan": "5"}} ], {"class": "error"});
            }else{
                fillTableData(users);
            }
        },
        onFailure: function(req){
            var t = $("users_table").getElement("tbody");
            emptyTBody(t);
            addTableRow(t, [{"value": "Error loading data. Please see umitweb.log for details.", "attrs": {"colSpan": "5"}} ], {"class": "error"});
        }});
    });
});