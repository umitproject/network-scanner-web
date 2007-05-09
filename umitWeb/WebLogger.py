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

from umitCore.Logging import Log, LOGLEVEL
from logging import FileHandler

class WebLogger(Log):
    
    format = "[%(asctime)s] %(levelname)s: %(name)s - %(message)s"
    
    def __init__(self, name, level=0):
        Log.__init__(self, name, level)
        del self.handlers[:]
        handler = FileHandler("umitweb.log")
        handler.setFormatter(self.formatter)
        
        self.addHandler(handler)
        
def getLogger(name="UmitWeb"):
    return WebLogger(name, LOGLEVEL)
