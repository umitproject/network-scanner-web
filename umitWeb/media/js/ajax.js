runScan = function(){
    req = getXMLHttpRequest()
    
    if($("target").value == ""){
        alert("No target specified!")
        return false
    }
    
    $("result").innerHTML = "loading..."
    displayResult = function(){
         try{
            if(req.readyState == 4){
                if(req.status == 200){
                    $("result").innerHTML = "<pre>" + req.responseText + "</pre>"
                }else{
                    $("result").innerHTML = req.statusText
                }
            }
	}catch(e){
            alert(e)
            $("result").innerHTML = "Could not open Http Request."
        }
    }
    try{
        req.open("POST", "/scan/?plain", true)
        req.onreadystatechange = displayResult
        req.send("command=" + encodeURI($("command").value))
    }catch(e){
        $("result").innerHTML = "Could not open Http Request."
    }

    return false
}
