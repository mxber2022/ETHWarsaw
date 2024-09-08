const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5001; // Port for Express server

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'svc-375-u22133.vm.elestio.app',
  user: 'root',
  password: '480ZWyAu-Cggq-SQZTFgnf',
  database: 'mysql',
  port: 24306 // Custom port for MySQL
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all origins

// Route to create the FeedbackTable if it doesn't exist
app.get('/api/create-table', (req, res) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS FeedbackTable (
      id INT AUTO_INCREMENT PRIMARY KEY,
      Message TEXT NOT NULL,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  connection.query(createTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating table:', err);
      return res.status(500).json({ message: 'Error creating table' });
    }

    res.status(200).json({ message: 'Table created successfully' });
  });
});

// Route to handle POST request for feedback
app.post('/api/feedback', (req, res) => {
  const { feedback } = req.body;

  if (!feedback) {
    return res.status(400).json({ message: 'Feedback is required' });
  }

  const query = 'INSERT INTO FeedbackTable (Message) VALUES (?)';
  connection.query(query, [feedback], (err, results) => {
    if (err) {
      console.error('Error inserting feedback:', err);
      return res.status(500).json({ message: 'Error submitting feedback' });
    }

    res.status(200).json({ message: 'Feedback submitted successfully' });
  });
});

// Route to fetch all feedback
app.get('/api/feedback', (req, res) => {
  const query = 'SELECT * FROM FeedbackTable ORDER BY CreatedAt DESC';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching feedback:', err);
      return res.status(500).json({ message: 'Error fetching feedback' });
    }

    res.status(200).json(results);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Express server is running on http://localhost:${port}`);
});

// Handle server termination
process.on('SIGINT', () => {
  connection.end(err => {
    if (err) {
      console.error('Error closing the database connection:', err);
    }
    process.exit();
  });
});
