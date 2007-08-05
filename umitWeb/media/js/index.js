var varData = ""

scanLock = false;

lastHost = null;
lastService = null;
var scanEvent = null;
var scanId = null;
var saved = false;
var nmapOutput = "";
var sSlide;
var hSlide;

function openScan(){
	isToRun = true;
	if(saved == false && scanId != null){
		text = "The given scan has unsaved changes!\n" +
			"If you want to continue, click 'OK'.\n" +
			"WARNING: all unsaved data will be lost.";
		if(!confirm(text)){
			isToRun = false;
		}
	}
	if(isToRun){
		try{
			rs.close();
			delete rs;
		}catch(e){}
		rs = new UploadResultDialog();
		rs.run();
	}
}

function saveScan(){
	if(scanId == null){
		alert("There is no scan to save!");
	}else{
		try{
			rs.close();
			delete rs;
		}catch(e){}
		rs = new SaveResultDialog();
		rs.run();
	}
}

function openCommandWizard(){
	try{
		rs.close();
		delete rs;
	}catch(e){}
	rs = new CommandWizardDialog();
	rs.run();
}

window.addEvent("domready", function(){
    if($defined($("frmScan"))){
	$("frmScan").addEvent("submit", runScan);
	
	$("toggleHosts").addEvent("click", function(e){
		if(!this.hasClass("active")){
		    ts = $("toggleServices");
		    this.addClass("active");
		    ts.removeClass("active");
		    $("hosts").setStyle("display", "block");
		    $("services").setStyle("display", "none");
		}
		new Event(e).stop();
	});
	
	$("toggleServices").addEvent("click", function(e){
		if(!this.hasClass("active")){
		    th = $("toggleHosts");
		    this.addClass("active");
		    th.removeClass("active");
		    $("hosts").setStyle("display", "none");
		    $("services").setStyle("display", "block");
		}
		new Event(e).stop();
	});
	
	$("toggleHosts").addClass("active");
	$("services").setStyle("display", "none");
	
	updateProfiles();
	
	$("profiles").addEvent("change", function(event){
		cmd = this.options[this.selectedIndex].value;
		if($("target").value != ""){
			cmd = cmd.replace("<target>", $("target").value);
		}
		$("command").value = cmd;
		new Event(event).stop();
	});
        $("divSpinner").addClass("hide");
        $("body").removeClass("hide");
    }

   $("highlight_out").addEvent("change", function(e){
	new Event(e).stop();
	if(!nmapOutput || nmapOutput.trim().length == 0){ return }
	if(this.checked){
		$("nmap-output").setHTML(formatNmapOutput(nmapOutput));
	}else{
		$("nmap-output").setText(nmapOutput);
	}
   });
});
