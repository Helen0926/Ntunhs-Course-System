const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbconfig = {
    server: 'LAPTOP-H7A9T5IQ\\MSSQLSERVER02',
    database: 'course',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
};

// ----------------------------------------------------
// 新增：存取權限控制中介軟體 (Authorization Middleware)
// ----------------------------------------------------
const authorizeAdmin = (req, res, next) => {
    // 這裡我們假設前端會在請求的 Headers 中傳入 'X-User-Role'
    // 在實際應用中，通常會使用 JWT (JSON Web Token)
    const userRole = req.headers['x-user-role'];

    if (userRole === 'admin') {
        next(); // 如果是 'admin'，則繼續執行下一個函式
    } else {
        // 如果不是 'admin'，則返回 403 Forbidden 錯誤
        res.status(403).send('存取被拒絕：需要管理者權限');
    }
};

// ====================================================
// ===== 測試首頁 =====
app.get('/', (req, res) => {
    res.send('歡迎來到課程查詢API');
});

// ====================================================
// ===== 登入 API =====
// 修正：現在登入成功後會回傳使用者的角色
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect(dbconfig);
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .query('SELECT role FROM Users WHERE Username = @username AND Password = @password');

        if (result.recordset.length > 0) {
            // 成功時回傳角色
            const role = result.recordset[0].role;
            res.json({ success: true, message: '登入成功', role: role });
        } else {
            res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
        }
    } catch (err) {
        res.status(500).send('登入錯誤: ' + err);
    }
});

// ====================================================
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

// ====================================================
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

// ====================================================
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

// ----------------------------------------------------
// 新增：管理者專用 CRUD API for Courses
// 這些 API 都受 authorizeAdmin 中介軟體保護
// ----------------------------------------------------

// ===== 新增課程 =====
app.post('/api/admin/courses', authorizeAdmin, async (req, res) => {
    const { name, description, instructor } = req.body;
    try {
        const pool = await sql.connect(dbconfig);
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description)
            .input('instructor', sql.NVarChar, instructor)
            .query('INSERT INTO [dbo].[課程查詢$] ([科目中文名稱], [課程描述], [主開課教師姓名]) VALUES (@name, @description, @instructor)');
        res.status(201).json({ success: true, message: '課程新增成功' });
    } catch (err) {
        res.status(500).send('新增課程錯誤: ' + err);
    }
});

// ===== 修改課程 =====
app.put('/api/admin/courses/:id', authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, instructor } = req.body;
    try {
        const pool = await sql.connect(dbconfig);
        const result = await pool.request()
            .input('id', sql.NVarChar, id)
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description)
            .input('instructor', sql.NVarChar, instructor)
            .query('UPDATE [dbo].[課程查詢$] SET [科目中文名稱]=@name, [課程描述]=@description, [主開課教師姓名]=@instructor WHERE [課程ID]=@id');

        if (result.rowsAffected[0] > 0) {
            res.json({ success: true, message: '課程修改成功' });
        } else {
            res.status(404).json({ success: false, message: '找不到要修改的課程' });
        }
    } catch (err) {
        res.status(500).send('修改課程錯誤: ' + err);
    }
});

// ===== 刪除課程 =====
app.delete('/api/admin/courses/:id', authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbconfig);
        const result = await pool.request()
            .input('id', sql.NVarChar, id)
            .query('DELETE FROM [dbo].[課程查詢$] WHERE [課程ID]=@id');

        if (result.rowsAffected[0] > 0) {
            res.json({ success: true, message: '課程刪除成功' });
        } else {
            res.status(404).json({ success: false, message: '找不到要刪除的課程' });
        }
    } catch (err) {
        res.status(500).send('刪除課程錯誤: ' + err);
    }
});

// ====================================================
// ===== 啟動伺服器 =====
app.listen(8000, '192.168.66.27', () => {
    console.log('後端伺服器啟動於 http://192.168.66.27:8000');
});
