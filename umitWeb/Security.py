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

import os
import md5
import re
from xml.sax import make_parser
from xml.sax.handler import ContentHandler
from xml.sax.saxutils import XMLGenerator
from xml.sax.xmlreader import AttributesImpl as Attributes
from umitWeb.WebLogger import getLogger
from umitCore.Paths import Path

#SECURITY_FILE = os.path.join(os.path.dirname(__file__), os.pardir , "config", "security.xml")
SECURITY_FILE = Path.security_file

class Constraint(object):
    
    def __init__(self, type="command", content=""):
        self.type = type
        self.content = content


class Permission(object):
    
    def __init__(self, id=None, type="", description="", constraints=None):
        self.id = id
        self.type = type
        self.constraints = constraints or []
        self.description = description
        
    def add_constraint(self, type, content=""):
        self.constraints.append(Constraint(type, content))


class Role(object):
    
    def __init__(self, id, description="", permissions=None):
        self.id = id
        self.description = description
        self.permissions = permissions or []


class User(object):
    
    def __init__(self, login, name="", password="", superuser="no", roles=None):
        self.login = login
        self.name = name
        self.password = password
        if superuser == "yes":
            self.superuser = True
        else:
            self.superuser = False
        self.roles = roles or []
        
    def is_permitted(self, command):
        command = command.replace("nmap", "")
        permissions = []
        for role in self.roles:
            permissions += role.permissions
        for perm in permissions:
            found = False
            for c in perm.constraints:
                match = re.search(c.content, command)
                if match:
                    found = True
                    command = command[:match.start()] + command[match.end():]
            if perm.type == "deny" and found:
                return False
            elif len(command.strip()) == 0:
                return True
            
        else:
            if perm.id == "allow-all":
                return True
            elif perm.id == "deny-all":
                return False
            else:
                return False


class SecurityContext(object):
    _locked = False
    
    def __init__(self):
        self.permissions = []
        self.roles = []
        self.users = []
    
    def get_permission(self, id):
        for p in self.permissions:
            if id == p.id:
                return p
            
    def get_role(self, id):
        for r in self.roles:
            if id == r.id:
                return r
    
    
    def add_permission(self, id, type):
        self.permissions.append(Permission(id, type))
    
    
    def add_user(self, name, login, password, is_superuser, role_names):
        u = User(login, name=name, password=md5.new(password).hexdigest())
        if is_superuser:
            u.superuser = True
        else:
            u.superuser = False
        u.roles = []
        for r in role_names:
            u.roles.append(self.get_role(r))
        self.users.append(u)
        
    def add_role(self, id, description, permission_names):
        r = Role(id, description, [self.get_permission(p) for p in permission_names])
        self.roles.append(r)
    
    
    def get_user(self, login=None, password=None, id=None):
        if not id:
            passwd = md5.new(password).hexdigest()
            for u in self.users:
                if u.login == login:
                    if u.password == passwd:
                        return u
        else:
            for u in self.users:
                if u.login == id:
                    return u
                
    def _write_permissions(self):
        permissions = self.permissions
        self.writer.startElement("permissions", Attributes({}))
        for perm in permissions:
            attrs = Attributes({'id': perm.id,
                                'type': perm.type})
            self.writer.startElement("permission", attrs)
            if perm.description:
                self.writer.startElement("description", Attributes({}))
                self.writer.characters(perm.description)
                self.writer.endElement("description")
                
            for constraint in perm.constraints:
                self.writer.startElement("constraint",
                    Attributes({'type': constraint.type}))
                self.writer.characters(constraint.content)
                self.writer.endElement("constraint")
            self.writer.endElement("permission")
        self.writer.endElement("permissions")
        
    def _write_roles(self):
        roles = self.roles
        self.writer.startElement("roles", Attributes({}))
        for role in roles:
            self.writer.startElement("role",
                    Attributes({'id': role.id}))
            if role.description:
                self.writer.startElement("description", Attributes({}))
                self.writer.characters(role.description)
                self.writer.endElement("description")
                
            if role.permissions:
                self.writer.startElement("permissions", Attributes({}))
                for p in role.permissions:
                    self.writer.startElement("permission",
                                  Attributes({"ref": p.id}))
                    self.writer.endElement("permission")
                self.writer.endElement("permissions")
            self.writer.endElement("role")
        self.writer.endElement("roles")
    
    def _write_users(self):
        users = self.users
        self.writer.startElement("users", Attributes({}))
        for user in users:
            attrs = Attributes({'login': user.login,
                            'superuser': user.superuser and "yes" or "no"})
            self.writer.startElement("user", attrs)
            if user.name:
                self.writer.startElement("name", Attributes({}))
                self.writer.characters(user.name)
                self.writer.endElement("name")
            self.writer.startElement("password", Attributes({}))
            self.writer.characters(user.password)
            self.writer.endElement("password")
            if user.roles:
                self.writer.startElement("roles", Attributes({}))
                for r in user.roles:
                    self.writer.startElement("role",
                                         Attributes({'ref': r.id}))
                    self.writer.endElement("role")
                self.writer.endElement("roles")
            self.writer.endElement("user")
        self.writer.endElement("users")
    
    def write_xml(self, xml_file=None):
        xml_file = xml_file or SECURITY_FILE
        if self._locked:
            raise ResourceBusyError
        else:
            self._locked = True
        xml = open(xml_file, "w", 1)
        xml.flush()
        xml.seek(0)
        self.writer = XMLGenerator(xml)
        self.writer.startDocument()
        self.writer.startElement("security", Attributes({}))
        self._write_permissions()
        self._write_roles()
        self._write_users()
        self.writer.endElement("security")
        self.writer.endDocument()
        xml.flush()
        xml.close()
        del xml
        self._locked = False


