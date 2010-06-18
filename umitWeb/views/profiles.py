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

from umitCore.UmitConf import CommandProfile
from umitCore.NmapCommand import CommandConstructor
from umitWeb.Http import HttpResponse, HttpError, Http500
from umitWeb.Auth import authenticate, ERROR

@authenticate(ERROR)
def add(req):
    if not req.POST:
        raise HttpError(400, "Ivalid Request.")
    
    profile = CommandProfile()
    profile_name = req.POST["name"]
    command = req.POST["command"]
    hint = req.POST.get("hint", "")
    description = req.POST.get("description", "")
    annotation = req.POST.get("annotation", "")
    profile.add_profile(profile_name,
                        command=command.replace("<target>", "%s"),
                        hint=hint,
                        description=description,
                        annotation=annotation,
                        options={})
    #options=constructor.get_options())
    return HttpResponse("OK")
    
