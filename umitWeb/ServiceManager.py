import gtk
import sys
import gobject
from os.path import join, split
from umitWeb.WebPaths import WPath as Path
import _winreg
import webbrowser

from umitWeb.WindowsService import WindowsService
from higwidgets.higwindows import HIGMainWindow


######################################
# Setting the umit home directory

from umitWeb.WebPaths import WPath as Path
Path.set_umit_conf(split(sys.argv[0])[0])

######################################

class UmitServiceManager(HIGMainWindow):
    def __init__(self):
        HIGMainWindow.__init__(self)
        self._old_umit_status = "Not Set"
        self.vbox = gtk.VBox()
        self.service_table = gtk.Table(5, 2)
        self.notebook = gtk.Notebook()
        try:
            self.service_manager = WindowsService("UMIT")
            self.umit_status = self.service_manager.status()
        except Exception, ex:
            self.service_manager = None
            self.umit_status = str(ex)
            
        self.set_title("UMIT Service Manager")

        self.notebook.append_page(self.vbox, gtk.Label("Status"))
        self.notebook.append_page(self.service_table, gtk.Label("Service Configuration"))
        self.notebook.set_current_page(0)
        
        self.add(self.notebook)
        
        self.set_icon_from_file(join(Path.icons_dir, "umit_16.ico"))
        
        self._create_widgets()
        self._pack_widgets()

        self.set_umit_status()
        
        self._connect_signals()
        
        self.set_resizable(False)
        self.set_position(gtk.WIN_POS_CENTER)
        
        gobject.timeout_add(1000, self.check_service_status)
        #gobject.idle_add(self.check_service_status)
        self.check_preferences()
        self.connect('delete-event', self._exit_cb)
        
    def check_service_status(self):
        if self.service_manager is not None:
            self.umit_status = self.service_manager.status()
            if self.umit_status != self._old_umit_status:
                self.set_button_status()
                self.set_umit_status()
            self._old_umit_status = self.umit_status
            return True
        return False
    
    def check_preferences(self):
        self.port_entry.set_value(int(Path.web_server_port))
        self.address_entry.set_text(Path.web_server_address)
        self.service_status_checkbutton.set_active(Path.web_server_auto_start in ["on", "true", "1"])
        self.console_checkbutton.set_active(Path.web_server_auto_start_console in ["on", "true", "1"])
    
    def set_button_status(self):
        self.start_button.set_property("sensitive", not (self.umit_status == "RUNNING"))
        self.menuitem_start.set_property("sensitive", not (self.umit_status == "RUNNING"))
        
        self.restart_button.set_property("sensitive", self.umit_status == "RUNNING")
        self.menuitem_restart.set_property("sensitive", self.umit_status == "RUNNING")
        
        self.stop_button.set_property("sensitive", not (self.umit_status == "STOPPED"))
        self.menuitem_stop.set_property("sensitive", not (self.umit_status == "STOPPED"))
        
    def set_umit_status(self):
        self.status_bar.pop(self._sbar_ctx)
        self.status_bar.push(self._sbar_ctx, "UMIT - " + self.umit_status)
        self.status_icon.set_tooltip("UMIT - " + self.umit_status)
        if self.umit_status == "STOPPED":
            self.status_icon.set_from_file(join(Path.icons_dir, "umit_16_deactivated.ico"))
        else:
            self.status_icon.set_from_file(join(Path.icons_dir, "umit_16.ico"))
        
    def _exit_cb(self, widget=None, extra=None):
        self.status_icon.set_visible(False)
        if extra == True:
            gtk.main_quit()
        else:
            self.hide_all()
            self.status_icon.set_visible(True)
            return True
        
    def _create_widgets(self):
        self.service_table.set_border_width(5)
        self.status_bar = gtk.Statusbar()
        self.hbox = gtk.HBox()
        self.hbox.set_border_width(5)
        self.service_icon = gtk.Image()
        self.service_icon.set_from_file(join(Path.icons_dir, "umit_128.ico"))
        
        self.serviceinfo_vbox = gtk.VBox()
        self.main_label = gtk.Label()
        self.main_label.set_use_markup(True)
        self.main_label.set_markup("<b>UMIT Service Info</b>")
        
        self.status_label = gtk.Label()
        self.status_label.set_use_markup(True)
        
        self.status_table = gtk.Table(2, 3)
        
        self.start_button = gtk.Button()
        self.stop_button = gtk.Button()
        self.restart_button = gtk.Button()
        
        img_start = gtk.Image()
        img_start.set_from_stock(gtk.STOCK_MEDIA_PLAY, gtk.ICON_SIZE_BUTTON)
        self.start_button.set_image(img_start)
        
        img_stop = gtk.Image()
        img_stop.set_from_stock(gtk.STOCK_MEDIA_STOP, gtk.ICON_SIZE_BUTTON)
        self.stop_button.set_image(img_stop)
        
        img_restart = gtk.Image()
        img_restart.set_from_stock(gtk.STOCK_REFRESH, gtk.ICON_SIZE_BUTTON)
        self.restart_button.set_image(img_restart)
        
        self.status_label = gtk.Label()
        
        self.status_icon = gtk.StatusIcon()
        self.status_icon.set_from_file(join(Path.icons_dir, "umit_16.ico"))
        
        self.popup_menu = gtk.Menu()
        self.menuitem_open = gtk.MenuItem("Open UmitWeb")
        self.menuitem_show = gtk.MenuItem("Show management console")        
        self.menuitem_start = gtk.MenuItem("Start service")
        self.menuitem_stop = gtk.MenuItem("Stop service")
        self.menuitem_restart = gtk.MenuItem("Restart service")
        self.menuitem_exit = gtk.MenuItem("Exit")

        self.port_entry = gtk.SpinButton(climb_rate=1, digits=0)
        self.port_entry.set_range(1, 65535)

        self.address_entry = gtk.Entry()

        self.service_status_checkbutton = gtk.CheckButton("Start UmitWeb Service at Startup")
        self.console_checkbutton = gtk.CheckButton("Start Management Console at Startup")
        self.apply_button = gtk.Button("Apply Changes")
        
        self._sbar_ctx = self.status_bar.get_context_id("Umit Status")
        
    
    def _pack_widgets(self):
        self.hbox.set_spacing(3)
        self.hbox.pack_start(self.service_icon, expand=False)
        self.hbox.pack_start(self.serviceinfo_vbox)

        self.serviceinfo_vbox.pack_start(self.main_label)
        self.serviceinfo_vbox.pack_start(self.status_table)
        
        self.status_table.attach(self.start_button, 0, 1, 0, 1)
        self.status_table.attach(gtk.Label("Start service"), 1, 2, 0, 1)
        
        self.status_table.attach(self.stop_button, 0, 1, 1, 2)
        self.status_table.attach(gtk.Label("Stop service"), 1, 2, 1, 2)
        
        self.status_table.attach(self.restart_button, 0, 1, 2, 3)
        self.status_table.attach(gtk.Label("Restart service"), 1, 2, 2, 3)
        
        self.vbox.pack_start(self.hbox)
        self.vbox.pack_start(self.status_bar, expand=False)
        
        self.popup_menu.attach(self.menuitem_open, 0, 1, 0, 1)
        self.popup_menu.attach(gtk.SeparatorMenuItem(), 0, 1, 1, 2)
        self.popup_menu.attach(self.menuitem_show, 0, 1, 2, 3)
        self.popup_menu.attach(self.menuitem_start, 0, 1, 3, 4)
        self.popup_menu.attach(self.menuitem_stop, 0, 1, 4, 5)
        self.popup_menu.attach(self.menuitem_restart, 0, 1, 5, 6)
        self.popup_menu.attach(gtk.SeparatorMenuItem(), 0, 1, 6, 7)
        self.popup_menu.attach(self.menuitem_exit, 0, 1, 7, 8)

        self.service_table.attach(gtk.Label("Address:"), 0, 1, 0, 1, gtk.FILL)
        self.service_table.attach(self.address_entry, 1, 2, 0, 1)
        self.service_table.attach(gtk.Label("Port Number:"), 0, 1, 1, 2, gtk.FILL)
        self.service_table.attach(self.port_entry, 1, 2, 1, 2)
        self.service_table.attach(self.service_status_checkbutton, 0, 2, 2, 3)
        self.service_table.attach(self.console_checkbutton, 0, 2, 3, 4)
        self.service_table.attach(self.apply_button, 0, 2, 4, 5, yoptions=gtk.EXPAND)
        
        
    def _connect_signals(self):
        self.status_icon.connect("activate", self.show_main_window)
        self.status_icon.connect("popup-menu", self.show_popup)
        
        for name in ["start", "stop",]:
            btn = getattr(self, "%s_button" % name)
            btn.connect("clicked", self.change_service_status, [name])
        self.restart_button.connect("clicked", self.change_service_status, ["stop", "start"])
        self.apply_button.connect("clicked", self.apply_preferences)
        
        self.menuitem_exit.connect("activate", self._exit_cb, True)
        self.menuitem_show.connect("activate", lambda widget: self.show_all())
        
        host = Path.web_server_address
        port = Path.web_server_port
        if host in ["0.0.0.0", "127.0.0.1"]:
            host = "localhost"
        self.menuitem_open.connect("activate", lambda widget: webbrowser.open_new("http://%s:%s/" % (host, port)))
        self.menuitem_start.connect("activate", self.change_service_status, ["start"])
        self.menuitem_stop.connect("activate", self.change_service_status, ["stop"])
        self.menuitem_restart.connect("activate", self.change_service_status, ["stop", "start"])
        
        
    def show_popup(self, widget, button, activated_time):
        self.popup_menu.show_all()
        self.popup_menu.popup(None, None, None, button, activated_time)
        
    def change_service_status(self, widget, methods):
        if self.service_manager:
            for method in methods:
                getattr(self.service_manager, method)()
                
    def apply_preferences(self, widget):
        Path.web_server_port = self.port_entry.get_text()
        Path.web_server_address = self.address_entry.get_text()
        
        if self.service_status_checkbutton.get_active():
            Path.web_server_auto_start = "true"
        else:
            Path.web_server_auto_start = "false"
        
        if self.console_checkbutton.get_active():
            Path.web_server_auto_start_console = "true"
        else:
            Path.web_server_auto_start_console = "false"

        #Apply on Windows registry
        startup_console_key = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"
        run_key = _winreg.OpenKey(_winreg.HKEY_LOCAL_MACHINE, startup_console_key, 0, _winreg.KEY_ALL_ACCESS)
        
        try:
            console_running = _winreg.QueryValueEx(run_key, "Umit Management Console")[0]
            Path.web_console_path = console_running
        except:
            console_running = False
        
        if (not console_running) and self.console_checkbutton.get_active():
            #FIXME: Add full path to the entry
            _winreg.SetValueEx(run_key, "Umit Management Console", 0, _winreg.REG_SZ, Path.web_console_path)
            
        elif console_running and (not self.console_checkbutton.get_active()):
            _winreg.DeleteValue(run_key, "Umit Management Console")
        run_key.Close()
        
        if self.service_status_checkbutton.get_active():
            self.service_manager.setstartup("automatic")
            if self.service_manager.status() == "STOPPED":
                self.service_manager.start()
        else:
            self.service_manager.setstartup("manual")
            if self.service_manager.status() == "RUNNING":
                self.service_manager.stop()
        Path.config_parser.save_changes()
        dialog = gtk.Dialog("Umit Management Console", self, gtk.DIALOG_MODAL | gtk.DIALOG_DESTROY_WITH_PARENT,
                           (gtk.STOCK_OK, gtk.RESPONSE_ACCEPT))
        dialog.set_default_response(gtk.RESPONSE_ACCEPT)
        l = gtk.Label("Preferences Applied Successfully!")
        dialog.set_border_width(5)
        dialog.vbox.pack_start(l)
        dialog.show_all()
        dialog.run()
        dialog.destroy()
    
    def show_main_window(self, widget):
        if self.get_property("visible"):
            self.hide_all()
        else:
            self.show_all()
        
        
if __name__ == "__main__":
    w = UmitServiceManager()
    gtk.main()
