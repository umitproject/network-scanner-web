# Copyright (C) 2008 Adriano Monteiro Marques.
#
# Author: Rodolfo Carvalho <rodolfo@umitproject.org>
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

from os.path import join, split, exists
from umitCore.BasePaths import base_paths, HOME
from umitCore.Paths import Paths, Path, copy_config_file

MEDIA_DIR = join("share", "umit", "umitweb_media")
TEMPLATES_DIR = join("share", "umit", "templates")

base_paths.update(dict(webconfig_file='umitweb.conf',
                       security_file='security.xml'))
                       
class WebPaths(Paths):
    templates_dir = TEMPLATES_DIR
    media_dir = MEDIA_DIR
    
    def __init__(self):
        Paths.__init__(self)
        self.hardcoded += [
            "templates_dir",
            "media_dir"
        ]
        
        self.config_files_list += [
            "webconfig_file",
            "security_file",
            "umitdb_web"
        ]
    
    def set_umit_conf(self, base_dir):
        Paths.set_umit_conf(self, base_dir)
        Path.set_umit_conf(base_dir)
        if not exists(join(self.config_dir, "security.xml")) or \
           not exists(join(self.config_dir, "umitweb.conf")):
           create_web_files(self.config_file, HOME)


def create_web_files(config_file, user_home):
    user_dir = join(user_home, base_paths['config_dir'])
    main_dir = split(config_file)[0]
    copy_config_file("security.xml", main_dir, user_dir)
    copy_config_file("umitweb.conf", main_dir, user_dir)


WPath = WebPaths()
