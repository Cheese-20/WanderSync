"""
WanderSync - Cloud DB Exporter
Connects to the Aiven cloud MySQL database and exports the full schema + data
into a single SQL file that markers can import locally.
"""

import mysql.connector
import datetime
import os

# Cloud DB credentials
config = {
    'host': 'wandersync-2026-wandersync.d.aivencloud.com',
    'port': 11936,
    'database': 'WanderSync',
    'user': 'avnadmin',
    'password': 'AVNS_RY1yP6_apEXLSjoTHgu',
    'ssl_disabled': False,
    'connection_timeout': 30,
}

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'database', 'wandersync_backup.sql')

def quote_value(val):
    if val is None:
        return 'NULL'
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (datetime.date, datetime.datetime)):
        return f"'{val}'"
    if isinstance(val, bytes):
        return f"X'{val.hex()}'"
    escaped = str(val).replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '\\r')
    return f"'{escaped}'"

def dump_database():
    print("🔌 Connecting to Aiven cloud database...")
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()

    lines = []
    lines.append("-- ============================================================")
    lines.append("-- WanderSync Database Dump")
    lines.append(f"-- Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("-- Import with: mysql -u root -p WanderSync < wandersync_local_setup.sql")
    lines.append("-- ============================================================")
    lines.append("")
    lines.append("CREATE DATABASE IF NOT EXISTS WanderSync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    lines.append("USE WanderSync;")
    lines.append("")
    lines.append("SET FOREIGN_KEY_CHECKS=0;")
    lines.append("")

    # Get all tables
    cursor.execute("SHOW TABLES")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"📋 Found {len(tables)} tables: {', '.join(tables)}")

    for table in tables:
        print(f"  ⬇️  Exporting table: {table}")

        # DROP + CREATE TABLE
        cursor.execute(f"SHOW CREATE TABLE `{table}`")
        create_stmt = cursor.fetchone()[1]
        # Replace double-quoted identifiers with backticks for MySQL compatibility
        create_stmt = create_stmt.replace('"', '`')
        lines.append(f"-- Table: {table}")
        lines.append(f"DROP TABLE IF EXISTS `{table}`;")
        lines.append(create_stmt + ";")
        lines.append("")

        # Get rows
        cursor.execute(f"SELECT * FROM `{table}`")
        rows = cursor.fetchall()
        col_names = [desc[0] for desc in cursor.description]

        if rows:
            col_list = ', '.join(f'`{c}`' for c in col_names)
            lines.append(f"INSERT INTO `{table}` ({col_list}) VALUES")
            row_strings = []
            for row in rows:
                vals = ', '.join(quote_value(v) for v in row)
                row_strings.append(f"  ({vals})")
            lines.append(',\n'.join(row_strings) + ";")
            lines.append("")

    lines.append("SET FOREIGN_KEY_CHECKS=1;")
    lines.append("")
    lines.append("-- ✅ Import complete!")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    cursor.close()
    conn.close()

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"\n✅ Done! Exported to: {os.path.abspath(OUTPUT_FILE)}")
    print(f"   File size: {size_kb:.1f} KB")
    print(f"   Tables: {len(tables)}")

if __name__ == '__main__':
    dump_database()
