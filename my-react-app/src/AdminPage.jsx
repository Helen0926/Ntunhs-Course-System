import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, GraduationCap, Calendar, MapPin, Clock, User, 
  Plus, Edit, Trash2, Save, X, Settings, Database 
} from 'lucide-react';

const departmentMap = {
  '11120':'護理系(二技)',
  '11140':'護理系(四技)',
  '11230':'護理系(二技進修部日間班)',
  '11330':'護理系(二技進修部夜間班)',
  '13140':'高照系',
  '1C120':'護理助產及婦女健康系(二技)',
  '1C330':'護理助產及婦女健康系(二技進修部)',
  '1D120':'醫護教育暨數位學習系',
  '21120':'健管系(二技)',
  '21140':'健管系(四技)',
  '21130':'健管系(二技進修部)',
  '22140':'資管系',
  '23140':'休健系',
  '24120':'長照系(二技)',
  '25140':'語聽系',
  '31120':'幼保系(二技)',
  '31140':'幼保系(四技)',
  '32140':'運保系',
  '33140':'生死與健康心理諮商系',
  '41140':'高齡與運動健康暨嬰幼兒保育技優專班',
  '42140':'智慧健康科技技優專班'
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('view'); // 'view' | 'manage'
  const [semester, setSemester] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grade, setGrade] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 管理功能相關狀態
  const [editingCourse, setEditingCourse] = useState(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    科目中文名稱: '',
    學分數: '',
    主開課教師姓名: '',
    課別名稱: '',
    年級: '',
    上課地點: '',
    上課星期: '',
    上課節次: '',
    學期: '',
    系所代碼: ''
  });

  useEffect(() => {
    fetch('http://192.168.66.27:8000/api/semesters')
      .then(res => res.json())
      .then(data => {
        const sems = data.map(item => String(item.學期));
        setSemesters(sems);
      })
      .catch(err => console.error("Error fetching semesters:", err));

    fetch('http://192.168.66.27:8000/api/departments')
      .then(res => res.json())
      .then(data => {
        const deps = data.map(item => String(item.系所代碼));
        const filteredDeps = deps.filter(d => departmentMap[d]);
        setDepartments(filteredDeps);
      })
      .catch(err => console.error("Error fetching departments:", err));
  }, []);

  const handleDepartmentChange = (code) => {
    setSelectedDepartments(prev =>
      prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code]
    );
  };

  const handleGradeChange = (e) => {
    const value = e.target.value;
    setGrade(prev =>
      prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
    );
  };

  const formatSemesterDisplay = (semCode) => {
    if (!semCode) return '';
    const year = semCode.substring(0, 3);
    const term = semCode.substring(3, 4);
    if (term === '1') {
      return `${year}上`;
    } else if (term === '2') {
      return `${year}下`;
    }
    return semCode;
  };

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        semester,
        department: selectedDepartments.join(','),
        grade: grade.join(','),
        keyword,
      }).toString();

      const res = await fetch(`http://192.168.66.27:8000/api/courses?${query}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error('Fetch error:', err);
      alert('查詢失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 新增課程
  const handleAddCourse = async () => {
    try {
      const res = await fetch('http://192.168.66.27:8000/api/admin/courses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Role': 'admin' // 加入管理者權限標頭
        },
        body: JSON.stringify({
          name: newCourse.科目中文名稱,
          description: newCourse.課別名稱,
          instructor: newCourse.主開課教師姓名
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        alert('課程新增成功！');
        setIsAddingCourse(false);
        setNewCourse({
          科目中文名稱: '',
          學分數: '',
          主開課教師姓名: '',
          課別名稱: '',
          年級: '',
          上課地點: '',
          上課星期: '',
          上課節次: '',
          學期: '',
          系所代碼: ''
        });
        fetchCourses(); // 重新載入課程清單
      } else {
        alert(data.message || '新增失敗');
      }
    } catch (err) {
      console.error('Add course error:', err);
      alert('新增失敗，請稍後再試');
    }
  };

  // 修改課程
  const handleUpdateCourse = async (courseId) => {
    try {
      const res = await fetch(`http://192.168.66.27:8000/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Role': 'admin'
        },
        body: JSON.stringify({
          name: editingCourse.科目中文名稱,
          description: editingCourse.課別名稱,
          instructor: editingCourse.主開課教師姓名
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        alert('課程修改成功！');
        setEditingCourse(null);
        fetchCourses();
      } else {
        alert(data.message || '修改失敗');
      }
    } catch (err) {
      console.error('Update course error:', err);
      alert('修改失敗，請稍後再試');
    }
  };

  // 刪除課程
  const handleDeleteCourse = async (courseId, courseName) => {
    if (!confirm(`確定要刪除課程「${courseName}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      const res = await fetch(`http://192.168.66.27:8000/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 
          'X-User-Role': 'admin'
        }
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        alert('課程刪除成功！');
        fetchCourses();
      } else {
        alert(data.message || '刪除失敗');
      }
    } catch (err) {
      console.error('Delete course error:', err);
      alert('刪除失敗，請稍後再試');
    }
  };

  // --- 樣式定義 ---
  const containerStyle = {
    backgroundColor: '#f0f4f8',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: 'Inter, sans-serif',
    color: '#333',
    display: 'flex',
    justifyContent: 'center',
    width: '100vw',
    boxSizing: 'border-box',
  };

  const mainContentWrapperStyle = {
    maxWidth: '1400px',
    width: '100%',
    backgroundColor: '#fff',
    padding: '30px 40px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  };

  const tabsStyle = {
    display: 'flex',
    gap: '5px',
    borderBottom: '2px solid #e0e7ee',
    marginBottom: '20px',
  };

  const tabStyle = {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.2s',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
  };

  const sectionTitleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '15px',
  };

  const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: '#f8fafd',
    border: '1px solid #e0e7ee',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
  };

  const selectStyle = {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #cce0f0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    fontSize: '1rem',
    color: '#333',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 15px center',
    backgroundSize: '1em',
    cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const buttonStyle = {
    padding: '12px 25px',
    background: 'linear-gradient(45deg, #3b82f6, #4f46e5)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    transition: 'all 0.2s',
  };

  const addButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(45deg, #10b981, #059669)',
    marginBottom: '20px',
  };

  const editButtonStyle = {
    padding: '6px 12px',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.8rem',
    transition: 'background-color 0.2s',
  };

  const deleteButtonStyle = {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.8rem',
    transition: 'background-color 0.2s',
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: 'min(90%, 600px)',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
  };

  const ViewCoursesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* 篩選欄區塊 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {/* 學期選擇 */}
        <div style={filterGroupStyle}>
          <div style={sectionTitleStyle}>
            <Calendar size={20} color="#3b82f6" />
            <span>學期選擇</span>
          </div>
          <select
            value={semester}
            onChange={e => setSemester(e.target.value)}
            style={selectStyle}
          >
            <option value="">請選擇學期</option>
            {semesters.map((s, i) => (
              <option key={i} value={s}>{formatSemesterDisplay(s)}</option>
            ))}
          </select>
        </div>

        {/* 系所選擇 */}
        <div style={filterGroupStyle}>
          <div style={sectionTitleStyle}>
            <BookOpen size={20} color="#10b981" />
            <span>系所選擇</span>
            {selectedDepartments.length > 0 && (
              <span style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '600' }}>
                已選 {selectedDepartments.length} 個
              </span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', maxHeight: '200px', overflowY: 'auto', padding: '10px', borderRadius: '8px', border: '1px solid #e0e7ee', backgroundColor: '#fff' }}>
            {departments.map((d, i) => (
              <label key={i} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#e6f0fa',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontSize: '0.95rem',
                color: '#333',
                border: '1px solid #cce0f0',
              }}>
                <input
                  type="checkbox"
                  value={d}
                  checked={selectedDepartments.includes(d)}
                  onChange={() => handleDepartmentChange(d)}
                  style={{ marginRight: '8px', width: '18px', height: '18px', accentColor: '#3b82f6' }}
                />
                {departmentMap[d]}
              </label>
            ))}
          </div>
        </div>

        {/* 年級選擇 */}
        <div style={filterGroupStyle}>
          <div style={sectionTitleStyle}>
            <GraduationCap size={20} color="#8b5cf6" />
            <span>年級選擇</span>
            {grade.length > 0 && (
              <span style={{ backgroundColor: '#ede9fe', color: '#7c3aed', padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '600' }}>
                已選 {grade.join(', ')} 年級
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[1, 2, 3, 4].map((g) => (
              <label key={g} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#e6f0fa',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                color: '#333',
                border: '1px solid #cce0f0',
              }}>
                <input
                  type="checkbox"
                  value={String(g)}
                  checked={grade.includes(String(g))}
                  onChange={handleGradeChange}
                  style={{ marginRight: '8px', width: '18px', height: '18px', accentColor: '#3b82f6' }}
                />
                {g}年級
              </label>
            ))}
          </div>
        </div>

        {/* 關鍵字搜尋與搜尋按鈕 */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flexGrow: 1, minWidth: '250px', position: 'relative' }}>
            <div style={sectionTitleStyle}>
              <Search size={20} color="#f59e0b" />
              <span>關鍵字搜尋</span>
            </div>
            <input
              type="text"
              placeholder="輸入課程名稱或教師姓名..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 15px 12px 45px',
                border: '1px solid #cce0f0',
                borderRadius: '8px',
                backgroundColor: '#fff',
                fontSize: '1rem',
                color: '#333',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
              }}
            />
            <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <button
            onClick={fetchCourses}
            disabled={isLoading}
            style={isLoading ? { ...buttonStyle, opacity: 0.6, cursor: 'not-allowed' } : buttonStyle}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px', height: '20px', border: '2px solid #ffffff', borderTop: '2px solid transparent',
                  borderRadius: '50%', animation: 'spin 1s linear infinite'
                }}></div>
                搜尋中...
              </>
            ) : (
              <>
                <Search size={20} />
                搜尋
              </>
            )}
          </button>
        </div>
      </div>

      {/* 搜尋結果表格 */}
      <div style={{
        overflowX: 'auto',
        borderRadius: '12px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e0e7ee',
        backgroundColor: '#fff',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#e6f0fa', borderBottom: '2px solid #cce0f0' }}>
            <tr>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><BookOpen size={16} color="#3b82f6" />課程名稱</div>
              </th>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333', whiteSpace: 'nowrap' }}>學分</th>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={16} color="#10b981" />教師</div>
              </th>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333', whiteSpace: 'nowrap' }}>課別</th>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333', whiteSpace: 'nowrap' }}>年級</th>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} color="#ef4444" />地點</div>
              </th>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={16} color="#8b5cf6" />星期</div>
              </th>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={16} color="#f59e0b" />節次</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e0e0e0', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '12px 10px', fontSize: '0.9rem', color: '#1f2937', fontWeight: '500' }}>{course['科目中文名稱']}</td>
                  <td style={{ padding: '12px 10px', fontSize: '0.9rem', color: '#555' }}>
                    <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#dbeafe', color: '#2563eb' }}>
                      {course['學分數']}學分
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', fontSize: '0.9rem', color: '#555' }}>{course['主開課教師姓名']}</td>
                  <td style={{ padding: '12px 10px', fontSize: '0.9rem', color: '#555' }}>
                    <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#d1fae5', color: '#047857' }}>
                      {course['課別名稱']}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', fontSize: '0.9rem', color: '#555' }}>
                    <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                      {course['年級']}年級
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', fontSize: '0.9rem', color: '#555' }}>{course['上課地點']}</td>
                  <td style={{ padding: '12px 10px', fontSize: '0.9rem', color: '#555' }}>{course['上課星期']}</td>
                  <td style={{ padding: '12px 10px', fontSize: '0.9rem', color: '#555' }}>{course['上課節次']}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#777', fontSize: '1.1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={{ backgroundColor: '#e0e7ee', padding: '20px', borderRadius: '50%' }}>
                      <Search size={48} color="#9ca3af" />
                    </div>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500', color: '#666' }}>尚無查詢結果</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>請選擇搜尋條件後點擊「搜尋」按鈕</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ManageCoursesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* 新增課程按鈕 */}
      <button
        onClick={() => setIsAddingCourse(true)}
        style={addButtonStyle}
      >
        <Plus size={20} />
        新增課程
      </button>

      {/* 課程管理表格 */}
      <div style={{
        overflowX: 'auto',
        borderRadius: '12px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e0e7ee',
        backgroundColor: '#fff',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#e6f0fa', borderBottom: '2px solid #cce0f0' }}>
            <tr>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333' }}>課程名稱</th>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333' }}>教師</th>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333' }}>課別</th>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333' }}>學分</th>
              <th style={{ padding: '15px 10px', fontSize: '0.9rem', fontWeight: '700', color: '#333' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  {editingCourse && editingCourse.課程ID === course.課程ID ? (
                    // 編輯模式
                    <>
                      <td style={{ padding: '12px 10px' }}>
                        <input
                          type="text"
                          value={editingCourse.科目中文名稱}
                          onChange={(e) => setEditingCourse({...editingCourse, 科目中文名稱: e.target.value})}
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <input
                          type="text"
                          value={editingCourse.主開課教師姓名}
                          onChange={(e) => setEditingCourse({...editingCourse, 主開課教師姓名: e.target.value})}
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <input
                          type="text"
                          value={editingCourse.課別名稱}
                          onChange={(e) => setEditingCourse({...editingCourse, 課別名稱: e.target.value})}
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '12px 10px' }}>{course['學分數']}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={() => handleUpdateCourse(course.課程ID)}
                            style={{ ...editButtonStyle, backgroundColor: '#10b981' }}
                          >
                            <Save size={14} />
                            儲存
                          </button>
                          <button
                            onClick={() => setEditingCourse(null)}
                            style={{ ...deleteButtonStyle, backgroundColor: '#6b7280' }}
                          >
                            <X size={14} />
                            取消
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // 檢視模式
                    <>
                      <td style={{ padding: '12px 10px', fontSize: '0.9rem', fontWeight: '500' }}>{course['科目中文名稱']}</td>
                      <td style={{ padding: '12px 10px', fontSize: '0.9rem' }}>{course['主開課教師姓名']}</td>
                      <td style={{ padding: '12px 10px', fontSize: '0.9rem' }}>{course['課別名稱']}</td>
                      <td style={{ padding: '12px 10px', fontSize: '0.9rem' }}>{course['學分數']}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={() => setEditingCourse(course)}
                            style={editButtonStyle}
                          >
                            <Edit size={14} />
                            編輯
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.課程ID, course['科目中文名稱'])}
                            style={deleteButtonStyle}
                          >
                            <Trash2 size={14} />
                            刪除
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#777', fontSize: '1.1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={{ backgroundColor: '#e0e7ee', padding: '20px', borderRadius: '50%' }}>
                      <Database size={48} color="#9ca3af" />
                    </div>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500', color: '#666' }}>尚無課程資料</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>請先搜尋課程或新增課程</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={mainContentWrapperStyle}>
        {/* 標題區塊 */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/National_Taipei_University_of_Nursing_and_Health_Science_logo.jpg/330px-National_Taipei_University_of_Nursing_and_Health_Science_logo.jpg"
            alt="國立臺北護理健康大學校徽"
            style={{
              height: '80px',
              width: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/ffffff?text=Logo'; }}
          />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(45deg, #3b82f6, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              管理者控制台
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: '5px 0 0 0' }}>課程管理系統</p>
          </div>
        </div>

        {/* 分頁標籤 */}
        <div style={tabsStyle}>
          <button
            onClick={() => setActiveTab('view')}
            style={activeTab === 'view' ? activeTabStyle : tabStyle}
          >
            <Search size={18} />
            查詢課程
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            style={activeTab === 'manage' ? activeTabStyle : tabStyle}
          >
            <Settings size={18} />
            管理課程
          </button>
        </div>

        {/* 分頁內容 */}
        {activeTab === 'view' ? <ViewCoursesTab /> : <ManageCoursesTab />}

        {/* 新增課程模態框 */}
        {isAddingCourse && (
          <div style={modalStyle}>
            <div style={modalContentStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>新增課程</h3>
                <button
                  onClick={() => setIsAddingCourse(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>課程名稱</label>
                  <input
                    type="text"
                    value={newCourse.科目中文名稱}
                    onChange={(e) => setNewCourse({...newCourse, 科目中文名稱: e.target.value})}
                    style={inputStyle}
                    placeholder="請輸入課程名稱"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>教師姓名</label>
                  <input
                    type="text"
                    value={newCourse.主開課教師姓名}
                    onChange={(e) => setNewCourse({...newCourse, 主開課教師姓名: e.target.value})}
                    style={inputStyle}
                    placeholder="請輸入教師姓名"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>課別名稱</label>
                  <input
                    type="text"
                    value={newCourse.課別名稱}
                    onChange={(e) => setNewCourse({...newCourse, 課別名稱: e.target.value})}
                    style={inputStyle}
                    placeholder="請輸入課別名稱"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>學分數</label>
                  <input
                    type="number"
                    value={newCourse.學分數}
                    onChange={(e) => setNewCourse({...newCourse, 學分數: e.target.value})}
                    style={inputStyle}
                    placeholder="請輸入學分數"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setIsAddingCourse(false)}
                  style={{ ...buttonStyle, background: '#6b7280' }}
                >
                  取消
                </button>
                <button
                  onClick={handleAddCourse}
                  style={addButtonStyle}
                >
                  <Save size={18} />
                  儲存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS 動畫 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
// 刪除課程
  const handleDeleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`確定要刪除課程「${courseName}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      const res = await fetch(`http://192.168.66.27:8000/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 
          'X-User-Role': 'admin'
        }
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        alert('課程刪除成功！');
        fetchCourses();
      } else {
        alert(data.message || '刪除失敗');
      }
    } catch (err) {
      console.error('Delete course error:', err);
      alert('刪除失敗，請稍後再試');
    }
  };
  
export default AdminPage;