class SecurityConfHandler(ContentHandler):
    logger = getLogger("ContentHandler")
    _in_users = False
    _in_roles = False
    _in_permissions = False
    _in_constraint = False
    _in_permission = False
    _in_role = False
    _in_user = False
    _in_description = False
    _in_name = False
    _in_password = False
    
    def __init__(self, context):
        self.context = context

    def _add_permission(self, attrs):
        self.context.add_permission(attrs.get("id"), attrs.get("type", "allow"))
        
    def _add_constraint_to_permission(self, attrs):
        p = self.context.permissions[-1].add_constraint(attrs.get("type", "command"))
        
    def _add_role(self, id):
        self.context.roles.append(Role(id))
        
    def _add_permission_to_role(self, id):
        perm = self.context.get_permission(id)
        if perm:
            self.context.roles[-1].permissions.append(perm)
        else:
            raise ElementNotFound()
        
    def _add_user(self, login, superuser):
        self.context.users.append(User(login, superuser=superuser))
        
    def _add_role_to_user(self, id):
        role = self.context.get_role(id)
        if role:
            self.context.users[-1].roles.append(role)
        else:
            raise ElementNotFound()
        
    def startElement(self, name, attrs):
        if name == "permissions" and not self._in_roles:
            self._in_permissions = True
        elif name == "permission" and self._in_permissions:
            self._in_permission = True
            self._add_permission(attrs)
        elif name == "permission" and self._in_role:
            self._add_permission_to_role(attrs.get("ref"))
        elif name == "constraint":
            self._in_constraint = True
            self._add_constraint_to_permission(attrs)
        elif name == "roles" and not self._in_users:
            self._in_roles = True
        elif name == "role" and self._in_roles:
            self._add_role(attrs.get("id"))
            self._in_role = True
        elif name == "role" and self._in_user:
            self._add_role_to_user(attrs.get("ref"))
        elif name == "description":
            self._in_description = True
        elif name == "users":
            self._in_users = True
        elif name == "user" and self._in_users:
            self._in_user = True
            self._add_user(attrs.get("login"), attrs.get("superuser", "no"))
        elif name == "name" and self._in_user:
            self._in_name = True
        elif name == "password" and self._in_user:
            self._in_password = True

    def characters(self, ch):
        if self._in_constraint:
            self.context.permissions[-1].constraints[-1].content += ch
        elif self._in_description and self._in_role:
            self.context.roles[-1].description += ch
        elif self._in_description and self._in_permission:
            self.context.permissions[-1].description += ch
        elif self._in_name and self._in_user:
            self.context.users[-1].name += ch
        elif self._in_password and self._in_user:
            self.context.users[-1].password += ch
    
    def endElement(self, name):
        if name == "constraint":
            self._in_constraint = False
        elif name == "permission" and self._in_permissions:
            self._in_permission = False            
        elif name == "permissions" and not self._in_roles:
            self._in_permissions = False
        elif name == "roles" and not self._in_users:
            self._in_roles = False
        elif name == "role" and self._in_roles:
            self._in_role = False
        elif name == "description":
            self._in_description = False
        elif name == "users":
            self._in_users = False
        elif name == "user" and self._in_users:
            self._in_user = False
        elif name == "name" and self._in_user:
            self._in_name = False
        elif name == "password" and self._in_user:
            self._in_password = False
        


## Exceptions
class ElementNotFound(Exception):
    pass

class ResourceBusyError(Exception):
    pass

def get_security_parser(config_file=None):
    logger = getLogger("Context")
    cfg_file = config_file or SECURITY_FILE
    
    
    parser = make_parser()
    ctx = SecurityContext()
    parser.setContentHandler(SecurityConfHandler(ctx))
    f = open(cfg_file, 'r')
    parser.parse(f)
    f.close()
    
    return ctx
    
Context = get_security_parser

if __name__ == "__main__":
    pass
    #Path.set_umit_conf(os.path.join(os.path.dirname(__file__), os.pardir, 'config', 'umit.conf'))
    #ctx = Context()
    #print "Permissions:\n" + "\n---\n".join([
    #    p.id + " - " + p.type + "\n###\n" + ("\n".join([c.content for c in p.constraints])) \
    #    for p in ctx.permissions
    #])
    
    #print [[r.id, r.description, [p.id for p in r.permissions]] for r in ctx.roles]
    #print [[u.login, u.password, u.name, [r.id for r in u.roles]] for u in ctx.users]