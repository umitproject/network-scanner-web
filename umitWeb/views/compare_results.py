from math import floor, sqrt
from umitWeb.Http import HttpResponse, Http404, HttpError
from umitWeb.Auth import authenticate, ERROR
from umitWeb.WebLogger import getLogger
from umitCore.NmapParser import NmapParser
from umitCore.Diff import Diff
from umitCore.UmitConf import DiffColors

logger = getLogger("compare_results")

@authenticate()
def index(req):
    response = HttpResponse()
    response.loadTemplate("compare_results.html")
    return response


@authenticate(ERROR)
def upload(req):
    logger.debug("FILES: %s" % str(req.FILES))
    #if req.GET or not req.FILES.has_key("u"):
    #    raise HttpError(400, "Invalid GET request")
    
    parser = NmapParser(req.FILES['u']['temp_name'])
    try:
        parser.parse()
    except:
        return HttpResponse("{'result': 'FAIL'}")
    
    output = parser.nmap_output.replace("'", "\\'").replace("\r\n", "\n").\
           replace("\r", "\n").replace("\n", "\\n")
    response = HttpResponse("{'result': 'OK', 'output': '%s'}" % output, "text/plain")
    logger.debug(response.data)
    return response


#@authenticate(ERROR)
def diff_colors(req):
    response = HttpResponse("", "text/plain")
    dc = DiffColors()
    data = []
    toHex = lambda value: "%0.2x" % floor(sqrt(value))
    logger.debug(tuple(map(toHex, dc.unchanged)))
    data.append("'unchanged': '#%s%s%s'" % tuple(map(toHex, dc.unchanged)))
    data.append("'added': '#%s%s%s'" % tuple(map(toHex, dc.added)))
    data.append("'modified': '#%s%s%s'" % tuple(map(toHex, dc.modified)))
    data.append("'not_present': '#%s%s%s'" % tuple(map(toHex, dc.not_present)))
    response.write("diff_colors = {%s}" % ",".join(data))
    return response


#@authenticate(ERROR)
def make_diff(req):
    """
    def _text_changed (self, widget):
        self.txg_added.set_property("background-gdk", self.colors.added)
        self.txg_removed.set_property("background-gdk", self.colors.not_present)
        
        buff = self.txt_diff_result.get_buffer()

        buff.apply_tag(self.txg_tag, buff.get_start_iter(), buff.get_end_iter())

        if self.check_color:
            positions = self._take_changes(buff)
            
            for i in positions['added']:
                buff.apply_tag(self.txg_added, i[0],i[1])
            
            for i in positions['removed']:
                buff.apply_tag(self.txg_removed, i[0], i[1])
        else:
            buff.remove_tag(self.txg_added, buff.get_start_iter (), buff.get_end_iter())
            buff.remove_tag(self.txg_removed, buff.get_start_iter (), buff.get_end_iter())
    """
    scan1 = """
    Starting Nmap 4.20 ( http://insecure.org ) at 2007-08-04 11:24 BRT 
    Machine 192.168.7.105 MIGHT actually be listening on probe port 80 
    Initiating Connect() Scan at 11:24 
    Scanning 192.168.7.105 [1697 ports] 
    Discovered open port 80/tcp on 192.168.7.105 
    Discovered open port 23/tcp on 192.168.7.105 
    Discovered open port 53/tcp on 192.168.7.105 
    Completed Connect() Scan at 11:24, 0.86s elapsed (1697 total ports) 
    Host 192.168.7.105 appears to be up ... good. 
    Interesting ports on 192.168.7.105: 
    Not shown: 1694 closed ports 
    
    PORT STATE SERVICE 
    23/tcp open telnet 
    53/tcp open domain 
    80/tcp open http 
    
    Nmap finished: 1 IP address (1 host up) scanned in 1.032 seconds """
    
    scan2 = """
    Starting Nmap 4.20 ( http://insecure.org ) at 2007-08-04 11:56 BRT 
    Machine 192.168.7.105 MIGHT actually be listening on probe port 80 
    Initiating Connect() Scan at 11:56 
    Scanning 192.168.7.105 [1697 ports] 
    Discovered open port 80/tcp on 192.168.7.105 
    Discovered open port 23/tcp on 192.168.7.105 
    Completed Connect() Scan at 11:56, 0.85s elapsed (1697 total ports) 
    Host 192.168.7.105 appears to be up ... good. 
    Interesting ports on 192.168.7.105: 
    Not shown: 1695 closed ports 
    
    PORT STATE SERVICE 
    23/tcp open telnet 
    80/tcp open http 
    
    Nmap finished: 1 IP address (1 host up) scanned in 0.988 seconds"""

    
    diff_text = Diff(scan1, scan2)
    lines = diff_text.generate()
    
    response = HttpResponse(str(lines), "text/plain")
    return response