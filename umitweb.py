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

import sys
import os
from os.path import join, split

try:
    import psyco
    psyco.full()
except ImportError:
    pass

######################################
# Setting the umit home directory

from umitWeb.WebPaths import WPath as Path
Path.set_umit_conf(split(sys.argv[0])[0])

######################################

from umitWeb.Server import UmitWebServer

def main():
    if sys.platform in ["linux", "darwin"]:
        if os.getuid() != 0:
            raise Exception, "Server MUST run as root."
        
    server = UmitWebServer()
    try:
        print "UmitWebServer started on 0.0.0.0:8059"
        server.run()
    except KeyboardInterrupt:
        print "Stopping..."
        sys.exit(0)
        
    
if __name__ == "__main__":
    main()
