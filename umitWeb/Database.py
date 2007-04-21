import re
import pickle
try:
    from sqlite3 import dbapi2 as dbmodule
except ImportError:
    from pysqlite2 import dbapi2 as dbmodule

connection = dbmodule.connect("/home/rodox/.umit/web.db")


class DBError(Exception):
    pass


class Model(object):
    _sqlfields = []
    
    def __init__(self, table, id_field="id"):
        self.connection = connection
        self.table = table
        self.id_field = id_field
        self.__setattr__(self.id_field, None)

    def _process_result(self, cursor, result):
        cols = [e[0] for e in cursor.description]
        ret_data = {}
        for i in len(result):
            ret_data[cols[i]] = result[i]

        return ret_data
    
    def get(self, id):
        """Get a single object, given its id
        """
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM %s where %s=?" % (self.table, self.id_field), (id,))
        return self._process_result(cursor, cursor.fecthone())

    def get_list(**params):
        """Get a list of objects that match with params.
        """
        operation_patterns = (
            (r"^(?P<field>.+)__gt$", "%s > %s"),
            (r"^(?P<field>.+)__gte$", "%s >= ?"),
            (r"^(?P<field>.+)__lt$", "%s < ?"),
            (r"^(?P<field>.+)__lte$", "%s <= ?"),
            (r"^(?P<field>.+)__contains$", "%s LIKE ?"),
            (r"^(?P<field>.+)__icontains$", "%s ILIKE ?"),
            (r"^.*$", "%s = ?")
        )

        for k in params.keys():
            
            match = None
            strfmt = ""
            for p in operation_patterns:
                match = re.match(p[0], k)
                if match:
                    col = match.groupdict()['field']
                    strfmt = p[1]

            if match:
                where_list.append(strfmt % col)
                param_list.append(params[k])

        query = "SELECT * FROM %s WHERE 1=1" % self.table
        query += " AND ".join(where_list)
        cursor = self.connection.cursor()
        cursor.execute(query, param_list)
        return self._process_result(cursor, cursor.fetchall())

    def _create(self):
        cursor = connection.cursor()
        creation_sql = "CREATE TABLE %s(%s)" % (self.table, ",\n".join(self._sqlfields))
        print creation_sql
        cursor.execute(creation_sql)
    

class SessionData(Model):
    _sqlfields = [
        "sessid CHAR(32) not null",
        "pickled_data TEXT",
        "primary key(sessid)"
        ]
    
    def __init__(self, **kwargs):
        Model.__init__(self, "session", "sessid")
        self.pickled_data = {}

        try:
            if kwargs:
                self.pickled_data = pickle.loads(kwargs['pickled_data'])
                self.id = kwargs['sessid']
        except KeyError:
            raise DBError("All attributes must be filled, or none.")

    def save(self):
        if self.get(self.id):
            sql = "UPDATE session SET pickled_data=? WHERE sessid=?"
        else:
            sql = "INSERT INTO session(pickled_data, sessid) VALUES (?, ?)"

        cursor = connection.cursor()
        cursor.execute(sql, (pickle.dumps(self.pickled_data), self.id))


class User(Model):
    _sqlfields = [
        "id INT NOT NULL",
        "login VARCHAR(30) NOT NULL",
        "password CHAR(32) NOT NULL",
        "description VARCHAR(255)",
        "PRIMARY KEY(id)"
        ]

    def __init__(self, **kwargs):
        Model.__init__(self, "users")
        self.login = None
        self.password = kwargs.get("password", None)
        self.description = kwargs.get("description", None)
        if kwargs:
            try:
                self.login = kwargs['login']
            except KeyError:
                raise DBError("'login' attribute must be filled.")

    def save(self):
        pass
    

def _init():
    classes = Model.__class__.__subclasses__(Model)
    for Class in classes:
        Class()._create()

def _clean():
    classes = Model.__class__.__subclasses__(Model)
    drop_sql = "DROP TABLE %s"
    for Class in classes:
        obj = Class()
        cursor = connection.cursor()
        cursor.execute(drop_sql % obj.table)

def _verify():
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM session")
    except dbmodule.OperationalError, ex:
        _init()

_verify()
