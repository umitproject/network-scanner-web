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

import re
import os
from tempfile import mktemp
from urllib import quote, unquote, unquote_plus
from datetime import datetime, timedelta
from Cookie import SimpleCookie
from umitWeb.WebLogger import getLogger
from umitCore.I18N import _
from shutil import copyfileobj
from StringIO import StringIO

class HttpError(Exception):
    """Send a generic HTTP Error to the server
    """
    def __init__(self, error_code, message):
        self.error_code = error_code
        self.message = message
        Exception.__init__(self, message)


class Http404(HttpError):
    """Send a 404 HTTP Error (Page not found) to the server
    """
    def __init__(self):
        HttpError.__init__(self, 404, _("Page Not Found"))


class Http500(HttpError):
    """Send a 500 HTTP Error (Internal Server Error) to the server
    """
    def __init__(self, message=_("Internal Server Error")):
        HttpError.__init__(self, 500, message)


class Http403(HttpError):
    """Send a 403 HTTP Error (Forbidden) to the server
    """
    def __init__(self, message=_("Forbidden")):
        HttpError.__init__(self, 403, message)


class HttpRequest(object):
    """A class to encapsulate the elements of a HTTP Request.
    """
    
    logger = getLogger("HttpRequest")
    
    def __init__(self, requestHandler):
        self.requestHandler = requestHandler
        self.headers = self.requestHandler.headers
        
        self.querystring = ""
        if "?" in self.requestHandler.path:
            self.path, self.querystring = self.requestHandler.path.split("?")
        else:
            self.path = self.requestHandler.path

        self.GET = {}
        self.POST = {}
        self.REQUEST = {}
        self.FILES = {}
        self.COOKIES = {}

        if self.querystring:
            for arg in self.querystring.split("&"):
                if "=" in arg:
                    key, value = arg.split("=", 1)
                    self.GET[unquote(key)] = unquote(value)
                else:
                    self.GET[unquote(arg)] = ""

        if self.requestHandler.command == "POST":
            length = int(self.headers.get('content-length', 0))
            #rfile = StringIO()
            #rf = self.requestHandler.request.makefile()
            #pdata = self.requestHandler.rfile.flush()
            pdata = self.requestHandler.rfile.read(length)
            #rfd = os.dup(self.requestHandler.rfile.fileno())
            #rf = os.fdopen(rfd, 'rb')
            #pdata = self.get_rfile(self.requestHandler.rfile, size=length-1)
            #pdata = rf.read(length)
            #rf.close()
            #pdata = rf.read(length)
            #print "PDATA: %s\n\n" % pdata
            
            #pdata = ""
            #self.POST['command'] = "-v -v -v -O -sV 10.0.0.254"
            
            if pdata:
                if "multipart/form-data" not in self.headers.get('content-type', 'x-www-urlencoded'):
                    if "+" in pdata:
                        unquote_func = unquote_plus
                    else:
                        unquote_func = unquote

                    for arg in pdata.split("&"):
                        key, value = arg.split("=", 1)
                        self.POST[unquote_func(key)] = unquote_func(value)
                else:
                    #multipart/form-data form
                    boundary = re.findall(r".*;[\s][Bb][Oo][Uu][Nn][Dd][Aa][Rr][Yy]=([^;]*).*", self.headers['content-type'])
                    if boundary:
                        boundary = boundary[0]
                    form_elements = pdata.split("--%s" % boundary)[1:-1]
                    
                    for element in form_elements:
                        header, data = element.split("\r\n", 2)[1:]
                        
                        #self.logger.debug("Form-header: %s" % header)
                        #self.logger.debug("Form-data: %s" % data)
                        
                        match_file = re.match(r".*[; ]filename=[\"](?P<filename>[^,]+)[\"].*", header)
                        match_text = re.match(r".*[; ]name=[\"](?P<name>[^,^;]+)[\"].*", header)
                        
                        if match_file:
                            #Type: File
                            content_type, data = data.split("\r\n", 1)
                            data = data[2:-2]           # Delete initial and final '\r\n'
                            #self.logger.debug("Data: " + str(data))
                            content_type = content_type[len("content-type:")-1:].strip()
                            temp_name = mktemp()
                            temp_file = open(temp_name, "wb", 1)
                            temp_file.write(data)
                            temp_file.flush()
                            temp_file.close()
                            
                            self.FILES[match_text.groupdict()['name']] = {
                                "content_type": content_type,
                                "name": match_file.groupdict()['filename'],
                                "temp_name": temp_name,
                                "size": len(data),
                                "temp_file": open(temp_name, "rb", 0)
                                }
                            self.POST[match_text.groupdict()['name']] = match_file.groupdict()['filename']
                        else:
                            #Type: Plain text
                            self.POST[match_text.groupdict()['name']] = data[2:-2]
            else:
                print "No pdata!"
        self.COOKIES = SimpleCookie(self.headers.get("cookie", ""))
        self.REQUEST.update(self.GET)
        self.REQUEST.update(self.POST)
        if self.requestHandler.command == "POST":
            self.logger.debug("POST data: %s" % str(self.POST))
            self.logger.debug("POST path: %s" % str(self.path))
            
            if self.FILES:
                for file in self.FILES.items():
                    self.logger.debug("temp name: %s" % file[1]['temp_name'])
                    
    def get_rfile(self, rfile, length=16*1024, size=0):
        if not size:
            return
        r = ""
        while size > 0:
            buf = rfile.read(min(length, size))
            if not buf:
                break
            r += buf
            size -= len(buf)
        return r

    def get_path(self):
        """Return the path part of a request
        """
        return self.path
    
    def session_destroy(self):
        del self.COOKIES['umitsessid']
        self.session._session.delete()


class HttpResponse(object):
    """A class to represent a HTTP Response to be sent back to the web browser (client)
    It is possible to set response headers with the __setitem__ method. For example:
    response['Content-type'] = 'text/html'
    response['Content-disposition'] = 'attachment; filename=xyz.html'
    """
    def __init__(self, data="", mimeType="text/html"):
        self.headers = {}
        self.data = data
        self.code = 200
        self.headers['Content-type'] = mimeType

    def write(self, data):
        """Appends text to the response stream
        """
        self.data += data
        
    def loadTemplate(self, template):
        template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
        self.data = open(os.path.join(template_dir, template)).read()
        
    def __add__(self, obj):
        if not issubclass(obj.__class__, self.__class__):
            raise ValueError, "Cannot add object %s of type %s" % (repr(obj), repr(obj.__class__))
        else:
            return HttpResponse(self.data + obj.data, self.headers['Content-type'])

    def __setitem__(self, key, value):
        self.headers[key] = value

    def __getitem__(self, key):
        return self.headers[key]

    def __str__(self):
        return self.data
    
    #def __repr__(self):
    #    pass


class HttpResponseRedirect(HttpResponse):
    def __init__(self, url):
        HttpResponse.__init__(self)
        self.code = 303
        self['Location'] = url

