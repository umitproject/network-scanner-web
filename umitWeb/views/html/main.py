#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Copyright (C) 2005 Insecure.Com LLC.
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

from umitWeb.Http import HttpResponse, HttpResponseRedirect
from umitWeb.Auth import html_auth, ERROR
from umitWeb.Security import Context
from umitWeb.WebLogger import getLogger

logger = getLogger("html.main")

def index(req):
    response = HttpResponse()
    response.loadTemplate("html/index.html")
    return response

@html_auth()
def main(req):
    response = HttpResponse()
    response.loadTemplate("html/main.html")
    return response

def login(req):
    logger.debug("aeeeeeeeee")
    response = HttpResponse()
    error = ""
    errorclass = "hide"
    if req.POST:
        ctx = Context()
        user = ctx.get_user(req.POST['login'], req.POST['password'])
        if user:
            req.session['umit_user'] = user
            return HttpResponseRedirect("/html/")
        else:
            error = "Incorrect username or password"
            errorclass = ""
    response.loadTemplate("html/login.html")
    return response % {"error": error, "errorclass": errorclass}