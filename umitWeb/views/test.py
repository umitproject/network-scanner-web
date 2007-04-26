#from umitWeb.Http import HttpResponse, Http404

class BaseTest(object):
    pass

class ServerBaseTest(BaseTest):
    pass

def main(req, path):
    klasses = [str((x[1], x[1].__bases__)) for x in globals().items() \
               if hasattr(x[1], '__bases__')]
    
main(None, None)
