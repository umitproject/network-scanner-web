!include "MUI.nsh"
; MUI Settings:
;
;!define MUI_ICON "share\icons\umit_32.ico" # Installer icon
;!define MUI_UNICON "share\icons\trash_32.ico" # Uninstaller icon
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "share\pixmaps\splash.bmp"
!define MUI_HEADERIMAGE_UNBITMAP "share\pixmaps\splash.bmp"
!define MUI_ABORTWARNING
!define MUI_UNABORTWARNING

!define APPLICATION_NAME "Umit"
!define APPLICATION_VERSION "0.9.4"
!define APPLICATION_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPLICATION_NAME}"
!define APPLICATION_UNINST_ROOT_KEY "HKLM"
!define WINPCAP "winpcap-nmap-4.01.exe"

Name "${APPLICATION_NAME}"
InstallDir "$PROGRAMFILES\${APPLICATION_NAME}\"

; Pages definitions
!define MUI_PAGE_HEADER_TEXT "Umit, The Nmap Frontend"
!define MUI_PAGE_HEADER_SUBTEXT "Umit"

; Finish page definitions
!define MUI_FINISHPAGE_LINK "Don't forget to visit Umit's website!"
!define MUI_FINISHPAGE_LINK_LOCATION "http://umit.sourceforge.net/" 

Outfile ${APPLICATION_NAME}-${APPLICATION_VERSION}.exe

; MUI Installer Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "COPYING"
!insertmacro MUI_PAGE_LICENSE "COPYING_HIGWIDGETS"
!insertmacro MUI_PAGE_LICENSE "COPYING_NMAP"
!insertmacro MUI_PAGE_LICENSE "COPYING_WINPCAP"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; MUI Uninstaller Pages
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Language
!insertmacro MUI_LANGUAGE "English"

Section "Umit Web interface" SecUmit
  SetOutPath $INSTDIR
  File COPYING
  File COPYING_HIGWIDGETS
  File COPYING_NMAP
  File COPYING_WINPCAP
  File README
  File share\icons\umit_*.ico

  File /r dist\*.*

  File "install_scripts\windows\win_dependencies\${WINPCAP}"
  ExecWait "$INSTDIR\${WINPCAP}"
  Delete "$INSTDIR\${WINPCAP}"

  CreateDirectory "$SMPROGRAMS\Umit"
  CreateShortCut "$SMPROGRAMS\Umit\Start UMIT web server.lnk" "$INSTDIR\umitweb.exe" "" $INSTDIR\umit_48.ico
SectionEnd

Section "Install as windows service"
  SetOutPath "$INSTDIR"
  File "install_scripts\windows\win_dependencies\instsrv.exe"
  File "install_scripts\windows\win_dependencies\srvany.exe"
  ExecWait '"$INSTDIR\instsrv.exe" "UMIT" "$INSTDIR\srvany.exe"' $0
  Delete "$INSTDIR\instsrv.exe"
  WriteRegStr HKLM "SYSTEM\CurrentControlSet\Services\UMIT" "Description" "UMIT is a graphical interface for nmap, with and embedded web server."
  WriteRegStr HKLM "SYSTEM\CurrentControlSet\Services\UMIT" "DisplayName" "UMIT The nmap frontend"
  WriteRegStr HKLM "SYSTEM\CurrentControlSet\Services\UMIT\Parameters" "Application" "$INSTDIR\umitweb.exe"
  WriteRegStr HKLM "SYSTEM\CurrentControlSet\Services\UMIT\Parameters" "AppDir" "$INSTDIR"
  WriteRegStr HKLM "SYSTEM\CurrentControlSet\Services\UMIT\Parameters" "AppDirectory" "$INSTDIR"
  ExecWait "net start UMIT"
  CreateDirectory "$SMPROGRAMS\Umit"
  CreateShortCut "$SMPROGRAMS\Umit\Start UMIT server instance.lnk" "net start UMIT" "" $INSTDIR\umit_48.ico
  CreateShortCut "$SMPROGRAMS\Umit\Start UMIT server instance.lnk" "net stop UMIT" "" $INSTDIR\umit_48.ico
  
  MessageBox MB_YESNO|MB_ICONQUESTION "You need to restart your computer to make UMIT work find. Do you want to reboot your computer now?" IDNO +2
    Reboot
SectionEnd

Section -Post
  WriteUninstaller "$INSTDIR\Umit-Uninstaller.exe"
  WriteRegStr ${APPLICATION_UNINST_ROOT_KEY} "${APPLICATION_UNINST_KEY}" "DisplayName" "${APPLICATION_NAME}"
  WriteRegStr ${APPLICATION_UNINST_ROOT_KEY} "${APPLICATION_UNINST_KEY}" "UninstallString" "$INSTDIR\Umit-Uninstaller.exe"
  WriteRegStr ${APPLICATION_UNINST_ROOT_KEY} "${APPLICATION_UNINST_KEY}" "DisplayVersion" "${APPLICATION_VERSION}"
  WriteRegStr ${APPLICATION_UNINST_ROOT_KEY} "${APPLICATION_UNINST_KEY}" "Publisher" "Umit, The Nmap Frontend"
SectionEnd

; Components descriptions
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
	!insertmacro MUI_DESCRIPTION_TEXT SecUmit "Install Umit and its dependencies"
!insertmacro MUI_FUNCTION_DESCRIPTION_END

Section "Uninstall"
    Delete "$INSTDIR\*.*"
    Delete "$INSTDIR\share\*.*"
    Delete "$SMPROGRAMS\Umit"
    RMDir "$INSTDIR\share"
    RMDir "$INSTDIR"
    RMDir "$SMPROGRAMS\Umit"
    ExecWait "net stop UMIT"
    DeleteRegKey HKLM "SYSTEM\CurrentControlSet\Services\UMIT"
    DeleteRegKey ${APPLICATION_UNINST_ROOT_KEY} "${APPLICATION_UNINST_KEY}"
  
;  remove_uninstaller:
;      Delete "$INSTDIR\Umit-Uninstaller.exe"
SectionEnd