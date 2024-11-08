import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "이름을 입력해주세요.";
    if (!formData.userId || formData.userId.length < 6 || formData.userId.length > 20) {
      newErrors.userId = "아이디는 6-20자로 입력해주세요.";
    }
    if (!formData.password || formData.password.length < 8 || formData.password.length > 20) {
      newErrors.password = "비밀번호는 8-20자로 입력해주세요.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitSuccess(false);
    } else {
      setErrors({});
      setSubmitSuccess(true);
      console.log("회원가입 정보:", formData);
      // 여기에 회원가입 API 호출을 추가하세요.
    }
  };

  return (
    <div className="container">
      <div className="signup-form">
        <h2>회원가입</h2>
        <p>회원이 되어 다양한 혜택을 경험해 보세요!</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="이름을 입력해주세요"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          {/* 아이디 입력 부분 */}
          <div className="input-group">
            <div className="input-group id-input-wrap">
              <input
              id="userId"
              name="userId"
              type="text"
              placeholder="아이디 입력 (6-20자)"
              value={formData.userId}
              onChange={handleChange}
              />
            <button type="button" className="duplicate-check">중복 확인</button>
          </div>
        {errors.userId && <p className="error-message">{errors.userId}</p>}
        </div>

          <div className="input-group">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호 입력 (문자, 숫자, 특수문자 포함 8-20자)"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <div className="input-group">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="비밀번호 재입력"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
          </div>

          <div className="button-group">
            <button type="submit" className="signup-btn">가입하기</button>
          </div>
        </form>

        {submitSuccess && <div className="success-message">회원가입이 완료되었습니다!</div>}
        {errors.submit && <div className="error-message-general">{errors.submit}</div>}
        
        <p className="login-prompt">
          이미 회원이십니까? <a href="/login">로그인 페이지로 가기</a>
        </p>
      </div>
    </div>
  );
}

export default App;
