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

from os.path import join, abspath, dirname, exists, pardir
import sys
from types import DictionaryType, StringType, ListType
from math import floor, sqrt
from umitCore.NmapOutputHighlight import NmapOutputHighlight
from umitCore.UmitConf import CommandProfile
from umitWeb.Http import HttpResponse, Http404, HttpResponseRedirect
from umitWeb.WebLogger import getLogger
from umitWeb.Auth import authenticate, ERROR
from umitWeb.SecurityParser import Security
import mimetypes

logger = getLogger("main")

@authenticate()
def index(req):
    response = HttpResponse()
    response.loadTemplate("index.html")
    return response

@authenticate(ERROR)
def output_highlight(req):
    response = HttpResponse()
    response['Content-type'] = "text/javascript; charset=utf-8"
    highlight = NmapOutputHighlight()
    attrDic = {}
    """
setts:['bold', 'italic', 'underline', 'text', 'highlight', 'regex']
    """
    response.write("highlights = {};\n")
    for attr in ["closed_port", "date", "details", "filtered_port",
                 "hostname", "ip", "open_port", "port_list"]:
        attribute = getattr(highlight, attr)
        response.write("highlights['%s'] = {};\n" % attr)
        for index, value in enumerate(['bold', 'italic', 'underline', 'text', 'highlight', 'regex']):
            if type(attribute[index]) == ListType:
                propValue = "#%s%s%s" % tuple(map(lambda value: "%0.2x" % floor(sqrt(value)), attribute[index]))
            elif type(attribute[index]) == StringType:
                propValue = attribute[index].replace("\\", "\\\\")
            else:
                propValue = attribute[index]
            response.write("highlights['%s']['%s'] = '%s';\n" % (attr, value, propValue))
    return response

@authenticate(ERROR)
def get_profiles(req):
    profile = CommandProfile()
    profiles = profile.sections()
    response = HttpResponse()
    response['Content-type'] = "text/plain"
    ret = []
    for section in profiles:
        ret.append([section, profile.get_command(section) % "<target>"])
    response.write(str(ret))
    return response

def serve_media(req, path):
    response = HttpResponse()
    
    filename = join(dirname(__file__), pardir, 'media', *(path.split("/")))
    
    if not exists(filename):
        raise Http404
    
    response['Content-type'] = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
    response['Content-type'] += '; charset=utf-8'
    cntFile = None
    if sys.platform == 'win32':
        if response['Content-type'].startswith("text"):
            cntFile = open(filename, 'r')
        else:
            cntFile = open(filename, 'rb')
    else:
        cntFile = open(filename, 'r')
    response.write(cntFile.read())
    return response

def show_favicon(req):
    return serve_media(req, "images/favicon.ico")

def login(req):
    resp = HttpResponse()
    if req.POST:
        resp['Content-type'] = "text/plain"
        user = Security.get_user(req.POST['login'], req.POST['password'])
        
        if req.GET.has_key("json"):
            if user:
                req.session['umit_user'] = user
                resp.write('OK')
            else:
                resp.write('FAIL')
            return resp
        else:
            if user:
                req.session['umit_user'] = user
                return HttpResponseRedirect("/")
    else:
        resp.loadTemplate("login.html")
        return resp
    
def test_ajax(req):
    if req.POST:
        return HttpResponse(req.FILES['file']['name'], 'text/plain')
    else:
        r = HttpResponse()
        r['Content-type'] = "text/plain"
        r.loadTemplate('ajax_form.html')
        return r
    
def logout(req):
    if req.session.has_key("umit_user"):
        del req.session['umit_user']
    return HttpResponseRedirect("/")