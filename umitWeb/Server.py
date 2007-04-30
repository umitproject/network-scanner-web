#-*- coding: utf-8 -*-
## Copyright (C) 2007 Rodolfo da Silva Carvalho
## This program is free software; you can redistribute it and/or modify
## it under the terms of the GNU General Public License as published by
## the Free Software Foundation; either version 2 of the License, or
## (at your option) any later version.
## 
## This program is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
## GNU General Public License for more details.
## 
## You should have received a copy of the GNU General Public License
## along with this program; if not, write to the Free Software
## Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA

import re
import os
import sys
import pickle
import md5
import random
from traceback import print_exc
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
from umitWeb.Urls import patterns
from umitWeb.Http import HttpRequest, Http404, HttpError, HttpResponse
from umitWeb.Database import SessionData


class URLResolver(object):
    """A class to resolve URLs. I works anylsing the path passed to the server.
    UmitWeb has a urls module that contains URL patterns (like in django framework
    - http://www.djangoproject.com). Each pattern is assinged with one function.
    This function is executed and the result (an instance of HttpResponse) is sent
    back to the client (the http browser).
    """
    def __init__(self):
        pass

    def resolve(self, request):
        """Resolve the path and executes the assigned function. if the path wasn't
        found in the urls module, this method raises a Http404 error.
        Parameters:
        request -> and instance of HttpRequest.
        """
        path = request.get_path()[1:]
        found = False
        for regex, action in patterns:
            pat = re.compile(regex)
            match = pat.match(path)
            if match:
                try:
                    found = True
                    module, function = action.rsplit(".", 1)
                    exec "import %s" % module
                    module = eval(module)
                    executer = getattr(module, function)
                    return executer(request, **match.groupdict())
                except ImportError, e:
                    raise HttpError(500, str(e))
                break
        if not found:
            raise Http404


class SessionWrapper(object):
    def __init__(self, sessid=None):
        self.id = None
        self.modified = False
        if sessid is None:
            self._session = SessionData(self.get_new_sessid())
        else:
            self._session = SessionData.get(sessid)
            if self._session is None:
                self._session = SessionData(sessid)
                self.modified = True

    def get_new_sessid(self):
        junk = "çoa^wer098~73°0£24q¢ßðæ3w4w98948512397&*@#$!@#*()"
        return md5.new(str(random.randint(0, sys.maxint-1)) \
                                  + str(random.randint(1, sys.maxint-1)//2) \
                                  + junk).hexdigest()
    def get_sessid(self):
        return self._session.id

    def __setitem__(self, name, value):
        self._session.pickled_data[name] = value
        self.modified = True

    def __getitem__(self, name):
        return self._session.pickled_data[name]

    def __delitem__(self, name):
        del self._session.pickled_data[name]
        self.modified = True

    def keys(self):
        return self._session.pickled_data.keys()

    def items(self):
        return self._session.pickled_data.items()

    def get(self, name, default=None):
        return self._session.pickled_data.get(name, default)

    def save(self):
        self._session.save()
        
    @classmethod
    def clear(self):
        sessions = SessionData.get_list()
        if sessions:
            for session in sessions:
                session.delete()
    

class UmitRequestHandler(BaseHTTPRequestHandler):
    """Custom HTTP Request Handler for UmitWeb
    """

    COOKIE_SESSION_NAME = "umitsessid"

    def __init__(self, request, client_address, server):
        self.server = server
        BaseHTTPRequestHandler.__init__(self, request, client_address, server)
    
    def do_GET(self):
        """Processor for HTTP GET command. A shortcut for process_request()
        """
        self._process_request()

    def do_POST(self):
        """Processor for HTTP POST command. A shortcut for process_request()
        """
        self._process_request()
        
    def send_redirect(self, path):
        self.send_response(303)
        response = "Location: %s\n" % path
        self.wfile.write(response)

    def _process_request(self):
        """Process the request and writes the response back to the client.
        If a HttpError occurs, the response is sent as a HTTP Error.
        """
        try:
            request = HttpRequest(self)
            
            if "." not in request.path.rsplit("/", 1)[-1] and \
               not request.path.endswith("/"):
                redirect_page = "%s/" % request.get_path()
                if request.querystring:
                    redirect_page += "?%s" % request.querystring
                self.send_redirect(redirect_page)
            else:
                resolver = URLResolver()
    
                self.session_start(request)
                
                response = resolver.resolve(request)
                if response.__class__ is not HttpResponse and not issubclass(response.__class__, HttpResponse):
                    raise HttpError(500, "Expected HttpResponse, got %s" % response.__class__.__name__)
                
                if request.session.modified:
                    request.session.save()
                
                self.send_response(response.code)
                for header in response.headers.keys():
                    self.send_header(header, response.headers[header])

                request.COOKIES[self.COOKIE_SESSION_NAME] =  request.session.get_sessid()
                self.wfile.write(str(request.COOKIES))
                    
                self.wfile.write('\n\n')
                self.wfile.write(response.data)
        except HttpError, e:
            self.send_error(e.error_code, e.message)
        except Exception, e:
            self.send_error(500, str(e))
            self.wfile.write("<h2>Exception Details:</h2><pre>")
            print_exc(file=self.wfile)
            self.wfile.write("</pre>")
            


    def session_start(self, request):
        if self.COOKIE_SESSION_NAME not in request.COOKIES.keys():
            request.session = SessionWrapper()
            request.session.modified = True
        else:
            request.session = SessionWrapper(request.COOKIES[self.COOKIE_SESSION_NAME].value)


class UmitWebServer(HTTPServer):
    def __init__(self):
        HTTPServer.__init__(self, ("0.0.0.0", 8000), UmitRequestHandler)
        
    def run(self):
        SessionWrapper.clear()
        self.serve_forever()
