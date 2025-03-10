import React, { useState, useEffect } from 'react';
import './MonthPlanner.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function MonthPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // API 인스턴스 생성
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
  });

  // API 응답 인터셉터 설정
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );

  // 월별 일정 조회 함수
  const fetchMonthTasks = async (year, month) => {
    setIsLoading(true);
    try {
      const response = await api.get('/planner', {
        params: {
          year: year,
          month: month.toString().padStart(2, '0')
        }
      });

      if (response.data.result === 'ok') {
        const fetchedTasks = {};
        response.data.tasks.forEach(task => {
          const dateStr = task.date;
          if (!fetchedTasks[dateStr]) {
            fetchedTasks[dateStr] = [];
          }
          fetchedTasks[dateStr].push({
            id: task.id,
            text: task.content,
            completed: task.completed
          });
        });
        console.log('Fetched tasks:', fetchedTasks);
        setTasks(fetchedTasks);
      }
    } catch (error) {
      console.error("일정 조회 중 오류 발생:", error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시와 월 변경 시 일정 불러오기
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    fetchMonthTasks(year, month);
  }, [currentDate]);

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
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = date.toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
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
 
  const addTask = async (e) => {
    e.preventDefault();
    if (newTask.trim() && selectedDate) {
      const taskContent = newTask.trim();
      
      const [year, month, day] = selectedDate.split('-');
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      try {
        console.log('Sending request:', {
          content: taskContent,
          date: formattedDate
        });
        
        const response = await api.post('/planner', {
          content: taskContent,
          date: formattedDate
        });
        
        if (response.data.result === "ok") {
          // 새 task 객체 생성
          const newTaskObj = {
            id: response.data.id,
            text: taskContent,
            completed: false,
            date: formattedDate
          };
 
          // tasks 상태 업데이트
          setTasks(prev => {
            const updatedTasks = {
              ...prev,
              [formattedDate]: [...(prev[formattedDate] || []), newTaskObj]
            };
            console.log('Updated tasks:', updatedTasks);
            return updatedTasks;
          });
          
          setNewTask('');
          // 현재 월의 일정을 다시 불러오기
          await fetchMonthTasks(year, month);
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("일정 저장 중 오류 발생:", error.response?.data || error);
        if (error.response?.status === 400) {
          alert('잘못된 요청입니다. 날짜와 내용을 확인해주세요.');
        } else if (error.response?.status === 401) {
          alert('로그인이 필요합니다.');
          navigate('/login');
        } else {
          alert('일정 저장 중 오류가 발생했습니다.');
        }
      }
    }
  };
 
  const toggleTask = async (dateStr, index) => {
    try {
      const task = tasks[dateStr][index];
      const response = await api.put(`/planner/${task.id}`, {
        completed: !task.completed
      });
      
      if (response.data.result === "ok") {
        setTasks(prev => ({
          ...prev,
          [dateStr]: prev[dateStr].map((t, i) => 
            i === index ? { ...t, completed: !t.completed } : t
          )
        }));
      }
    } catch (error) {
      console.error("작업 상태 변경 중 오류 발생:", error);
    }
  };
 
  const deleteTask = async (dateStr, index) => {
  try {
    const task = tasks[dateStr][index];
    
    // 디버깅을 위해 task 객체 로그 출력
    console.log('Deleting task:', task);
    
    // task.id가 undefined인지 확인
    if (!task || !task.id) {
      console.error('Task ID is undefined');
      return;
    }
    
    const response = await api.delete(`/planner/${task.id}`);
    
    if (response.data.result === "ok") {
      // tasks 상태 업데이트
      setTasks(prev => {
        const updatedTasks = {
          ...prev,
          [dateStr]: prev[dateStr].filter((_, i) => i !== index)
        };
        
        // 해당 날짜의 모든 일정이 삭제된 경우, 빈 배열로 설정
        if (updatedTasks[dateStr].length === 0) {
          updatedTasks[dateStr] = [];
        }
        
        console.log('Tasks after deletion:', updatedTasks);
        return updatedTasks;
      });

      // 현재 월의 일정을 다시 불러오기
      const [year, month] = dateStr.split('-');
      await fetchMonthTasks(year, month);
    }
  } catch (error) {
    console.error("작업 삭제 중 오류 발생:", error.response?.data || error);
    alert('일정 삭제 중 오류가 발생했습니다.');
  }
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
      {isLoading && <div className="loading-indicator">로딩 중...</div>}
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
                  const formattedMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                  const formattedDay = date ? date.toString().padStart(2, '0') : '';
                  const fullDateStr = date ? `${currentDate.getFullYear()}-${formattedMonth}-${formattedDay}` : '';
                  const dateStr = `${currentDate.getMonth() + 1}-${date}`;
                  const isHoliday = holidays[dateStr];
                  const dayOfWeek = date ? new Date(currentDate.getFullYear(), currentDate.getMonth(), date).getDay() : null;
                  
                  let styleClass = '';
                  if (isHoliday) {
                    styleClass = dayOfWeek === 6 ? 'saturday-holiday' : 'holiday';
                  } else if (dayOfWeek === 6) {
                    styleClass = 'saturday';
                  }
 
                  return (
                    <td
                      key={dateIndex}
                      onClick={() => selectDate(date)}
                      className={`${date ? styleClass : ''} ${selectedDate === fullDateStr ? 'selected' : ''}`}
                    >
                      <div className={styleClass}>{date}</div>
                      {date && isHoliday && (
                        <div className="holiday-indicator">{holidays[dateStr]}</div>
                      )}
                      {date && tasks[fullDateStr]?.length > 0 && (
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
                    addTask(e);
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

 