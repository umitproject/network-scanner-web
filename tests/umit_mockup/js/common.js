toggle = function(target){
    tgDiv = $(target + "-detail")
    tgSwitcher = $(target + "-switch")
    tgDiv.toggleClass("hide")
    if(tgSwitcher.hasClass("sw-collapsed")){
        tgSwitcher.removeClass("sw-collapsed")
        tgSwitcher.addClass("sw-expanded")
    }else{
        tgSwitcher.removeClass("sw-expanded")
        tgSwitcher.addClass("sw-collapsed")
    }
    
    
}
