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

from umitWeb.Http import HttpResponse, Http404
from umitWeb.Auth import authenticate, ERROR
from umitWeb.Server import UmitWebServer as server
from umitWeb.WebLogger import getLogger
from umitCore.NmapCommand import NmapCommand
import re

logger = getLogger(__name__)

@authenticate(ERROR)
def new(req):
    response = HttpResponse()
    response['Content-type'] = "text/plain"
    
    #Replace dangerous commands
    command = re.sub(r"[\\;|`&]", "", req.POST['command'])
    print "\n\nReceiving command: %s\n\n" % command
    try:
        nmapCommand = NmapCommand(command)
        print "\n\nCommand created: %s\n\n" % str(nmapCommand)
        nmapCommand.run_scan()
        print "\n\nCommand is now running!\n\n"
        resourceID = server.currentInstance.addResource(nmapCommand)
        print "\n\nResource added on the resource pool."
        #del nmapCommand
        
        response.write("{'result': 'OK', 'status': 'RUNNING', 'id': '%s'}" % resourceID)
    except Exception, e:
        response.write("{'result': 'FAIL', 'status': '%s'}" % str(e).replace("'", "\\'"))
    return response

@authenticate(ERROR)
def check(req, resource_id):
    response = HttpResponse()
    response['Content-type'] = "text/plain"
    
    nmapCommand = server.currentInstance.getResource(resource_id)

    logger.debug("server status: " % server.currentInstance._resourcePool)
    
    if not nmapCommand:
        raise Http404
    
    output = nmapCommand.get_output()
    if nmapCommand.scan_state():
        response.write("{'result': 'OK', 'status': 'RUNNING', " + \
                       "'output': {'text': '%s'}}" % output.replace("'", "\\'").replace("\n", "\\n' + \n'"))
    else:
        xml_out = nmapCommand.get_xml_output().replace('"', '\\"').\
                replace("'", "\\'").replace("\n", "\\n' + \n'")
        text_out = nmapCommand.get_output().replace("'", "\\'").replace("\n", "\\n' + \n'")
        response.write("{'result': 'OK', 'status': 'FINISHED', 'output':" + \
                       " {'xml': '%s', 'plain': '%s'}}" % (xml_out, text_out))
    return response
