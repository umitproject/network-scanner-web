#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Copyright (C) 2005 Insecure.Com LLC.
#
# Author: Rodolfo da Silva Carvalho <rodolfo.ueg@gmail.com>
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA

from types import *
from umitWeb.Http import HttpResponse, Http404, Http500, Http403, HttpError
from umitWeb.Auth import authenticate, ERROR
from umitWeb.Server import UmitWebServer as server
from umitWeb.WebLogger import getLogger
from umitWeb.Json import ScanJsonParser
from umitCore.NmapCommand import NmapCommand
from umitCore.NmapParser import NmapParser, HostInfo
from umitCore.UmitConf import CommandProfile
from umitCore.UmitDB import Scans, UmitDB
from urllib import quote
from tempfile import mktemp
import random
import sys
import os
#from StringIO import StringIO
import re
import md5
from threading import Thread
from time import time
import datetime


logger = getLogger(__name__)

@authenticate()
def index(req):
    response = HttpResponse()
    response.loadTemplate("scans.html")
    return response


@authenticate(ERROR)
def new(req):
    response = HttpResponse()
    response['Content-type'] = "text/plain"
    
    #Replace dangerous commands
    command = re.sub(r"[\\;|`&]", "", req.POST['command'])
    if req.session.user.is_permitted(command):
        try:
            nmapCommand = NmapCommand(command)
            resourceID = server.currentInstance.addResource(nmapCommand)
            server.currentInstance.fireResourceEvent(resourceID, "run_scan")
            
            req.session['command_' + resourceID] = command
            req.session['profile_' + resourceID] = req.POST['profile_name']
            req.session['target_' + resourceID] = req.POST['target']
            response.write("{'result': 'OK', 'status': 'RUNNING', 'id': '%s'}" % resourceID)
        except Exception, e:
            response.write("{'result': 'FAIL', 'status': '%s'}" % str(e).replace("'", "\\'"))
        return response
    else:
        raise Http403


@authenticate(ERROR)
def check(req, resource_id):
    response = HttpResponse()
    response['Content-type'] = "text/javascript"
    
    nmapCommand = server.currentInstance.getResource(resource_id)
    
    if nmapCommand is None:
        raise Http404
    
    try:
        output = nmapCommand.get_output()
        if nmapCommand.scan_state():
            response.write("{'result': 'OK', 'status': 'RUNNING', " + \
                           "'output': {'text': '%s'}}" % output.replace("'", "\\'").replace("\n", "\\n' + \n'"))
        else:
            profile = CommandProfile()
            parser = NmapParser()
            parser.set_xml_file(nmapCommand.get_xml_output_file())
            parser.parse()

            parser.profile_name = req.session['profile_' + resource_id]
            parser.target = req.session['target_' + resource_id]
            parser.nmap_command = req.session['command_' + resource_id]
            parser.profile = profile.get_command(parser.profile_name)
            parser.profile_hint = profile.get_hint(parser.profile_name)
            parser.profile_description = profile.get_description(parser.profile_name)
            parser.profile_annotation = profile.get_annotation(parser.profile_name)
            parser.profile_options = profile.get_options(parser.profile_name)
            try:
                parser.nmap_output = nmapCommand.get_raw_output()
            except:
                parser.nmap_output = "\\n".join(self.scan_result.get_nmap_output().split("\n"))
            parsed_scan = ScanJsonParser(parser).parse()
            text_out = nmapCommand.get_output().replace("'", "\\'").replace("\n", "\\n' + \n'")
            response.write("{'result': 'OK', 'status': 'FINISHED', 'output':" + \
                           " {'full': %s, 'plain': '%s'}}" % (parsed_scan, text_out))
            server.currentInstance.removeResource(resource_id)
            fname = mktemp()
            fresult = open(fname, "w", 0)
            parser.write_xml(fresult)
            req.session['scan_result_' + resource_id] = open(fname, 'r').read()
    except Exception, e:
        if "running" in str(e).lower():
            response.write("{'result': 'OK', 'status': 'RUNNING', " + \
                           "'output': {'text': ''}}")
        else:
            raise Http500("Nmap command raised an exception!\n%s" % str(e))
    return response


