require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();

// ดึงค่าจาก .env ผ่าน process.env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ... โค้ดส่วนอื่นๆ เหมือนเดิม ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);

app.use(express.json());
app.use(express.static('public'));

// API ดึงข้อมูล
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses ORDER BY created_at DESC',
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API บันทึกข้อมูล
app.post('/api/expenses', async (req, res) => {
  const { title, amount, category } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO expenses (title, amount, category) VALUES ($1, $2, $3) RETURNING *',
      [title, amount, category],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API สำหรับลบข้อมูลตาม ID
app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    res.json({ message: 'ลบรายการสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);
