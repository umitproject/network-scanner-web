last_host_scanned = "<target>"
var slides = {}

fillCommand = function(value){
    $('command').value = $('command').value.replace(last_host_scanned, value)
    last_host_scanned = value
}

function clearScanData(){
    $("ports_table").getElement("tbody").empty();
    $("hosts_tab").empty();
    $("scan_details").empty();
    $("tabber-result").tabber.tabShow(1);
    $("services_table").getElement("tbody").empty();
    $("nmap-output").empty();
}

function toggle(target){
    tgDiv = $(target + "-detail")
    
    tgSwitcher = $(target + "-switch")
    
    tgDiv.toggleClass("hide");

    if(tgSwitcher.hasClass("sw-collapsed")){
        tgSwitcher.removeClass("sw-collapsed")
        tgSwitcher.addClass("sw-expanded")
    }else{
        tgSwitcher.removeClass("sw-expanded")
        tgSwitcher.addClass("sw-collapsed")
    }  
}

function getViewportSize(){
    /*return [window.getScrollWidth, window.getScrollHeight()];*/
    var size = [0, 0];
    if (typeof window.innerWidth != 'undefined')
    {
     size = [ window.innerWidth, window.innerHeight ];
    }
    else if (typeof document.documentElement != 'undefined' &&
             typeof document.documentElement.clientWidth != 'undefined' &&
             document.documentElement.clientWidth != 0)
    {
     size = [ document.documentElement.clientWidth, document.documentElement.clientHeight ];
    }
    else
    {
     size = [ document.getElementsByTagName('body')[0].clientWidth,
              document.getElementsByTagName('body')[0].clientHeight ];
    }
   
    return size;   
}

function setInputStyles(){
    $$("input[type=text]", "input[type=password]", "select", "textarea", "input[type=file]").each(function(element){
        element.style.borderStyle = "solid";
        element.style.borderWidth = "1px";
        element.style.borderColor = "#303030";
        element.style.backgroundImage = "url(/media/images/input_bg.png)";
        element.style.backgroundRepeat = "repeat-x";
    });
    $$("textarea").each(function(element){
        element.style.fontFamily = "sans-serif";
        element.style.fontSize = "9pt";
    });
    $$("input[type=submit]", "input[type=button]").each(function(element){
        element.style.backgroundImage = "url(/media/images/th_back.jpg)";
        element.style.color = "black";
        element.style.borderWidth = "1px";
    });
}

function addTableRow(table, row, lineAttrs){
	tr = new Element("tr");
	if(lineAttrs){
		for(attr in lineAttrs){
		    tr[attr] = lineAttrs[attr];
		}
	}
	for(i = 0; i < row.length; i++){
		td = new Element("td")
		if($type(row[i]) == "string"){
		    td.setHTML(row[i]);
		}else if($type(row[i]) == "element"){
		    td.adopt(row[i]);
		}else{
                    for(attr in row[i].attrs){
                        td[attr] = row[i].attrs[attr]
                    }
                    if($type(row[i].value) == "string"){
                        td.setHTML(row[i].value);
                    }else{
                        td.adopt(row[i].value);
                    }
		}
		tr.adopt(td)
	}
	table.adopt(tr)
        return tr;
}

function showError(req, target){
	messages = {
		403: {"title": "Access Denied",
		      "description": "Your access has been " +
				"denied when you tried to " +
				"request this page.<br/>" +
				"Check with you system " +
				"administrator if you have " +
				"access to access this page."}
	}
	div = new Element("div", {'class': "error"})
	if(messages[req.status]){
		div.setHTML(messages[req.status]["description"]);
		header = new Element("h3", {styles: {"display": "block", "color": "red"}});
		header.setText(messages[req.status]['title']);
		$(target).empty().adopt(div);
		header.injectBefore(div);
	}else{
		regexp = /.*Message:((.*[\r]?[\n]?)*)/g
		txt = req.responseText.match(regexp)[0]
		//txt = req.responseText
		header = new Element("h3", {styles: {"display": "block", "color": "red"}});
		header.setText("Response Code:" + req.status)
		$(target).empty().adopt(div);
		header.injectBefore(div);
		div.setHTML(txt);
	}
}

function removeCommand(value){
	commandLine = $("divCommandConstructor");
	oldValue = commandLine.value;
	regex = new RegExp(value.replace(" ", "[ ]+").replace("%s", "[^ ^$]*"));
	
	if(oldValue.match(regex)){
		commandLine.value = oldValue.replace(regex, "");
	}
	commandLine.value = commandLine.value.trim();
}

function updateProfiles(){
	new Json.Remote("/scan/profiles/", {onComplete: function(result){
                $("profiles").empty();
		for(i = 0; i < result.length; i++){
			opt = new Element("option", {"value": result[i][1]})
			opt.setText(result[i][0]);
			$("profiles").adopt(opt);
		}
		cmd = $("profiles").options[0].value;
		if($("target").value != ""){
			cmd = cmd.replace("<target>", $("target").value);
		}
		$("command").value = cmd;
	}}).send();
}

window.addEvent("domready", function(){
    setInputStyles();
    size = getViewportSize();
    $$("div[class='tab-placeholder']").each(function(div){
	div.style.height = (size[1]-251) + "px";
    });
	
    if($defined($("hosts")))
	$("hosts").style.height = (size[1]-220) + "px"
    if($defined($("services")))
	$("services").style.height = (size[1]-220) + "px"
	
    if($defined($("body"))){
	$("body").setStyle("width", (size[0]) + "px");
        $("umit-title").setStyle("width", size[0]-60 + "px");
    }
    if($defined($("footer")))
       $("footer").injectInside($("body"));
    if($defined($("nmap-output"))){
        $("nmap-output").style.height = size[1]-300 + "px";
    }
});