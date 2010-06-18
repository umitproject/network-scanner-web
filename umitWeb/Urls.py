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

patterns = (
    (r'^$', 'umitWeb.views.html.main.index'),
    (r'^js/$', 'umitWeb.views.main.index'),
    (r'^favicon.ico$', 'umitWeb.views.main.show_favicon'),
    (r'^html/$', 'umitWeb.views.html.main.main'),
    (r'^html/login/$', 'umitWeb.views.html.main.login'),
    (r'^login/$', 'umitWeb.views.main.login'),
    (r'^logout/$', 'umitWeb.views.main.logout'),
    (r'^test/(?P<path>.*)/$', 'umitWeb.views.test.main'),
    (r'^scan/$', 'umitWeb.views.scan.new'),
    (r'^scan/profiles/$', 'umitWeb.views.options.get_profiles'),
    (r'^scan/upload/$', 'umitWeb.views.scan.upload_result'),
    (r'^scan/(?P<resource_id>[0-9a-fA-F]{32,32})/check/$', 'umitWeb.views.scan.check'),
    (r'^scan/(?P<scan_id>[0-9a-fA-F]{32,32})/save/$', 'umitWeb.views.scan.save_result'),
    (r'^scans/$', 'umitWeb.views.scan.get_saved_scans'),
    (r'^scans/(?P<scan_id>\d+)/$', 'umitWeb.views.scan.get_scan'),
    (r'^scans/(?P<scan_id>\d+)/delete/$', 'umitWeb.views.scan.delete_scan'),
    (r'^scans/upload/$', 'umitWeb.views.compare_results.upload'),
    (r'^wizard/$', 'umitWeb.views.options.get_wizard_options'),
    (r'^options/$', 'umitWeb.views.options.get_options'),
    (r'^profile_editor/$', 'umitWeb.views.options.get_profile_editor_options'),
    (r'^js/management/$', 'umitWeb.views.preferences.index'),
    (r'^js/management/users/$', 'umitWeb.views.preferences.users'),
    (r'^js/management/users/search/$', 'umitWeb.views.preferences.users_search'),
    (r'^js/management/users/add/$', 'umitWeb.views.preferences.add_user'),
    (r'^js/management/users/edit/(?P<id>[^/]+)/$', 'umitWeb.views.preferences.edit_user'),
    (r'^js/management/users/delete/(?P<id>[^/]+)/$', 'umitWeb.views.preferences.delete_user'),
    (r'^js/management/users/get_all/$', 'umitWeb.views.preferences.users_get_all'),
    (r'^js/management/users/get_user/(?P<id>[^/]+)/$', 'umitWeb.views.preferences.get_user'),
    (r'^js/management/roles/$', 'umitWeb.views.preferences.roles'),
    (r'^js/management/roles/get_role/(?P<id>[^/]+)/$', 'umitWeb.views.preferences.get_role'),
    (r'^js/management/roles/get_all/$', 'umitWeb.views.preferences.roles_get_all'),
    (r'^js/management/roles/search/$', 'umitWeb.views.preferences.roles_search'),
    (r'^js/management/roles/add/$', 'umitWeb.views.preferences.add_role'),
    (r'^js/management/roles/edit/(?P<id>[^/]+)/$', 'umitWeb.views.preferences.edit_role'),
    (r'^js/management/roles/delete/(?P<id>[^/]+)/$', 'umitWeb.views.preferences.delete_role'),
    (r'^js/management/permissions/get_all/$', 'umitWeb.views.preferences.permissions_get_all'),
    (r'^js/management/permissions/$', 'umitWeb.views.preferences.permissions'),
    (r'^js/management/permissions/get_permission/(?P<id>[^/]+)/$', 'umitWeb.views.preferences.get_permission'),
    (r'^js/management/permissions/search/$', 'umitWeb.views.preferences.permissions_search'),
    (r'^js/management/permissions/add/$', 'umitWeb.views.preferences.add_permission'),
    (r'^js/management/permissions/edit/(?P<id>[^/]+)/$', 'umitWeb.views.preferences.edit_permission'),
    (r'^js/management/permissions/delete/(?P<id>[^/]+)/$', 'umitWeb.views.preferences.delete_permission'),
    (r'^js/management/profiles/$', 'umitWeb.views.preferences.profiles'),
    (r'^js/management/scans/$', 'umitWeb.views.scan.index'),
    (r'^js/profiles/add/$', 'umitWeb.views.profiles.add'),
    (r'^js/compare_results/$', 'umitWeb.views.compare_results.index'),
    (r'^js/compare_results/make_diff/$', 'umitWeb.views.compare_results.make_diff'),
    (r'^js/compare_results/make_html_diff/$', 'umitWeb.views.compare_results.make_html_diff'),
    (r'^media/js/output_highlight.js$', 'umitWeb.views.main.output_highlight'),
    (r'^media/js/diff_colors.js$', 'umitWeb.views.compare_results.diff_colors'),
    (r'^media/(?P<path>.*)$', 'umitWeb.views.main.serve_media'),
    (r'^docs/(?P<path>.*)$', 'umitWeb.views.main.serve_docs')
)
