$ = function(id){
    return document.getElementById(id)
}
    
getXMLHttpRequest = function(){
    if(window.ActiveXObject){
        try{
            return new ActiveXObject("Msxml2.XMLHTTP")
        }catch(e){
            try{
                return new ActiveXObject("MSXML.XMLHTTP")
            }catch(e){
                return null
            }
        }
    }else if(document.implementation.createDocument){
        return new XMLHttpRequest()
    }else{
        return null
    }
}

last_host_scanned = "<target>"

fillCommand = function(value){
    $('command').value = $('command').value.replace(last_host_scanned, value)
    last_host_scanned = value
}