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

from umitWeb.Http import HttpResponseRedirect, Http403
from umitWeb.WebLogger import getLogger

REDIRECT = 0
ERROR = 1

logger = getLogger(__name__)

#decorator
def authenticate(destination=None):
    destination = destination or REDIRECT
    def _ret_function(func):
        def _checklogin(req, *args, **kwargs):
            if req.session.has_key("umit_user"):
                return func(req, *args, **kwargs)
            else:
                if destination == REDIRECT:
                    return HttpResponseRedirect("/login/")
                else:
                    raise Http403
        return _checklogin
    
    return _ret_function