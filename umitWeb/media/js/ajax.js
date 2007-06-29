var varData = ""

scanLock = false;

loadHosts = function(hosts){
	tbHosts = $("hosts_table").getElement("tbody").empty();
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
			pId = this.parentNode.parentNode.getAttribute("id").substr("host-".length);
			selectHost(hosts, pId);
		}
		lnk.setText(txt);
		addTableRow(tbHosts, [img, lnk], {'id': 'host-' + iH});
	}
}

selectHost = function(sHosts, start, end){
	for(i = 0; i < sHosts.length; i++){
		if($defined($("host-" + i)))
			$("host-" + i).removeClass("selected");
	}
	if(hosts.length > 0){
		if(!end){
			loadHostsTab([sHosts[start]]);
			$("host-" + start).addClass("selected");
		}else{
			arr = new Array();
			for(i = start, j = 0; i < end && i < hosts.length; i++, j++){
				arr[j] = sHosts[i];
				$("host-" + i).addClass("selected");
			}
			loadHostsTab(arr);
		}
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

loadHostsTab = function(hostset){
	hostsTab = $("hosts_tab").empty()
	for(i = 0; i < hostset.length; i++){
		h = hostset[i]
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
		
		h = hostset[i];
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
		
		hostsTab.adopt(tgDiv);
		
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
		head = new Element("h4", {'class': 'sw-expanded', 'id': txt + "-switch"})
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
		//slides[txt] = new Fx.Slide(scanDiv);
		//slides[txt].hide();
		addTableRow(tbl, ["<b>Services:</b>", selectServices]);
		scanDiv.adopt(tbl);
		scanTab.adopt(scanDiv);
	}
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
	hosts = scan.hosts
	loadHosts(hosts);
	loadScanInfo(scan);
	selectHost(hosts, 0);
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
	new Event(e).stop();
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
