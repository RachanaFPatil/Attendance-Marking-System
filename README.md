# Attendance-Marking-System

A simple web-based **Attendance Management System** built using **Node.js, Express, EJS, and SQLite**.  
The project lets users record, view, and manage attendance logs through a clean and lightweight interface.

---

## ⭐ Features
- Adding new attendance entries
- Viewing all attendance logs
- Storing records in a local SQLite (.db) file
- Simple authentication using Express Session
- Fully server-rendered UI using EJS templates  

---

## 🛠️ Technologies Used
**Backend:** Node.js, Express.js, Body-Parser, Express-Session  
**Frontend:** HTML, CSS, EJS Templates  
**Database:** SQLite (`database.db`)

---

## 🔍 How It Works
- The server connects to the local `database.db` file  
- When a user submits attendance, the data is inserted into the SQLite database  
- When the logs page is opened, the backend reads all records and displays them  
- Everything runs completely on your local machine  

---

