var w;
function fillTableData(scans){
    t = $("scans_table").getElement("tbody").empty();

    for(index = 0; index < scans.length; index++){
        s = scans[index];
        ch = new Element("input", {"type": "checkbox", "id": "chk-" + s.id});
        lnkEdit = new Element("a", {"href": "javascript:void(null)", "id": "" + s.id});
        lnkEdit.setText(s.name);
        lnkEdit.addEvent("click", function(e){
            new Event(e).stop();
            img = new Element("img", {"src": "/media/images/spinner.gif"});
            text = this.textContent;
            this.adopt(img);
            link = this;
            args = {
                "type": "database",
                "scanId": this.id
            }
            new XHR({"method": "post",
                    "onSuccess": function(resp){
                        try{
                            response = Json.evaluate(resp);
                            if(response.result == "OK"){
                                w = window.open("/js/", "", "screenX=0,screenY=0,left=0,top=0,menubar=no," +
                                                "status=yes,width=" + (screen.availWidth-8).toString() +
                                                ",toolbar=no,height=" + (screen.availHeight-48).toString());
                                if(w == null){
                                    alert("Grrr! UMIT found a popup blocker. Please, disable it.");
                                    img.setStyle("display", "none");
                                    return;
                                }
                                Asset.javascript("/media/js/scan.js");
                                w.onload = function(){
                                    w.loadScanData(response.output.full);
                                    data = response.output.full;
                                    w.nmapOutput = response.output.plain;
                                    w.$("command").value = data.nmap_command;
                                    w.scanId = data.id;
                                    if(!w.$("highlight_out").checked){
                                            w.$("nmap-output").setText(w.nmapOutput);
                                    }else{
                                            w.$("nmap-output").setHTML(w.formatNmapOutput(w.nmapOutput));
                                    }
                                }
                            }else{
                                alert(response.output);
                            }
                        }catch(e){
                            alert(e);
                            alert("Error loading result. See umitweb.log for details.");
                        }
                        img.setStyle("display", "none");
                    },
                    "onFailure": function(){
                        alert("Error loading result. See umitweb.log for details.");
                    }}).send("/scan/upload/", Object.toQueryString(args));
        });
        line = [ch, s.id, lnkEdit, s.date]
        className = (index % 2 == 0)? "light": "dark";
        tr = addTableRow(t, line);
        tr.addClass(className);
    }
}

function loadScansTableData(){
    new Json.Remote("/scans/", {
        onComplete: fillTableData,
        onFailure: function(req){
            t = $("scans_table").getElement("tbody").empty();
            addTableRow(t, [{"value": "Error loading data. Please see umitweb.log for details.", "attrs": {"colSpan": "4"}} ], {"class": "error"});
        }
    }).send();
}

window.addEvent("domready", function(e){
    loadScansTableData();
    
    $("delete-scan").addEvent("click", function(e){
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
        if(confirm("Are you sure you want to delete the selected scan(s)?")){
            ids.each(function(id){
                new Json.Remote("/scans/" + id + "/delete/", {onComplete: function(e){loadScansTableData()}}).send();
            });
        }
    });
    
    $("frmSearch").addEvent("submit", function(e){
        new Event(e).stop();
        this.send({onComplete: function(req){
            scans = null;
            eval("scans = " + req);
            if(scans.length == 0){
                addTableRow($("scans_table").getElement("tbody").empty(),
                            [{"value": "The result has found no data.",
                              "attrs": {"colSpan": "4"}} ], {"class": "error"});
            }else{
                fillTableData(scans);
            }
        },
        onFailure: function(req){
            t = $("scans_table").getElement("tbody").empty();
            addTableRow(t, [{"value": "Error loading data. Please see umitweb.log for details.", "attrs": {"colSpan": "5"}} ], {"class": "error"});
        }});
    });
});