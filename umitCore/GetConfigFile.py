#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright (C) 2005-2006 Insecure.Com LLC.
# Copyright (C) 2007-2008 Adriano Monteiro Marques
#
# Author: Adriano Monteiro Marques <adriano@umitproject.org>
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

from os.path import exists, dirname
from os import access, R_OK
from tempfile import mktemp

from umitCore.Paths import Path
from umitCore.UmitLogging import log

def get_config_file(filename, original_content):
    config_file = mktemp()

    try:
        c = Path.__getattr__(filename)
        if exists(c) and access(c, R_OK):
            config_file = c
        else:
            raise Exception()
    except:
        # Using temporary file
        cfile = open(config_file, "w")
        cfile.write(original_content)
        cfile.close()

    log.debug(">>> Get config file %s: %s" % (filename, config_file))
    return config_file