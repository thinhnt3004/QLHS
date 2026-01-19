"""
Kết nối SQL Server
"""
import pyodbc
from config import settings

def get_connection():
    """Tạo kết nối SQL Server"""
    try:
        connection_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={settings.SQL_SERVER};"
            f"DATABASE={settings.DATABASE};"
            f"UID={settings.USERNAME};"
            f"PWD={settings.PASSWORD}"
        )
        conn = pyodbc.connect(connection_string)
        return conn
    except Exception as e:
        print(f"Lỗi kết nối: {e}")
        return None

def execute_query(query: str, params: tuple = None, fetch: bool = True):
    """Thực thi query SQL"""
    conn = get_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if fetch:
            return cursor.fetchall()
        else:
            conn.commit()
            return {"status": "success"}
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}
    finally:
        cursor.close()
        conn.close()
