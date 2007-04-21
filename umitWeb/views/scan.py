from umitWeb.http import HttpResponse

def index(self):
    resp = HttpResponse()
    resp.write('<?xml version="1.0"?>')
    resp.write('<data>abc</data>')
    resp['Content-type'] = 'text/xml'
    resp['Set-cookie'] = 'c1=123'
    return resp
