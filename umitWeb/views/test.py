from umitWeb.Http import HttpResponse, Http404, HttpResponseRedirect
from traceback import print_exc

from types import ClassType

class BaseTest(object):
    _path = ""
    
    def __init__(self, req):
        self._req = req
        
    def runTest(self):
        HttpResponse("=P")


class ServerTest(BaseTest):
    _path = "server/info"
    
    def runTest(self):
        r = HttpResponse("", "text/plain")
        cookies = {}
        for key in self._req.COOKIES.keys():
            cookies[key] = self._req.COOKIES[key].value
            
        r_dict = {}
        r_dict['GET'] = self._req.GET
        r_dict['POST'] = self._req.POST
        r_dict['COOKIES'] = cookies
        session_items = self._req.session.items()
        session_attributes = {}
        map(lambda d: session_attributes.update(d), [{items[0]: items[1]} for items in session_items])
        r_dict['SESSION'] = session_attributes
        r.write(str(r_dict))
        return r
    
class SessionTest(BaseTest):
    _path = "server/session_set"
    
    def runTest(self):
        r = HttpResponse("", "text/plain")
        try:
            test_attr = self._req.GET.get("name", "test")
            test_str  = self._req.GET.get("value", "test_value")
            self._req.session[test_attr] = test_str
            r.write("{'result': 'OK'}")
        except Exception, ex:
            r.write("{'result': 'FAIL', 'message': '%s'}" % str(ex))
        return r


def main(req, path):
    testClasses = [x[1] for x in globals().items() \
               if hasattr(x[1], '__bases__') and BaseTest in x[1].__bases__]
    
    for klass in testClasses:
        if klass._path == path:
            return klass(req).runTest()
        
    raise Http404
