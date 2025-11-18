const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');

const app = express();
const port = 3000;

// Set up database
const dbPath = path.join(__dirname, 'attendance.db'); // File-based SQLite database
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session management
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// List of 50 specific usernames
const usernames = [
  'rachana', 'navya', 'anu', 'deepa', 'krishna', 'geetha', 'priya', 'neha', 'asha',
  'manju', 'swathi', 'pooja', 'soni', 'komal', 'anjali', 'maya', 'jyothi', 'shreya', 'vijaya',
  'nisha', 'rani', 'sakshi', 'kavya', 'diana', 'harini', 'akshara', 'shruti', 'isha', 'charu',
  'rupal', 'kavitha', 'lakshmi', 'tanu', 'megha', 'divya', 'prachi', 'bhavana', 'tanvi', 'deepthi',
  'namrata', 'sonal', 'anjana', 'poonam', 'puja', 'sushma', 'neelam', 'kriti', 'hima', 'yashika', 'gita', 'bharti', 'saanvi'
];

// Create tables and insert usernames
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS attendance (username TEXT, date TEXT, time TEXT)');
  
  let stmt = db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)');
  
  // Insert the list of usernames
  usernames.forEach(username => {
    stmt.run(username, 'student123');
  });
  
  stmt.finalize();
});

// Routes
app.get('/', (req, res) => {
  if (req.session.username) {
    res.redirect('/mark-attendance');
  } else {
    res.send(`
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(180deg, white, #00008B);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }

        .heading {
            text-align: center;
            color: Black;
            margin-bottom: 20px;
            font-size: 3em;
        }

        .container {
            max-width: 400px;
            width: 100%;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
            text-align: center;
            color: #333;
        }

        label {
            display: block;
            margin-bottom: 5px;
        }

        input[type="text"],
        input[type="password"] {
            width: 95%;
            padding: 10px;
            margin-bottom: 20px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        button {
            width: 100%;
            padding: 10px;
            background-color: #00008B;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        button:hover {
            background-color: #6495ED;
        }
    </style>
</head>
<body>
    <div class="heading">Attendance Marking System</div>
    <div class="container">
        <h1>Login</h1>
        <form action="/login" method="post">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <button type="submit">Login</button>
        </form>
        <br>
        <form action="/teacher-login" method="get">
            <button type="submit">Teacher Login</button>
        </form>
    </div>
</body>
</html>


    `);
  }
});

app.post('/login', (req, res) => {
  let { username, password } = req.body;
  username = username.toLowerCase(); // Convert the username to lowercase
  console.log(`Attempting to log in with username: ${username}, password: ${password}`);

  
  db.get('SELECT * FROM users WHERE LOWER(username) = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.send('An error occurred');
    }
    
    if (row) {
      req.session.username = username; // Store username in session
      res.redirect('/mark-attendance');
  } else {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Error</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: linear-gradient(180deg, white, #00008B); margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%;">
                <h4 style="color: Red; font-weight: bold; margin-bottom: 20px;">Invalid username or password</h4>
                <a href="/" style="display: inline-block; padding: 10px 20px; background-color: #00008B; color: white; text-decoration: none; border-radius: 4px;">Back to Login</a>
            </div>
        </body>
        </html>
      `);
  }
  
  });
});

app.get('/mark-attendance', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/');
  }

  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mark Attendance</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(180deg, white, #00008B); 
            margin: 0; 
            padding: 0; 
            min-height: 100vh; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
        }

        .container {
            text-align: center;
            background-color: rgba(255, 255, 255, 0.8);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h1 { 
            color: #333; 
            margin-bottom: 20px;
        }

        button { 
            padding: 10px 20px; 
            background-color: #00008B; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            margin-bottom: 20px;
        }

        button:hover { 
            background-color: #6495ED; 
        }

        a {
            text-decoration: none;
            color: #00008B;
            font-weight: bold;
        }

        a:hover {
            color: #6495ED;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Mark Attendance</h1>
        <form action="/mark-attendance" method="post">
            <button type="submit">Mark Attendance</button>
        </form>
        <a href="/logout">Logout</a>
    </div>
</body>
</html>

  `);
});

app.post('/mark-attendance', (req, res) => {
  const username = req.session.username;
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];
  
  console.log(`Attempting to mark attendance for username: ${username}, date: ${date}, time: ${time}`);

  // Check if the user has already marked attendance today
  db.get('SELECT * FROM attendance WHERE username = ? AND date = ?', [username, date], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.send('An error occurred');
    }
    
    if (row) {
      // User has already marked attendance for today
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Attendance Error</title>
        </head>
        <body style="font-family: Arial, sans-serif;  background: linear-gradient(180deg, white, #00008B); margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%;">
                <h4 style="color: Red; font-weight: bold; margin-bottom: 20px;">You have already marked your attendance for today.</h4>
                <a href="/logout" style="display: inline-block; padding: 10px 20px; background-color:#00008B; color: white; text-decoration: none; border-radius: 4px;">Logout</a>
            </div>
        </body>
        </html>
      `);
    } else {
      // User has not marked attendance for today, proceed with insertion
      db.run('INSERT INTO attendance (username, date, time) VALUES (?, ?, ?)', [username, date, time], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.send('Error marking attendance');
        } else {
          res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Attendance</title>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        font-family: Arial, sans-serif;
                        background: linear-gradient(180deg, white, #00008B);
                        padding: 0;
                        min-height: 100vh;
                    }
                    .container {
                        text-align: center;
                        padding: 20px;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #00008B;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>MARKED ATTENDANCE</h1>
                    <center><a href="/logout">Logout</a></center>
                </div>
            </body>
            </html>
          `);
        }
      });
    }
  });
});

