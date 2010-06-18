#!/bin/sh

python setup.py sdist
mv dist/UmitWeb-0.1-RC1.tar.gz /usr/src/redhat/SOURCES
rmdir dist
rpmbuild -vv -bb umit.fedora.spec --clean
