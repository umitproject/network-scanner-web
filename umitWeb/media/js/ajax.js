var varData = ""

scanLock = false;

lastHost = null;
var scanEvent = null;

loadHosts = function(hosts){
	if(!window.ie){
		tbHosts = $("hosts_table").getElement("tbody").empty();
	}
	for(iH = 0; iH < hosts.length; iH++){
		h = hosts[iH]
		if(h.hostnames.length > 0){
			txt = h.hostnames[0].hostname
		}else{
			txt = h.ip.addr
		}
		
		img_src = '/media/images/unknown_24.png';
		if($defined(h.osmatch.name)){
			oses = {"irix": "irix",
				"solaris": "solaris",
				"linux": "linux",
				"freebsd": "freebsd",
				"macos x": "macosx",
				"openbsd": "openbsd",
				"windows": "win",
				"ubuntu": "ubuntu", 
				"red hat": "redhat"}
			for(k in oses){
				if(h.osmatch.name.toLowerCase().contains(k)){
					img_src = "/media/images/" + oses[k] + "_24.png"
				}
			}
		}
		img = new Element("img", {'src': img_src});
		
		lnk = new Element("a", {'href': '#'});
		vX = iH
		lnk.onclick = function(e){
			e = new Event(e);
			pId = this.parentNode.parentNode.getAttribute("id").substr("host-".length);
			selectHost(e, hosts, pId);
		}
		lnk.setText(txt);
		addTableRow(tbHosts, [img, lnk], {'id': 'host-' + iH});
	}
}

selectHost = function(event, sHosts, index){
	event.stop();
	arr = new Array();
	indexArr = new Array();
	if($defined($("host-" + index))){
		$("host-" + index).toggleClass("selected");
	}else{
		return;
	}
	if(h.hostnames.length > 0)
		txt = h.hostnames[0].hostname + " " + txt
	for(k in slides){
		if(k != "command-info" && k != "general-info" && k.substring(0, "scaninfo-".length) != "scaninfo-"){
			delete slides[k]
		}
	}
	
	if(event.control === false){
		for(i = 0; i < sHosts.length; i++){
			if($defined($("host-" + i)))
				$("host-" + i).removeClass("selected");
		}
	}else if(event.control == true && event.shift == false){
		lines = $("hosts_table").getElement("tbody").getElements("tr[class=selected]");
		for(x = 0; x < lines.length; x++){
			tr = lines[x];
			_id = tr.id.substring("host-".length)
			indexArr.include(_id);
		}
	}
	
	if(event.shift === true && lastHost != null && $defined(lastHost)){
		if(index < lastHost){
			start = index;
			end = lastHost;
		}else if(index > lastHost){
			start = lastHost
			end = index;
		}
		//alert(start + " - " + end);
		
		for(x = start; x <= end; x++){
			//alert("host-" + x);
			$("host-" + x).addClass("selected");
			indexArr.include(x);
		}
	}
	
	for(x = 0; x < indexArr.length; x++){
		arr.include(sHosts[indexArr[parseInt(x)]])
	}
	
	if(arr.length == 0){
		arr = [sHosts[index]];
		if(sHosts.length > 0){
			$("host-" + index).addClass("selected");
		}
	}
	
	if(sHosts.length > 0){
		loadHostsTab(arr);
		loadPortsTab(arr);
		lastHost = index;
	}
}

