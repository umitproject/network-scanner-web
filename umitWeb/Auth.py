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

from umitWeb.Http import HttpResponseRedirect, Http403
from umitWeb.WebLogger import getLogger

REDIRECT = 0
ERROR = 1

logger = getLogger(__name__)

#decorator
def authenticate(destination=None, redirect_page=None):
    """``authenticate`` is a decorator for each view that needs authentication.
    
    Parameters:
    
    * ``destination`` -- the argument that determines if the page will be redirected to another location (0), or a forbidden page (error 403) will be displayed (1).
    * ``redirect_page`` -- the page that will be followed by if the user is not authenticated.
    
    
    """
    destination = destination or REDIRECT
    redirect_page = redirect_page or "/login/"
    def _ret_function(func):
        def _checklogin(req, *args, **kwargs):
            if req.session.has_key("umit_user"):
                return func(req, *args, **kwargs)
            else:
                if destination == REDIRECT:
                    return HttpResponseRedirect(redirect_page)
                else:
                    raise Http403
        return _checklogin
    
    return _ret_function

def need_superuser():
    """``need_superuser`` is a decorator for each view that needs superuser authorization.
    It raises a Http403 error if the user is not allowed to access the page.
    
    """
    def _ret_function(func):
        def _check_perms(req, *args, **kwargs):
            if req.user and req.user.superuser:
                return func(req, *args, **kwargs)
            else:
                raise Http403
        return _check_perms
    return _ret_function

html_auth = lambda destination=None: authenticate(destination=destination, redirect_page="/html/login/")