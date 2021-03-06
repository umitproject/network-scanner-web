#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright (C) 2005-2006 Insecure.Com LLC.
# Copyright (C) 2007-2008 Adriano Monteiro Marques
#
# Author: Adriano Monteiro Marques <adriano@umitproject.org>
#         Cleber Rodrigues <cleber.gnu@gmail.com>
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
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA

import gtk
from HIGWidgets import *

w = HIGWindow()
n = gtk.Notebook()

pages = [HIGVBox() for i in range(0, 5)]

for i in range(0, 5):
    p = HIGLabeledProgressBar("10.1.1.%s" % i)
    p.show_all()
    pages[i].set_size_request(200, 200)
    n.insert_page(pages[i], p)

w.add(n)
w.connect("delete-event", lambda w, p: gtk.main_quit())
w.show_all()

gtk.main()
