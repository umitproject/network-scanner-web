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

from os.path import join, split, exists, dirname
import re
from umitCore.BasePaths import base_paths, HOME, CONFIG_DIR
from umitCore.Paths import Paths, Path, copy_config_file

MEDIA_DIR = join(CONFIG_DIR, "..", "umitweb_media")
TEMPLATES_DIR = join(CONFIG_DIR, "..", "templates")

base_paths.update(dict(webconfig_file='umitweb.conf',
                       config_file='umitweb.conf',
                       security_file='security.xml',
                       web_db=join('share', 'config', 'web.db')))
                       
class WebPaths(Paths):
    templates_dir = TEMPLATES_DIR
    media_dir = MEDIA_DIR
    web_section = "web"
    
    #def __init__(self):
    #    Paths.__init__(self)
    hardcoded = Paths.hardcoded + [
        "templates_dir",
        "media_dir"
    ]
        
    config_files_list = Paths.config_files_list + [
        "webconfig_file",
        "security_file",
        "web_db"
    ]
        
    web_settings = [
        "web_server_port",
        "web_server_address",
        "web_requires_root",
        "web_server_auto_start",
        "web_server_auto_start_console",
        "web_console_path"
    ]
    
    def set_umit_conf(self, base_dir):
        Paths.set_umit_conf(self, base_dir)
        Path.set_umit_conf(base_dir)
        if not exists(join(self.config_dir, "security.xml")) or \
           not exists(join(self.config_dir, "umitweb.conf")):
            create_web_files(self.config_file, HOME)
           
    def __getattr__(self, name):
        if self.config_file_set:
            try:
                attr = Paths.__getattr__(self, name)
                return attr
            except NameError, e:
                if name in self.web_settings:
                    return self.config_parser.get(self.web_section, re.sub(r"^web_", "", name))
                else:
                    raise e
        else:
            raise Exception("Must set config file location first")
        
    def __setattr__(self, name, value):
        if name in self.web_settings:
            self.config_parser.set(self.web_section, name.strip("web_"), value)
        else:
            super(Paths, self).__setattr__(name, value)


def create_web_files(config_file, user_home):
    user_dir = join(user_home, base_paths['config_dir'])
    main_dir = join(dirname(__file__), CONFIG_DIR)
    copy_config_file("security.xml", main_dir, user_dir)
    copy_config_file("umitweb.conf", main_dir, user_dir)


WPath = WebPaths()
WPath.set_umit_conf("")
