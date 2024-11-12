import React, { useState } from 'react';
import './EditAccount.css';
import { useNavigate } from "react-router-dom";

function EditAccount() {
  // 사용자 정보 상태
  const [name, setName] = useState("사용자 이름"); // 회원가입 시 등록된 이름
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 비밀번호 변경 처리 함수
  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!newPassword) {
      setErrorMessage("새 비밀번호를 입력해주세요.");
      return;
    }
    if (!currentPassword) {
      setErrorMessage("현재 비밀번호를 입력해주세요.");
      return;
    }
    // 비밀번호 변경 처리 로직 (백엔드 API 호출 등)
    console.log("비밀번호 변경:", newPassword);
    setErrorMessage(""); // 에러 메시지 초기화
  };

  // 회원 탈퇴 처리 함수
  const handleDeleteAccount = () => {
    if (window.confirm("정말 회원탈퇴하시겠습니까?")) {
      // 회원탈퇴 처리 로직 (백엔드 API 호출 등)
      console.log("회원 탈퇴");
      window.location.href = "/";
    }
  };

  // 저장 버튼 클릭 시 사용자 정보 저장 처리
  const handleSave = () => {
    // 정보 저장 처리 로직 (백엔드 API 호출 등)
  
  };

  return (
    <div className="profile-edit-container">
      <h2>회원정보 수정</h2>

      <div className="user-info">
        <div className="form-group">
          <label>이름</label>
          <input type="text" value={name} disabled />
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
          <button onClick={handleSave}>저장</button>
          <button onClick={handleDeleteAccount}>회원 탈퇴</button>
        </div>
      </div>
    </div>
  );
}

export default EditAccount;
