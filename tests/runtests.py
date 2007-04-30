import unittest
import os
import re
import sys
import signal
import BaseHTTPServer
import urllib2
from urllib import quote, unquote
from tempfile import mktemp
import cookielib

sys.path += [os.path.join(os.path.dirname(__file__), "..", "")]

from umitWeb.Server import UmitWebServer

class HttpTestCase(unittest.TestCase):
    def setUp(self):
        self.server_url = "http://localhost:8000"
        self.info_url = "%s/test/server/info" % self.server_url
        self.req_info = urllib2.Request(self.info_url)
        
    def testSession(self):
        req = "%s/test/server/session_set/?name=test_session&value=%s" % (self.server_url, quote("a test string"))
        f = urllib2.urlopen(req)
        try:
            contents = eval(f.read())
            self.assertEqual(contents['result'], "OK")
            
            try:
                sess_id = re.findall(r".*umitsessid=([^;]+)[;]{0,1}.*", f.headers['set-cookie'])[0]
            except:
                self.fail("Session does not exist.")
                
            self.req_info.add_header("Cookie", "umitsessid=%s" % sess_id)
            
            f2 = urllib2.urlopen(self.req_info)
            contents = eval(f2.read())
            self.assertTrue(contents['SESSION'].has_key("test_session"))
            self.assertEqual(contents['SESSION']['test_session'], "a test string")
        except SyntaxError:
            self.fail("Error reading the result")
            
    def testGet(self):
        req = urllib2.Request(self.info_url + "?get_param1=value1&get_param2=value2")
        try:
            contents = eval(urllib2.urlopen(req).read())
            self.assertTrue(contents['GET'].has_key("get_param1") and contents['GET'].has_key("get_param2"))
            self.assertEqual(contents['GET']['get_param1'], 'value1')
            self.assertEqual(contents['GET']['get_param2'], 'value2')
        except Exception, ex:
            self.fail("Exception during content reading: %s" % str(ex))

pid = None

def run_tests():
    pid = os.fork()
    if pid > 0:
        print "server running on pid %d" % pid
        try:
            unittest.main()
        except SystemExit:
            pass
        print 'killing server process...'
        os.kill(pid, signal.SIGKILL)
        sys.exit(0)

    err_file = mktemp()
    log_file = mktemp()
    print "Starting child process"
    sys.stdout = open(log_file, 'w')
    sys.stderr = open(err_file, 'w')
    web_server.run()


if __name__ == "__main__":
    web_server = UmitWebServer()
    run_tests()
