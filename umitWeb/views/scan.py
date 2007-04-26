from umitWeb.Http import HttpResponse

def index(req):
    resp = HttpResponse()
    resp.write('<h1>It Works!</h1>')
    return resp