addTableRow = function(table, row, lineAttrs){
	tr = new Element("tr");
	if(lineAttrs){
		for(var attr in lineAttrs){
			tr[attr] = lineAttrs[attr];
		}
	}
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

loadPortsTab = function(pHosts){
	if(!window.ie){
		tbody = $("ports_table").getElement("tbody").empty();
	}
	lines = new Array();
	count = 0;
	for(k = 0; k < pHosts.length; k++){
		for(i = 0; i < pHosts[k].ports.length; i++){
			for(j = 0; j < pHosts[k].ports[i].port.length; j++){
				port = pHosts[k].ports[i].port[j];
				img = new Element("img");
				img.src = "/media/images/" + ((port.port_state == "open")? "open": "closed") + ".png";
				if(port.port_state == "open"){
					img.src = "/media/images/open.png";
				}else{
					img
				}
				found = false;
				for(m = 0; m < lines.length; m++){
					if(lines[m][1] == port.portid){
						found = true;
						break
					}
				}
				
				if(!found)
					lines.include([img, port.portid, port.port_state,
				    		     port.service_name || "unknown", port.service_product || ""]);
			}
		}
	}
	for(k = 0; k < lines.length; k++){
		addTableRow(tbody, lines[k])
	}
}

loadHostsTab = function(hostset){
	hostsTab = $("hosts_tab").empty()
	collapsed = (hostset.length > 1);
	for(hi = 0; hi < hostset.length; hi++){
		h = hostset[hi]
		txt = h.ip.addr
		if(h.hostnames.length > 0)
			txt = h.hostnames[0].hostname + " " + txt
		
		head = new Element("h4", {'class': 'sw-expanded', 'id': txt + "-switch"});
		lnk = new Element("a", {'onclick': 'toggle("' + txt + '")', 'href': '#'});
		lnk.setText(txt);
		head.adopt(lnk);
		
		hostsTab.adopt(head);
		
		tgDiv = new Element("div", {'id': txt + "-detail", 'class': 'frame-div'});
		hostsTab.adopt(tgDiv);
		
		if(collapsed){
			head.removeClass("sw-expanded").addClass("sw-collapsed");
			slides[txt] = new Fx.Slide(tgDiv);
			slides[txt].toggle();
		}
		
		//Comment
		head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-comment-switch"})
		lnk = new Element("a", {'onclick': 'toggle("' + txt + '-comment")', 'href': '#'});
		lnk.setText("Comment");
		head.adopt(lnk);
		tgDiv.adopt(head);
		
		commentDiv = new Element("div", {'id': txt + "-comment-detail", 'class': 'frame-div'})
		comment = new Element("textarea", {'rows':"5", 'cols':"60", 'class': "flat-field"})
		commentDiv.adopt(comment);
		tgDiv.adopt(commentDiv);
		slides[txt + "-comment"] = new Fx.Slide(commentDiv);
		slides[txt + "-comment"].hide();
		
		//Host Status
		head = new Element("h4", {'class': 'sw-expanded', 'id': txt + "-status-switch"})
		lnk = new Element("a", {'onclick': 'toggle("' + txt + '-status")', 'href': '#'});
		lnk.setText("Host Status");
		head.adopt(lnk);
		tgDiv.adopt(head);
		statusDiv = new Element("div", {'id': txt + "-status-detail", 'class': 'frame-div'});
		tgDiv.adopt(statusDiv);
		
		tbl = new Element("table");
		
		img_src = "/media/images/unknown_48.png"
		if($defined(h.osmatch.name)){
			oses = {"irix": "irix",
				"solaris": "solaris",
				"linux": "linux",
				"freebsd": "freebsd",
				"macos x": "macosx",
				"openbsd": "openbsd",
				"windows": "win",
				"ubuntu": "ubuntu", 
				"red hat": "redhat"}
			for(k in oses){
				if(h.osmatch.name.toLowerCase().contains(k)){
					img_src = "/media/images/" + oses[k] + "_48.png"
				}
			}
		}
		imgOS = new Element("img", {'src': img_src})
		open_ports = parseInt(h.openned_ports)
		img_src = 'vl_5'
		if(open_ports < 3){
		    img_src = 'vl_1'
		}else if(open_ports < 5){
		    img_src = 'vl_2'
		}else if(open_ports < 7){
		    img_src = 'vl_3'
		}else if(open_ports < 9){
		    img_src = 'vl_4'
		}
		imgStatus = new Element("img", {'src': '/media/images/' + img_src + '_48.png'})
		addTableRow(tbl, ["<b>State:</b>", h.state, {"attrs": {"rowSpan": "4"}, "value": imgOS}])
		addTableRow(tbl, ["<b>Open ports:</b>", h.openned_ports])
		addTableRow(tbl, ["<b>Filtered ports:</b>", h.filtered_ports])
		addTableRow(tbl, ["<b>Closed ports:</b>", h.closed_ports])
		addTableRow(tbl, ["<b>Scanned ports:</b>", h.scanned_ports, {"attrs": {"rowSpan": "3"}, "value": imgStatus}])
		addTableRow(tbl, ["<b>Up time:</b>", h.uptime.seconds || "Not Available"])
		addTableRow(tbl, ["<b>Last boot:</b>", h.uptime.lastboot || "Not Available"])
		
		statusDiv.adopt(tbl);
		
		
		//Addresses
		head = new Element("h4", {'class': 'sw-expanded', 'id': txt + "-addresses-switch"})
		lnk = new Element("a", {'onclick': 'toggle("' + txt + '-addresses")', 'href': '#'});
		lnk.setText("Addresses");
		head.adopt(lnk);
		tgDiv.adopt(head);
		addrDiv = new Element("div", {'id': txt + "-addresses-detail", 'class': 
										 'frame-div'});
		tbl = new Element("table");
		addTableRow(tbl, ["<b>IPV4:</b>", h['ip']['addr']]);
		addTableRow(tbl, ["<b>IPV6:</b>", (h['ipv6']['addr'])? h['ipv6']['addr']: ""]);
		addTableRow(tbl, ["<b>MAC:</b>", (h['mac']['addr'])? h['mac']['addr']: ""]);
		addrDiv.adopt(tbl);
		
		tgDiv.adopt(addrDiv);
		
		//Host names
		if(h.hostnames.length > 0){
			head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-hostnames-switch"})
			lnk = new Element("a", {'onclick': 'toggle("' + txt + '-hostnames")', 'href': '#'});
			lnk.setText("Hostnames");
			head.adopt(lnk);
			tgDiv.adopt(head);
			hostnameDiv = new Element("div", {'id': txt + "-hostnames-detail", 'class': 
										 'frame-div'});
			tbl = new Element("table");
			desc = "<b>Name - Type:</b>"
			for(k = 0; k < h.hostnames.length; k++){
				hn = h.hostnames[k]
				addTableRow(tbl, [desc, hn.hostname + " - " + hn.hostname_type]);
			}
			hostnameDiv.adopt(tbl);
			tgDiv.adopt(hostnameDiv);
			hostsTab.adopt(tgDiv); 
			slides[txt + '-hostnames'] = new Fx.Slide(hostnameDiv);
			slides[txt + '-hostnames'].hide();
		}
		
		if(h.osclasses.length > 0 && h.osmatch.name){
			head = new Element("h4", {'class': 'sw-expanded', 'id': txt + "-os-switch"})
			lnk = new Element("a", {'onclick': 'toggle("' + txt + '-os")', 'href': '#'});
			lnk.setText("Operating System");
			head.adopt(lnk);
			tgDiv.adopt(head);
			
			osDiv = new Element("div", {'id': txt + "-os-detail", 'class': 'frame-div'});
			tgDiv.adopt(osDiv);
			tb = new Element("table");
			addTableRow(tb, ["<b>Name:</b>", h.osmatch.name]);

			accurDiv = new Element("div", {'class': 'progress-bar'});
			accurDiv.setText(h.osmatch.accuracy + "%");
			position = 180 - (parseInt(h.osmatch.accuracy)/100 * 180);
			accurDiv.style.backgroundPosition = "" + position + "px 0px";
			
			addTableRow(tb, ["<b>Accuracy:</b>", accurDiv]);
			osDiv.adopt(tb);
	
			head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + '-os-ports-switch'})
			portDiv = new Element("div", {'id': txt + "-os-ports-detail", 'class': 'frame-div'});
			lnk = new Element("a", {'onclick': 'toggle("' + txt + '-os-ports")', 'href': '#'});
			lnk.setText("Ports Used");
			head.adopt(lnk);
	
			tb = new Element("table");
			desc = "<b>Port - Protocol - State:</b>"
			for(y = 0; y < h.ports_used.length; y++){
				pu = h.ports_used[y];
				addTableRow(tb, [desc, [pu.portid, pu.proto, pu.state].join(" - ")])
			}
			portDiv.adopt(tb);
			osDiv.adopt(head);
			osDiv.adopt(portDiv);
			slides[txt + '-os-ports'] = new Fx.Slide(portDiv);
			slides[txt + '-os-ports'].hide();
			
			head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + '-os-osclass-switch'})
			classDiv = new Element("div", {'id': txt + "-os-osclass-detail", 'class': 'frame-div'});
			lnk = new Element("a", {'onclick': 'toggle("' + txt + '-os-osclass")', 'href': '#'});
			lnk.setText("OS Class");
			head.adopt(lnk);
			
			tb = new Element("table");
			addTableRow(tb, ["<b>Type</b>", "<b>Vendor</b>",
					 "<b>OS Family</b>", "<b>OS Generation</b>",
					 "<b>Accuracy</b>"]);
			
			for(y = 0; y < h.osclasses.length; y++){
				osc = h.osclasses[y];
				accurDiv = new Element("div", {'class': 'progress-bar'});
				accurDiv.setText(osc.accuracy + "%");
				position = 180 - (parseInt(osc.accuracy)/100 * 180);
				alert(position)
				accurDiv.style.backgroundPosition = "" + position + "px 0px";
				addTableRow(tb, [osc.type, osc.vendor, osc.osfamily,
						osc.osgen, accurDiv]);
			}
			classDiv.adopt(tb);
			
			osDiv.adopt(head);
			osDiv.adopt(classDiv);
			slides[txt + '-os-osclass'] = new Fx.Slide(classDiv);
			slides[txt + '-os-osclass'].hide();
		}	
		
		// TCP Sequence
		if(h.tcpsequence.values){
			head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-tcpsequence-switch"})
			lnk = new Element("a", {'onclick': 'toggle("' + txt + '-tcpsequence")', 'href': '#'});
			lnk.setText("TCP Sequence");
			head.adopt(lnk);
			tgDiv.adopt(head);
			
			tcpDiv = new Element("div", {'id': txt + "-tcpsequence-detail", 'class': 'frame-div'});
			tb = new Element("table");
			tcpDiv.adopt(tb);
			selectValues = new Element("select");
			list = h.tcpsequence.values.split(",");
			for(x = 0; x < list.length; x++){
				opt = new Element("option");
				opt.setText(list[x]);
				selectValues.adopt(opt);
			}
			addTableRow(tb, ["<b>Class:</b>", h.tcpsequence.class]);
			addTableRow(tb, ["<b>Difficulty:</b>", h.tcpsequence.difficulty]);
			addTableRow(tb, ["<b>Index:</b>", h.tcpsequence.index]);
			addTableRow(tb, ["<b>Values:</b>", selectValues]);
			tgDiv.adopt(tcpDiv);
			slides[txt + '-tcpsequence'] = new Fx.Slide(tcpDiv);
			slides[txt + '-tcpsequence'].hide();
		}
		
		//IP ID Sequence
		if(h.ipidsequence.values){
			head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-ipidsequence-switch"})
			lnk = new Element("a", {'onclick': 'toggle("' + txt + '-ipidsequence")', 'href': '#'});
			lnk.setText("IP ID Sequence");
			head.adopt(lnk);
			tgDiv.adopt(head);
			
			tcpDiv = new Element("div", {'id': txt + "-ipidsequence-detail", 'class': 'frame-div'});
			tb = new Element("table");
			tcpDiv.adopt(tb);
			selectValues = new Element("select");
			list = h.ipidsequence.values.split(",");
			for(x = 0; x < list.length; x++){
				opt = new Element("option");
				opt.setText(list[x]);
				selectValues.adopt(opt);
			}
			addTableRow(tb, ["<b>Class:</b>", h.ipidsequence.class]);
			addTableRow(tb, ["<b>Values:</b>", selectValues]);
			tgDiv.adopt(tcpDiv);
			slides[txt + '-ipidsequence'] = new Fx.Slide(tcpDiv);
			slides[txt + '-ipidsequence'].hide();
		}
		
		//TCP TS Sequence
		if(h.tcptssequence.values){
			head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-tcptssequence-switch"})
			lnk = new Element("a", {'onclick': 'toggle("' + txt + '-tcptssequence")', 'href': '#'});
			lnk.setText("TCP TS Sequence");
			head.adopt(lnk);
			tgDiv.adopt(head);
			
			tcpDiv = new Element("div", {'id': txt + "-tcptssequence-detail", 'class': 'frame-div'});
			tb = new Element("table");
			tcpDiv.adopt(tb);
			selectValues = new Element("select");
			list = h.tcptssequence.values.split(",");
			for(x = 0; x < list.length; x++){
				opt = new Element("option");
				opt.setText(list[x]);
				selectValues.adopt(opt);
			}
			addTableRow(tb, ["<b>Class:</b>", h.tcptssequence.class]);
			addTableRow(tb, ["<b>Values:</b>", selectValues]);
			tgDiv.adopt(tcpDiv);
			slides[txt + '-tcptssequence'] = new Fx.Slide(tcpDiv);
			slides[txt + '-tcptssequence'].hide();
		}
	}
}

