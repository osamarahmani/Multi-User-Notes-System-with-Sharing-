import pymongo
import os

MONGO_URI = "mongodb+srv://devadharshinigurumoorthy_db_user:deva123@deva.uhxmas7.mongodb.net/notes_db?retryWrites=true&w=majority"

client = pymongo.MongoClient(
    MONGO_URI,
    tls=True,
    tlsAllowInvalidCertificates=True,
    serverSelectionTimeoutMS=5000
)

db = client["notes_db"]

try:
    client.admin.command('ping')
    print("MongoDB Connected!")
except Exception as e:
    print("MongoDB Connection Error:", e)