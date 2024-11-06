import React, { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessageID, setErrorMessageID] = useState('');   // 아이디 오류 메시지 상태
  const [errorMessagePW, setErrorMessagePW] = useState('');   // 비밀번호 오류 메시지 상태

  const testID = '나은빈';
  const testPW = '0808';

  // 로그인 버튼 클릭 시 호출되는 함수
  const buttonClickedHandler = () => {
    let idError = "";
    let pwError = "";

    if (username !== testID) idError = "아이디가 틀렸습니다!";
    if (password !== testPW) pwError = "비밀번호가 틀렸습니다!";

    setErrorMessageID(idError);
    setErrorMessagePW(pwError);

    // 로그인 성공 시 오류 메시지 초기화
    if (username === testID && password === testPW) {
      alert("로그인 성공");
      setErrorMessageID('');
      setErrorMessagePW('');
    }
  };

  // 회원가입 버튼 클릭 시 호출되는 함수
  const signUpButtonClickedHandler = () => {
    window.location.href = "/signup"; // 회원가입 페이지 URL로 이동
  };

  return (
    <div className="outer-container">
      <div className="login-container">
        <h2 className="login-title">로그인</h2>
        
        <div className="input-container">
          <input 
            type="text" 
            placeholder="아이디" 
            className="input-field" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          {errorMessageID && <div className="error-message">{errorMessageID}</div>}
        </div>
        
        <div className="input-container">
          <input 
            type="password" 
            placeholder="비밀번호" 
            className="input-field" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          {errorMessagePW && <div className="error-message">{errorMessagePW}</div>}
        </div>
        
        <button className="login-button" onClick={buttonClickedHandler}>로그인</button>
        
        {/* 회원가입 버튼 */}
        <p className="signup-text" onClick={() => (window.location.href = "/signup")}>
          회원가입
        </p>
      </div>
    </div>
  );
}

export default App;