@authenticate(ERROR)
def upload_result(req):
    if req.POST:
        if req.POST['type'] == "file":
            try:
                parser = NmapParser()
                parser.set_xml_file(req.FILES['scan_result']['temp_file'])
                parser.parse()
                parsed_scan = ScanJsonParser(parser).parse()
                junk = r"odpojfsdkjfpisudŕij208u-0w9rsdnfkdfçwrtwqr/fsasd~/???çds"
                key = md5.new(str(random.randint(0, sys.maxint-1)) \
                                  + str(random.randint(1, sys.maxint-1)//2) \
                                  + junk).hexdigest()
                req.session['scan_result_' + key] = open(req.FILES['scan_result']['temp_name'], 'r').read()
                text_out = parser.nmap_output.replace("'", "\\'").replace("\r", "").replace("\n", "\\n' + \n'")
                parsed_scan = str(parsed_scan).replace("\n", "\\n' + \n'")
                return HttpResponse(("{'result': 'OK', 'id': '%s', 'output': " + \
                                    "{'plain': '%s', 'full': %s}}") % \
                                    (key, text_out, parsed_scan), "text/plain")
            except Exception, ex:
                return HttpResponse("{'result': 'FAIL', 'output': '%s'}" % str(ex).replace("'", "\\'"), "text/plain")
        else:
            scan_id = req.POST['scanId']
            db = UmitDB()
            if scan_id not in [str(sid) for sid in db.get_scans_ids()]:
                return HttpResponse("{'result': 'FAIL', 'output': 'Scan not found!'}")
            
            scan = Scans(scans_id=scan_id)
            ftemp = open(mktemp(), "w", 0)
            ftemp.write(scan.nmap_xml_output)
            ftemp.flush()
            parser = NmapParser(ftemp.name)
            parser.parse()
            json_parser = ScanJsonParser(parser)
            return HttpResponse("{'result': 'OK', 'output': {'plain': '%s', 'full': %s}}" % \
                                (parser.get_nmap_output().replace("'", "\\'").\
                                replace("\r", "").replace("\n", "\\n' + \n'"),
                                json_parser.parse()), 
                                "text/plain")
    else:
        raise HttpError(400, "Invalid GET request.")

@authenticate(ERROR)
def save_result(req, scan_id):
    print req.POST
    if req.POST:
        scan = req.session.get("scan_result_" + scan_id, None)
        parser = NmapParser()
        fname = mktemp()
        ftemp = open(fname, "a", 0)
        ftemp.write(scan)
        ftemp.close()
        parser.set_xml_file(fname)
        parser.parse()
        parser.scan_name = req.POST['filename']
        parser.write_xml(open(fname, "w", 0))
        ftemp = open(fname, "r")
        scan = ftemp.read()
        if not scan:
            raise Http404
        
        if req.POST['destination'] == "database":
            Scans(scan_name=parser.scan_name,
                    nmap_xml_output=scan,
                    date=time())
            return HttpResponse("{'result': 'OK'}", "text/plain")
        else:
            response = HttpResponse(scan, "text/xml")
            response['Content-disposition'] = "attachment; filename=" + quote(req.POST['filename'].replace(" ", "_")) + ".usr"
            return response
    else:
        raise HttpError(400, "Invalid GET request.")
    

@authenticate(ERROR)
def get_saved_scans(req):
    db = UmitDB()
    data = [{"id": str(s.scans_id), 
             "name": str(s.scan_name).replace("'", "\\'"),
             "date": datetime.datetime.fromtimestamp(s.date).strftime("%Y-%m-%d %H:%M:%S")}
             for s in db.get_scans() if req.POST.get("search", "").lower() in s.scan_name.lower()]
    return HttpResponse(str(data))


@authenticate(ERROR)
def get_scan(req, scan_id):
    db = UmitDB()
    if scan_id not in [str(sid) for sid in db.get_scans_ids()]:
        raise Http404
    
    scan = Scans(scans_id=scan_id)
    ftemp = open(mktemp(), "w", 0)
    ftemp.write(scan.nmap_xml_output)
    ftemp.flush()
    parser = NmapParser(ftemp.name)
    parser.parse()
    return HttpResponse("{'result': 'OK', 'output': '%s', 'xml': '%s'}" % \
                        (parser.get_nmap_output().replace("'", "\\'").\
                        replace("\r", "").replace("\n", "\\n' + \n'"),
                        open(ftemp.name).read().replace('"', "'").\
                        replace("'", "\\'").\
                        replace("\n", "\\n' + \n'")), 
                        "text/plain")


@authenticate(ERROR)
def delete_scan(req, scan_id):
    db = UmitDB()
    cursor = db.cursor
    if int(scan_id) not in db.get_scans_ids():
        raise Http404
    
    try:
        cursor.execute("DELETE FROM scans WHERE scans_id=%d" % int(scan_id))
    except Exception, e:
        return HttpResponse("{'result': 'FAIL', 'error': '%s'}" % str(e))
    
    return HttpResponse("{'result': 'OK'}")