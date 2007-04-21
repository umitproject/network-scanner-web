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
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
from umitWeb.Urls import patterns
from umitWeb.Http import HttpRequest, Http404, HttpError
from umitWeb.Database import connection


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
                except ImportError:
                    pass
                break
        
        if not found:
            raise Http404


class SessionWrapper(object):
    def __init__(self, sessid=None):
        self.id = None
        junk = "çoawer09873024q3w4w98948512397&*@#$!@#*()"
        if sessid is None:
            self.id = md5.new(str(random.randint(0, sys.maxint-1)) \
                                  + str(random.randint(1, sys.maxint-1)//2) \
                                  + junk).hexdigest()
        else:
            cursor = connection.cursor()
            sql = "SELECT pickled_data FROM web_sessions WHERE sessid = ?"
            cursor.execute(sql, (sessid,))
            self.id = sessid
            self._session = pickle.loads(cursor)

    def __setitem__(self, name, value):
        self._session[name] = value
        self.save()

    def __getitem__(self, name):
        return self._session[name]

    def __delitem__(self, name):
        del self._session[name]
        self.save()

    def keys(self):
        return self._session.keys()

    def items(self):
        return self._session.items()

    def get(self, name, default=None):
        return self._session.get(name, default)

    def save(self):
        cursor = connection.cursor()
        if self.sessid:
            sql = "UPDATE web_sessions SET pickled_data=? WHERE sessid=?"
        else:
            sql = "INSERT INTO web_sessions (pickled_data, sessid) VALUES(?, ?)"

        cursor.execute(sql, (pickle.dumps(self._session), self.id))
            
    

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
        self.process_request()

    def do_POST(self):
        """Processor for HTTP POST command. A shortcut for process_request()
        """
        self.process_request()

    def process_request(self):
        """Process the request and writes the response back to the client.
        If a HttpError occurs, the response is sent as a HTTP Error.
        """
        try:
            request = HttpRequest(self)
            resolver = URLResolver()

            self.session_start(request)
            
            response = resolver.resolve(request)
            self.send_response(200)
            for header in response.headers.keys():
                self.send_header(header, response.headers[header])

            for cookie in request.get_raw_cookies():
                self.send_header("Set-cookie", cookie)
                
            self.wfile.write('\n')
            self.wfile.write(response.data)
        except HttpError, e:
            self.send_error(e.error_code, e.message)
            return


    def session_start(self, request):
        if self.COOKIE_SESSION_NAME not in request.COOKIES.keys():
            request.session = SessionWrapper()
            request.set_cookie(self.COOKIE_SESSION_NAME, request.session.id)
        else:
            request.session = SessionWrapper(request.COOKIES[self.COOKIE_SESSION_NAME])


class UmitWebServer:
    def __init__(self):
        pass
