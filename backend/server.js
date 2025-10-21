const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your-secret-key'; // In production, use environment variable

app.use(cors());
app.use(bodyParser.json());

// Data files
const usersFile = path.join(__dirname, 'users.json');
const requestsFile = path.join(__dirname, 'requests.json');

// Helper functions
const readData = (file) => {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  const { username, password, email, role = 'user' } = req.body;
  const users = readData(usersFile);

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now(), username, password: hashedPassword, email, role };
  users.push(newUser);
  writeData(usersFile, users);

  res.status(201).json({ message: 'User created successfully' });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const users = readData(usersFile);
  const user = users.find(u => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

app.get('/api/auth/verify', verifyToken, (req, res) => {
  const users = readData(usersFile);
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: { id: user.id, username: user.username, role: user.role } });
});

// Request routes
app.post('/api/requests', verifyToken, (req, res) => {
  const { title, description, priority, category, department } = req.body;
  const requests = readData(requestsFile);
  const newRequest = {
    id: Date.now(),
    userId: req.user.id,
    title,
    description,
    priority,
    category,
    department,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  requests.push(newRequest);
  writeData(requestsFile, requests);
  res.status(201).json(newRequest);
});

app.get('/api/requests', verifyToken, (req, res) => {
  const requests = readData(requestsFile);
  const userRequests = requests.filter(r => r.userId === req.user.id);
  res.json(userRequests);
});

app.put('/api/requests/:id', verifyToken, (req, res) => {
  const { status } = req.body;
  const requests = readData(requestsFile);
  const request = requests.find(r => r.id == req.params.id && r.userId === req.user.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  request.status = status;
  writeData(requestsFile, requests);
  res.json(request);
});

// Admin routes
app.get('/api/admin/requests', verifyToken, isAdmin, (req, res) => {
  const requests = readData(requestsFile);
  const users = readData(usersFile);
  const requestsWithUsers = requests.map(request => ({
    ...request,
    user: users.find(u => u.id === request.userId)
  }));
  res.json(requestsWithUsers);
});

app.put('/api/admin/requests/:id', verifyToken, isAdmin, (req, res) => {
  const { status } = req.body;
  const requests = readData(requestsFile);
  const request = requests.find(r => r.id == req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  request.status = status;
  writeData(requestsFile, requests);
  res.json(request);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
