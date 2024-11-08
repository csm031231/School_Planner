import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Link, Routes, Route } from 'react-router-dom'; // Router, Link, Routes, Route 사용

// 임시 로그인, 회원가입 페이지
function Login() {
  return <h2>로그인 페이지</h2>;
}

function Signup() {
  return <h2>회원가입 페이지</h2>;
}

function App() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [tasks, setTasks] = useState(Array(7).fill().map(() => [
    { text: ' ', completed: false },
    { text: ' ', completed: false },
    { text: ' ', completed: false },
  ]));
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [notes, setNotes] = useState(Array(7).fill(''));

  // 할일 추가 함수
  function addTask(dayIndex) {
    let newTasks = [...tasks];
    newTasks[dayIndex] = [...newTasks[dayIndex], { text: '', completed: false }];
    setTasks(newTasks);
  }

  // input 바뀌면 처리하는 함수
  function handleInputChange(dayIndex, taskIndex, value) {
    let newTasks = [...tasks];
    newTasks[dayIndex][taskIndex].text = value;
    setTasks(newTasks);
  }

  // 체크박스 처리하는 함수
  function handleCheckboxChange(dayIndex, taskIndex) {
    let newTasks = [...tasks];
    newTasks[dayIndex][taskIndex].completed = !newTasks[dayIndex][taskIndex].completed;
    setTasks(newTasks);
  }

  // 날짜 계산하는 함수 수정
  function getDatesForWeek() {
    let startDate = new Date();
    startDate.setDate(startDate.getDate() + currentWeek * 7);  // 현재 주차를 반영한 날짜로 설정
    let dayOfWeek = startDate.getDay();
    let diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);  // 일요일은 6, 월요일은 0
    startDate.setDate(startDate.getDate() - diffToMonday);  // 월요일로 설정

    let dates = [];
    for (let i = 0; i < 7; i++) {
      let date = new Date(startDate);
      date.setDate(startDate.getDate() + i); // 월요일부터 시작해서 날짜 계산
      dates.push(date.getMonth() + 1 + '.' + String(date.getDate()).padStart(2, '0'));
    }
    return dates;
  }

  // 주차 이동 함수
  function goToNextWeek() {
    setCurrentWeek(currentWeek + 1);  // 다음 주로 이동
  }

  function goToPreviousWeek() {
    setCurrentWeek(currentWeek - 1);  // 이전 주로 이동
  }

  // 오늘로 가는 함수 수정
  function goToToday() {
    let today = new Date();
    let dayOfWeek = today.getDay();
    let diff = (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // 월요일은 0으로 설정
    today.setDate(today.getDate() - diff);  // 오늘을 이번 주 월요일로 설정
    let startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diff);  // 해당 주의 월요일로 설정
    let diffInDays = Math.floor((today - startOfWeek) / (1000 * 60 * 60 * 24));
    setCurrentWeek(Math.floor(diffInDays / 7));  // 해당 주차로 설정
  }

  // 날짜 클릭하면 처리하는 함수
  function handleDayClick(index) {
    setSelectedDayIndex(index);
  }

  // 메모 바뀌면 처리하는 함수
  function handleNoteChange(e) {
    let newNotes = [...notes];
    newNotes[selectedDayIndex] = e.target.value;
    setNotes(newNotes);
  }

  // 요일이랑 날짜
  let dates = getDatesForWeek();
  let days = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

  return (
    <Router> {/* BrowserRouter로 감싸기 */}
    <div className="planner-container">
      <header className="planner-header">
        <button className="today-button" onClick={goToToday}>오늘로 돌아가기</button>
        <h1>학교생활</h1>
        <div className="auth-links">
          <Link to="/login">로그인</Link> / <Link to="/signup">회원가입</Link>
        </div>
      </header>
        {/* 주간 보기 */}
        <div className="planner-week-view">
          <div className="planner-week-header">
            <button onClick={goToPreviousWeek}>{"<"}</button>
            <span>{dates[0].split('.')[0]}월 {dates[0].split('.')[1]}일 - {dates[6].split('.')[1]}일</span>
            <button onClick={goToNextWeek}>{">"}</button>
          </div>

          {/* 일주일 칸 */}
          <div className="planner-days">
            {dates.map((date, idx) => (
              <div key={idx} 
                   className={selectedDayIndex === idx ? 'day-column selected' : 'day-column'} 
                   onClick={() => handleDayClick(idx)}>
                <h3>{date} {days[idx]}</h3>
                {/* 날짜별 할 일 미리보기 영역 */}
                <div className="task-preview">
                  {/* 항상 첫 3개의 할 일만 미리보기로 표시 */}
                  {tasks[idx].slice(0, 3).map((task, taskIdx) => (
                    <div key={taskIdx} className="task">
                      <input type="text"
                             value={task.text}
                             onChange={(e) => handleInputChange(idx, taskIdx, e.target.value)}
                             placeholder=" " />
                      <input type="checkbox"
                             checked={task.completed}
                             onChange={() => handleCheckboxChange(idx, taskIdx)} />
                    </div>
                  ))}
                  {/* 3개 초과 시 "+N개 더보기" 텍스트 표시 */}
                  {tasks[idx].length > 3 && (
                    <div className="more-tasks">
                      +{tasks[idx].length - 3}개 더보기
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 상세 보기 */}
        <div className="planner-details">
          <div className="planner-detail">
            <h3>{dates[selectedDayIndex]}의 플래너</h3>
            {/* 상세보기는 모든 할일 다 보여주기 */}
            {tasks[selectedDayIndex].map((task, idx) => (
              <div key={idx} className="task">
                <input type="text"
                       value={task.text}
                       onChange={(e) => handleInputChange(selectedDayIndex, idx, e.target.value)}
                       placeholder=" " />
                <input type="checkbox"
                       checked={task.completed}
                       onChange={() => handleCheckboxChange(selectedDayIndex, idx)} />
              </div>
            ))}
            <button onClick={() => addTask(selectedDayIndex)}>할 일 추가</button>
          </div>

          {/* 메모장 */}
          <div className="memo-section">
            <h3>메모</h3>
            <textarea value={notes[selectedDayIndex]}
                      onChange={handleNoteChange}
                      placeholder="메모를 작성하세요" />
          </div>
        </div>

        {/* 라우팅 처리할 곳 */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// 실행 안될 때 npm install react-router-dom@latest 이거 터미널에 쓰고 실행하기