const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Explicitly serve all static files from current directory
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (filePath.endsWith('.js') && !filePath.endsWith('server.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

/**
 * POST /api/simulate
 */
app.post('/api/simulate', (req, res) => {
  const { decision, pros, cons } = req.body;

  if (!decision || !pros || !cons) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const proScore = pros.reduce((sum, p) => sum + (p.weight * p.certainty), 0);
  const conScore = cons.reduce((sum, c) => sum + (c.weight * c.certainty), 0);
  const totalFactors = pros.length + cons.length;
  const totalPossible = totalFactors * 10 * 10;
  const rawScore = totalPossible > 0 ? ((proScore - conScore) / totalPossible) * 100 : 0;
  const successProbability = Math.round(Math.max(0, Math.min(100, (rawScore + 100) / 2)));

  let verdict;
  if (rawScore > 40)       verdict = 'Strongly Recommended';
  else if (rawScore > 10)  verdict = 'Likely Positive';
  else if (rawScore > -10) verdict = 'Proceed with Caution';
  else if (rawScore > -40) verdict = 'Not Recommended';
  else                     verdict = 'High Risk';

  const riskyCons = cons.map(c => ({
    text: c.text,
    riskScore: c.weight * c.certainty,
    weight: c.weight,
    certainty: c.certainty
  })).sort((a, b) => b.riskScore - a.riskScore);

  res.json({ decision, proScore, conScore, rawScore: Math.round(rawScore), successProbability, verdict, riskyCons, pros, cons });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 NeuralDecide running at http://localhost:${PORT}\n`);
});
