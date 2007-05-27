import types

class Field(object):
    size = 0
    datatype = ""
    unique = False
    primary_key = False
    null = True
    default = None
    value = None

    def __init__(self, **kwargs):
        for key in kwargs.keys():
            if hasattr(self, key):
                setattr(self, key, kwargs[key])
            else:
                raise AttributeError

    def reder_sql(self):
        if self.size:
            return "%s(%s) %s" (self.datatype, self.size, self.get_extraargs())
        else:
            return "%s(%s)" (self.datatype, self.get_extraargs())

    def get_extraargs(self):
        args = []
        if self.unique:
            args.append("UNIQUE")
        if self.primary_key:
            args.append("PRIMARY KEY")
        if not null:
            args.append("NOT NULL")
        return " ".join(args)

    def _set(self, value):
        self.value = value

    def _get(self):
        return self.value


class CharField(Field):
    self.datatype = "CHAR"
    
    def __init__(self, size, varchar=False, **kwargs):
        if varchar:
            self.datatype = "VARCHAR"
        Field.__init__(size=size, **kwargs)