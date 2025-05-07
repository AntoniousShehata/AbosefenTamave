
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app = express(); 
const PORT = 5000;

app.use(cors());
app.use(express.json());

const config = {
  user: 'sa',
  password: 'Tmahereswd123.',
  server: 'localhost',
  port: 55752,
  database: 'Abosefen',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};


app.get('/api/products', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().execute('dbo.Total_item_desc_Website');
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).send('Database error');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
