import sys

if sys.platform not in ["win32"]:
    raise Exception, "Management console supports only Windows platform by now."

import gtk
from umitWeb.WebPaths import WPath as Path

from umitWeb.ServiceManager import UmitServiceManager


if __name__ == "__main__":
    s = UmitServiceManager()
    gtk.main()
