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

from umitWeb.Http import HttpResponse, Http404, HttpResponseRedirect
from umitWeb.WebLogger import getLogger
from traceback import print_exc

from types import ClassType

class BaseTest(object):
    _path = ""
    logger = getLogger("TEST: %s" % _path)
    
    def __init__(self, req):
        self._req = req
        
    def runTest(self):
        HttpResponse("=P")


class ServerTest(BaseTest):
    _path = "server/info"
    
    def runTest(self):
        r = HttpResponse("", "text/plain")
        cookies = {}
        files = {}
        for key in self._req.COOKIES.keys():
            cookies[key] = self._req.COOKIES[key].value
        
        for key in self._req.FILES.keys():
            files[key] = {'name': self._req.FILES[key]['name'], 'size': self._req.FILES[key]['size']}
            
        r_dict = {}
        r_dict['GET'] = self._req.GET
        r_dict['POST'] = self._req.POST
        r_dict['COOKIES'] = cookies
        r_dict['FILES'] = files
        #self.logger.debug("REQUEST received: %s" % str(vars(self._req)))
        session_items = self._req.session.items()
        session_attributes = {}
        map(lambda d: session_attributes.update(d), [{items[0]: items[1]} for items in session_items])
        r_dict['SESSION'] = session_attributes
        r.write(str(r_dict))
        return r
    
class SessionSetTest(BaseTest):
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
    
class SessionUnsetTest(BaseTest):
    _path = "server/session_unset"
    
    def runTest(self):
        r = HttpResponse("", "text/plain")
        try:
            test_attr = self._req.GET.get("name", "test")
            del self._req.session[test_attr]
            r.write("{'result': 'OK'}")

        except Exception, ex:
            r.write("{'result': 'FAIL', 'message': '%s'}" % str(ex).replace("'", "\""))
            
        return r
            

class SessionDestroyTest(BaseTest):
    _path = "server/session_destroy"
    
    def runTest(self):
        r = HttpResponse("", "text/plain")
        
        try:
            self._req.session.destroy()
            r.write("{'result': 'OK'}")
        except Exception, ex:
            r.write("{'result': 'FAIL', 'message': '%s'}" % str(ex))
            
        return r


def main(req, path):
    testClasses = [x[1] for x in globals().items() \
               if hasattr(x[1], '__bases__') and BaseTest in x[1].__bases__]
    
    resp = HttpResponse()
    for klass in [k for k in testClasses if k._path == path]:
        resp += klass(req).runTest()
    
    if resp.data:
        return resp
    else:
        raise Http404
