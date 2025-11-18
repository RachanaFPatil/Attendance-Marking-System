# Attendance-Marking-System

A simple web-based **Attendance Management System** built using **Node.js, Express, EJS, and SQLite**.  
It is created to make attendance hassle-free. Students can submit their attendance digitally, and teachers can track logs in real time to catch duplicate or repeated entries.

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
**Database:** SQLite (`attendance.db`)

---

## How to Run the Project

### Install Dependencies
```bash
npm install
```
### Start the Server
```bash
node server.js
```
- The application runs in browser and can be accessed through http://localhost:3000
### Login Credentials
Use the following test credentials to log in:
- Teacher / Admin Login
  - Username: teacher
  - Password: teacher123
- Student Login
  - Username: student name
  - Password: student123
  - **Note:** Student names are **predefined inside the server code (hardcoded)**.
