import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './WeekPlanner.css';

function WeekPlanner() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [tasks, setTasks] = useState(Array(7).fill().map(() => [
    { text: ' ', completed: false },
    { text: ' ', completed: false },
    { text: ' ', completed: false },
  ]));
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [notes, setNotes] = useState(Array(7).fill(''));
  const [plannerType, setPlannerType] = useState("weekly");
  const navigate = useNavigate();

  function addTask(dayIndex) {
    let newTasks = [...tasks];
    newTasks[dayIndex] = [...newTasks[dayIndex], { text: '', completed: false }];
    setTasks(newTasks);
  }

  function handleInputChange(dayIndex, taskIndex, value) {
    let newTasks = [...tasks];
    newTasks[dayIndex][taskIndex].text = value;
    setTasks(newTasks);
  }

  function handleCheckboxChange(dayIndex, taskIndex) {
    let newTasks = [...tasks];
    newTasks[dayIndex][taskIndex].completed = !newTasks[dayIndex][taskIndex].completed;
    setTasks(newTasks);
  }

  function getDatesForWeek() {
    let startDate = new Date();
    startDate.setDate(startDate.getDate() + currentWeek * 7);
    let dayOfWeek = startDate.getDay();
    let diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    startDate.setDate(startDate.getDate() - diffToMonday);

    let dates = [];
    for (let i = 0; i < 7; i++) {
      let date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.getMonth() + 1 + '.' + String(date.getDate()).padStart(2, '0'));
    }
    return dates;
  }

  function goToNextWeek() {
    setCurrentWeek(currentWeek + 1);
  }

  function goToPreviousWeek() {
    setCurrentWeek(currentWeek - 1);
  }

  function goToToday() {
    let today = new Date();
    let dayOfWeek = today.getDay();
    let diff = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    today.setDate(today.getDate() - diff);
    let startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diff);
    let diffInDays = Math.floor((today - startOfWeek) / (1000 * 60 * 60 * 24));
    setCurrentWeek(Math.floor(diffInDays / 7));
  }

  function handleDayClick(index) {
    setSelectedDayIndex(index);
  }

  function handleNoteChange(e) {
    let newNotes = [...notes];
    newNotes[selectedDayIndex] = e.target.value;
    setNotes(newNotes);
  }

  let dates = getDatesForWeek();
  let days = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

  return (
    <div className="planner-container">
      <div className="planner-week-header">
        <div className="date-nav-container">
          <button className="nav-arrow" onClick={goToPreviousWeek}>＜</button>
          <div className="current-month">{dates[0].split('.')[0]}월 {dates[0].split('.')[1]}일 - {dates[6].split('.')[1]}일</div>
          <button className="nav-arrow" onClick={goToNextWeek}>＞</button>
        </div>
        <button className="today-button" onClick={goToToday}>오늘로 돌아가기</button>
      </div>

      <div className="planner-days">
        {dates.map((date, idx) => (
          <div key={idx} className={selectedDayIndex === idx ? 'day-column selected' : 'day-column'} onClick={() => handleDayClick(idx)}>
            <h3>{date} {days[idx]}</h3>
            <div className="task-preview">
              {tasks[idx].slice(0, 3).map((task, taskIdx) => (
                <div key={taskIdx} className="task">
                  <input type="text" className="task-input-preview" value={task.text} onChange={(e) => handleInputChange(idx, taskIdx, e.target.value)} placeholder=" " />
                  <input type="checkbox" checked={task.completed} onChange={() => handleCheckboxChange(idx, taskIdx)} />
                </div>
              ))}
              {tasks[idx].length > 3 && (
                <div className="more-tasks">
                  +{tasks[idx].length - 3}개 더보기
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="planner-details">
        <div className="planner-detail">
          <h3>{dates[selectedDayIndex]}의 플래너</h3>
          {tasks[selectedDayIndex].map((task, idx) => (
            <div key={idx} className="task">
              <input type="text" value={task.text} onChange={(e) => handleInputChange(selectedDayIndex, idx, e.target.value)} placeholder=" " />
              <input type="checkbox" checked={task.completed} onChange={() => handleCheckboxChange(selectedDayIndex, idx)} />
            </div>
          ))}
          <button onClick={() => addTask(selectedDayIndex)}>할 일 추가</button>
        </div>

        <div className="memo-section">
          <h3>메모</h3>
          <textarea value={notes[selectedDayIndex]} onChange={handleNoteChange} />
        </div>
      </div>
    </div>
  );
}

export default WeekPlanner;

