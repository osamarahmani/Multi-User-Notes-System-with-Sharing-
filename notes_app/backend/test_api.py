import requests

BASE_URL = "http://127.0.0.1:5000"

# -----------------------------
# 1. SIGNUP
# -----------------------------
def signup():
    url = f"{BASE_URL}/signup"

    data = {
        "username": "testuser",
        "password": "123456"
    }

    res = requests.post(url, json=data)
    print("SIGNUP:", res.json())


# -----------------------------
# 2. LOGIN
# -----------------------------
def login():
    url = f"{BASE_URL}/login"

    data = {
        "username": "testuser",
        "password": "123456"
    }

    res = requests.post(url, json=data)
    print("LOGIN:", res.json())

    return res.json().get("user_id")


# -----------------------------
# 3. CREATE NOTE
# -----------------------------
def create_note(user_id):
    url = f"{BASE_URL}/create-note"

    data = {
        "user_id": user_id,
        "title": "Test Note",
        "content": "Hello World"
    }

    res = requests.post(url, json=data)
    print("CREATE NOTE:", res.json())

    return res.json().get("note_id")


# -----------------------------
# 4. GET NOTES
# -----------------------------
def get_notes(user_id):
    url = f"{BASE_URL}/get-notes/{user_id}"

    res = requests.get(url)
    print("GET NOTES:", res.json())


# -----------------------------
# 5. UPDATE NOTE
# -----------------------------
def update_note(note_id, user_id):
    url = f"{BASE_URL}/update-note/{note_id}"

    data = {
        "user_id": user_id,
        "title": "Updated Title",
        "content": "Updated Content"
    }

    res = requests.put(url, json=data)
    print("UPDATE NOTE:", res.json())


# -----------------------------
# 6. DELETE NOTE
# -----------------------------
def delete_note(note_id, user_id):
    url = f"{BASE_URL}/delete-note/{note_id}"

    data = {
        "user_id": user_id
    }

    res = requests.delete(url, json=data)
    print("DELETE NOTE:", res.json())


# -----------------------------
# 7. SHARE NOTE
# -----------------------------
def share_note(note_id, owner_id):
    url = f"{BASE_URL}/share-note"

    data = {
        "note_id": note_id,
        "owner_id": owner_id,
        "shared_with": "another_user_id",
        "permission": "read"
    }

    res = requests.post(url, json=data)
    print("SHARE NOTE:", res.json())


# -----------------------------
# MAIN FLOW
# -----------------------------
if __name__ == "__main__":
    signup()

    user_id = login()

    if user_id:
        note_id = create_note(user_id)

        get_notes(user_id)

        if note_id:
            update_note(note_id, user_id)
            delete_note(note_id, user_id)

            # Optional
            share_note(note_id, user_id)