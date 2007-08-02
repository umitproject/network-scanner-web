from os.path import dirname, join
from umitCore.Paths import Path
from umitCore.NmapOptions import NmapOptions
from umitCore.BasePaths import base_paths
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
