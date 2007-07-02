last_host_scanned = "<target>"
slides = {}

fillCommand = function(value){
    $('command').value = $('command').value.replace(last_host_scanned, value)
    last_host_scanned = value
}

toggle = function(target){
    tgDiv = $(target + "-detail")
    if(!slides[target]){
	slides[target] = new Fx.Slide(tgDiv)
    }
    tgSwitcher = $(target + "-switch")
    slides[target].toggle()

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
        div.style.height = (size[1]-200) + "px";
    });
	
	if($defined($("hosts")))
	    $("hosts").style.height = (getViewportSize()[1]-185) + "px"
    
    if($defined($("nmap-output"))){
        $("nmap-output").style.height = getViewportSize()[1]-260 + "px";
    }
});
