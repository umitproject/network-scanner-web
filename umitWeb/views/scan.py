#-*- coding: utf-8 -*-
# Copyright (C) 2007 Adriano Monteiro Marques <py.adriano@gmail.com>
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

from types import ListType, StringType, DictionaryType, UnicodeType
from umitWeb.Http import HttpResponse, Http404
from umitWeb.Auth import authenticate, ERROR
from umitWeb.Server import UmitWebServer as server
from umitWeb.WebLogger import getLogger
from umitCore.NmapCommand import NmapCommand
from umitCore.NmapParser import NmapParser, HostInfo
import re

logger = getLogger(__name__)

@authenticate(ERROR)
def new(req):
    response = HttpResponse()
    response['Content-type'] = "text/plain"
    
    #Replace dangerous commands
    command = re.sub(r"[\\;|`&]", "", req.POST['command'])
    try:
        nmapCommand = NmapCommand(command)
        nmapCommand.run_scan()
        resourceID = server.currentInstance.addResource(nmapCommand)
        del nmapCommand
        
        response.write("{'result': 'OK', 'status': 'RUNNING', 'id': '%s'}" % resourceID)
    except Exception, e:
        response.write("{'result': 'FAIL', 'status': '%s'}" % str(e).replace("'", "\\'"))
    return response

@authenticate(ERROR)
def check(req, resource_id):
    response = HttpResponse()
    response['Content-type'] = "text/javascript"
    
    nmapCommand = server.currentInstance.getResource(resource_id)

    logger.debug("server status: " % server.currentInstance._resourcePool)
    
    if not nmapCommand:
        raise Http404
    
    output = nmapCommand.get_output()
    if nmapCommand.scan_state():
        response.write("{'result': 'OK', 'status': 'RUNNING', " + \
                       "'output': {'text': '%s'}}" % output.replace("'", "\\'").replace("\n", "\\n' + \n'"))
    else:
        parser = NmapParser()
        parser.set_xml_file(nmapCommand.get_xml_output_file())
        parser.parse()
        print "OS: ", parser.hosts[0].osmatch
        parsed_scan = __scan_to_json(parser)
        text_out = nmapCommand.get_output().replace("'", "\\'").replace("\n", "\\n' + \n'")
        response.write("{'result': 'OK', 'status': 'FINISHED', 'output':" + \
                       " {'full': %s, 'plain': '%s'}}" % (parsed_scan, text_out))
    return response


def __scan_to_json(scan):
    attrs = [a for a in dir(scan) if not callable(getattr(scan, a)) \
             and not a.startswith("_")]
    
    ret = {}
    
    for attr in attrs:
        realAttribute = getattr(scan, attr)
        if type(realAttribute) == StringType or type(realAttribute) == UnicodeType:
            ret[attr] = str(realAttribute)
        elif type(realAttribute) == ListType:
            ret[attr] = __list_to_json(realAttribute)
        elif type(realAttribute) == DictionaryType:
            ret[attr] = __dict_to_json(realAttribute)
        elif realAttribute.__class__ == HostInfo:
            ret[attr] = __hostinfo_to_json(realAttribute)
            
    return str(ret)

def __list_to_json(list):
    ret = []
    for x in list:
        if type(x) == StringType or type(x) == UnicodeType:
            ret.append(str(x))
        elif type(x) == ListType:
            ret.append(__list_to_json(x))
        elif type(x) == DictionaryType:
            ret.append(__dict_to_json(x))
        elif x.__class__ == HostInfo:
            ret.append(__hostinfo_to_json(x))
            
    return ret

def __dict_to_json(dic):
    ret = {}
    for k in dic.keys():
        if type(dic[k]) == StringType or type(dic[k]) == UnicodeType:
            ret[k] = str(dic[k])
        elif type(dic[k]) == ListType:
            ret[k] = __list_to_json(dic[k])
        elif type(dic[k]) == DictionaryType:
            ret[k] = __dict_to_json(dic[k])
        elif dic[k].__class__ == HostInfo:
            ret[k] = __hostinfo_to_json(dic[k])
    return ret

def __hostinfo_to_json(host):
    attrs = [a for a in dir(host) if not callable(getattr(host, a)) and \
             not a.startswith("_")]
    ret = {}
    for k in attrs:
        attr = getattr(host, k)
        if type(attr) == StringType or type(attr) == UnicodeType:
            ret[k] = str(attr)
        elif type(attr) == ListType:
            ret[k] = __list_to_json(attr)
        elif type(attr) == DictionaryType:
            ret[k] = __dict_to_json(attr)
    return ret
