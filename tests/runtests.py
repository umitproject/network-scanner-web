import unittest
import os
import sys
import signal
import BaseHTTPServer
from urllib2 import urlopen

sys.path += [os.path.join(os.path.dirname(__file__), "..", "")]

from umitWeb import server

class UmitTestServer(BaseHTTPServer.HTTPServer):
    def __init__(self, address, port):
        self.request_handler = None
        BaseHTTPServer.HTTPServer.__init__(self, (address, port),
                                           server.UmitRequestHandler)
        
    def finish_request(self, request, client_address):
        print "aeeee"
        self.request_handler = self.RequestHandlerClass(request, client_address, self)
        print "RH: ", self.request_handler


class UmitRequestHandlerTestCase(unittest.TestCase):
    def setUp(self):
        self.server = web_server
        
    def testdo_GET(self):
        print self.server
        openedUrl = urlopen("http://localhost:8000/?x=123")

    def testdo_POST(self):
        pass
    

def run_tests():
    pid = os.fork()
    if pid > 0:
        print "server running on pid %d" % pid
        unittest.main()
        os.kill(pid, signal.SIGKILL)
        sys.exit(0)
    else:
        print "starting child process"
        web_server.serve_forever()


if __name__ == "__main__":
    web_server = UmitTestServer("127.0.0.1", 8000)
    run_tests()
