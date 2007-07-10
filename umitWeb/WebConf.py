from umitCore.NmapOutputHighlight import NmapOutputHighlight
from umitCore.Paths import Path

class JsOutputHighlight(NmapOutputHighlight, object):
    def __init__(self, *args):
        NmapOutputHighlight.__init__(self, *args)
        self.read(Path.webconfig_file)