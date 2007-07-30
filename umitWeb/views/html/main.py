from umitWeb.Http import HttpResponse, HttpResponseRedirect
from umitWeb.Auth import html_auth, ERROR
from umitWeb.Security import Context
from umitWeb.WebLogger import getLogger

logger = getLogger("html.main")

def index(req):
    response = HttpResponse()
    response.loadTemplate("html/index.html")
    return response

@html_auth()
def main(req):
    response = HttpResponse()
    response.loadTemplate("html/main.html")
    return response

def login(req):
    logger.debug("aeeeeeeeee")
    response = HttpResponse()
    error = ""
    errorclass = "hide"
    if req.POST:
        ctx = Context()
        user = ctx.get_user(req.POST['login'], req.POST['password'])
        if user:
            req.session['umit_user'] = user
            return HttpResponseRedirect("/html/")
        else:
            error = "Incorrect username or password"
            errorclass = ""
    response.loadTemplate("html/login.html")
    return response % {"error": error, "errorclass": errorclass}