import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

function Signup() {
 const navigate = useNavigate();
 const [formData, setFormData] = useState({
   name: '',
   id: '',
   pwd: '',
   pwd_confirm: ''
 });

 const [errors, setErrors] = useState({});

 const api = axios.create({
   baseURL: 'http://localhost:5000/api'
 });

 const handleChange = (e) => {
   const { name, value } = e.target;
   setFormData({
     ...formData,
     [name]: value
   });
 };

 const validateForm = () => {
   const newErrors = {};
   
   if (!formData.name) {
     newErrors.name = "이름을 입력해주세요.";
   }
   
   if (!formData.id || formData.id.length < 6 || formData.id.length > 20) {
     newErrors.id = "아이디는 6-20자로 입력해주세요.";
   }
   
   if (!formData.pwd || formData.pwd.length < 8 || formData.pwd.length > 20) {
     newErrors.pwd = "비밀번호는 8-20자로 입력해주세요.";
   }
   
   if (formData.pwd !== formData.pwd_confirm) {
     newErrors.pwd_confirm = "비밀번호가 일치하지 않습니다.";
   }

   return newErrors;
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   const newErrors = validateForm();
   
   if (Object.keys(newErrors).length > 0) {
     setErrors(newErrors);
     return;
   }

   try {
     const response = await api.post('/register', {
       name: formData.name,
       id: formData.id,
       pwd: formData.pwd,
       pwd_confirm: formData.pwd_confirm
     });

     // 성공 응답 처리 (Swagger에 맞춤)
     if (response.status === 200 && response.data.result === 'ok') {
       alert("회원가입이 완료되었습니다. 로그인해주세요.");
       navigate('/login');
     }
     
   } catch (error) {
     console.error("회원가입 오류:", error);
     
     // 400 에러 (Invalid input)
     if (error.response?.status === 400) {
       setErrors({ 
         submit: error.response.data.message 
       });
     }
     // 500 에러 (Database error)
     else if (error.response?.status === 500) {
       setErrors({ 
         submit: error.response.data.message 
       });
     }
   }
 };

 // 아이디 중복 확인 - 실제 API가 있다면 해당 엔드포인트로 수정 필요
 const handleDuplicateCheck = async () => {
   if (!formData.id) {
     setErrors({ id: "아이디를 입력해주세요." });
     return;
   }

   try {
     const response = await api.post('/check-duplicate', {
       id: formData.id
     });

     if (response.status === 200 && response.data.result === 'ok') {
       alert('사용 가능한 아이디입니다.');
     }
   } catch (error) {
     if (error.response?.status === 400) {
       setErrors({ id: error.response.data.message });
     }
   }
 };

 return (
   <div className="container">
     <div className="signup-form">
       <h2>회원가입</h2>
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

         <div className="input-group">
           <div className="input-group id-input-wrap">
             <input
               id="id"
               name="id"
               type="text"
               placeholder="아이디 입력 (6-20자)"
               value={formData.id}
               onChange={handleChange}
             />
             <button
               type="button"
               className="duplicate-check"
               onClick={handleDuplicateCheck}
             >
               중복 확인
             </button>
           </div>
           {errors.id && <p className="error-message">{errors.id}</p>}
         </div>

         <div className="input-group">
           <input
             id="pwd"
             name="pwd"
             type="password"
             placeholder="비밀번호 입력 (8-20자)"
             value={formData.pwd}
             onChange={handleChange}
           />
           {errors.pwd && <p className="error-message">{errors.pwd}</p>}
         </div>

         <div className="input-group">
           <input
             id="pwd_confirm"
             name="pwd_confirm"
             type="password"
             placeholder="비밀번호 재입력"
             value={formData.pwd_confirm}
             onChange={handleChange}
           />
           {errors.pwd_confirm && <p className="error-message">{errors.pwd_confirm}</p>}
         </div>

         <div className="button-group">
           <button type="submit" className="signup-btn">가입하기</button>
         </div>

         {errors.submit && <div className="error-message-general">{errors.submit}</div>}
       </form>
       
       <p className="login-prompt">
         이미 회원이십니까? <a href="/login">로그인 페이지로 가기</a>
       </p>
     </div>
   </div>
 );
}

export default Signup;