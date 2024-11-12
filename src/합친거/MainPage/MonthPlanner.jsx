import React, { useState } from 'react';
import './MonthPlanner.css';
import { useNavigate } from "react-router-dom";

function MonthPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isInputVisible, setIsInputVisible] = useState(false);

  const navigate = useNavigate()
  
  const getCalendarData = (year, month) => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();
    return { firstDay, lastDate };
  };

  const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

  const holidays = {
    '1-1': '신정',
    '3-1': '삼일절',
    '5-5': '어린이날',
    '6-6': '현충일',
    '8-15': '광복절',
    '10-3': '개천절',
    '10-9': '한글날',
    '12-25': '성탄절',
  };

  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const selectDate = (date) => {
    if (date) {
      const dateStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${date}`;
      setSelectedDate(dateStr);
      setIsInputVisible(true);
      if (!tasks[dateStr]) {
        setTasks(prev => ({ ...prev, [dateStr]: [] }));
      }
    }
  };

  const closeTaskView = () => {
    setSelectedDate(null);
    setIsInputVisible(false);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim() && selectedDate) {
      setTasks(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), { text: newTask, completed: false }]
      }));
      setNewTask('');
    }
  };

  const toggleTask = (dateStr, index) => {
    setTasks(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].map((task, i) => 
        i === index ? { ...task, completed: !task.completed } : task
      )
    }));
  };
  const deleteTask = (dateStr, index) => {
    setTasks(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].filter((_, i) => i !== index)
    }));
  };
  const { firstDay, lastDate } = getCalendarData(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1
  );

  const getDatesArray = () => {
    const dates = [];
    let week = [];
    for (let i = 0; i < firstDay; i++) {
      week.push("");
    }
    for (let i = 1; i <= lastDate; i++) {
      week.push(i);
      if (week.length === 7) {
        dates.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) {
        week.push("");
      }
      dates.push(week);
    }
    return dates;
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const formatDate = (date) => {
    return `${currentDate.getMonth() + 1}월 ${date}일 ${weekDays[new Date(currentDate.getFullYear(), currentDate.getMonth(), date).getDay()]}요일`;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-section">
        <h1 className="calendar-title">달력</h1>
        <div className="month-selector">
          <button onClick={prevMonth}>◀</button>
          <span>{currentDate.getFullYear()}년 / {months[currentDate.getMonth()]}</span>
          <button onClick={nextMonth}>▶</button>
        </div>

        <table className="calendar">
          <thead>
            <tr>
              {weekDays.map((day, index) => (
                <th key={index}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getDatesArray().map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((date, dateIndex) => {
                  const dateStr = `${currentDate.getMonth() + 1}-${date}`;
                  const isHoliday = holidays[dateStr];
                  const dayOfWeek = date ? new Date(currentDate.getFullYear(), currentDate.getMonth(), date).getDay() : null;
                  
                  let styleClass = '';
                  if (isHoliday) {
                    // 공휴일이면서 토요일인 경우
                    styleClass = dayOfWeek === 6 ? 'saturday-holiday' : 'holiday';
                  } else if (dayOfWeek === 6) {
                    // 일반 토요일인 경우
                    styleClass = 'saturday';
                  }

                  return (
                    <td
                      key={dateIndex}
                      onClick={() => selectDate(date)}
                      className={`${date ? styleClass : ''} ${selectedDate === `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${date}` ? 'selected' : ''}`}
                    >
                      <div className={styleClass}>{date}</div>
                      {date && isHoliday && (
                        <div className="holiday-indicator">{holidays[dateStr]}</div>
                      )}
                      {date && tasks[`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${date}`]?.length > 0 && (
                        <div className="task-indicator">●</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDate && (
        <div className="task-section">
          <button className="close-button" onClick={closeTaskView}>✕</button>

          <h2>{formatDate(selectedDate.split('-')[2])}</h2>
          {isInputVisible && (
            <form onSubmit={addTask} className="task-form">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="새로운 할 일을 입력하세요"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addTask(e);  // Enter 키를 눌렀을 때 addTask 실행
                }
              }}
            />
          </form>
          
          )}
          <div className="task-list">
            {tasks[selectedDate]?.map((task, index) => (
              <div key={index} className="task-item">
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(selectedDate, index)}
                  />
                  <span className={task.completed ? 'completed' : ''}>
                    {task.text}
                  </span>
                </label>
                <button 
                  className="delete-button"
                  onClick={() => deleteTask(selectedDate, index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthPlanner;
