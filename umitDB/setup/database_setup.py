# Copyright (C) 2007 Insecure.Com LLC.
#
# Author:  Guilherme Polo <ggpolo@gmail.com>
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 
# USA

"""
Setup database for umit.
"""

from _database import sql
from _database import database

def acquire_conn_cursor(db):
    """
    Get connection and cursor from database.
    """
    conn = sql.connect(db)
    cursor = conn.cursor()

    return conn, cursor

def setup_tables(conn, cursor):
    """
    Create all tables for database.
    """
    tables = open('../sql/%s-schema.sql' % database, 'r').readlines()
    tables = ''.join(line for line in tables)

    cursor.executescript(tables)
    conn.commit()

def setup_triggers(conn, cursor):
    """
    Setup triggers for database.
    """
    insert_triggers = open('../sql/%s-insert-triggers.sql' % database, 
                           'r').readlines()
    insert_triggers = ''.join(line for line in insert_triggers)

    update_triggers = open('../sql/%s-update-triggers.sql' % database, 
                           'r').readlines()
    update_triggers = ''.join(line for line in update_triggers)

    cursor.executescript(insert_triggers)
    cursor.executescript(update_triggers)
    conn.commit()

def setup_database(conn, cursor):
    """
    Setup database.
    """
    setup_tables(conn, cursor)
    setup_triggers(conn, cursor)

def drop_tables(conn, cursor):
    """
    Drops all tables in database.
    """
    drop_tables = open('../sql/%s-drop-tables.sql' % database, 'r').readlines()
    drop_tables = ''.join(line for line in drop_tables)

    cursor.executescript(drop_tables)
    conn.commit()

def drop_triggers(conn, cursor):
    """
    Drops all triggers in database.
    """
    drop_triggers = open('../sql/%s-drop-triggers.sql' % database, 'r').readlines()
    drop_triggers = ''.join(line for line in drop_triggers)

    cursor.executescript(drop_triggers)
    conn.commit()


def clear_database(conn, cursor):
    """
    Clear database.
    """

    drop_triggers(conn, cursor)
    drop_tables(conn, cursor)
    cursor.execute("VACUUM")

    conn.commit()

# When invoked set up umit new generation database.
if __name__ == "__main__":
    db = "../../config/umitng.db"

    conn, cursor = acquire_conn_cursor(db)
    try:
        setup_database(conn, cursor)
    except sql.OperationalError:
        clear_database(conn, cursor)
        setup_database(conn, cursor)

