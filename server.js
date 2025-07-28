const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json()); // 用來接收 POST 傳來的 JSON

const dbconfig = {
  server: 'LAPTOP-H7A9T5IQ\\MSSQLSERVER02',
  database: 'course',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true
  }
};

// ===== 測試首頁 =====
app.get('/', (req, res) => {
  res.send('歡迎來到課程查詢API');
});

// ===== 登入 API =====
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await sql.connect(dbconfig);
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .query('SELECT * FROM Users WHERE Username = @username AND Password = @password');

    if (result.recordset.length > 0) {
      res.json({ success: true, message: '登入成功' });
    } else {
      res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
    }
  } catch (err) {
    res.status(500).send('登入錯誤: ' + err);
  }
});

// ===== 取得所有學期 =====
app.get('/api/semesters', async (req, res) => {
  try {
    const pool = await sql.connect(dbconfig);
    const result = await pool.request().query('SELECT DISTINCT [學期] FROM [dbo].[課程查詢$] ORDER BY [學期] DESC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('錯誤: ' + err);
  }
});

// ===== 取得所有系所代碼 =====
app.get('/api/departments', async (req, res) => {
  try {
    const pool = await sql.connect(dbconfig);
    const result = await pool.request().query('SELECT DISTINCT [系所代碼] FROM [dbo].[課程查詢$] ORDER BY [系所代碼]');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('錯誤: ' + err);
  }
});

// ===== 查詢課程資料 =====
app.get('/api/courses', async (req, res) => {
  try {
    const pool = await sql.connect(dbconfig);
    const { semester, department, grade, keyword } = req.query;

    let query = 'SELECT * FROM [dbo].[課程查詢$] WHERE 1=1';
    const request = pool.request();

    if (semester) {
      query += ' AND [學期] = @semester';
      request.input('semester', sql.NVarChar, semester);
    }

    if (department) {
      const departmentList = department.split(',');
      const deptParams = departmentList.map((_, i) => `@dept${i}`).join(', ');
      query += ` AND [系所代碼] IN (${deptParams})`;
      departmentList.forEach((code, i) => {
        request.input(`dept${i}`, sql.NVarChar, code);
      });
    }

    if (grade) {
      const grades = typeof grade === 'string' ? grade.split(',') : [grade];
      const gradeParams = grades.map((_, i) => `@grade${i}`).join(', ');
      query += ` AND [年級] IN (${gradeParams})`;
      grades.forEach((g, i) => {
        request.input(`grade${i}`, sql.NVarChar, g);
      });
    }

    if (keyword) {
      query += ' AND ([科目中文名稱] LIKE @keyword OR [主開課教師姓名] LIKE @keyword)';
      request.input('keyword', sql.NVarChar, `%${keyword}%`);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('錯誤: ' + err);
  }
});

// ===== 啟動伺服器 =====
app.listen(8000, '192.168.66.27',() => {
  console.log('後端伺服器啟動於 http://192.168.66.27:8000');
});
