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

import sys
import os
from os.path import join, split

from umitWeb.Server import UmitWebServer

######################################
# Setting the umit home directory

#from umitCore.Paths import Path
#Path.set_umit_conf(join(split(__file__)[0], 'config', 'umit.conf'))
######################################

if __name__ == "__main__":
    server = UmitWebServer()
    try:
        print "UmitWebServer started on 0.0.0.0:8000"
        server.run()
    except KeyboardInterrupt:
        print "Stopping..."
        sys.exit(0)
