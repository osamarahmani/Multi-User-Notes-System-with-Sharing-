from config import db


def create_user(user_data):
    return db.users.insert_one(user_data)


def find_user_by_username(username):
    return db.users.find_one({"username": username})