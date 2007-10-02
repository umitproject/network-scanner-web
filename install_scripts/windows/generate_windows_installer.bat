@echo off

echo ####################
echo # Umit for Windows #
echo ####################
echo .

echo Setting installation variables...
set PythonEXE=C:\Python25\python.exe
set UmitOrig=C:\Umit\trunk
set UmitDir=C:\UmitTemp
set DistDir=%UmitDir%\dist

set NmapDir=C:\Nmap
set WinpcapDir=C:\Winpcap
set WinInstallDir=%UmitDir%\install_scripts\windows
set Output=%UmitDir%\win_install.log
set MakeNSIS="%PROGRAMFILES%\NSIS\makensis.exe"
set UtilsDir=%UmitDir%\install_scripts\utils

echo Writing output to %Output%
rd %Output% /S /Q

echo Removing old compilation...
rd %UmitDir% /S /Q

echo Creating a temp directory for compilation...
mkdir %UmitDir%

echo Copying trunk to the temp dir...
xcopy %UmitOrig%\*.* %UmitDir% /E /S /C /Y /V /I >> %Output%

echo Creating dist and dist\share directories...
mkdir %DistDir%\share
mkdir %DistDir%\share\xml


echo Creating Nmap dist dirs...
mkdir %DistDir%\Nmap


echo Copying Nmap to his dist directory...
xcopy %NmapDir%\*.* %DistDir%\Nmap >> %Output%


echo Compiling Umit using py2exe...
cd %UmitDir%
%PythonEXE% -OO %WinInstallDir%\setup.py py2exe >> %Output%


echo Removing the build directory...
rd %UmitDir%\build /s /q >> %Output%

echo .
echo Creating installer...
%MakeNSIS% /V4 /NOCD %WinInstallDir%\umit_compiled.nsi

cd %UmitOrig%
echo Done!
