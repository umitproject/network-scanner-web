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
from umitWeb.Http import HttpResponse, Http404
from umitWeb.WebLogger import getLogger
import mimetypes

logger = getLogger("main")

def index(req):
    response = HttpResponse()
    response.loadTemplate("index.html")
    return response

def serve_media(req, path):
    response = HttpResponse()
    
    filename = join(dirname(__file__), pardir, 'media', *(path.split("/")))
    
    if not exists(filename):
        raise Http404
    
    response['Content-type'] = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
    response.write(open(filename, 'r').read())
    return response