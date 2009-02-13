from types import ListType, DictionaryType, TupleType
from umitCore.I18N import _
from umitCore.NmapParser import HostInfo, NmapParser

class JsonParser(object):
    """JsonParser: a general-purpose JSON parser.
    
    This class and its subclasses are used to convert objects
    to JSON format, for use in the web app. More information 
    about JSON: http://www.json.org
    """

    def __init__(self):
        object.__init__(self)
        self.__service_list = []
        
    def parse(self):
        """Parse the object passed by the instance to a string 
        containing the JSON object.
        """
        raise NameError, _("Method not implemented")
        
    def _add_to_service_list(self, *classnames):
        for klass in classnames:
            self.__service_list.append(klass)
    
    def service_is_registered(self, obj):
        for klass in self.__service_list:
            if isinstance(obj, klass):
                return True
        return False
    
    def _list_to_json(self, list):
        ret = []
        for x in list:
            if type(x) == ListType or type(x) == TupleType:
                ret.append(self._list_to_json(x))
            elif type(x) == DictionaryType:
                ret.append(self._dict_to_json(x))
            elif self.service_is_registered(x):
                ret.append(self._to_json(x))
            elif hasattr(x, "to_json"):
                ret.append(x.to_json)
            else:
                ret.append(str(x))
                
        return ret
    
    
    def _dict_to_json(self, dic):
        ret = {}
        for k in dic.keys():
            if type(dic[k]) == ListType:
                ret[k] = self._list_to_json(dic[k])
            elif type(dic[k]) == DictionaryType:
                ret[k] = self._dict_to_json(dic[k])
            elif self.service_is_registered(dic[k]):
                ret.append(self._to_json(dic[k]))
            elif hasattr(dic[k], "to_json"):
                ret.append(dic[k].to_json)
            else:
                ret[k] = str(dic[k])
        return ret
    
    def _to_json(self, obj):
        raise NameError, _("Method not implemented")


class ScanJsonParser(JsonParser):
    """Class for JSON serialization of NmapParser objects.
    """
    def __init__(self, scan_obj):
        JsonParser.__init__(self)
        self._add_to_service_list(HostInfo)
        self._scan = scan_obj
        
        
    def parse(self):
        whitelist = ["filtered_ports", "scaninfo", "nmap", "closed_ports", "formated_finish_date", 
                     "list_port", "verbose_level", "open_ports", "formated_date", "hostnames", "hosts",
                     "nmap_command", "nmap", "formate_date", "runstats"]
        attrs = [a for a in dir(self._scan) if a in whitelist]
        
        ret = {}
        
        for attr in attrs:
            realAttribute = getattr(self._scan, attr)
            if type(realAttribute) == ListType or type(realAttribute) == TupleType:
                ret[attr] = self._list_to_json(realAttribute)
            elif type(realAttribute) == DictionaryType:
                ret[attr] = self._dict_to_json(realAttribute)
            elif self.service_is_registered(realAttribute):
                ret[attr] = self._to_json(realAttribute)
            else:
                ret[attr] = str(realAttribute)
        #filter the unnecessary attributes
        
        return str(ret)
    
    #FIXME: need to be completed and tested
    def __clean_junk(self, scan_dict):
        junk = []
        for j in junk:
            elements = scan_dict
            key = j[0]
            assert isinstance(elements, list)
            deep = 1
            while len(j) < deep:
                deep += 1
                key = j[deep - 1]
                elements = elements[key]
                if len(j) == deep:
                    del elements[key]
                    break
        return scan_dict
    
    def _hostinfo_to_json(self, host):
        attrs = [a for a in dir(host) if not callable(getattr(host, a)) and \
                 not a.startswith("_")]
        ret = {}
        for k in attrs:
            attr = getattr(host, k)
            if type(attr) == ListType or type(attr) == TupleType:
                ret[k] = self._list_to_json(attr)
            elif type(attr) == DictionaryType:
                ret[k] = self._dict_to_json(attr)
            else:
                ret[k] = str(attr)
        ret['open_ports'] = str(host.get_open_ports())
        ret['filtered_ports'] = str(host.get_filtered_ports())
        ret['closed_ports'] = str(host.get_closed_ports())
        ret['scanned_ports'] = str(host.get_scanned_ports())
        return ret
    
    def _to_json(self, obj):
        if isinstance(obj, HostInfo):
            return self._hostinfo_to_json(obj)