loadScanInfo = function(scan){
	scanTab = $("scan_details").empty();
	
	head = new Element("h4", {'class': 'sw-expanded', 'id': "command-info-switch"})
	lnk = new Element("a", {'onclick': 'toggle("command-info")', 'href': '#'});
	lnk.setText("Command Info");
	head.adopt(lnk);
	scanTab.adopt(head);
	cmdDiv = new Element("div", {'id': "command-info-detail", 'class': 'frame-div'});
	tbl = new Element("table");
	
	addTableRow(tbl, ["<b>Command:</b>", scan.nmap_command]);
	addTableRow(tbl, ["<b>Version:</b>", scan.nmap.nmaprun.version]);
	addTableRow(tbl, ["<b>Verbosity Level:</b>", scan.verbose_level]);
	addTableRow(tbl, ["<b>Debug Level:</b>", scan.nmap.debugging]);
	
	cmdDiv.adopt(tbl);
		
	scanTab.adopt(cmdDiv);
	
	//
	
	head = new Element("h4", {'class': 'sw-expanded', 'id': "general-info-switch"})
	lnk = new Element("a", {'onclick': 'toggle("general-info")', 'href': '#'});
	lnk.setText("General Info");
	head.adopt(lnk);
	scanTab.adopt(head);
	cmdDiv = new Element("div", {'id': "general-info-detail", 'class': 'frame-div'});
	tbl = new Element("table");
	
	addTableRow(tbl, ["<b>Started on:</b>", scan.formated_date]);
	addTableRow(tbl, ["<b>Finished on:</b>", scan.formated_finish_date]);
	addTableRow(tbl, ["<b>Hosts up:</b>", scan.runstats.hosts_up]);
	addTableRow(tbl, ["<b>Hosts down:</b>", scan.runstats.hosts_down]);
	addTableRow(tbl, ["<b>Hosts scanned:</b>", scan.runstats.hosts_scanned]);
	addTableRow(tbl, ["<b>Open ports:</b>", scan.openned_ports]);
	addTableRow(tbl, ["<b>Filtered ports:</b>", scan.filtered_ports]);
	addTableRow(tbl, ["<b>Closed ports:</b>", scan.closed_ports]);
	
	cmdDiv.adopt(tbl);
	scanTab.adopt(cmdDiv);
		
	for(i = 0; i < scan.scaninfo.length; i++){
		info = scan.scaninfo[i];
		txt = "scaninfo-" + info.type
		head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-switch"})
		lnk = new Element("a", {'onclick': 'toggle("'+ txt +'")', 'href': '#'});
		lnk.setText("Scan Info - " + info.type);
		head.adopt(lnk);
		scanTab.adopt(head);
		scanDiv = new Element("div", {'id': txt + "-detail", 'class': 'frame-div'});
		tbl = new Element("table");
		addTableRow(tbl, ["<b>Scan type:</b>", info.type]);
		addTableRow(tbl, ["<b>Protocol:</b>", info.protocol]);
		addTableRow(tbl, ["<b># scanned ports:</b>", info.numservices]);

		selectServices = new Element("select");
		
		services = info.services.split(",")
		for(j = 0; j < services.length; j++){
			opt = new Element("option");
			opt.setText(services[j]);
			selectServices.adopt(opt);
		}
		addTableRow(tbl, ["<b>Services:</b>", selectServices]);
		scanDiv.adopt(tbl);
		scanTab.adopt(scanDiv);
		slides[txt] = new Fx.Slide(scanDiv);
		slides[txt].hide();
	}
}

