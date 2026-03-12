const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API route
app.post('/api/simulate', (req, res) => {
  const { decision, pros, cons } = req.body;
  if (!decision || !pros || !cons) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const proScore = pros.reduce((sum, p) => sum + (p.weight * p.certainty), 0);
  const conScore = cons.reduce((sum, c) => sum + (c.weight * c.certainty), 0);
  const totalPossible = (pros.length + cons.length) * 10 * 10;
  const rawScore = totalPossible > 0 ? ((proScore - conScore) / totalPossible) * 100 : 0;
  const successProbability = Math.round(Math.max(0, Math.min(100, (rawScore + 100) / 2)));
  let verdict;
  if (rawScore > 40)       verdict = 'Strongly Recommended';
  else if (rawScore > 10)  verdict = 'Likely Positive';
  else if (rawScore > -10) verdict = 'Proceed with Caution';
  else if (rawScore > -40) verdict = 'Not Recommended';
  else                     verdict = 'High Risk';
  const riskyCons = cons.map(c => ({ text: c.text, riskScore: c.weight * c.certainty, weight: c.weight, certainty: c.certainty }))
    .sort((a, b) => b.riskScore - a.riskScore);
  res.json({ decision, proScore, conScore, rawScore: Math.round(rawScore), successProbability, verdict, riskyCons, pros, cons });
});

// Explicit page routes
app.get('/',               (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html',     (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/simulator.html', (req, res) => res.sendFile(path.join(__dirname, 'simulator.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/about.html',     (req, res) => res.sendFile(path.join(__dirname, 'about.html')));
app.get('/contact.html',   (req, res) => res.sendFile(path.join(__dirname, 'contact.html')));
app.get('/services.html',  (req, res) => res.sendFile(path.join(__dirname, 'services.html')));
app.get('/landing.html',   (req, res) => res.sendFile(path.join(__dirname, 'landing.html')));
app.get('/shared.css',     (req, res) => res.sendFile(path.join(__dirname, 'shared.css')));

// 404 fallback
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '404.html')));

app.listen(PORT, () => console.log(`🚀 NeuralDecide running at http://localhost:${PORT}`));
