from umitWeb.Http import HttpResponse

def index(req):
    response = HttpResponse()
    response.loadTemplate("index_html.html")
    return response