loadScanData = function(scan){
	hosts = scan.hosts
	loadHosts(hosts);
	loadScanInfo(scan);
	selectHost(scanEvent, hosts, 0);
}

checkScanStatus = function(scanID){
    checkUrl = "/scan/" + scanID + "/check/"
    new Json.Remote(checkUrl, {onComplete: function(result){
				if(result.result == "OK"){
				    resultBox = $("nmap-output");
				    if(result.status == "FINISHED"){
						resultBox.removeClass("ajax-loading")
						resultBox.setText(result.output.plain)
						varData = result.output.full
						loadScanData(result.output.full)
				    }else if(result.status == "RUNNING"){
						setTimeout("checkScanStatus('" + scanID + "')", 1000)
						resultBox.empty().setText(result.output.text)
				    }
				}else{
				    resultBox.addClass("ajax-error").setText(result.status);
				}
				scanLock = false;
			      },
			      onFailure: function(req){
			        $("nmap-output").removeClass("ajax-loading");
			        $("hosts_table").getElement("tbody").empty();
			        $("nmap-output").setHTML(req.responseText);
				scanLock = false;
			      }
			      }).send();
}

runScan = function(e){
	e = new Event(e);
	e.stop();
	scanEvent = e;
	result_box = $("nmap-output");
	result_box.empty().addClass("ajax-loading");
	tbHosts = $("hosts_table").getElement("tbody");
	if(!window.ie){
		tbHosts.empty();
	}else{
		while(tbHosts.rows > 0) tbHosts.deleteRow(0);
	}
	tr = new Element("tr");
	td1 = new Element("td");
	td1.adopt(new Element("img", {'src': '/media/images/spinner.gif'}));
	tr.adopt(td1);
	td2 = new Element("td");
	td2.setText("Running...");
	tr.adopt(td2);
	tbHosts.adopt(tr);
	
	$("ports_table").getElement("tbody").empty();
	$("hosts_tab").empty();
	$("scan_details").empty();
	$("tabber-result").tabber.tabShow(1);
	
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
		    $("hosts_table").getElement("tbody").empty();
		    result_box.setHTML(error.responseText);
		    scanLock = false;
		  }
		  });
}

window.addEvent("domready", function(){
    if($defined($("frmScan"))){
	$("frmScan").addEvent("submit", runScan);
    }
});
