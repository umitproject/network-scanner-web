var varData = ""

scanLock = false;

lastHost = null;
lastService = null;
var scanEvent = null;
var nmapOutput = "";
var sSlide;
var hSlide;

function sendJSONRequest(){}

function loadHosts(hosts){
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
			img_src = "/media/images/default_24.png"
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

function selectHost(event, sHosts, index){
	arr = new Array();
	$("ports_table_placeholder").setStyle("display", "block");
	$("hosts_s_table_placeholder").setStyle("display", "none");
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
		
		for(x = start; x <= end; x++){
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
	event.stop();
}

function addTableRow(table, row, lineAttrs){
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
	//alert(table)
	table.adopt(tr)
}

function loadPortsTab(pHosts){
	tbody = $("ports_table").getElement("tbody").empty();
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

function loadHostsTab(hostset){
	hostsTab = $("hosts_tab").empty()
	collapsed = (hostset.length > 1);
	for(hi = 0; hi < hostset.length; hi++){
		h = hostset[hi]
		txt = h.ip.addr
		if(h.hostnames.length > 0)
			txt = h.hostnames[0].hostname + " " + txt
		
		head = new Element("h4", {'class': 'sw-expanded', 'id': txt + "-switch"});
		lnk = new Element("a", {'href': '#', 'class': 'expander'});
		head.setText(txt);
		lnk.adopt(head);
		
		hostsTab.adopt(lnk);
		
		tgDiv = new Element("div", {'id': txt + "-detail", 'class': 'frame-div'});
		hostsTab.adopt(tgDiv);
		
		if(collapsed){
			toggle(txt);
		}
		
		//Comment
		head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-comment-switch"})
		lnk = new Element("a", {'href': '#', 'class': 'expander'});
		head.setText("Comment");
		lnk.adopt(head);
		tgDiv.adopt(lnk);
		
		commentDiv = new Element("div", {'id': txt + "-comment-detail", 'class': 'frame-div hide'})
		comment = new Element("textarea", {'rows':"5", 'cols':"60", 'class': "flat-field"})
		commentDiv.adopt(comment);
		tgDiv.adopt(commentDiv);
		
		//Host Status
		head = new Element("h4", {'class': 'sw-expanded', 'id': txt + "-status-switch"})
		lnk = new Element("a", {'href': '#', 'class': 'expander'});
		head.setText("Host Status");
		lnk.adopt(head);
		tgDiv.adopt(lnk);
		statusDiv = new Element("div", {'id': txt + "-status-detail", 'class': 'frame-div'});
		tgDiv.adopt(statusDiv);
		
		tbl = new Element("table");
		
		img_src = "/media/images/unknown_48.png"
		if($defined(h.osmatch.name)){
			oses = {"irix": "irix",
				"solaris": "solaris",
				"linux": "linux",
				"freebsd": "freebsd",
				"mac os x": "macosx",
				"openbsd": "openbsd",
				"windows": "win",
				"ubuntu": "ubuntu", 
				"red hat": "redhat"}
			img_src = "/media/images/default_48.png";
			for(k in oses){
				if(h.osmatch.name.toLowerCase().contains(k)){
					img_src = "/media/images/" + oses[k] + "_48.png"
				}
			}
		}
		imgOS = new Element("img", {'src': img_src})
		open_ports = parseInt(h.open_ports)
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
		addTableRow(tbl, ["<b>Open ports:</b>", h.open_ports])
		addTableRow(tbl, ["<b>Filtered ports:</b>", h.filtered_ports])
		addTableRow(tbl, ["<b>Closed ports:</b>", h.closed_ports])
		addTableRow(tbl, ["<b>Scanned ports:</b>", h.scanned_ports, {"attrs": {"rowSpan": "3"}, "value": imgStatus}])
		addTableRow(tbl, ["<b>Up time:</b>", h.uptime.seconds || "Not Available"])
		addTableRow(tbl, ["<b>Last boot:</b>", h.uptime.lastboot || "Not Available"])
		
		statusDiv.adopt(tbl);
		
		
		//Addresses
		head = new Element("h4", {'class': 'sw-expanded', 'id': txt + "-addresses-switch"})
		lnk = new Element("a", {'href': '#', 'class': 'expander'});
		head.setText("Addresses");
		lnk.adopt(head);
		tgDiv.adopt(lnk);
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
			lnk = new Element("a", {'href': '#', 'class': 'expander'});
			head.setText("Hostnames");
			lnk.adopt(head);
			tgDiv.adopt(lnk);
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
			lnk = new Element("a", {'href': '#', 'class': 'expander'});
			head.setText("Operating System");
			lnk.adopt(head);
			tgDiv.adopt(lnk);
			
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
			lnk = new Element("a", {'href': '#', 'class': 'expander'});
			head.setText("Ports Used");
			lnk.adopt(head);
	
			tb = new Element("table");
			desc = "<b>Port - Protocol - State:</b>"
			for(y = 0; y < h.ports_used.length; y++){
				pu = h.ports_used[y];
				addTableRow(tb, [desc, [pu.portid, pu.proto, pu.state].join(" - ")])
			}
			portDiv.adopt(tb);
			osDiv.adopt(lnk);
			osDiv.adopt(portDiv);
			slides[txt + '-os-ports'] = new Fx.Slide(portDiv);
			slides[txt + '-os-ports'].hide();
			
			head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + '-os-osclass-switch'})
			classDiv = new Element("div", {'id': txt + "-os-osclass-detail", 'class': 'frame-div'});
			lnk = new Element("a", {'onclick': 'toggle("' + txt + '-os-osclass")', 'href': '#'});
			head.setText("OS Class");
			lnk.adopt(head);
			
			tb = new Element("table");
			addTableRow(tb, ["<b>Type</b>", "<b>Vendor</b>",
					 "<b>OS Family</b>", "<b>OS Generation</b>",
					 "<b>Accuracy</b>"]);
			
			for(y = 0; y < h.osclasses.length; y++){
				osc = h.osclasses[y];
				accurDiv = new Element("div", {'class': 'progress-bar'});
				accurDiv.setText(osc.accuracy + "%");
				position = 180 - (parseInt(osc.accuracy)/100 * 180);
				accurDiv.style.backgroundPosition = "" + position + "px 0px";
				addTableRow(tb, [osc.type, osc.vendor, osc.osfamily,
						osc.osgen, accurDiv]);
			}
			classDiv.adopt(tb);
			
			osDiv.adopt(lnk);
			osDiv.adopt(classDiv);
			slides[txt + '-os-osclass'] = new Fx.Slide(classDiv);
			slides[txt + '-os-osclass'].hide();
		}	
		
		// TCP Sequence
		if(h.tcpsequence.values){
			head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-tcpsequence-switch"})
			lnk = new Element("a", {'href': '#', 'class': 'expander'});
			head.setText("TCP Sequence");
			lnk.adopt(head);
			tgDiv.adopt(lnk);
			
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
			addTableRow(tb, ["<b>Class:</b>", h.tcpsequence['class']]);
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
			lnk = new Element("a", {'href': '#', 'class': 'expander'});
			head.setText("IP ID Sequence");
			lnk.adopt(head);
			tgDiv.adopt(lnk);
			
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
			addTableRow(tb, ["<b>Class:</b>", h.ipidsequence['class']]);
			addTableRow(tb, ["<b>Values:</b>", selectValues]);
			tgDiv.adopt(tcpDiv);
			slides[txt + '-ipidsequence'] = new Fx.Slide(tcpDiv);
			slides[txt + '-ipidsequence'].hide();
		}
		
		//TCP TS Sequence
		if(h.tcptssequence.values){
			head = new Element("h4", {'class': 'sw-collapsed', 'id': txt + "-tcptssequence-switch"})
			lnk = new Element("a", {'href': '#', 'class': 'expander'});
			head.setText("TCP TS Sequence");
			lnk.adopt(head);
			tgDiv.adopt(lnk);
			
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
			addTableRow(tb, ["<b>Class:</b>", h.tcptssequence['class']]);
			addTableRow(tb, ["<b>Values:</b>", selectValues]);
			tgDiv.adopt(tcpDiv);
			slides[txt + '-tcptssequence'] = new Fx.Slide(tcpDiv);
			slides[txt + '-tcptssequence'].hide();
		}
	}
}

