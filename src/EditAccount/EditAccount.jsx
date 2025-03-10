import React, { useState } from 'react';
import './EditAccount.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function EditAccount({ setIsLoggedIn }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {  
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
  });

  // 비밀번호 변경
  const handlePasswordChange = async () => {
    if (!currentPassword) {
      setErrorMessage("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!newPassword) {
      setErrorMessage("새 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await api.put('/user/password', {
        currentPassword,
        newPassword
      });

      if (response.data.result === 'ok') {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrorMessage("");
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      setErrorMessage("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

   // 회원 탈퇴
   const handleDeleteAccount = async () => {
    if (window.confirm("정말 회원탈퇴하시겠습니까?")) {
      try {
        const response = await api.post('/delete-account');
        
        if (response.data.result === 'ok') {
          alert(response.data.message || "회원 탈퇴가 완료되었습니다.");
          // 로그아웃 처리
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          setIsLoggedIn(false);  // 로그인 상태 변경
          navigate('/login');  // 로그인 페이지로 이동
        } else {
          setErrorMessage(response.data.message);
        }
      } catch (error) {
        console.error("회원 탈퇴 오류:", error);
        if (error.response?.status === 401) {
          alert("로그인이 필요합니다.");
          navigate('/login');
        } else {
          setErrorMessage("회원 탈퇴 처리 중 오류가 발생했습니다.");
        }
      }
    }
  };


  return (
    <div className="profile-edit-container">
      <h2>회원정보 수정</h2>
      <div className="user-info">
        <div className="form-group">
          <label>이름</label>
          <strong>{localStorage.getItem('username')}</strong>
        </div>
        <div className="form-group">
          <label>현재 비밀번호</label>
          <input
            type="password"
            placeholder="현재 비밀번호"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>새 비밀번호</label>
          <input
            type="password"
            placeholder="새 비밀번호"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>새 비밀번호 확인</label>
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="buttons">
          <button onClick={handlePasswordChange}>비밀번호 변경</button>
          <button onClick={handleDeleteAccount}>회원 탈퇴</button>
        </div>
      </div>
    </div>
  );
}

export default EditAccount;