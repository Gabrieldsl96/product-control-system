import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Importando o arquivo Login.css

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });
      if (response.data === 'success') {
        // Redirecionar para o dashboard
        window.location.href = '/dashboard';
      } else {
        alert('Credenciais inválidas!');
      }
    } catch (error) {
      console.error('Houve um erro ao fazer login', error.response || error.message || error);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