app.get('/view-attendance', (req, res) => {
  if (!req.session.teacher && !req.session.username) {
    return res.redirect('/');
  }

  db.all('SELECT * FROM attendance', [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.send('Error retrieving attendance');
    } else {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>View Attendance</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: white; margin: 0; padding: 0; min-height: 100vh; }
              h1 { text-align: center; color: #333; }
              table { margin: 20px auto; border-collapse: collapse; width: 80%; }
              th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
              th { background-color: #00008B; color: white; }
              a { display: block; text-align: center; margin-top: 20px; color: Red; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>Attendance Records</h1>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Date</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(record => `
                        <tr>
                            <td>${record.username}</td>
                            <td>${record.date}</td>
                            <td>${record.time}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <a href="${req.session.teacher ? '/add-student' : '/mark-attendance'}">Back</a>
            <a href="/logout">Logout</a>
        </body>
        </html>
      `);
    }
  });
});


app.get('/teacher-login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teacher Login</title>
    <style>
        body {
        
            font-family: Arial, sans-serif;
            background: linear-gradient(180deg, white, #00008B);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            max-width: 400px;
            width: 100%;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin: 10px 0 5px;
            text-align: left;
        }
        input[type="text"], input[type="password"] {
            width: calc(100% - 22px);
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            width: 100%;
            padding: 10px;
            background-color: #00008B;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #6495ED;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Teacher Login</h1>
        <form action="/teacher-login" method="post">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>

  `);
});

app.post('/teacher-login', (req, res) => {
  let { username, password } = req.body;
  username = username.toLowerCase(); // Convert the username to lowercase
  
  // Simple check for a hardcoded teacher account
  if (username === 'teacher' && password === 'teacher123') {
    req.session.teacher = true; // Mark the session as a teacher session
    res.redirect('/add-student');
} else {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invalid Credentials</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(180deg, white, #00008B);
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                color: white;
            }

            .container {
                text-align: center;
                padding: 20px;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            }

            .container h1 {
                margin-bottom: 20px;
                font-size: 1.5em;
            }

            .container a {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #00008B;
                color: white;
                text-decoration: none;
                border-radius: 4px;
            }

            .container a:hover {
                background-color: #6495ED;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Invalid teacher credentials</h1>
            <a href="/teacher-login">Back to Login</a>
        </div>
    </body>
    </html>
    `);
}

});

app.get('/add-student-page', (req, res) => {
  if (!req.session.teacher) {
    return res.redirect('/teacher-login'); // Redirect to teacher login if not authenticated
  }

  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add New Student</title>
</head>
<body style="font-family: Arial, sans-serif; background:linear-gradient(180deg, white, #00008B); margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
    <div style="max-width: 500px; width: 100%; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center;">
        <h1 style="color: #333; margin-bottom: 20px;">Add New Student</h1>
        <form action="/add-student" method="post" style="margin-bottom: 20px;">
            <label for="new-username" style="display: block; margin-bottom: 10px; font-size: 16px; color: #555;">Username:</label>
            <input type="text" id="new-username" name="new-username" required style="width: calc(100% - 22px); padding: 10px; font-size: 16px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px;">
            <button type="submit" style="padding: 10px 20px; background-color: #00008B; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Add Student</button>
        </form>
        <a href="/add-student" style="display: inline-block; margin-top: 20px; text-decoration: none; color: Red; font-size: 16px;">Back</a>
    </div>
</body>
</html>

  `);
});

app.get('/add-student', (req, res) => {
  if (!req.session.teacher) {
    return res.redirect('/teacher-login'); // Redirect to teacher login if not authenticated
  }

  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teacher Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(180deg, white, #00008B);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            max-width: 600px;
            width: 100%;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        button {
            display: inline-block;
            padding: 10px 20px;
            margin: 10px;
            background-color: #00008B;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            text-decoration: none;
        }
        button:hover {
            background-color: #6495ED;
        }
        form {
            display: inline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Teacher Dashboard</h1><br>
        <a href="/add-student-page"><button>Add Student</button></a>
        <br>
        <form action="/refresh-attendance" method="post">
            <button type="submit">Refresh Attendance</button>
        </form>
        <br>
        <form action="/view-attendance" method="get">
            <button type="submit">View Attendance</button>
        </form>
        <br>
        <form action="/view-students" method="get">
            <button type="submit">View Students</button>
        </form>
        <br>
        <form action="/logout" method="get">
            <button type="submit">Logout</button>
        </form>
    </div>
</body>
</html>

  `);
});

