import express from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('dist'));

// Helper function to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Simple session management (in-memory for demo)
const sessions = new Map();

// Auth middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const sessionToken = authHeader.slice(7);
  const userId = sessions.get(sessionToken);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.userId = userId;
  next();
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword(password),
      },
    });
    
    res.status(201).json({ 
      id: user.id, 
      email: user.email 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const sessionToken = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionToken, user.id);
    
    res.json({ 
      token: sessionToken,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const sessionToken = authHeader.slice(7);
    sessions.delete(sessionToken);
  }
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Daily tip route (deterministic based on day of week)
app.get('/api/tips/daily', async (req, res) => {
  try {
    const dayOfWeek = new Date().getDay();
    const tip = await prisma.tip.findFirst({
      where: { dayOfWeek }
    });
    
    if (!tip) {
      return res.status(404).json({ error: 'Tip not found' });
    }
    
    res.json({ tip: tip.tip, dayOfWeek: tip.dayOfWeek });
  } catch (error) {
    console.error('Tip error:', error);
    res.status(500).json({ error: 'Failed to fetch tip' });
  }
});

// Workout routes (protected)
app.get('/api/workouts', authenticate, async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' }
    });
    res.json(workouts);
  } catch (error) {
    console.error('Fetch workouts error:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

app.post('/api/workouts', authenticate, async (req, res) => {
  try {
    const { type, duration, distance, date, notes } = req.body;
    
    if (!type || !duration) {
      return res.status(400).json({ error: 'Type and duration required' });
    }
    
    const workout = await prisma.workout.create({
      data: {
        userId: req.userId,
        type,
        duration: parseInt(duration),
        distance: distance ? parseFloat(distance) : null,
        date: date ? new Date(date) : new Date(),
        notes
      }
    });
    
    res.status(201).json(workout);
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
});

app.put('/api/workouts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, duration, distance, date, notes } = req.body;
    
    // Verify workout belongs to user
    const existing = await prisma.workout.findFirst({
      where: { id: parseInt(id), userId: req.userId }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    const workout = await prisma.workout.update({
      where: { id: parseInt(id) },
      data: {
        type,
        duration: parseInt(duration),
        distance: distance ? parseFloat(distance) : null,
        date: date ? new Date(date) : existing.date,
        notes
      }
    });
    
    res.json(workout);
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ error: 'Failed to update workout' });
  }
});

app.delete('/api/workouts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify workout belongs to user
    const existing = await prisma.workout.findFirst({
      where: { id: parseInt(id), userId: req.userId }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    await prisma.workout.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

// Serve React app for all non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});