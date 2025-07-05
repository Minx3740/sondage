const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');
const VALIDATED_FILE = path.join(__dirname, 'validated.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // pour servir index.html/admin.html

// Utilitaires pour lire/écrire les fichiers
function readData(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}
function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Enregistrer une réponse (en attente de validation)
app.post('/api/reponse', (req, res) => {
  const data = readData(DATA_FILE);
  data.push(req.body);
  writeData(DATA_FILE, data);
  res.json({ ok: true });
});

// Récupérer toutes les réponses en attente
app.get('/api/reponses', (req, res) => {
  res.json(readData(DATA_FILE));
});

// Récupérer toutes les réponses validées
app.get('/api/reponsesValidees', (req, res) => {
  res.json(readData(VALIDATED_FILE));
});

// Valider une réponse (déplacer de data.json vers validated.json)
app.post('/api/valider/:id', (req, res) => {
  let data = readData(DATA_FILE);
  let validated = readData(VALIDATED_FILE);
  const idx = parseInt(req.params.id, 10);
  if (data[idx]) {
    validated.push(data[idx]);
    data.splice(idx, 1);
    writeData(DATA_FILE, data);
    writeData(VALIDATED_FILE, validated);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Supprimer une réponse en attente
app.delete('/api/supprimer/:id', (req, res) => {
  let data = readData(DATA_FILE);
  const idx = parseInt(req.params.id, 10);
  if (data[idx]) {
    data.splice(idx, 1);
    writeData(DATA_FILE, data);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
app.delete('/api/reset', (req, res) => {
  writeData(DATA_FILE, []);
  writeData(VALIDATED_FILE, []);
  res.status(200).send({ message: 'Données réinitialisées' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('Serveur démarré sur http://localhost:' + PORT);
});