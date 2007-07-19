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

toggle = function(target){
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

getViewportSize = function(){
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

window.addEvent("domready", function(){
    $$("input[type=text]", "input[type=password]", "select").each(function(element){
        element.style.borderStyle = "solid";
        element.style.borderWidth = "1px";
        element.style.borderColor = "#303030";
    });
    $$("input[type=submit]", "input[type=button]").each(function(element){
        element.style.backgroundImage = "url(/media/images/th_back.jpg)";
        element.style.color = "black";
    });
    
    $$("div[class='tab-placeholder']").each(function(div){
        size = getViewportSize();
	if(!window.ie){
	    div.style.height = (size[1]-250) + "px";
	}else{
	    div.style.height = (size[1]-250) + "px";
	}
    });
	
    if($defined($("hosts")))
	$("hosts").style.height = (getViewportSize()[1]-220) + "px"
    if($defined($("services")))
	$("services").style.height = (getViewportSize()[1]-220) + "px"
	
    if($defined($("body")))
	$("body").setStyle("width", (getViewportSize()[0]) + "px");
    
    if($defined($("nmap-output"))){
        $("nmap-output").style.height = getViewportSize()[1]-300 + "px";
    }
});
