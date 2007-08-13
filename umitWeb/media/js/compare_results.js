DiffHandler = new Class({
    "color": function(){
        if(diff_text != null){
            last_tag = null;
            new_text = [];
            styles = {
                added: "background-color:" + diff_colors.added,
                removed: "background-color:" + diff_colors.removed
            }
            
            /*l = diff_text.join("\n");
            p = this.takeChanges(l);
            D = p;*/
            //$("diff-pane").setHTML("");
        }
    },
    "takeChanges": function(line){
        positions = {"added": [], "removed": []};
        
        in_line = false;
        type = '';
        last_char = "\n";
        
        for(i = 0; i < line.length; line ++){
            ch = line[i];
            if(!in_line){
                pos = [];
                if(ch == "+" && last_char == "\n"){
                    pos.extend([i]);
                    type = "added";
                    in_line = true;
                }else if(ch == "-" && last_char == "\n"){
                    pos.extend([i]);
                    type = "removed";
                    in_line = true;
                }
            }else{
                if(ch == "\n"){
                    pos.append(i);
                    positions[type].extend([pos]);
                    in_line = false;
                    type = '';
                }
            }
            last_chars = ch;
        }
        return positions;
    },
    "uncolor": function(){
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
    
    
    $$($("u1-result"), $("u2-result")).each(function(el){
        el.addEvent("change", function(e){
            new Event(e).stop();
            if(this.value.trim().length > 0){
                id = this.id.substring(1, 2);
                $("spinner" + id + "-file").removeClass("hide");
                $("iframe-scan" + id).removeEvents();
                $("iframe-scan" + id).addEvent("load", function(e){
                    scan = Json.evaluate(this.contentDocument.getElementsByTagName("pre")[0].textContent);
                    if(scan.result == "OK"){
                        $("scan" + id + "-detail").setText(scan.output);
                    }
                    $("spinner" + id + "-file").addClass("hide");
                    makeDiff();
                });
                
                this.form.encoding = "multipart/form-data";
                this.form.enctype = "multipart/form-data";
                this.form.submit();
            }
        });
    });
    
    updateResults();
    setInputStyles();
});