function loadScanInfo(scan){
	scanTab = $("scan_details").empty();
	
	head = new Element("h4", {'class': 'sw-expanded', 'id': "command-info-switch"})
	lnk = new Element("a", {'href': '#', 'class': 'expander'});
	head.setText("Command Info");
	lnk.adopt(head);
	scanTab.adopt(lnk);
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
	lnk = new Element("a", {'href': '#', 'class': 'expander'});
	head.setText("General Info");
	lnk.adopt(head);
	scanTab.adopt(lnk);
	cmdDiv = new Element("div", {'id': "general-info-detail", 'class': 'frame-div'});
	tbl = new Element("table");
	
	addTableRow(tbl, ["<b>Started on:</b>", scan.formated_date]);
	addTableRow(tbl, ["<b>Finished on:</b>", scan.formated_finish_date]);
	addTableRow(tbl, ["<b>Hosts up:</b>", scan.runstats.hosts_up]);
	addTableRow(tbl, ["<b>Hosts down:</b>", scan.runstats.hosts_down]);
	addTableRow(tbl, ["<b>Hosts scanned:</b>", scan.runstats.hosts_scanned]);
	addTableRow(tbl, ["<b>Open ports:</b>", scan.open_ports]);
	addTableRow(tbl, ["<b>Filtered ports:</b>", scan.filtered_ports]);
	addTableRow(tbl, ["<b>Closed ports:</b>", scan.closed_ports]);
	
	cmdDiv.adopt(tbl);
	scanTab.adopt(cmdDiv);
		
	for(i = 0; i < scan.scaninfo.length; i++){
		info = scan.scaninfo[i];
		txts = "scaninfo-" + info.type
		head = new Element("h4", {'class': 'sw-expanded', 'id': txts + "-switch"})
		lnk = new Element("a", {'href': '#', 'class': 'expander'});
		head.setText("Scan Info - " + info.type);
		lnk.adopt(head);
		scanTab.adopt(lnk);
		scanDiv = new Element("div", {'id': txts + "-detail", 'class': 'frame-div'});
		tbl = new Element("table");
		addTableRow(tbl, ["<b>Scan type:</b>", info.type]);
		addTableRow(tbl, ["<b>Protocol:</b>", info.protocol]);
		addTableRow(tbl, ["<b># scanned ports:</b>", info.numservices]);

		selectServices = new Element("select");
		
		info.services.split(",").each(function(el){
			opt = new Element("option");
			opt.setText(el);
			selectServices.adopt(opt);
		});
		
		addTableRow(tbl, ["<b>Services:</b>", selectServices]);
		scanDiv.adopt(tbl);
		scanTab.adopt(scanDiv);
		toggle(txts)
	}
}

