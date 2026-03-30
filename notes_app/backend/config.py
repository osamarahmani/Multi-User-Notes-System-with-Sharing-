import pymongo
import os

# Ensure your MongoDB URI is correct. 
# If using Atlas, make sure your IP is whitelisted!
client = pymongo.MongoClient("mongodb+srv://devadharshinigurumoorthy_db_user:deva123@deva.uhxmas7.mongodb.net/", serverSelectionTimeoutMS=5000)
db = client["notes_db"]

try:
    client.admin.command('ping')
    print("MongoDB Connected!")
except Exception as e:
    print("MongoDB Connection Error:", e)