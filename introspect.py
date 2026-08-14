import pymysql

host = 'wandersync-2026-wandersync.d.aivencloud.com'
port = 11936
user = 'avnadmin'
password = 'AVNS_RY1yP6_apEXLSjoTHgu'
database = 'WanderSync'

try:
    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        ssl={'ssl': {}}
    )
    cursor = conn.cursor()
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = %s AND table_type = 'BASE TABLE'", (database,))
    tables = [row[0] for row in cursor.fetchall()]

    cursor.execute("""
        SELECT table_name, column_name, column_type, column_key 
        FROM information_schema.columns 
        WHERE table_schema = %s
        ORDER BY table_name, ordinal_position
    """, (database,))
    columns = cursor.fetchall()

    cursor.execute("""
        SELECT table_name, column_name, referenced_table_name, referenced_column_name 
        FROM information_schema.key_column_usage 
        WHERE table_schema = %s AND referenced_table_name IS NOT NULL
    """, (database,))
    foreign_keys = cursor.fetchall()

    print("TABLES:")
    for table in tables:
        print(f"TABLE_NAME: {table}")
        for col in columns:
            if col[0] == table:
                key_str = ""
                if col[3] == "PRI": key_str = "PK"
                elif col[3] == "MUL": key_str = "FK"
                print(f"  {col[1]} {col[2]} {key_str}")

    print("\nFOREIGN KEYS:")
    for fk in foreign_keys:
        print(f"{fk[0]}.{fk[1]} -> {fk[2]}.{fk[3]}")

    conn.close()
except Exception as e:
    print("ERROR:", e)