function selectService(scan, service_id, event){
	
	
	sServices = new Array();
	sHosts = new Array();
	
	if($defined($("service-" + service_id))){
		$("service-" + service_id).toggleClass("selected");
	}
	
	if(event.control === false){
		sServices.include(service_id);
	}else if(event.control == true && event.shift == false){
		lines = $("services_table").getElement("tbody").getElements("tr[class=selected]");
		for(x = 0; x < lines.length; x++){
			tr = lines[x];
			_id = tr.id.substring("service-".length)
			sServices.include(_id);
		}
	}
	
	if(sServices.length == 0){
		sServices.include(service_id);
	}
	
	/*if(event.shift === true && lastService != null && $defined(lastService)){
		if(service_id < lastService){
			start = index;
			end = lastHost;
		}else if(index > lastHost){
			start = lastHost
			end = index;
		}
		
		for(x = start; x <= end; x++){
			$("host-" + x).addClass("selected");
			indexArr.include(x);
		}
	}*/
	
	scan.hosts.each(function(host){
		for(i = 0; i < host.ports.length; i++){
			host.ports[0].port.each(function(port){
				sServices.each(function(service){
					if(port.service_name == service){
						sHosts.include([host, port]);
					}
				});
			});
		}
	});
	
	$("services_table").getElement("tBody").getElements("tr").each(function(el){
		el.removeClass("selected");
	});
	
	sServices.each(function(s){
		$("service-" + s).addClass("selected");
	});
	
	st = $("hosts_s_table").getElement("tbody").empty();
	$("hosts_s_table_placeholder").setStyle("display", "block");
	$("ports_table_placeholder").setStyle("display", "none");
	$("tabber-result").tabber.tabShow(0);
	
	sHosts.each(function(host){
		$("service-" + host[1].service_name).addClass("selected");
		hostname = host[0].ip.addr;
		if(host[0].hostnames.length > 0)
			hostname = host[0].hostnames[0].hostname + " " + hostname
		
		src = (host[1].port_state == "open")? "open.png" : "closed.png";
		img = new Element("img", {'src': '/media/images/' + src});
		
		portid = host[1].portid
		protocol = host[1].protocol;
		state = host[1].port_state;
		product = host[1].service_product;
		version = host[1].service_version;
		addTableRow(st, [img, hostname, portid, protocol, state, product, version]);
	});
	event.stop();
}

