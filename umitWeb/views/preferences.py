from umitWeb.Auth import authenticate, ERROR, need_superuser
from umitWeb.WebLogger import getLogger
from umitWeb.Http import HttpResponse, Http403, Http404, HttpError
from umitWeb.Security import Context, User
import md5


@authenticate(ERROR)
def index(req):
    r = HttpResponse()
    r.loadTemplate("preferences.html")
    return r


@authenticate(ERROR)
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
    