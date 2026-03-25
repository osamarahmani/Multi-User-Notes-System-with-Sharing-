1. Multi-User Notes System (with Sharing)
Problem: Users need structured note storage with sharing.
Core Features:
•	User auth (signup/login) 
•	CRUD notes 
•	Share note with another user (read/write) 
•	Tagging + search 
•	Soft delete (trash) 
DB Design:
•	users 
•	notes 
•	note_shares (many-to-many) 
•	tags / note_tags 
Focus: relational modeling, access control, joins