function loadServices(scan){
	ports = scan.list_port;
	ports.each(function(port){
		st = $("services_table").getElement("tbody");
		lnk = new Element("a", {"href": "#"});
		lnk.setText(port.service_name);
		lnk.addEvent("click", function(e){
			e = new Event(e);
			selectService(scan, port.service_name, e);
		});
		addTableRow(st, [lnk], {"id": "service-" + port.service_name});
	})
}

function loadScanData(scan){
	var hosts = scan['hosts'];
	loadHosts(hosts);
	loadServices(scan);
	loadScanInfo(scan);
	selectHost(scanEvent, hosts, 0);
	$$("a[class=expander]").each(function(lnk){
		lnk.addEvent("click", function(e){
			tgId = this.getElement("h4").id;
			toggle(tgId.substring(0, tgId.length - "-switch".length));
			new Event(e).stop();
		})
	});
}

function formatNmapOutput(output){
	results = new Array();
	output.split("\n").each(function(txt_out){
		if(txt_out.trim().length == 0){
			results.include("&nbsp;");
			return;
		}
		result = '';
		found = false;
		txt = txt_out;
		for(k in highlights){
			this_found = false;
			txt_temp = txt;
			hg = highlights[k];
			regex = new RegExp(hg.regex);
			
			style = "color:" + hg.text + ";";
			style += "background-color:" + hg.highlight + ";";
			if(hg.bold == '1'){
				style += "font-weight:bold;";
			}
			if(hg.underline == '1'){
				style += "text-decoration:underline;";
			}
			
			if(hg.italic == '1'){
				style += 'font-style:italic';
			}
			
			while(txt_temp.match(regex)){
				this_found = true;
				found = true;
				m = txt_temp.match(regex)[0]
				
				result = txt.replace(txt_temp, txt_temp.replace(m, "<span style='" +
							  style + "'>" + m + "</span>"));
				txt_temp = txt_temp.substring(txt_temp.search(regex) +
							      txt_temp.match(regex)[0].length);
			}
			
			if(this_found)
				txt = result;
		}
		if(!found){
			result = txt_out;
		}
		
		brtMatch = /([Bb][Rr][Aa][Ss][Ii][Ll]|BRT)/;
		if(result.match(brtMatch)){
			value = result.match(brtMatch)[0];
			strFmt = "";
			strFmt = "<span style='background-color:#00ca30; font-weight: bold'>";
			colors = ["yellow", "blue", "white"]
			for(x = 0, y = 0; x < value.length; x++, y++){
				if(y == colors.length){
					y = 0;
				}
				strFmt += "<span style='color:" + colors[y] + "'>"
				strFmt += value.substring(x, x+1)
				strFmt += "</span>"
			}
			strFmt += "</span>";
			result = result.replace(value, strFmt);
		}
		results.include(result);
	});
	return results.join("<br/>");
}

