// server.js
// Node.js + Express minimal: POST /api/messages untuk menyimpan
// GET /api/messages untuk mengambil semua
// Menyimpan data ke data.json di folder yang sama

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 3000;

// helper: baca file, buat jika tidak ada
function readData(){
  try {
    if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([],{space:2}));
    const raw = fs.readFileSync(DATA_FILE,'utf8');
    return JSON.parse(raw || '[]');
  } catch(e){
    console.error('Error membaca data file', e);
    return [];
  }
}

function writeData(arr){
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
    return true;
  } catch(e){
    console.error('Error menulis data file', e);
    return false;
  }
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // optional: serve frontend dari /public

// CORS ringan jika frontend di host terpisah saat dev
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ambil semua pesan
app.get('/api/messages', (req,res)=>{
  const data = readData();
  res.json({ok:true, messages: data});
});

// simpan pesan baru
app.post('/api/messages', (req,res)=>{
  const {text} = req.body || {};
  if(!text || typeof text !== 'string' || !text.trim()){
    return res.status(400).json({ok:false, error:'text is required'});
  }
  const trimmed = text.trim();
  const data = readData();
  const item = {id: Date.now(), text: trimmed, createdAt: new Date().toISOString()};
  data.push(item);
  const ok = writeData(data);
  if(!ok) return res.status(500).json({ok:false, error:'failed to save'});
  res.status(201).json({ok:true, message: item});
});

// opsi: hapus semua (untuk development)
app.delete('/api/messages', (req,res)=>{
  const ok = writeData([]);
  if(!ok) return res.status(500).json({ok:false});
  res.json({ok:true});
});

app.listen(PORT, ()=> console.log(`API server running at http://localhost:${PORT}`));
