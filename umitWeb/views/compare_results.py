from math import floor, sqrt
import sys
import os
from types import DictType
from umitWeb.Http import HttpResponse, Http404, HttpError
from umitWeb.Auth import authenticate, ERROR
from umitWeb.WebLogger import getLogger
from umitCore.NmapParser import NmapParser
from umitCore.Diff import Diff, ParserDiff
from umitCore.UmitConf import DiffColors
from umitCore.DiffHtml import DiffHtml
from tempfile import mktemp

logger = getLogger("compare_results")

@authenticate()
def index(req):
    response = HttpResponse()
    response.loadTemplate("compare_results.html")
    return response


@authenticate(ERROR)
def upload(req):
    logger.debug("FILES: %s" % str(req.FILES))
    
    if req.FILES.has_key('u1-result'):
        up_file = req.FILES['u1-result'];
    else:
        up_file = req.FILES['u2-result'];
    
    if "win" in sys.platform:
        fname = mktemp()
        ftemp = open(fname, "w")
        ftemp.write(up_file['temp_file'].read())
        ftemp.close()
    else:
        fname = up_file['temp_name']
    parser = NmapParser(fname)
    try:
        parser.parse()
    except Exception, ex:
        logger.debug(str(ex))
        logger.debug(fname)
        return HttpResponse("{'result': 'FAIL'}")
    
    output = parser.nmap_output.replace("'", "\\'").replace("\n", "\\n")
    full = open(fname, "r").read().replace("'", "\\'").replace("\n", "\\n")
    logger.debug(output)
    
    response = HttpResponse("{'result': 'OK', 'output': '%s', 'xml': '%s'}" % (output, full), "text/plain")
    return response


@authenticate(ERROR)
def diff_colors(req):
    response = HttpResponse("", "text/plain")
    dc = DiffColors()
    data = []
    toHex = lambda value: "%0.2x" % floor(sqrt(value))
    logger.debug(tuple(map(toHex, dc.unchanged)))
    data.append("'unchanged': '#%s%s%s'" % tuple(map(toHex, dc.unchanged)))
    data.append("'added': '#%s%s%s'" % tuple(map(toHex, dc.added)))
    data.append("'modified': '#%s%s%s'" % tuple(map(toHex, dc.modified)))
    data.append("'not_present': '#%s%s%s'" % tuple(map(toHex, dc.not_present)))
    response.write("diff_colors = {%s}" % ",".join(data))
    return response


@authenticate(ERROR)
def make_diff(req):
    scan1 = req.POST['scan1']
    scan2 = req.POST['scan2']
    xml1 = mktemp()
    xml2 = mktemp()
    
    open(xml1, "w").write(req.POST['scan1-xml'])
    open(xml2, "w").write(req.POST['scan2-xml'])
    parsed1 = NmapParser(xml1)
    parsed1.parse()
    parsed2 = NmapParser(xml2)
    parsed2.parse()
    
    diff_tree = ParserDiff(parsed1, parsed2)
    diff_text = Diff(scan1.split("\n"), scan2.split("\n"))
    lines = diff_text.generate_without_banner()
    diff = {"text": lines, "compare": [d.to_dict() for d in diff_tree.make_diff()]}
    
    response = HttpResponse(str(diff), "text/plain")
    return response


@authenticate(ERROR)
def make_html_diff(req):
    scan1 = req.POST['scan1']
    scan2 = req.POST['scan2']
    
    diff_html = DiffHtml(scan1.split('\n'), scan2.split('\n'))
    return HttpResponse(diff_html.generate())
    
