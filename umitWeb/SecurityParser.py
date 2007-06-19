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

from os.path import pardir, join, dirname
from xml.dom import minidom
import md5

CONFIG_FILE = join(dirname(__file__), pardir, "config", "security.xml")


class Constraint(object):
    _xmlTree = None

    DOMAIN = 0
    COMMAND = 1
    TARGET = 2
    #add more constraints below
    
    __types = {"domain": DOMAIN, "command": COMMAND, "target": TARGET}
    
    def __init__(self, xmlNode=None):
        self.xmlNode = xmlNode
        if xmlNode:
            type = xmlNode.getAttribute("type")
            self.content = xmlNode.childNodes[0].nodeValue
            if type in self.__types.keys():
                self.typecode = self.__types[type]
            else:
                self.type = -1
            
    def __get_type(self):
        for key in self.__types.keys():
            if self.__types[key] == self.typecode:
                return key
    
    def __set_type(self, type):
        for key in self.__types.keys():
            if type == key:
                self.typecode = self.__types[key]
                return
    
    type = property(__get_type, __set_type)
    
    
    def __repr__(self):
        return "<Constraint type: %s \"%s\">" % (self.type, self.content)
        


class Permission(object):
    _xmlTree = None
    def __init__(self, xmlNode=None):
        self.xmlNode = xmlNode
        if xmlNode:
            self.type = xmlNode.getAttribute("type")
            self.id = xmlNode.getAttribute("id")
        else:
            self.type = None
            self.id = None
            self.commands = []
    
    def __get_constraints(self):
        search = self.xmlNode.getElementsByTagName("constraint")
        constraints = []
        for constraint in search:
            constraints.append(Constraint(constraint))
        return constraints
        
    constraints = property(__get_constraints)


class Role(object):
    _xmlTree = None
    def __init__(self, xmlNode=None):
        if xmlNode:
            self.id = xmlNode.getAttribute("id")
            #self.description = xpath.Evaluate("//role/description", xmlNode)[0].\
            #                                 childNodes[0].nodeValue
            #self.__perm_refs = [e.value for e in xpath.Evaluate("//role/permissions/permission/@ref", xmlNode)]
            self.description = ""
            self.__perm_refs = []
        else:
            self.id = None
            self.description = None
            self.__perm_refs = []
        
    def __get_permissions(self):
        perms = []
        #for p in self.__perm_refs:
        #    search = xpath.Evaluate('//security/permissions/permission[@id="%s"]' % p, self._xmlTree)
        #    if node:
        #        perms.append(Permission(search[0]))
        return perms
                
    def __get_users(self):
        #search = xpath.Evaluate('//security/users/user[role/@ref="%s"]' % self.id, self._xmlTree)
        users = []
        #for node in search:
        #    users.append(User(node))
        return users
    
    permissions = property(__get_permissions)
    users = property(__get_users)


class User(object):
    _xmlTree = None
    def __init__(self, xmlNode=None):
        if xmlNode:
            self.login = xmlNode.getAttribute("login")
            self.name = xmlNode.getElementsByTagName("name")[0].childNodes[0].nodeValue
            self.password = xmlNode.getElementsByTagName("password")[0].childNodes[0].nodeValue
            
            #self.__role_ref = xpath.Evaluate("//user/role/@ref", xmlNode)
            self.__role_ref = []
            
    def __get_roles(self):
        #search = xpath.Evaluate('//security/roles/role[@id="%s"]' % \
        #                        self.__role_ref, self._xmlTree)
        search = []
        if search:
            return Role(search[0])
    
    roles = property(__get_roles)


class SecurityParser(object):
    def __init__(self):
        self.__elTree = minidom.parse(CONFIG_FILE)
        Role._xmlTree = self.__elTree
        Permission._xmlTree = self.__elTree
        User._xmlTree = self.__elTree
        
    def __get_permissions(self):
        if not self.__elTree:
            return []
        
        elements = [p for p in self.__elTree.getElementsByTagName("permissions")\
                    if p.parentNode.nodeName=="security"][0].childNodes
        elements = [fe for fe in elements if fe.__class__ is minidom.Element \
                    and fe.nodeName=="permission"]
        permissions = []
        for p in elements:
            permissions.append(Permission(p))
            
        return permissions
    
    def __get_roles(self):
        if not self.__elTree:
            return []
        
        #elements = xpath.Evaluate("//security/roles/role", self.__elTree)
        elements = []
        roles = []
        for r in elements:
            roles.append(Role(r))
        return roles
    
    def __get_users(self):
        if not self.__elTree:
            return []
        
        #elements = xpath.Evaluate("//security/users/user", self.__elTree)
        elements = []
        users = []
        for u in elements:
            users.append(User(u))
        return users
    
    def get_user(self, login, password=None):
        users = [User(userElement) for userElement in self.__elTree.getElementsByTagName("users")[0].childNodes \
                  if userElement.nodeName == "user" and userElement.getAttribute("login") == login]
        
        if users and password:
            if users[0].password == md5.new(password).hexdigest():
                return users[0]
        elif users:
            return users[0]
    
    permissions = property(__get_permissions, doc="Get all permissions")
    roles = property(__get_roles, doc="Get all roles")
    users = property(__get_users, doc="Get all users")
    
#Singleton
Security = SecurityParser()

if __name__ == "__main__":
    print "%d permission(s), %d role(s) and %d user(s)." % tuple(len(x) for x in [Security.permissions, Security.roles, Security.users])
    