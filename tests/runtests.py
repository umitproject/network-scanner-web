import unittest
import os
import re
import sys
import signal
import BaseHTTPServer
import urllib2
from urllib import quote, unquote, urlencode
import httplib
from tempfile import mktemp
import mimetypes

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
            
    def testPost(self):
        data = urlencode({'name': "A name", 'data': "Some data"})
        req = urllib2.Request(self.info_url, data)
        req.add_header('Content-length', len(data))
        try:
            contents = eval(urllib2.urlopen(req).read())
            self.assertTrue(contents['POST'].has_key("name") and contents['POST'].has_key("data"))
            self.assertEqual(contents['POST']['name'], 'A name')
            self.assertEqual(contents['POST']['data'], 'Some data')
        except SyntaxError, ex:
            self.fail("Error reading the result")
    
    def testPostMultipartFormData(self):
        fields = {'name': 'A name',
                  'data': 'Some data'}
        files = {}
        content_type, body = self.getMultipartFormData(fields, files)
        req = urllib2.Request(self.info_url, body)
        req.add_header("Content-type", content_type)
        try:
            contents = eval(urllib2.urlopen(req).read())
            self.assertTrue(contents['POST'].has_key("name") and contents['POST'].has_key("data"))
            self.assertEqual(contents['POST']['name'], 'A name')
            self.assertEqual(contents['POST']['data'], 'Some data')
        except SyntaxError, ex:
            self.fail("Error reading the result")
        
    
    def getMultipartFormData(self, fields, files):
        """Recipe extracted from http://aspn.activestate.com/ASPN/Cookbook/Python/Recipe/146306
        """
        BOUNDARY = "--------AKinDOfBoundarY_$"
        CRLF = "\r\n"
        parameters = []
        
        for key in fields.keys():
            parameters.append('--%s' % BOUNDARY)
            parameters.append('Content-disposition: form-data; name=%s' % key)
            parameters.append('')
            parameters.append(fields[key])
        
        for key in files.keys():
            parameters.append('--%s' % BOUNDARY)
            parameters.append('Content-disposition: form-data; name=%s, filename=%s'\
                              % (key, files[key].name))
            parameters.append('Content-type: %s' % self.getContentType(files[key].name))
            parameters.append('')
            parameters.append(fields[key])
            
        parameters.append('--%s--' % BOUNDARY)
        parameters.append('')
        enctype = "Content-type: multipart/form-data; boundary=%s" % BOUNDARY
        body = CRLF.join(parameters)
        return enctype, body
        
    def getContentType(self, filename):
        return mimetypes.guess_type(filename)[0] or 'application/octet-stream'

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
