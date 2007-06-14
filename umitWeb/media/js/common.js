last_host_scanned = "<target>"

fillCommand = function(value){
    $('command').value = $('command').value.replace(last_host_scanned, value)
    last_host_scanned = value
}