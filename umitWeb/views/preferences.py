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

from umitWeb.Auth import authenticate, ERROR, need_superuser
from umitWeb.WebLogger import getLogger
from umitWeb.Http import HttpResponse, Http403, Http404, HttpError
from umitWeb.Security import Context, User, Permission
import md5


@authenticate(ERROR)
def index(req):
    r = HttpResponse()
    r.loadTemplate("preferences.html")
    return r


@authenticate()
@need_superuser()
def users(req):
    response = HttpResponse()
    response.loadTemplate("users.html")
    return response


def __users_to_json(users):
    resp = []
    for user in users:
        data = []
        data.append("'name': '%s'" % user.name.replace("'", "\\'"))
        data.append("'login': '%s'" % user.login.replace("'", "\\'"))
        data.append("'superuser': %s" % str(user.superuser).lower())
        rdata = []
        for role in user.roles:
            rdata.append(role.id)
        data.append("roles: ['%s']" % "','".join(rdata))
        resp.append("{%s}" % ",".join(data))
    return "[%s]" % ",".join(resp)


@authenticate(ERROR)
@need_superuser()
def users_get_all(req):
    ctx = Context()
    
    return HttpResponse(__users_to_json(ctx.users))


@authenticate(ERROR)
@need_superuser()
def users_search(req):
    ctx = Context()
    users = []
    search = req.POST['search']
    
    for u in ctx.users:
        if (search.lower() in u.login.lower()) or (search.lower() in u.name.lower()):
            users.append(u)
    return HttpResponse(__users_to_json(users))


@authenticate(ERROR)
@need_superuser()
def add_user(req):
    ctx = Context()
    if not req.POST:
        raise HttpError(400, "Invalid Request")
    
    login = req.POST['login']
    name = req.POST['name']
    roles = req.POST['roles'].strip() and req.POST['roles'].split(",") or []
    superuser = (req.POST['superuser'] == "yes")
    password = req.POST['password']
    
    if login in [u.login for u in ctx.users]:
        return HttpResponse("{'result': 'FAIL', 'error': 'This login name already exists. Please, choose other.'}")
    
    ctx.add_user(name, login, password, superuser, roles)
    ctx.write_xml()
    return HttpResponse("{'result': 'OK'}")


@authenticate(ERROR)
@need_superuser()
def get_user(req, id):
    ctx = Context()
    user = ctx.get_user(id=id)
    if not user:
        raise Http404
    resp = []
    resp.append("'name': '%s'" % user.name.replace("'", "\\'"))
    resp.append("'login': '%s'" % user.login.replace("'", "\\'"))
    resp.append("'superuser': %s" % str(user.superuser).lower())
    resp.append("'roles': ['%s']" % "','".join([r.id for r in user.roles]))
    return HttpResponse("{%s}" % ",".join(resp))


@authenticate(ERROR)
@need_superuser()
def edit_user(req, id):
    ctx = Context()
    user = ctx.get_user(id=id)
    if not user:
        raise Http404
    
    user.name = req.POST['name']
    user.roles = []
    for id in (req.POST['roles'].strip() and req.POST['roles'].split(",") or []):
        user.roles.append(ctx.get_role(id))
    user.superuser = (req.POST['superuser'] == "yes")
    
    if req.POST['password'].strip():
        password = req.POST['password']
    
    for i in xrange(len(ctx.users)):
        if ctx.users[i].login == id:
            ctx.users[i] = user
            break
    
    ctx.write_xml()
    return HttpResponse("{'result': 'OK'}")


@authenticate(ERROR)
@need_superuser()
def delete_user(req, id):
    ctx = Context()
    found = False
    for i in xrange(len(ctx.users)):
        if ctx.users[i].login == id:
            del ctx.users[i]
            found = True
            break
    if not found:
        raise Http404
    ctx.write_xml()
    return HttpResponse("{'result': 'OK'}")
    

@authenticate(ERROR)
@need_superuser()
def roles_get_all(req):
    ctx = Context()
    return HttpResponse("[%s]" % ",".join(["{'value': '%s', 'description': '%s'}" % 
                                               (r.id.replace("'", "\\'"), 
                                                r.description.replace("'", "\\'")) 
                                               for r in ctx.roles]))


@authenticate(ERROR)
@need_superuser()
def roles(req):
    response = HttpResponse()
    response.loadTemplate("roles.html")
    return response


@authenticate(ERROR)
@need_superuser()
def roles_search(req):
    if not req.POST:
        raise HttpError(400, "Invalid Request")
    
    search = req.POST.get("search", "")
    
    ctx = Context()
    roles = [r for r in ctx.roles if search.lower() in r.id.lower()]
    
    data = []
    for r in roles:
        rdata = []
        rdata.append("'id': '%s'" % r.id.replace("'", "\\'"))
        rdata.append("'description': '%s'" % r.description.replace("'", "\\'"))
        rdata.append("'permissions': ['%s']" % "','".join([p.id.replace("'", "\\'")
                                                           for p in r.permissions]))
        data.append("{%s}" % ",".join(rdata))
    
    return HttpResponse("[%s]" % ",".join(data), "text/plain")


