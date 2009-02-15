#!/bin/sh
#
# Copyright (c) 1009 Adriano Monteiro Marques
# All rights reserved.
#
# Author: Rodolfo Carvaho <rodolfo@umitproject.org>, 2009
#
# /etc/init.d/UmitWeb
#   and its sybolic links
# /usr/bin/umitwebserver
#
# chkconfig:           2345 80 80
# description:   UmitWeb, the Umit web frontend
# processname: umitwebserver
#
### BEGIN INIT INFO
# Provides:            UmitWeb
# Required-Start:
# Required-Stop:
# Default-Start:       2 3 4 5
# Default-Stop:        0 1 6
# Short-Description:   UmitWeb, the Umit web frontend
# Description:         UmitWeb is a web frontend for umit.
#                      Umit is the newest network scanning frontend, and it's \
#                      been developed in Python and GTK and was started with \
#                      the sponsoring of Google's Summer of Code.
#                      The project goal is to develop a network scanning \
#                      frontend that is really useful for advanced users and \
#                      easy to be used by newbies. With Umit, a network admin \
#                      could create scan profiles for faster and easier \
#                      network scanning or even compare scan results to \
#                      easily see any changes. A regular user will also \
#                      be able to construct powerful scans with Umit command \
#                      creator wizards.
### END INIT INFO

UmitWeb=/usr/bin/UmitWeb
servicename=UmitWeb
processname=umitwebserver
pidfile=/var/run/umitweb.pid
RETVAL=0

# Sanity Check
test -x $UmitWeb || { echo "$UmitWeb not installed.";
        if [ "$1" = "stop" ]; then exit 0;
        else exit 6; fi }

. /etc/rc.d/init.d/functions

start(){
    echo -n $"Starting $servicename: "
    daemon --pidfile=$pidfile $UmitWeb
    RETVAL=$?
    echo
}

stop(){
    echo -n $"Stopping $servicename: "
    killproc $processname
    RETVAL=$?
    echo

    if [ $RETVAL -eq 0 ]; then
        rm -f $pidfile
    fi
}

case "$1" in
    start)
        start
    ;;
    stop)
        stop
    ;;
    restart|reload)
        stop
        start
    ;;
    status)
        status -p $pidfile $processname
		RETVAL=$?
    ;;
    *)
        echo "Usage: $0 {start|stop|status|restart|reload}"
        exit 1
    ;;
esac
exit $RETVAL

