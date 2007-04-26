from tempfile import mktemp
from urllib import quote, unquote
from datetime import datetime, timedelta

class HttpError(Exception):
    """Send a generic HTTP Error to the server
    """
    def __init__(self, error_code, message):
        self.error_code = error_code
        self.message = message
        Exception.__init__(self, message)


class Http404(HttpError):
    """Send a 404 HTTP Error (Page not found) to the server
    """
    def __init__(self):
        HttpError.__init__(self, 404, "Page Not Found")


class Http500(HttpError):
    """Send a 500 HTTP Error (Internal Server Error) to the server
    """
    def __init__(self, message="Internal Server Error"):
        HttpError.__init__(self, 500, message)


class Http403(HttpError):
    """Send a 403 HTTP Error (Forbidden) to the server
    """
    def __init__(self, message="Forbidden"):
        HttpError.__init__(self, 403, message)


class HttpRequest(object):
    """A class to encapsulate the elements of a HTTP Request.
    """
    def __init__(self, requestHandler):
        self.requestHandler = requestHandler
        self.headers = self.requestHandler.headers
        self._raw_cookies = {}
        
        self.querystring = ""
        if "?" in self.requestHandler.path:
            self.path, self.querystring = self.requestHandler.path.split("?")
        else:
            self.path = self.requestHandler.path

        self.GET = {}
        self.POST = {}
        self.REQUEST = {}
        self.FILES = {}
        self.COOKIES = {}

        if self.querystring:
            for arg in self.querystring.split("&"):
                if "=" in arg:
                    key, value = arg.split("=", 1)
                    self.GET[key] = unquote(value)
                else:
                    self.GET[arg] = ""

        if self.requestHandler.command == "POST":
            length = int(self.headers['content-length'])
            pdata = self.requestHandler.rfile.read(length)
            if pdata:
                if "multipart/form-data" not in self.headers.get("content-type"):
                    pairs = pdata.split("&")
                    for pair in pairs:
                        key, value = pair.split("=", 1)
                        self.POST[key] = value
                else:
                    try:
                        boundary = self.headers['content-type'].split(";")[1].split("=")[1].strip().lstrip()
                        fields = pdata.split(boundary)[1:-1]
                        for field in fields:
                            field = field[2:-4]
                            header, data = field.split("\r\n", 1)
                            print header
                            headers = {}
                            for h in header.split(";"):
                                key, value = h.split("=")
                                headers.update({key: value})
                                
                                if headers.has_key("filename"):
                                    self.POST[headers['name']] = ""
                                    fd = open(mktemp(), "w+")
                                    fd.write(data)
                                    fd.flush()
                                    fd.seek(0)
                                    self.FILES[headers['name']] = {
                                        "content-type": headers.get("content-type", "text/plain"),
                                        "file": fd,
                                        "size": len(data),
                                        "name": headers.get("name", "")
                                        }
                                else:
                                    self.POST[headers['name']] = data
                    except IndexError:
                        print "No boundary."
                        
            #print "POST: ", self.POST, "\n===\n"
            #print "FILES: ", self.FILES, "===\n"
            #print "GET: ", self.GET

        if self.headers.has_key("cookie"):
            for cookie in self.headers['cookie'].split("&"):
                if "=" in cookie:
                    key, value = cookie.split("=", 1)
                    self.COOKIES[key] = unquote(value)
                else:
                    self.COOKIES[cookie] = ""

        self.REQUEST.update(self.GET)
        self.REQUEST.update(self.POST)

    def get_path(self):
        """Returns the path part of a request
        """
        return self.path


class HttpResponse(object):
    """A class to represent a HTTP Response to be sent back to the web browser (client)
    It is possible to set response headers with the __setitem__ method. For example:
    response['Content-type'] = 'text/html'
    response['Content-disposition'] = 'attachment; filename=xyz.html'
    """
    def __init__(self, data="", mimeType="text/html"):
        self.headers = {}
        self.data = data
        self.headers['Content-type'] = mimeType

    def write(self, data):
        """Appends text to the response stream
        """
        self.data += data
        
    def set_cookie(self, name, value,
                   expires=None, domain=None,
                   path=None, secure=False):
        cookie = "%s=%s" % (name, value)
        if expires:
            exp = datetime.utcnow() + timedelta(seconds=expires)
            cookie += "; expires=%s" % datetime.strftime(exp, "%A, %d-%m-%Y %H:%M:%S GMT")
        if domain:
            cookie += "; domain=%s" % domain
        if path:
            cookie += "; path=%s" % path
        if secure:
            cookie += "; secure"

        self._raw_cookies[name] = cookie
        
    def remove_cookie(self, name):
        self.set_cookie(name, "", expires=-3600)

    def get_raw_cookies(self):
        return [x[1] for x in self._raw_cookies.items()]

    def __setitem__(self, key, value):
        self.headers[key] = value

    def __getitem__(self, key):
        return self.headers[key]

    def __str__(self):
        return self.data

    