@authenticate(ERROR)
@need_superuser()
def get_role(req, id):
    ctx = Context()
    
    role = ctx.get_role(id)
    
    if role is None:
        raise Http404
    
    data = []
    data.append("'id': '%s'" % role.id)
    data.append("'description': '%s'" % role.description)
    data.append("'permissions': ['%s']" % "','".join([p.id.replace("'", "\\'")
                                                    for p in role.permissions]))
    
    return HttpResponse("{%s}" % ",".join(data), "text/plain")


@authenticate(ERROR)
@need_superuser()
def add_role(req):
    ctx = Context()
    if not req.POST:
        raise HttpError(400, "Invalid Request")
    
    id = req.POST['id']
    description = req.POST['description']
    permissions = req.POST['permissions'].strip() and req.POST['permissions'].split(",") or []
    
    if id in [p.id for p in ctx.roles]:
        return HttpResponse("{'result': 'FAIL', 'error': 'This id already exists. Please, choose other.'}")
    
    ctx.add_role(id, description, permissions)
    ctx.write_xml()
    return HttpResponse("{'result': 'OK'}")


@authenticate(ERROR)
@need_superuser()
def edit_role(req, id):
    ctx = Context()
    role = ctx.get_role(id=id)
    if not role:
        raise Http404
    
    role.description = req.POST['description']
    role.permissions = []
    for id in (req.POST['permissions'].strip() and req.POST['permissions'].split(",") or []):
        role.permissions.append(ctx.get_permission(id))
    
    for i in xrange(len(ctx.roles)):
        if ctx.roles[i].id == id:
            ctx.roles[i] = role
            break
    
    ctx.write_xml()
    return HttpResponse("{'result': 'OK'}")


@authenticate(ERROR)
@need_superuser()
def delete_role(req, id):
    ctx = Context()
    found = False
    for i in xrange(len(ctx.roles)):
        if ctx.roles[i].id == id:
            del ctx.roles[i]
            found = True
            break
    if not found:
        raise Http404
    
    for i in xrange(len(ctx.users)):
        for j in xrange(len(ctx.users[i].roles)):
            if ctx.users[i].roles[j].id == id:
                del ctx.users[i].roles[j]
                break
            
    ctx.write_xml()
    return HttpResponse("{'result': 'OK'}")


@authenticate(ERROR)
@need_superuser()
def permissions_get_all(req):
    ctx = Context()
    return HttpResponse("['%s']" % "','".join([p.id.replace("'", "\\'") for p in ctx.permissions]))


@authenticate()
@need_superuser()
def permissions(req):
    response = HttpResponse()
    response.loadTemplate("permissions.html")
    return response


@authenticate(ERROR)
@need_superuser()
def get_permission(req, id):
    pass 


@authenticate(ERROR)
@need_superuser()
def add_permission(req):
    id = req.POST["id"]
    description = req.POST["description"]
    type = req.POST["type"]

    constraint_types = req.POST["constraint_types"].strip()  and \
                     req.POST['constraint_types'].split("\n") or []
    constraint_types = req.POST["constraints"].strip()  and \
                     req.POST['constraints'].split("\n") or []
    
    p = Permission(id, type)
    p.description = description
    


@authenticate(ERROR)
@need_superuser()
def delete_permission(req, id):
    ctx = Context()
    found = False
    for i in xrange(len(ctx.permissions)):
        if ctx.permissions[i].login == id:
            del ctx.permissions[i]
            found = True
            break
    if not found:
        raise Http404
    for i in xrange(len(ctx.roles)):
        for j in xrange(len(ctx.roles[i].permissions)):
            if ctx.roles[i].permissions[j].id == id:
                del ctx.roles[i].permissions[j]
    ctx.write_xml()
    return HttpResponse("{'result': 'OK'}") 


@authenticate(ERROR)
@need_superuser()
def edit_permission(req, id):
    pass 


@authenticate(ERROR)
@need_superuser()
def permissions_search(req):
    if not req.POST:
        raise HttpError(400, "Invalid Request")
    
    search = req.POST.get("search", "")
    
    ctx = Context()
    permissions = [p for p in ctx.permissions if search.lower() in p.id.lower()]
    
    data = []
    for p in permissions:
        pdata = []
        pdata.append("'id': '%s'" % p.id.replace("'", "\\'"))
        pdata.append("'description': '%s'" % p.description.replace("'", "\\'"))
        cdata = []
        for c in p.constraints:
            ccdata = []
            ccdata.append("'type': '%s'" % c.type.replace("'", "\\'"))
            ccdata.append("'content': '%s'" % c.content.replace("'", "\\'"))
            cdata.append("{%s}" % ",".join(ccdata))
        pdata.append("'constraints': [%s]" % ",".join(cdata))
        data.append("{%s}" % ",".join(pdata))
    
    return HttpResponse("[%s]" % ",".join(data), "text/plain")