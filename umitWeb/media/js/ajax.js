var xyz;

checkScanStatus = function(scanID){
    checkUrl = "/scan/" + scanID + "/check/"
    new Json.Remote(checkUrl, {onComplete: function(result){
					if(result.result == "OK"){
					    resultBox = $("result_box").empty();
					    if(result.status == "FINISHED"){
						resultBox.removeClass("ajax-loading")
						resultBox.empty().setText(result.output.plain)
					    }else if(result.status == "RUNNING"){
						setTimeout("checkScanStatus('" + scanID + "')", 1000)
						resultBox.empty().setText(result.output.text)
					    }
					}else{
					    resultBox.addClass("ajax-error").setText(result.status);
					}
			      }}).send();
}

runScan = function(e){
	    new Event(e).stop();
	    result = $("result").empty()
	    result_box = new Element("pre", {"id": "result_box"}).injectInside(result);
	    result_box.empty().addClass("ajax-loading");
	    this.send({onComplete: function(tResult){
			    result = Json.evaluate(tResult);
			    if(result.result == "OK"){
				checkScanStatus(result.id)
			    }else{
				result_box.removeClass("ajax-loading").addClass("ajax-error");
				result_box.setText(result.status);
			    }
		      }}
		    );
}

window.addEvent("domready", function(){
    if($defined($("frmScan"))){
	$("frmScan").addEvent("submit", runScan)
    }
});


doLogin = function(e){
    processResult = function(result){
	if(result == "OK"){
	    location = "/"
	}else{
	    $("error").setText("Incorrect username or password")
	}
    }
    new Event(e).stop();
    this.send({onComplete: processResult});
}

window.addEvent("domready", function(){
    if($defined($("frmLogin"))){
	$("frmLogin").addEvent("submit", doLogin);
    }
});