function checkScanStatus(scanID){
    checkUrl = "/scan/" + scanID + "/check/"
    new Json.Remote(checkUrl, {onComplete: function(result){
				if(result.result == "OK"){
				    resultBox = $("nmap-output");
				    if(result.status == "FINISHED"){
						resultBox.removeClass("ajax-loading")
						nmapOutput = result.output.plain
						if(window.ie){
							nmapOutput = nmapOutput.replace("\r", "<br/>\r")
							//alert(nmapOutput)
						}
						if(!$("highlight_out").checked){
							resultBox.setText(nmapOutput)
						}else{
							resultBox.setHTML(formatNmapOutput(nmapOutput))
						}
						varData = result.output.full
						loadScanData(result.output.full)
				    }else if(result.status == "RUNNING"){
						setTimeout("checkScanStatus('" + scanID + "')", 1000)
						nmapOutput = result.output.text
						if(window.ie){
							nmapOutput = nmapOutput.replace("\n", "<br/>\n")
						}
						if(!$("highlight_out").checked){
							resultBox.empty().setText(nmapOutput)
						}else{
							resultBox.empty().setHTML(formatNmapOutput(nmapOutput))
						}
				    }
				}else{
				    resultBox.addClass("ajax-error").setText(result.status);
				}
				scanLock = false;
			      },
			      onFailure: function(req){
			        $("nmap-output").removeClass("ajax-loading");
			        $("hosts_table").getElement("tbody").empty();
				if(req.status == 403){
					div = new Element("div", {'class': "error"})
					div.setHTML("<h2>Forbidden</h2>\n" +
						    "Your access has been " +
						    "denied when you try to " +
						    "request this page.<br/>" +
						    "Check with you system " +
						    "administrator if you have " +
						    "access to access this page.");
					$("nmap-output").adopt(div);
				}else{
					$("nmap-output").setHTML(req.responseText);
				}
				scanLock = false;
			      }
			      }).send();
}

runScan = function(e){
	e = new Event(e);
	
	scanEvent = e;
	result_box = $("nmap-output");
	result_box.empty().addClass("ajax-loading");
	tbHosts = $("hosts_table").getElement("tbody");
	tbHosts.empty();
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
	$("services_table").getElement("tbody").empty();
	
	this.send({onComplete: function(tResult){
			result = Json.evaluate(tResult);
			if(result.result == "OK"){
				    checkScanStatus(result.id)
			}else{
				    result_box.removeClass("ajax-loading").addClass("ajax-error");
				    result_box.setText(result.status);
			}
		  },
		  onFailure: function(req){
		    result_box.removeClass("ajax-loading");
		    $("hosts_table").getElement("tbody").empty();
		    if(req.status == 403){
				div = new Element("div", {'class': "error"})
				div.setHTML("Your access has been " +
					    "denied when you try to " +
					    "request this page.<br/>" +
					    "Check with you system " +
					    "administrator if you have " +
					    "access to access this page.");
				h1 = new Element("h1", {"style": "color:red; font-family: sans-serif"});
				h1.setText("Forbidden");
				$("nmap-output").adopt(h1);
				$("nmap-output").adopt(div);
			}else{
				$("nmap-output").setHTML(req.responseText);
			}
		    scanLock = false;
		  }
		  });
	e.stop();
}

window.addEvent("domready", function(){
    if($defined($("frmScan"))){
	$("frmScan").addEvent("submit", runScan);
	hSlide = new Fx.Slide("hosts", {mode: 'horizontal'});
	sSlide = new Fx.Slide("services", {mode: 'horizontal'});
	/*$("services").setStyle("position", "relative");*/
	
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
	
	new Json.Remote("/scan/profiles/", {onComplete: function(result){
		for(i = 0; i < result.length; i++){
			opt = new Element("option", {"value": result[i][1]})
			opt.setText(result[i][0]);
			$("profiles").adopt(opt);
		}
		cmd = $("profiles").options[0].value;
		if($("target").value != ""){
			cmd = cmd.replace("<target>", $("target").value);
		}
		$("command").value = cmd;
	}}).send();
	
	$("profiles").addEvent("change", function(event){
		cmd = this.options[this.selectedIndex].value;
		if($("target").value != ""){
			cmd = cmd.replace("<target>", $("target").value);
		}
		$("command").value = cmd;
		new Event(event).stop();
	});
    }
});

window.addEvent("domready", function(){
	if(window.ie){
		ts = $$("table", "tbody", "thead", "tfoot")
		ts.each(function(el){
			el.empty = function(){
				this.innerText = "";
				return this;
			};
		});
	}
	
	evt = "";
	if(!window.ie){
		evt = "change";
	}else{
		evt = "change";
	}
	$("highlight_out").addEvent(evt, function(e){
		new Event(e).stop();
		if(this.checked){
			$("nmap-output").setHTML(formatNmapOutput(nmapOutput));
		}else{
			$("nmap-output").setText(nmapOutput);
		}
	});
});

/*tabberOptions = {
	'onClick': function(args){
		new Event(args.event).stop();
		i = args.index;
		tabber = args.tabber;
		XX = tabber.tabs[i];
	}
}*/