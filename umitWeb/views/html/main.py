from umitWeb.Http import HttpResponse

def index(req):
    response = HttpResponse()
    response.loadTemplate("html/index.html")
    return response

def login(req):
    response = HttpResponse()
    response.loadTemplate("html/login.html")