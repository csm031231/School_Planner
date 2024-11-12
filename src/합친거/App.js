import './App.css';
import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MonthPlanner from './MainPage/MonthPlanner';
import WeekPlanner from './MainPage/WeekPlanner';
import Login from './Login/Login';
import Signup from './Signup/Signup';
import EditAccount from './EditAccount/EditAccount';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    console.log(isSidebarOpen);
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const buttonclick = () => {
    window.location.href = "/editaccount";
  };

  return (
    <div className="App">
      <div className="planner-container">
        <header className="planner-header">
          <Link to="/" className="header-link">
            <h1>학교생활</h1>
          </Link>
          <div className="auth-links">
            <Link to="/login">로그인</Link> / <Link to="/signup">회원가입</Link>
            <button className="settings-button" onClick={toggleSidebar}>
              ⚙️
            </button>
          </div>
        </header>
      </div>

      {/* 사이드바 */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar-button" onClick={closeSidebar}>닫기</button>
        <ul>
          <li><button onClick={buttonclick}>회원 정보 수정</button></li>
          <li><button>월별 플래너</button></li>
          <li><button>주별 플래너</button></li>
          <li><button>로그아웃</button></li>
        </ul>
      </div>

      {/* 페이지 라우팅 */}
      <Routes>
        <Route path="/" element={<MonthPlanner />} />
        <Route path="/week" element={<WeekPlanner />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/editaccount" element={<EditAccount />} />
      </Routes>
    </div>
  );
}

export default App;
