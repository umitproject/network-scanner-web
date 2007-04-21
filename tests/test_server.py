import os
import unittest
import socket
import BaseHTTPServer
import sys

sys.path += [os.path.join(os.path.dirname(__file__), "..", "")]

from umitWeb import server


class UmitTestServer(BaseHTTPServer.HTTPServer):
    def __init__(self, address, port):
        BaseHTTPServer.HTTPServer.__init__(self, (address, port),
                                           server.UmitRequestHandler)
        
    def finish_request(self, request, client_address):
        self.request_handler = self.RequestHandlerClass(request, client_address, self)


class UmitRequestHandlerTestCase(unittest.TestCase):
    def setUp(self):
        self.server = os.environ['UMIT_TEST_SERVER']
        
    def testdo_GET(self):
        pass

    def testdo_POST(self):
        pass 
