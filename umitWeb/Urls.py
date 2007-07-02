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

patterns = (
    (r'^$', 'umitWeb.views.main.index'),
    (r'^favicon.ico$', 'umitWeb.views.main.show_favicon'),
    (r'^login/$', 'umitWeb.views.main.login'),
    (r'^logout/$', 'umitWeb.views.main.logout'),
    (r'^test/(?P<path>.*)/$', 'umitWeb.views.test.main'),
    (r'^scan/$', 'umitWeb.views.scan.new'),
    (r'^scan/profiles/$', 'umitWeb.views.main.get_profiles'),
    (r'^scan/(?P<resource_id>[0-9a-fA-F]{32,32})/check/$', 'umitWeb.views.scan.check'),
    (r'^media/js/output_highlight.js$', 'umitWeb.views.main.output_highlight'),
    (r'^media/(?P<path>.*)$', 'umitWeb.views.main.serve_media'),
)
