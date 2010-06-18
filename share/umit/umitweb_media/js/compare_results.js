var varData = null;
var handler = null;

DiffHandler = new Class({
    "color": function(){
        if(diff_text != null){
            var last_tag = null;
            var new_text = [];
            var removed = /^-.*/;
            var styles = {
                added: {"style": "background-color:" + diff_colors.added,
                        "regex": /^\+.*/},
                removed: {"style": "background-color:" + diff_colors.not_present,
                          "regex": /^-.*/}
            };
            var new_lines = [];
            for(var i = 0; i < diff_text.length; i++){
                var found = false;
                var line = diff_text[i];
                for(k in styles){
                    if(line.match(styles[k].regex)){
                        found = true;
                        new_lines.extend(["<span style='" + styles[k].style + "'>" + line + "</span>"]);
                        break;
                    }
                }
                if(!found){
                    new_lines.extend([line]);
                }
            }
            $("diff-pane").setHTML(new_lines.join("<br/>"));
        }
        if(diff_compare != null){
            emptyTBody($("compare-table").getElement("tbody"));
            this.showCompareTable(diff_compare, true);
        }
    },
    "showCompareTable": function(childs, color, spaces, classLine){
        var tbl = $("compare-table").getElement("tbody");
        var self = this;
        
        if(spaces == null){
            spaces = "";
        }
        
        childs.each(function(c){
            var spn1rstCell = new Element("span");
            spn1rstCell.setHTML("<span>" + spaces + "</span>");
            var lnk = new Element("a", {"href": "javascript:void(null)", "styles": {"display": "inline"}});
            lnk.adopt(new Element("img", {"src": "/media/images/plus.png", "styles": {"display": "inline"}}));
            spn1rstCell.appendText(c.state);
            spn1rstCell.setStyle("margin:0");
            spn1rstCell.setStyle("padding:0");
            var tr = addTableRow(tbl, [{"value": spn1rstCell, "attrs": {"padding": "0"}}, 
                                  {"value": c.section, "attrs": {"styles": {"white-space": "nowrap", "padding": "0"}}}, 
                                  {"value": c.property, "attrs": {"styles": {"white-space": "nowrap", "padding": "0"}}}, 
                                  {"value": c.value1, "attrs": {"styles": {"white-space": "nowrap", "padding": "0"}}}, 
                                  {"value": c.value2, "attrs": {"styles": {"white-space": "nowrap", "padding": "0"}}}]);
            
            tr.childLines = [];
            tr.setStyle("padding", "0");
            if(c.section.trim().length > 0){
                tr.id = (classLine != null ? classLine + "-": "") + c.section.replace(" ", "-", "g");
            }else{
                tr.id = (classLine != null ? classLine + "-": "") + c.property.replace(" ", "-", "g");
            }
            
            if(classLine){
                tr.addClass(classLine);
                tr.addClass("hide");
                $(classLine).childLines.extend([tr]);
                tr.parentLine = $(classLine);
            }else{
                tr.parentLine = null;
            }
            
            tr.lineAction = "show";
            
            if(c.childs.length > 0){
                tr.addEvent("click", function(e){
                    toggleLine(this);
                });
                tr.setStyle("cursor", "hand");
            }
            if(color){
                if(c.state == "A"){
                    tr.setStyle("backgroundColor", diff_colors.added);
                }else if(c.state == "M"){
                    tr.setStyle("backgroundColor", diff_colors.modified);
                }else if(c.state == "U"){
                    tr.setStyle("backgroundColor", diff_colors.unchanged);
                }else if(c.state == "N"){
                    tr.setStyle("backgroundColor", diff_colors.not_present);
                }
            }
            if(c.childs.length > 0){
                self.showCompareTable(c.childs, color, spaces+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", tr.id);
            }
        });
    },
    "uncolor": function(){
        if(diff_text != null){
            $("diff-pane").setHTML(diff_text.join("<br/>"));
        }
        if(diff_compare != null){
            emptyTBody($("compare-table").getElement("tbody"));
            this.showCompareTable(diff_compare, false);
        }
    }
});

var handler = null;
var diff_text;
var diff_compare;

function toggleLine(line){
    line.childLines.each(function(child){
        if(child.childLines.length > 0 && child.lineAction == "hide"){
            toggleLine(child);
        }
        
        if(child.lineAction == "show"){
            child.removeClass("hide");
            child.childLines.each(function(c){
                c.childLines.each(function(cc){cc.lineAction = "hide"});
                c.addClass("hide");
            });
            child.lineAction = "hide";
        }else{
            child.addClass("hide");
            child.childLines.each(function(c){
                c.childLines.each(function(cc){cc.lineAction = "show"});
                c.addClass("hide");
            });
            child.lineAction = "show";
        }
    });
}

function updateResults(){
    new Json.Remote("/scans/", {
        onComplete: function(scans){
            var D = scans;
            scans.each(function(scan){
                $$($("s1-result"), $("s2-result")).each(function(el){
                    opt = new Element("option", {"value": scan.id});
                    if(window.ie){
                        opt.text = scan.name + "(" + scan.date + ")";
                        el.add(opt);
                    }else{
                        opt.setText(scan.name + " (" + scan.date + ")");
                        el.add(opt, null);
                    }
                });
            });
        },
        onFailure: function(req){
            alert("Error loading data. See umitweb.log for details.");
        }
    }).send();
}

function getScan(scanID, target){
    if(scanID.trim().length > 0){
        $("spinner" + target).removeClass("hide");
        new Json.Remote("/scans/" + scanID + "/", {
            onComplete: function(scan){
                if(scan.result == 'OK'){
                    $("scan" + target + "-detail").setText(scan.output);
                    $("scan" + target + "-xml").setText(scan['xml']);
                }else{
                    alert("Error loading data. See umitweb.log for details.");
                }
                $("spinner" + target).addClass("hide");
                makeDiff();
            },
            onFailure: function(){
                alert("Error loading data. See umitweb.log for details.");
                $("spinner" + target).addClass("hide");
            }
        }).send();
    }else{
        $("scan" + target + "-detail").empty();
        makeDiff();
    }
}

function makeDiff(){
    if($("scan1-detail").getText().length > 0 && $("scan2-detail").getText().length > 0){
        var args = {
            "scan1": $("scan1-detail").getText(),
            "scan2": $("scan2-detail").getText(),
            "scan1-xml": $("scan1-xml").getText(),
            "scan2-xml": $("scan2-xml").getText()
        }
        new XHR({
            method: "post",
            onSuccess: function(response){
                var result = Json.evaluate(response);
                diff_text = result.text;
                diff_compare = result.compare;
                if($("color-diff").checked){
                    handler.color();
                }else{
                    handler.uncolor();
                }
            }
        }).send("make_diff/", Object.toQueryString(args));
    }
}

function viewHTMLDiff(){
    var args = {
        scan1: $("scan1-detail").getText(),
        scan2: $("scan2-detail").getText()
    }
    
    new XHR({
        method: "post",
        onSuccess: function(response){
            w = window.open("", "_blank");
            if(w == null){
                alert("Oops! UmitWeb has encountered a pop-pup blocker! please, allow UmitWeb to open pop-up windows.");
            }else{
                w.document.write(response);
                w.document.close();
            }
        }
    }).send("make_html_diff/", Object.toQueryString(args));
}

window.addEvent("domready", function(){
    handler = new DiffHandler();
    $("s1-result").addEvent("change", function(e){
        getScan(this[this.selectedIndex].value, 1);
        new Event(e).stop();
    });
    
    $("s2-result").addEvent("change", function(e){
        getScan(this[this.selectedIndex].value, 2);
        new Event(e).stop();
    });
    
    size = getViewportSize()
    $$($("compare-tab"), $("diff-tab")).each(function(e){
        e.setStyle("height", (size[1]-368) + "px");
    });
    
    $$($("compare-pane"), $("diff-pane")).each(function(e){
        e.setStyle("height", (size[1]-378) + "px");
    });
    
    $("color-diff").checked = true;
    $("color-diff").addEvent("change", function(e){
        new Event(e).stop();
        if(this.checked){
            handler.color();
        }else{
            handler.uncolor();
        }
    });
    
    
    $$($("u1-result"), $("u2-result")).each(function(el){
        el.addEvent("change", function(e){
            id = this.id.substr(1, 1);
            if($("u" + id + "-result").value.length > 0){
                $("spinner" + id + "-file").removeClass("hide");
                $("iframe-scan" + id).removeEvents();
                $("iframe-scan" + id).addEvent("load", function(e){
                    try{
                        scan = Json.evaluate(this.contentDocument.getElementsByTagName("pre")[0].textContent);
                    }catch(e){
                        alert("Error loading data. See umitweb.log for details.");
                        $("spinner" + id + "-file").addClass("hide");
                        return;
                    }
                    if(scan['result'] == "OK"){
                        $("scan" + id + "-detail").setText(scan['output']);
                        $("scan" + id + "-xml").setText(scan['xml']);
                    }else{
                        alert("Error loading data. See umitweb.log for details.")
                    }
                    $("spinner" + id + "-file").addClass("hide");
                    makeDiff();
                });
                this.form.submit();
            }else{
                new Event(e).stop();
            }
        });
    });
    
    updateResults();
    setInputStyles();

    $$("a[class=expander]").each(function(lnk){
            lnk.addEvent("click", function(e){
                    tgId = this.getElement("h4").id;
                    toggle(tgId.substring(0, tgId.length - "-switch".length));
                    new Event(e).stop();
            })
    });

});