const MAX_STUDENTS = 150; // Set your desired maximum number of students

app.post('/add-student', (req, res) => {
  if (!req.session.teacher) {
    return res.redirect('/teacher-login'); // Redirect to teacher login if not authenticated
  }

  const { 'new-username': newUsername } = req.body;

  if (!newUsername) {
    return res.send('Username is required.');
  }

  // Check if the new username already exists
  db.get('SELECT * FROM users WHERE username = ?', [newUsername], (err, row) => {
    if (err) {
        console.error('Database error:', err);
        return res.send('<div style="color: red; font-weight: bold;">Error checking username.</div>');
    }

    if (row) {
        return res.send(`
             <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invalid Credentials</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(180deg, white, #00008B);
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                color: white;
            }

            .container {
                text-align: center;
                padding: 20px;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            }

            .container h1 {
                margin-bottom: 20px;
                font-size: 1.5em;
            }

            .container a {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #00008B;
                color: white;
                text-decoration: none;
                border-radius: 4px;
            }

            .container a:hover {
                background-color: #6495ED;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Invalid teacher credentials</h1>
            <a href="/login">Back to Login</a>
        </div>
    </body>
    </html>
        `);
    }

    
});



    // Check if the maximum number of students is reached
    db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.send('Error checking student count.');
      }

      const count = row.count;
      if (count >= MAX_STUDENTS) {
        return res.send('The maximum number of students has been reached.');
      }

      // Add the new student to the database
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [newUsername, 'password123'], (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.send('Error adding student.');
        }
    
        res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Student Added</title>
          </head>
          <body style="font-family: Arial, sans-serif; background: linear-gradient(180deg, white, #00008B); margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
              <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%;">
                  <h4 style="color: #00008B; font-weight: bold; margin-bottom: 20px;">Student added successfully.</h4>
                  <a href="/add-student" style="display: inline-block; padding: 10px 20px; background-color: #00008B; color: white; text-decoration: none; border-radius: 4px;">Back</a>
              </div>
          </body>
          </html>
        `);
    });
    
    });
  });

app.post('/refresh-attendance', (req, res) => {
  if (!req.session.teacher) {
    return res.redirect('/teacher-login'); // Redirect to teacher login if not authenticated
  }

  db.run('DELETE FROM attendance', (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.send('Error refreshing attendance.');
    }
    res.send(`
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refresh Attendance</title>
</head>
<body style="font-family: Arial, sans-serif; background:  linear-gradient(180deg, white, #00008B); margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
    <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%;">
        <h4 style="color: #28a745; margin-bottom: 20px;">Attendance records refreshed successfully.</h4>
        <a href="/add-student" style="display: inline-block; padding: 10px 20px; background-color: #00008B; color: white; text-decoration: none; border-radius: 4px;">Back</a>
    </div>
</body>
</html>

    `);
  });
});

app.get('/view-students', (req, res) => {
  if (!req.session.teacher) {
    return res.redirect('/teacher-login'); // Redirect to teacher login if not authenticated
  }

  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.send('Error retrieving students.');
    } else {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>View Students</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color:  linear-gradient(180deg, white, #00008B);
                    margin: 0;
                    padding: 0;
                }
                h1 {
                    color: #333;
                    text-align: center;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #00008B;
                    color: white;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                tr:hover {
                    background-color: #6485ED;
                }
                a {
                    display: inline-block;
                    margin: 20px auto;
                    padding: 10px 20px;
                    color: white;
                    background-color:#00008B;
                    text-decoration: none;
                    border-radius: 4px;
                }
                a:hover {
                    background-color: #6405ED;
                }
            </style>
        </head>
        <body>
            <h1>Student Records</h1>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(record => `
                        <tr>
                            <td>${record.username}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <a href="/add-student">Back</a>
        </body>
        </html>
      `);
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Error logging out');
    }
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
