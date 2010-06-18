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

from os.path import dirname, join
from umitCore.BasePaths import base_paths
from umitWeb.WebPaths import WPath as Path
from umitCore.NmapOptions import NmapOptions
from xml.dom import minidom

class WizardParser:
    def __init__(self, xml_file=None):
        self.xml_file = xml_file or Path.wizard
        self.__tree = minidom.parse(open(self.xml_file))
        self.sections = []
        self.__fill_sections(self.__tree.firstChild)
        
    def __fill_sections(self, root_node):
        groups = root_node.getElementsByTagName("groups")[0].getElementsByTagName("group")
        nmapOptions = NmapOptions(Path.options)
        for group in groups:
            name = group.getAttribute("name")
            element = root_node.getElementsByTagName(name)[0]
            dic = {}
            dic[name] = dict(label=element.getAttribute("label"), options=[])
            
            for node in element.childNodes:
                if node.__class__ is minidom.Element:
                    option = dict(label=node.getAttribute("label"))
                    if node.tagName == "option_list":
                        option["type"] = "list"
                        option["options"] = []
                        for opt in node.childNodes:
                            if opt.__class__ == minidom.Element:
                                option_name = opt.getAttribute("name").replace("'", "\\'")
                                x = {"name": option_name, "command": nmapOptions.get_option(option_name)['option']}
                                option["options"].append(x)
                    elif node.tagName == "option_check":
                        option["type"] = "check"
                        option["option"] = node.getAttribute("option")
                        option["command"] = nmapOptions.get_option(node.getAttribute("option"))["option"]
                        if node.getAttribute("arg_type"):
                            option["arg_type"] = node.getAttribute("arg_type")
                    dic[name]['options'].append(option)
            self.sections.append(dic)
                            
    def to_json(self):
        rlist = []
        for s in self.sections:
            k = s.keys()[0]
            el = s[k]
            kdata = []
            kdata.append("'label': '%s'" % el['label'].replace("'", "\\'"))
            options = []
            for o in el['options']:
                odata = []
                odata.append("'type': '%s'" % o['type'].replace("'", "\\'"))
                odata.append("'label': '%s'" % o['label'].replace("'", "\\'"))
                if o["type"] == "list":
                    #odata.append("'options': ['%s']" % "', '".join([p.replace("'", "\\'") for p in o["options"]]))
                    odict = []
                    for p in o["options"]:
                        odict.append("{'name': '%s', 'command': '%s'}" % (p["name"], p["command"]))
                    odata.append("'options': [%s]" % ", ".join(odict))
                elif o["type"] == "check":
                    odata.append("'option': '%s'" % o["option"].replace("'", "\\'"))
                    odata.append("'command': '%s'" % o["command"].replace("'", "\\'"))
                    if o.has_key("arg_type"):
                        odata.append("'arg_type': '%s'" % o["arg_type"].replace("'", "\\'"))
                options.append("{%s}" % ", ".join(odata))
            kdata.append("'options': [%s]" % ", ".join(options))
            
            data = "'%s': {%s}" % (k, ", ".join(kdata))
            rlist.append(data)
        return "{%s}" % ", ".join(rlist)
    

class ProfileEditorParser(WizardParser):
    def __init__(self, xml_file=None):
        xml_file = xml_file or join(dirname(Path.config_file), base_paths["profile_editor"])
        WizardParser.__init__(self, xml_file)
