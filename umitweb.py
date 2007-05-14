import sys
import os
from umitWeb.Server import UmitWebServer


if len(sys.argv) != 2:
    print "Wrong parameters!"
    print "Usage: %s {start|stop}" % sys.argv[0]
    sys.exit(1)

elif sys.argv[1] == "start":
    server = UmitWebServer()
    try:
        print "UmitWebServer started on 0.0.0.0:8000"
        server.run()
    except KeyboardInterrupt:
        print "Stopping..."
        sys.exit(0)

elif sys.argv[1] == "stop":
    os.kill(UmitWebServer.get_pid())
    sys.exit(0)
