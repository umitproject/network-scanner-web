var varData = ""

loadHosts = function(hosts){
	tbHosts = $("hosts_table").getElement("tbody").empty();
	for(i = 0; i < hosts.length; i++){
		tr = new Element("tr", {'id': 'host-' + i});
		j = -1;
		
		if(hosts[i].hostnames.length > 0)
			txt = hosts[i].hostnames[0].hostname
		else
			txt = hosts[i].ip.addr
		
		tds = new Array();
		tds[++j] = new Element("td");
		img = new Element("img", {'src': '/media/images/unknown_32.png'});
		tds[j].adopt(img);
		
		tds[++j] = new Element("td");
		lnk = new Element("a", {'href': '#'});
		/*lnk.onclick = function(){
			x = i
			selectHost(hosts, x)
		}*/
		lnk.setText(txt);
		tds[j].adopt(lnk);
		
		tds.each(function(el){tr.adopt(el)});
		tbHosts.adopt(tr)
	}
}

selectHost = function(hosts, start, end){
	for(i = 0; i < hosts.length; i++){
		$("host-" + i).removeClass("selected");
	}
	if(!end){
		loadHostsTab([hosts[start]]);
		$("host-" + start).addClass("selected");
	}else{
		arr = new Array();
		for(i = start, j = 0; i < end && i < hosts.length; i++, j++){
			arr[j] = hosts[i];
			$("host-" + i).addClass("selected");
		}
		loadHostsTab(arr);
	}
}

addTableRow = function(table, row){
	tr = new Element("tr");
	for(i = 0; i < row.length; i++){
		td = new Element("td")
		if($type(row[i]) == "string"){
			td.setHTML(row[i]);
		}else if($type(row[i]) == "element"){
			td.adopt(row[i]);
		}else{
			for(var attr in row[i].attrs){
				td[attr] = row[i].attrs[attr]
			}
			if($type(row[i].value) == "string"){
				td.setHTML(row[i].value);
			}else{
				td.adopt(row[i].value);
			}
		}
		tr.adopt(td)
	}
	table.adopt(tr)
}

loadHostsTab = function(hosts){
	hostsTab = $("hosts_tab").empty()
	for(i = 0; i < hosts.length; i++){
		h = hosts[i]
		txt = h.ip.addr
		if(h.hostnames.length > 0)
			txt = h.hostnames[0].hostname + " " + txt
		head = new Element("h4", {'class': 'sw-expanded', 'id': txt + "-switch"});
		lnk = new Element("a", {'onclick': 'toggle("' + txt + '")', 'href': '#'});
		lnk.setText(txt);
		head.adopt(lnk);
		hostsTab.adopt(head);
		
		tgDiv = new Element("div", {'id': txt + "-detail", 'class': 'frame-div'});
		
		//Comment
		head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-comment-switch"})
		lnk = new Element("a", {'onclick': 'toggle("' + txt + '-comment")', 'href': '#'});
		lnk.setText("Comment");
		head.adopt(lnk);
		tgDiv.adopt(head);
		
		commentDiv = new Element("div", {'id': txt + "-comment-detail", 'class': 
										 'frame-div hide'});
		comment = new Element("textarea", {'rows':"5", 'cols':"60", 'class': "flat-field"})
		commentDiv.adopt(comment);
		tgDiv.adopt(commentDiv);
		
		//Host Status
		head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-status-switch"})
		lnk = new Element("a", {'onclick': 'toggle("' + txt + '-status")', 'href': '#'});
		lnk.setText("Host Status");
		head.adopt(lnk);
		tgDiv.adopt(head);
		statusDiv = new Element("div", {'id': txt + "-status-detail", 'class': 
										 'frame-div hide'});
		tgDiv.adopt(statusDiv);
		
		tbl = new Element("table");
		imgOS = new Element("img", {'src': '/media/images/unknown_75.png'})
		imgStatus = new Element("img", {'src': '/media/images/vl_1_75.png'})
		addTableRow(tbl, ["<b>State:</b>", h.state, {"attrs": {"rowSpan": "4"}, "value": imgOS}])
		addTableRow(tbl, ["<b>Open ports:</b>", ":"])
		addTableRow(tbl, ["<b>Filtered ports:</b>", ":"])
		addTableRow(tbl, ["<b>Closed ports:</b>", ":"])
		addTableRow(tbl, ["<b>Scanned ports:</b>", ":", {"attrs": {"rowSpan": "3"}, "value": imgStatus}])
		addTableRow(tbl, ["<b>Up time:</b>", ":"])
		addTableRow(tbl, ["<b>Last boot:</b>", ":"])
		
		statusDiv.adopt(tbl);
		
		
		//Addresses
		head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-addresses-switch"})
		lnk = new Element("a", {'onclick': 'toggle("' + txt + '-addresses")', 'href': '#'});
		lnk.setText("Addresses");
		head.adopt(lnk);
		tgDiv.adopt(head);
		addrDiv = new Element("div", {'id': txt + "-addresses-detail", 'class': 
										 'frame-div hide'});
		tbl = new Element("table");
		addTableRow(tbl, ["<b>IPV4:</b>", h['ip']['addr']]);
		addTableRow(tbl, ["<b>IPV6:</b>", (h['ipv6']['addr'])? h['ipv6']['addr']: ""]);
		addTableRow(tbl, ["<b>MAC:</b>", (h['mac']['addr'])? h['mac']['addr']: ""]);
		addrDiv.adopt(tbl);
		
		tgDiv.adopt(addrDiv);
		
		hostsTab.adopt(tgDiv);
	}
}

