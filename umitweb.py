import sys
import os
from signal import SIGKILL
from umitWeb.Server import UmitWebServer


if len(sys.argv) != 2:
    print "Wrong parameters!"
    print "Usage: %s {start|stop}" % sys.argv[0]
    sys.exit(1)

elif sys.argv[1] == "start":
    server = UmitWebServer()
    try:
        server.run()
    except KeyboardInterrupt:
        sys.exit(0)
elif sys.argv[1] == "stop":
    os.kill(UmitWebServer.get_pid(), SIGKILL)
    sys.exit(0)
