import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import MonthPlanner from './MainPage/MonthPlanner';
import WeekPlanner from './MainPage/WeekPlanner';
import Login from './Login/Login';
import Signup from './Signup/Signup';
import EditAccount from './EditAccount/EditAccount';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [plannerView, setPlannerView] = useState('monthly');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (token && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const buttonclick = () => {
    navigate("/editaccount");
    closeSidebar();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    navigate('/login');
    closeSidebar();
  };

  const handlePlannerViewChange = (view) => {
    setPlannerView(view);
    closeSidebar();
  };

  return (
    <div className="App">
      <div className="planner-container">
        <header className="planner-header">
          <Link to="/" className="header-link">
            <h1>학교생활</h1>
          </Link>
          <div className="auth-links">
            {isLoggedIn ? (
              <span>안녕하세요, {username}님!</span>
            ) : (
              <span>
                <Link to="/login">로그인</Link> / <Link to="/signup">회원가입</Link>
              </span>
            )}
            <button className="settings-button" onClick={toggleSidebar}>
              ⚙️
            </button>
          </div>
        </header>
      </div>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar-button" onClick={closeSidebar}>닫기</button>
        <ul>
          <li><button onClick={buttonclick}>회원 정보 수정</button></li>
          <li><button onClick={() => handlePlannerViewChange('monthly')}>월별 플래너</button></li>
          <li><button onClick={() => handlePlannerViewChange('weekly')}>주별 플래너</button></li>
          <li><button onClick={handleLogout}>로그아웃</button></li>
        </ul>
      </div>

      <Routes>
        <Route path="/" element={plannerView === 'monthly' ? <MonthPlanner /> : <WeekPlanner />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/editaccount" 
          element={<EditAccount setIsLoggedIn={setIsLoggedIn} />} 
        />
      </Routes>
    </div>
  );
}

export default App;