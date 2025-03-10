import React, { useState, useEffect } from 'react';
import './WeekPlanner.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function WeekPlanner() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [tasks, setTasks] = useState(Array(7).fill().map(() => [
    { text: ' ', completed: false },
    { text: ' ', completed: false },
    { text: ' ', completed: false },
  ]));
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [notes, setNotes] = useState(Array(7).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [modifiedTasks, setModifiedTasks] = useState([]);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
  });

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
  
  api.interceptors.request.use((config) => {
    console.log("API 요청:", config.method.toUpperCase(), config.url, config.data || config.params);
    return config;
  });
  
  api.interceptors.response.use(
    (response) => {
      console.log("API 응답:", response.status, response.data);
      return response;
    },
    (error) => {
      console.error("API 오류:", error.response?.status, error.response?.data || error.message);
      return Promise.reject(error);
    }
  );

  
  async function fetchWeekData() {
    setIsLoading(true);
    try {
      const startDate = getStartDateForWeek();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
  
      const response = await api.get('/planner', {
        params: {
          year: startDate.getFullYear().toString(),
          month: String(startDate.getMonth() + 1).padStart(2, '0'),
        },
      });
  
      if (response.data.result === 'ok') {
        const allTasks = response.data.tasks || [];
  
        // Filter tasks for the current week
        const weekTasks = allTasks.filter((task) => {
          const taskDate = new Date(task.date);
          return taskDate >= startDate && taskDate <= endDate;
        });
  
        // Organize tasks by day of the week
        const organizedTasks = Array(7)
          .fill()
          .map(() => [
            { text: ' ', completed: false },
            { text: ' ', completed: false },
            { text: ' ', completed: false },
          ]);
  
        weekTasks.forEach((task) => {
          const taskDate = new Date(task.date);
          const dayIndex = taskDate.getDay() === 0 ? 6 : taskDate.getDay() - 1;
  
          const emptyIndex = organizedTasks[dayIndex].findIndex((t) => t.text === ' ');
          if (emptyIndex !== -1) {
            organizedTasks[dayIndex][emptyIndex] = {
              id: task.id,
              text: task.content,
              completed: task.completed,
              date: task.date,
            };
          } else {
            organizedTasks[dayIndex].push({
              id: task.id,
              text: task.content,
              completed: task.completed,
              date: task.date,
            });
          }
        });
  
        setTasks(organizedTasks);
        setModifiedTasks([]);
        setUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Error fetching week data:", error);
      alert('주간 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }
    // useEffect에서 호출
    useEffect(() => {
      fetchWeekData();
    }, [currentWeek]);

    function addTask(dayIndex) {
      const taskDate = getDateForDayIndex(dayIndex);
      const formattedDate = taskDate.toISOString().split('T')[0];
    
      const newTask = {
        text: '', // 초기값은 빈 문자열
        completed: false,
        date: formattedDate,
        isNew: true, // 새 작업 표시
      };
    
      const updatedTasks = [...tasks];
      updatedTasks[dayIndex].push(newTask);
      setTasks(updatedTasks);
    
      // 새 작업을 수정된 목록에 추가
      setModifiedTasks((prev) => [...prev, { dayIndex, task: newTask }]);
      setUnsavedChanges(true); // 저장 필요 상태로 전환
    }
    
    async function saveChanges() {
      try {
        if (!unsavedChanges) {
          alert('저장할 변경사항이 없습니다.');
          return;
        }
    
        console.log('저장할 작업들:', modifiedTasks); // 저장 시도하는 작업들 로그
    
        const updatedTasksPromises = modifiedTasks.map(async ({ dayIndex, task }) => {
          const dateForTask = task.date || getDateForDayIndex(dayIndex).toISOString().split('T')[0];
    
          // 빈 작업 처리 로직 수정
          if (!task.text || task.text.trim() === '') {
            console.warn('빈 내용이므로 저장하지 않습니다:', task);
            return null;
          }
    
          console.log('작업 저장 시도:', { task, dateForTask }); // 개별 작업 저장 로그
    
          try {
            let response;
            if (task.isNew) {
              // 새 작업 추가
              response = await api.post('/planner', {
                content: task.text.trim(),
                date: dateForTask,
                completed: task.completed || false,
              });
    
              console.log('새 작업 저장 응답:', response.data);
    
              // 서버에서 받은 ID로 task 업데이트
              if (response.data.id) {
                const updatedTasks = [...tasks];
                const taskToUpdateIndex = updatedTasks[dayIndex].findIndex(t => t === task);
                if (taskToUpdateIndex !== -1) {
                  updatedTasks[dayIndex][taskToUpdateIndex] = {
                    ...updatedTasks[dayIndex][taskToUpdateIndex],
                    id: response.data.id,
                    isNew: false
                  };
                  setTasks(updatedTasks);
                }
                return { dayIndex, taskId: response.data.id };
              }
            } else if (task.id) {
              // 기존 작업 수정
              response = await api.put(`/planner/${task.id}`, {
                content: task.text.trim(),
                completed: task.completed,
              });
    
              console.log('기존 작업 업데이트 응답:', response.data);
              return { dayIndex, taskId: task.id };
            }
          } catch (error) {
            console.error('개별 작업 저장 실패:', error.response?.data || error.message);
            return null;
          }
        });
    
        const updatedTasks = await Promise.all(updatedTasksPromises);
        
        // 저장 완료 후 tasks 상태 유지
        setModifiedTasks([]);
        setUnsavedChanges(false);
    
        // 저장 완료 알림만 표시
        alert('저장 완료');
      } catch (error) {
        console.error('전체 저장 실패:', error.response?.data || error.message);
        alert('저장 중 문제가 발생했습니다. 자세한 내용은 콘솔을 확인해주세요.');
      }
    }
  
    async function handleWeekChange(newWeek) {
      if (unsavedChanges) {
        await saveChanges();
      }
      setCurrentWeek(newWeek);
    }
  
    async function handleDayClick(index) {
      if (index !== selectedDayIndex && unsavedChanges) {
        await saveChanges();
      }
      setSelectedDayIndex(index);
    }
  
    function handleInputChange(dayIndex, taskIndex, value) {
      const updatedTasks = [...tasks];
      const task = updatedTasks[dayIndex][taskIndex];
      task.text = value; // 입력 값으로 업데이트
    
      // 변경된 task를 modifiedTasks에 추가
      setModifiedTasks((prev) => {
        const existingIndex = prev.findIndex(
          (t) => t.dayIndex === dayIndex && t.task.id === task.id
        );
        if (existingIndex === -1) {
          return [...prev, { dayIndex, task }];
        } else {
          prev[existingIndex].task = task;
          return [...prev];
        }
      });
    
      setTasks(updatedTasks); // tasks 상태 업데이트
      setUnsavedChanges(true); // 변경 사항 있음
    }
    
    
    async function goToPreviousWeek() {
      await handleWeekChange(currentWeek - 1);
    }
  
    async function goToNextWeek() {
      await handleWeekChange(currentWeek + 1);
    }
  
    async function toggleTask(dayIndex, taskIndex) {
      const task = tasks[dayIndex][taskIndex];
      if (!task.id) return;
  
      try {
          const updatedTasks = [...tasks];
          updatedTasks[dayIndex][taskIndex] = {
              ...task,
              completed: !task.completed
          };
          
          setTasks(updatedTasks);
          setModifiedTasks(prev => {
              const existingIndex = prev.findIndex(t => 
                  (t.dayIndex === dayIndex && t.task === task)
              );
              
              if (existingIndex === -1) {
                  return [...prev, { dayIndex, task: updatedTasks[dayIndex][taskIndex] }];
              }
              
              return prev;
          });
          setUnsavedChanges(true);
      } catch (error) {
          console.error("Error toggling task:", error);
      }
    }
  
    async function deleteTask(dayIndex, taskIndex) {
        const task = tasks[dayIndex][taskIndex];
        if (!task.id) return;
  
        try {
            const response = await api.delete(`/planner/${task.id}`);
            
            if (response.data.result === "ok") {
                const updatedTasks = [...tasks];
                updatedTasks[dayIndex].splice(taskIndex, 1);
                
                // 최소 3개의 task 유지
                while (updatedTasks[dayIndex].length < 3) {
                    updatedTasks[dayIndex].push({ text: ' ', completed: false });
                }
                
                setTasks(updatedTasks);
                setModifiedTasks(prev => prev.filter(t => 
                    !(t.dayIndex === dayIndex && t.task === task)
                ));
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }
  
    async function goToToday() {
      if (unsavedChanges) {
        await saveChanges();
      }
      setCurrentWeek(0);
      const today = new Date();
      const dayOfWeek = today.getDay();
      setSelectedDayIndex(dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    }
  
    function getStartDateForWeek() {
      let startDate = new Date();
      startDate.setDate(startDate.getDate() + currentWeek * 7);
      let dayOfWeek = startDate.getDay();
      let diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
      startDate.setDate(startDate.getDate() - diffToMonday);
      return startDate;
    }
  
    function getDateForDayIndex(dayIndex) {
      const startDate = getStartDateForWeek();
      const date = new Date(startDate);
      date.setDate(date.getDate() + dayIndex);
      return date;
    }
  
    function getDatesForWeek() {
      let startDate = getStartDateForWeek();
      let dates = [];
      for (let i = 0; i < 7; i++) {
        let date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date.getMonth() + 1 + '.' + String(date.getDate()).padStart(2, '0'));
      }
      return dates;
    }
  
    function handleNoteChange(e) {
      const updatedNotes = [...notes];
      updatedNotes[selectedDayIndex] = e.target.value;
      setNotes(updatedNotes);
    }
  
    let dates = getDatesForWeek();
    let days = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
  
  return (
    <div className="planner-container">
      {isLoading && <div className="loading-indicator">로딩 중...</div>}
      {unsavedChanges && <div className="unsaved-changes-indicator">저장되지 않은 변경사항이 있습니다</div>}
      
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
                  <input 
                    type="text" 
                    className="task-input-preview" 
                    value={task.text} 
                    onChange={(e) => handleInputChange(idx, taskIdx, e.target.value)} 
                    placeholder=" " 
                    disabled
                  />
                  <input 
                    type="checkbox" 
                    checked={task.completed} 
                    onChange={() => toggleTask(idx, taskIdx)}
                    disabled
                  />
                  {task.id && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(idx, taskIdx);
                      }} 
                      className="delete-button"
                    >
                      삭제
                    </button>
                  )}
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
              <input 
                type="text" 
                value={task.text} 
                onChange={(e) => handleInputChange(selectedDayIndex, idx, e.target.value)} 
                placeholder=" "
              />
              <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={() => toggleTask(selectedDayIndex, idx)}
              />
              {task.id && (
                <button 
                  onClick={() => deleteTask(selectedDayIndex, idx)} 
                  className="delete-button"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          <button onClick={() => addTask(selectedDayIndex)}>할 일 추가</button>
          <button onClick={saveChanges} className="save-button">저장</button>

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