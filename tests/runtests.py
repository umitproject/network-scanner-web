import unittest
import os
import re
import sys
import signal
import urllib2
import httplib
import mimetypes
from urllib import quote, unquote, urlencode
from tempfile import mktemp

sys.path += [os.path.join(os.path.dirname(__file__), "..", "")]

from umitWeb.WebLogger import getLogger
from umitWeb.Security import Context
from umitWeb.ProfileParser import ProfileEditorParser, WizardParser


######################################
# Setting the umit home directory

from umitCore.Paths import Path
Path.set_umit_conf(os.path.join(os.path.split(__file__)[0], os.pardir,'config', 'umit.conf'))
######################################


class HttpTestCase(unittest.TestCase):
    logger = getLogger("HttpTestCase")
    
    def setUp(self):
        self.server_url = "http://localhost:8059"
        self.info_url = "%s/test/server/info/" % self.server_url
        self.req_info = urllib2.Request(self.info_url)
        
    def get_cookie(self, headers, name):
        try:
            pattern = r".*%s=([^;]+)[;]{0,1}.*" % name
            return re.findall(pattern, headers['set-cookie'])[0]
        except Exception, ex:
            raise ValueError("Cookie %s does not exist. Exception: %s" % (name, str(ex)))
        
    def testSetGetSession(self):
        req = "%s/test/server/session_set/?name=test_session&value=%s" % (self.server_url, quote("a test string"))
        f = urllib2.urlopen(req)
        try:
            contents = eval(f.read())
            self.assertEqual(contents['result'], "OK")
            sess_id = self.get_cookie(f.headers, "umitsessid")    
            self.req_info.add_header("Cookie", "umitsessid=%s" % sess_id)
            
            f2 = urllib2.urlopen(self.req_info)
            contents = eval(f2.read())
            self.assertTrue(contents['SESSION'].has_key("test_session"))
            self.assertEqual(contents['SESSION']['test_session'], "a test string")
        except SyntaxError:
            self.fail("Error reading the result")
            
    def testUnsetSession(self):
        req = "%s/test/server/session_set/?name=test_session&value=%s" % (self.server_url, quote("a test string"))
        f = urllib2.urlopen(req)
        sessid = self.get_cookie(f.headers, "umitsessid")
        req = urllib2.Request("%s/test/server/session_unset/?name=test_session" % (self.server_url))
        req.add_header("Cookie", "umitsessid=%s" % sessid)
        f = urllib2.urlopen(req)
        fcontents = ""
        try:
            fcontents = f.read()
            contents = eval(fcontents)
        except Exception, ex:
            self.fail("Error reading the result. Exception: %s" % str(ex.__class__))
        
        self.assertEqual(contents['result'], "OK")
        sessid = self.get_cookie(f.headers, "umitsessid")
        req = urllib2.Request(self.info_url)
        req.add_header("Cookie", "umitsessid=%s" % sessid)
        
        try:
            f2 = urllib2.urlopen(req)
            fcontents = f2.read()
            contents = eval(fcontents)
        except Exception, ex:
            self.fail("Error reading the result. Exception: %s" % str(ex.__class__))
        
        self.assertFalse(contents['SESSION'].has_key("test_session"))
        
    def testDestroySession(self):
        try:
            f = urllib2.urlopen("%s/test/server/session_destroy" % self.server_url)
            fc = f.read().strip()
            contents = eval(fc)
        except SyntaxError, ex:
            self.logger.warning("Response: " + fc)
            assert False
        self.assertEqual(contents['result'], "OK")
        
        try:
            sessid = self.get_cookie(f.headers, "umitsessid")
        except ValueError:
            pass
        except Exception, ex:
            self.fail("Exception: %s" % str(ex))
        else:
            self.fail("Session wasn't destroyed.")
     
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
        ftest = "test.txt"
        fields = {'name': 'A name',
                  'data': 'Some data'}
        files = {'arq': open(ftest, 'r')}
        content_type, body = self.getMultipartFormData(fields, files)
        self.logger.debug(body)
        req = urllib2.Request(self.info_url, body)
        req.add_header("Content-type", content_type)
        req.add_header("Content-length", str(len(body)))
        try:
            self.logger.debug("CONTENT: " + str(req.headers))
            c = urllib2.urlopen(req)
            c = c.read()
            contents = eval(c)
            self.assertTrue(contents['POST'].has_key("name") and contents['POST'].has_key("data"))
            self.assertEqual(contents['POST']['name'], 'A name')
            self.assertEqual(contents['POST']['data'], 'Some data')
            self.assertTrue(contents['FILES'].has_key('arq'))
            self.assertEqual(contents['FILES']['arq']['size'], len(open(ftest).read()))
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
            parameters.append('Content-disposition: form-data; name=%s; filename=%s'\
                              % (key, files[key].name))
            parameters.append('Content-type: %s' % self.getContentType(files[key].name))
            parameters.append('')
            parameters.append(files[key].read())
            
        parameters.append('--%s--' % BOUNDARY)
        parameters.append('')
        enctype = "multipart/form-data; boundary=%s" % BOUNDARY
        body = CRLF.join(parameters)
        return enctype, body
        
    def getContentType(self, filename):
        return mimetypes.guess_type(filename)[0] or 'application/octet-stream'


class SecurityContextTestCase(unittest.TestCase):
    logger = getLogger("SecurityContextTestCase")
    file = "security.xml.sample"
    
    def setUp(self):
        self.context = Context()
        self.logger.debug(str(len(self.context.roles)))
        
    def tearDown(self):
        del self.context
        
    def testPermissions(self):
        self.assertTrue(len(self.context.permissions) == 5)
        self.assertEqual(self.context.permissions[0].id, "allow-all")
        self.assertEqual(self.context.permissions[2].id, "deny-localhost")
        self.assertEqual(len(self.context.permissions[2].constraints), 2)
        
    def testRoles(self):
        self.assertTrue(len(self.context.roles) == 2)
        self.assertEqual(self.context.roles[1].id, "administrator")
        
    def testUsers(self):
        self.assertTrue(len(self.context.users) == 2)
        u = self.context.get_user("user1", "123")
        self.assertTrue(u is not None)
        command = "nmap -v localhost"
        self.assertFalse(u.is_permitted(command))


class ProfileEditorParserTestCase(unittest.TestCase):
    def setUp(self):
        self.profile_parser = ProfileEditorParser()
        
    def testSections(self):
        self.assertEqual(len(self.profile_parser.sections.keys()), 6)
        self.assertTrue("Advanced" in self.profile_parser.sections.keys())
    

class WizardParserTestCase(unittest.TestCase):
    def setUp(self):
        self.wizard_parser = WizardParser()
        
    def testSections(self):
        self.assertEqual(len(self.wizard_parser.sections.keys()), 5)
        self.assertTrue("Ping" in self.wizard_parser.sections.keys())


pid = None


def run_tests():
    logger = getLogger()
    unittest.main()


if __name__ == "__main__":
    run_tests()
