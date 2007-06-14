from umitWeb.Http import HttpResponseRedirect, Http403
from umitWeb.WebLogger import getLogger

REDIRECT = 0
ERROR = 1

logger = getLogger(__name__)

#decorator
def authenticate(destination=None):
    destination = destination or REDIRECT
    def _ret_function(func):
        def _checklogin(req, *args, **kwargs):
            if req.session.has_key("umit_user"):
                return func(req, *args, **kwargs)
            else:
                if destination == REDIRECT:
                    return HttpResponseRedirect("/login/")
                else:
                    raise Http403
        return _checklogin
    
    return _ret_function