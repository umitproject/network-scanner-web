DiffHandler = new Class({
    "color": function(){
        if(diff_text != null){
            last_tag = null;
            new_text = [];
            removed = /^-.*/;
            styles = {
                added: {"style": "background-color:" + diff_colors.added,
                        "regex": /^\+.*/},
                removed: {"style": "background-color:" + diff_colors.not_present,
                          "regex": /^-.*/}
            };
            new_lines = [];
            for(i = 0; i < diff_text.length; i++){
                found = false;
                line = diff_text[i];
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
    },
    "uncolor": function(){
        if(diff_text != null){
            $("diff-pane").setHTML(diff_text.join("<br/>"));
        }
    }
});

var handler = null;
var diff_text;
function updateResults(){
    new Json.Remote("/scans/", {
        onComplete: function(scans){
            D = scans;
            scans.each(function(scan){
                $$($("s1-result"), $("s2-result")).each(function(el){
                    opt = new Element("option", {"value": scan.id});
                    opt.setText(scan.name + " (" + scan.date + ")");
                    el.add(opt, null);
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
        args = {
            scan1: $("scan1-detail").getText(),
            scan2: $("scan2-detail").getText()
        }
        new XHR({
            method: "post",
            onSuccess: function(response){
                diff_text = Json.evaluate(response);
                if($("color-diff").checked){
                    handler.color();
                }else{
                    handler.uncolor();
                }
            }
        }).send("make_diff/", Object.toQueryString(args));
    }
}

window.addEvent("domready", function(){
    handler = new DiffHandler();
    $$("a[class=expander]").each(function(lnk){
        lnk.addEvent("click", function(e){
                tgId = this.getElement("h4").id;
                toggle(tgId.substring(0, tgId.length - "-switch".length));
                new Event(e).stop();
        });
    });
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
        e.setStyle("height", (size[1]-348) + "px");
    });
    
    $$($("compare-pane"), $("diff-pane")).each(function(e){
        e.setStyle("height", (size[1]-358) + "px");
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
    
    
    $$($("frmScan1"), $("frmScan2")).each(function(el){
        el.addEvent("submit", function(e){
            id = this.id[this.id.length-1];
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
                    if(scan.result == "OK"){
                        $("scan" + id + "-detail").setText(scan.output);
                    }
                    $("spinner" + id + "-file").addClass("hide");
                    makeDiff();
                });
                this.submit();
            }else{
                new Event(e).stop();
            }
        });
    });
    
    updateResults();
    setInputStyles();
});