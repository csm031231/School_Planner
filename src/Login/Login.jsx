import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

function Login({ setIsLoggedIn, setUsername }) {
  const [username, setInputUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessageID, setErrorMessageID] = useState('');
  const [errorMessagePW, setErrorMessagePW] = useState('');
  const navigate = useNavigate();

  const buttonClickedHandler = async () => {
    let idError = '';
    let pwError = '';
    
    if (!username || !password) {
      idError = '아이디와 비밀번호를 입력해주세요.';
      setErrorMessageID(idError);
      return;
    }

    setErrorMessageID('');
    setErrorMessagePW('');

    try {
      const response = await api.post('/login', {
        id: username,
        pwd: password
      });

      if (response.data.result === 'ok') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.user.name);
        setIsLoggedIn(true);
        setUsername(response.data.user.name);
        alert('로그인 성공');
        navigate('/');
      } else {
        if (response.data.message.includes('아이디')) {
          setErrorMessageID(response.data.message);
        } else {
          setErrorMessagePW(response.data.message);
        }
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const signUpButtonClickedHandler = () => {
    navigate('/signup');
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
            onChange={(e) => setInputUsername(e.target.value)}
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
        <button className="login-button" onClick={buttonClickedHandler}>
          로그인
        </button>
        <p className="signup-text" onClick={signUpButtonClickedHandler}>
          회원가입
        </p>
      </div>
    </div>
  );
}

export default Login;