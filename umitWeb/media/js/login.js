doLogin = function(e){
    new Event(e).stop();
    $("spinner").removeClass("hide");
    $("error").addClass("hide")
    $("spacer").addClass("hide");
    processResult = function(result){
	if(result == "OK"){
	    location.href = "/"
	}else{
            $("spinner").addClass("hide");
	    $("error").empty().removeClass("hide").setText("Incorrect username or password")
	}
    }
    this.send({onComplete: processResult});
    return false;
}

window.addEvent("domready", function(){
    imgLoading = new Element('img', {'src': '/media/images/spinner.gif'});
    if($defined($("frmLogin"))){
        $("frmLogin").addEvent("submit", doLogin);
    }
});

window.addEvent("load", function(){
   $$("input[name=login]")[0].focus();
});