loadScanInfo = function(scan){
	scanTab = $("scan_details").empty();
	
	head = new Element("h4", {'class': 'sw-collapsed', 'id': "command-info-switch"})
	lnk = new Element("a", {'onclick': 'toggle("command-info")', 'href': '#'});
	lnk.setText("Command Info");
	head.adopt(lnk);
	scanTab.adopt(head);
	cmdDiv = new Element("div", {'id': "command-info-detail", 'class': 'frame-div hide'});
	tbl = new Element("table");
	
	addTableRow(tbl, ["<b>Command:</b>", scan.nmap_command]);
	addTableRow(tbl, ["<b>Version:</b>", scan.nmap.nmaprun.version]);
	addTableRow(tbl, ["<b>Verbosity Level:</b>", scan.verbose_level]);
	addTableRow(tbl, ["<b>Debug Level:</b>", scan.nmap.debugging]);
	
	cmdDiv.adopt(tbl);
		
	scanTab.adopt(cmdDiv);
	
	//
	
	head = new Element("h4", {'class': 'sw-collapsed', 'id': "general-info-switch"})
	lnk = new Element("a", {'onclick': 'toggle("general-info")', 'href': '#'});
	lnk.setText("General Info");
	head.adopt(lnk);
	scanTab.adopt(head);
	cmdDiv = new Element("div", {'id': "general-info-detail", 'class': 'frame-div hide'});
	tbl = new Element("table");
	
	addTableRow(tbl, ["<b>Started on:</b>", scan.formated_date]);
	addTableRow(tbl, ["<b>Finished on:</b>", scan.formated_finish_date]);
	addTableRow(tbl, ["<b>Hosts up:</b>", scan.runstats.hosts_up]);
	addTableRow(tbl, ["<b>Hosts down:</b>", scan.runstats.hosts_down]);
	addTableRow(tbl, ["<b>Hosts scanned:</b>", scan.runstats.hosts_scanned]);
	//addTableRow(tbl, ["<b>Open ports:</b>", scan.openned_ports]);
	//addTableRow(tbl, ["<b>Filtered ports:</b>", scan.filtered_ports]);
	//addTableRow(tbl, ["<b>Closed ports:</b>", scan.closed_ports]);
	
	cmdDiv.adopt(tbl);
		
	scanTab.adopt(cmdDiv);
	
	
}

loadScanData = function(scan){
	tbHost = $("ports_table");
	tb = tbHost.getElement("tbody").empty();
	if(scan.list_port){
		for(i = 0; i < scan.list_port.length; i++){
			tr = new Element("tr");
			img_src = "";
			if(scan.list_port[i].port_state == "open"){
				img_src = "/media/images/gtk-yes.png";
			}else{
				img_src = "/media/images/gtk-no.png";
			}
			
			tds = new Array();
			imgState = new Element("img", {'src': img_src});
			tds[0] = new Element("td");
			tds[0].adopt(imgState);
			
			
			tds[1] = new Element("td");
			tds[1].setText(scan.list_port[i].portid);
			
			tds[2] = new Element("td");
			tds[2].setText(scan.list_port[i].port_state);
			
			tds[3] = new Element("td");
			if(scan.list_port[i].service_name)
				tds[3].setText(scan.list_port[i].service_name);
			
			tds[4] = new Element("td");
			if(scan.list_port[i].service_product)
				tds[4].setText(scan.list_port[i].service_product);
				
			tds.each(function(el){tr.adopt(el)});
			tr.injectInside(tb);
		}
		tb.injectInside(tbHost);
	}
	loadHosts(scan.hosts);
	loadScanInfo(scan);
	selectHost(scan.hosts, 0);
}

checkScanStatus = function(scanID){
    checkUrl = "/scan/" + scanID + "/check/"
    new Json.Remote(checkUrl, {onComplete: function(result){
					if(result.result == "OK"){
					    resultBox = $("nmap-output");
					    if(result.status == "FINISHED"){
							resultBox.removeClass("ajax-loading")
							resultBox.setText(result.output.plain)
							loadScanData(result.output.full)
							varData = result.output.full
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
	    result_box = $("nmap-output");
	    result_box.empty().addClass("ajax-loading");
		tbHosts = $("hosts_table").getElement("tbody").empty();
		tr = new Element("tr");
		td1 = new Element("td");
		td1.adopt(new Element("img", {'src': '/media/images/spinner.gif'}));
		tr.adopt(td1);
		td2 = new Element("td");
		td2.setText("Running...");
		tr.adopt(td2);
		tbHosts.adopt(tr);
		
	    this.send({onComplete: function(tResult){
			    result = Json.evaluate(tResult);
			    if(result.result == "OK"){
					checkScanStatus(result.id)
			    }else{
					result_box.removeClass("ajax-loading").addClass("ajax-error");
					result_box.setText(result.status);
			    }
		      },
		      onFailure: function(error){
			result_box.removeClass("ajax-loading");
			result_box.setHTML(error.responseText);
		      }
		      });
}

window.addEvent("domready", function(){
    if($defined($("frmScan"))){
	$("frmScan").addEvent("submit", runScan)
    }
});


doLogin = function(e){
    new Event(e).stop();
    processResult = function(result){
	if(result == "OK"){
	    location = "/"
	}else{
	    $("error").empty().removeClass("hide").setText("Incorrect username or password")
	}
    }
    this.send({onComplete: processResult});
    return false;
}

window.addEvent("load", function(){
    imgLoading = new Element('img', {'src': '/media/images/spinner.gif'});
    if($defined($("frmLogin"))){
        $("frmLogin").addEvent("submit", doLogin);
    }
});
