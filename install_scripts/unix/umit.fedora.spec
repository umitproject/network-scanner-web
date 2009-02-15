Summary: UmitWeb, the Umit web frontend
%define version 0.1
License: GNU Public License
Group: Network
Name: UmitWeb
Prefix: /usr
Provides: Umit
Source: UmitWeb-0.1-RC1.tar.gz
URL: http://www.umitproject.org
Version: %{version}
Release: RC1
Buildroot: %{_tmppath}/umitrpm
%define python /usr/bin/python
%define py_compile %{python} /usr/lib/python2.5/py_compile.py

%description
UmitWeb is a web frontend for umit.
Umit is the newest network scanning frontend, and it's been developed in Python and GTK and was started with the sponsoring of Google's Summer of Code.

The project goal is to develop a network scanning frontend that is really useful for advanced users and easy to be used by newbies. With Umit, a network admin could create scan profiles for faster and easier network scanning or even compare scan results to easily see any changes. A regular user will also be able to construct powerful scans with Umit command creator wizards.


%prep
%setup -q
%build
%{py_compile} umitwebserver
mv umitwebserverc umitwebserver.pyc
%{py_compile} umitCore/*.py
%{py_compile} umitWeb/*.py
%{py_compile} umitWeb/views/*.py
%{py_compile} umitWeb/views/html/*.py

%clean
rm -rf *.pyc
rm -rf umitCore/*.pyc
rm -rf umitWeb/*.pyc

%install

mkdir -p $RPM_BUILD_ROOT/usr/local/umit
mkdir -p $RPM_BUILD_ROOT/usr/bin
mkdir -p $RPM_BUILD_ROOT/usr/lib/python2.5/site-packages/umitCore
mkdir -p $RPM_BUILD_ROOT/usr/lib/python2.5/site-packages/umitWeb/views/html


cp umitwebserver.pyc $RPM_BUILD_ROOT/usr/bin/umitwebserver
chmod a+x $RPM_BUILD_ROOT/usr/bin/umitwebserver

cp -va umitwebserver.pyc $RPM_BUILD_ROOT/usr/bin/umitwebserver
cp -va umitCore/*.pyc $RPM_BUILD_ROOT/usr/lib/python2.5/site-packages/umitCore
cp -rva umitWeb/*.pyc $RPM_BUILD_ROOT/usr/lib/python2.5/site-packages/umitWeb
cp install_scripts/unix/UmitWeb-fedora-service.sh $RPM_BUILD_ROOT/etc/init.d/UmitWeb
cp install_scripts/unix/UmitWeb-launcher $RPM_BUILD_ROOT/usr/bin/UmitWeb
chmod a+x $RPM_BUILD_ROOT/usr/bin/UmitWeb
chmod a+x $RPM_BUILD_ROOT/usr/bin/umitwebserver
chmod a+x $RPM_BUILD_ROOT/etc/init.d/UmitWeb

%files
/usr

%post
/sbin/chkconfig --add UmitWeb

%preun
if [ $1 = 0 ]; then
  /etc/init.d/UmitWeb stop > /dev/null 2>&1
  /sbin/chkconfig --del UmitWeb
fi
