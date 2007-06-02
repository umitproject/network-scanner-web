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

from umitWeb.Http import HttpResponse
from umitCore.NmapCommand import NmapCommand
import re

def new(req):
    response = HttpResponse()

    #Replace dangerous commands
    command = re.sub(r"[\\;|`&]", "", req.POST['command'])
    
    nmapCommand = NmapCommand(command)
    nmapCommand.run_scan()
    
    while nmapCommand.scan_state():
            pass
    
    if req.GET.has_key("xml"):
        response['Content-type'] = "text/xml"
        xml = nmapCommand.get_xml_output()
        
        #remove <?xsl-stylesheet?> from file
        final_xml = re.sub(r"<\?xml-stylesheet.*\?>", "", xml)
        response.write(final_xml)
        
    elif req.GET.has_key("json"):
        response['Content-type'] = "text/plain"
        response.write("{}")
        
    elif req.GET.has_key("plain"):
        response['Content-type'] = "text/plain"
        response.write(nmapCommand.get_output())
        
        
    return response
