import os
import md5
from xml.sax import make_parser
from xml.sax.handler import ContentHandler
from umitCore.Paths import Path


class Constraint(object):
    
    def __init__(self, type="command", content=""):
        self.type = type
        self.content = content


class Permission(object):
    
    def __init__(self, id=None, type="", description="", constraints=None):
        self.id = id
        self.type = type
        self.constraints = constraints or []
        self.description = description
        
    def add_constraint(self, type, content=""):
        self.constraints.append(Constraint(type, content))


class Role(object):
    
    def __init__(self, id, description="", permissions=None):
        self.id = id
        self.description = description
        self.permissions = permissions or []


class User(object):
    
    def __init__(self, login, name="", password="", superuser="no", roles=None):
        self.login = login
        self.name = name
        self.password = password
        if superuser == "yes":
            self.superuser = True
        else:
            self.superuser = False
        self.roles = roles or []


class SecurityContext(object):
    permissions = []
    roles = []
    users = []
    
    def get_user(self, id):
        pass
    
    def get_permission(self, id):
        for p in self.permissions:
            if id == p.id:
                return p
            
    def get_role(self, id):
        for r in self.roles:
            if id == r.id:
                return r
    
    def add_permission(self, id, type):
        self.permissions.append(Permission(id, type))
    
    def get_user(self, login, password):
        passwd = md5.new(password).hexdigest()
        for u in self.users:
            if u.login == login:
                if u.password == passwd:
                    return u


class SecurityConfHandler(ContentHandler):
    
    _in_users = False
    _in_roles = False
    _in_permissions = False
    _in_constraint = False
    _in_permission = False
    _in_role = False
    _in_user = False
    _in_description = False
    _in_name = False
    _in_password = False
    
    def __init__(self, context):
        self.context = context

    def _add_permission(self, attrs):
        self.context.add_permission(attrs.get("id"), attrs.get("type", "allow"))
        
    def _add_constraint_to_permission(self, attrs):
        p = self.context.permissions[-1].add_constraint(attrs.get("type", "command"))
        
    def _add_role(self, id):
        self.context.roles.append(Role(id))
        
    def _add_permission_to_role(self, id):
        perm = self.context.get_permission(id)
        if perm:
            self.context.roles[-1].permissions.append(perm)
        else:
            raise ElementNotFound()
        
    def _add_user(self, login, superuser):
        self.context.users.append(User(login, superuser=superuser))
        
    def _add_role_to_user(self, id):
        role = self.context.get_role(id)
        if role:
            self.context.users[-1].roles.append(role)
        else:
            raise ElementNotFound()
        
    def startElement(self, name, attrs):
        if name == "permissions" and not self._in_roles:
            self._in_permissions = True
        elif name == "permission" and self._in_permissions:
            self._in_permission = True
            self._add_permission(attrs)
        elif name == "permission" and self._in_role:
            self._add_permission_to_role(attrs.get("ref"))
        elif name == "constraint":
            self._in_constraint = True
            self._add_constraint_to_permission(attrs)
        elif name == "roles" and not self._in_users:
            self._in_roles = True
        elif name == "role" and self._in_roles:
            self._add_role(attrs.get("id"))
            self._in_role = True
        elif name == "role" and self._in_user:
            self._add_role_to_user(attrs.get("ref"))
        elif name == "description":
            self._in_description = True
        elif name == "users":
            self._in_users = True
        elif name == "user" and self._in_users:
            self._in_user = True
            self._add_user(attrs.get("login"), attrs.get("superuser", "no"))
        elif name == "name" and self._in_user:
            self._in_name = True
        elif name == "password" and self._in_user:
            self._in_password = True

    def characters(self, ch):
        if self._in_constraint:
            self.context.permissions[-1].constraints[-1].content += ch
        elif self._in_description and self._in_role:
            self.context.roles[-1].description += ch
        elif self._in_description and self._in_permission:
            self.context.permissions[-1].description += ch
        elif self._in_name and self._in_user:
            self.context.users[-1].name += ch
        elif self._in_password and self._in_user:
            self.context.users[-1].password += ch
    
    def endElement(self, name):
        if name == "constraint":
            self._in_constraint = False
        elif name == "permission" and self._in_permissions:
            self._in_permission = False            
        elif name == "permissions" and not self._in_roles:
            self._in_permissions = False
        elif name == "roles" and not self._in_users:
            self._in_roles = False
        elif name == "role" and self._in_roles:
            self._in_role = False
        elif name == "description":
            self._in_description = False
        elif name == "users":
            self._in_users = False
        elif name == "user" and self._in_users:
            self._in_user = False
        elif name == "name" and self._in_user:
            self._in_name = False
        elif name == "password" and self._in_user:
            self._in_password = False


## Exceptions
class ElementNotFound(Exception):
    pass


def get_security_parser(config_file=None):
    cfg_file = config_file or os.path.join(os.path.dirname(__file__), os.pardir ,"config", "security.xml")
    parser = make_parser()
    ctx = SecurityContext()
    parser.setContentHandler(SecurityConfHandler(ctx))
    parser.parse(open(cfg_file, 'r'))
    
    return ctx
    
Context = get_security_parser

if __name__ == "__main__":
    Path.set_umit_conf(os.path.join(os.path.dirname(__file__), os.pardir, 'config', 'umit.conf'))
    ctx = Context()
    #print "Permissions:\n" + "\n---\n".join([
    #    p.id + " - " + p.type + "\n###\n" + ("\n".join([c.content for c in p.constraints])) \
    #    for p in ctx.permissions
    #])
    
    #print [[r.id, r.description, [p.id for p in r.permissions]] for r in ctx.roles]
    print [[u.login, u.password, u.name, [r.id for r in u.roles]] for u in ctx.users]