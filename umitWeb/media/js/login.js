 doLogin = function(e){
    new Event(e).stop();
    processResult = function(result){
	if(result == "OK"){
	    location.href = "/"
	}else{
	    $("error").empty().removeClass("hide").setText("Incorrect username or password")
	    $("spacer").addClass("hide")
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