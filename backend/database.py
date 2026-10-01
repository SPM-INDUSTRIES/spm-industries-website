"""SQLite storage for Mevaa customer inquiries."""

import os
import sqlite3
from pathlib import Path


DATABASE_PATH = Path(os.getenv("INQUIRY_DATABASE", Path(__file__).with_name("inquiries.db")))


def _connect():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with _connect() as connection:
        connection.execute(
            """CREATE TABLE IF NOT EXISTS inquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )"""
        )


def create_inquiry(name, phone, email, message):
    initialize_database()
    with _connect() as connection:
        connection.execute(
            "INSERT INTO inquiries (name, phone, email, message) VALUES (?, ?, ?, ?)",
            (name, phone, email, message),
        )


def get_inquiries():
    initialize_database()
    with _connect() as connection:
        rows = connection.execute(
            "SELECT id, name, phone, email, message, created_at "
            "FROM inquiries ORDER BY id DESC"
        ).fetchall()
        return [dict(row) for row in rows]
