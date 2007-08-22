#!/bin/sh

UMITWEB="/usr/bin/umitweb.py"

start(){
   cd "/usr/"
   $UMITWEB 2>&1 /dev/null &
}

stop(){
   ps aux |grep umitweb |grep -v grep
}

case $1 in
 start)
   start;
 ;;
 stop)
   stop;
 ;;
 restart)
   stop;
   start;
 ;;
 *)
   echo "usage: $0 (start|stop|restart)"
 ;;
esac
