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

from umitWeb.Auth import authenticate, ERROR
from umitCore.UmitConf import CommandProfile
from umitWeb.Http import HttpResponse
from umitWeb.ProfileParser import ProfileEditorParser, WizardParser

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


@authenticate(ERROR)
def get_wizard_options(req):
    wp = WizardParser()
    return HttpResponse(wp.to_json(), "text/plain")


@authenticate(ERROR)
def get_profile_editor_options(req):
    pep = ProfileEditorParser()
    return HttpResponse(pep.to_json(), "text/plain")