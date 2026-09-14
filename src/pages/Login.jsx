import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { useNavigate } from 'react-router-dom';

// Importando as imagens diretamente da pasta src/assets
import iconeIsolado from '../assets/icone_isolado.png';
import logoCompleto from '../assets/logo-completo.png';

import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // 1. Validação do login (manual ou gerado pelo sorteio)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const users = await response.json();

      // Valida se o e-mail e a senha (telefone) conferem com algum usuário da API
      const validUser = users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.phone.trim() === password.trim()
      );

      if (validUser) {
        setSuccessMessage(`Login bem-sucedido, ${validUser.name}! Redirecionando...`);
        localStorage.setItem('usuarioLogado', JSON.stringify(validUser));

        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        setError('E-mail ou senha inválidos. Verifique os dados ou clique em sortear.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Erro na validação do login:', err);
      setError('Erro de conexão ao tentar validar o acesso.');
      setLoading(false);
    }
  };

  // 2. Sorteia o usuário: preenche o e-mail visível e preenche a senha com o telefone (mas mascarada em bolinhas)
  const handleRandomLogin = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const users = await response.json();

      if (users && users.length > 0) {
        const randomIndex = Math.floor(Math.random() * users.length);
        const randomUser = users[randomIndex];

        // Preenche o e-mail para identificação visual na tela
        setEmail(randomUser.email);

        // Preenche a senha com o telefone da API, mas o componente Password exibe as bolinhas padrão (••••••)
        setPassword(randomUser.phone);

        setSuccessMessage(`Usuário sorteado: ${randomUser.name}. A senha foi preenchida com segurança.`);

        setLoading(false);
      } else {
        setError('Não foi possível carregar os usuários da API.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Erro ao sortear usuário:', err);
      setError('Erro de conexão ao tentar realizar o login aleatório.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Painel de destaque esquerdo com o Ícone Isolado do MeetSync */}
      <div className="login-panel">
        <img 
          src={iconeIsolado} 
          alt="MeetSync Ícone" 
          className="login-panel-icon-img" 
        />
        <h1>Reserve sua sala em segundos</h1>
        <p>Consulte a disponibilidade em tempo real, veja os recursos de cada espaço e agende sem conflito de horário.</p>
      </div>

      <div className="login-form-area">
        <Card className="login-card">
          
          {/* Cabeçalho do Card com a Logo Completa do MeetSync (Corrigido o alinhamento) */}
          <div className="login-card-header">
            <img 
              src={logoCompleto} 
              alt="MeetSync - Sistema de Reserva de Salas" 
              className="login-logo-completa" 
            />
           
          </div>

          {error && <Message severity="error" text={error} className="login-message" />}
          {successMessage && <Message severity="success" text={successMessage} className="login-message" />}

          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email">E-mail</label>
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail cadastrado"
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Senha (Telefone)</label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                feedback={false}
                toggleMask
                disabled={loading}
              />
            </div>

            <Button
              label={loading ? 'Verificando...' : 'Entrar'}
              type="submit"
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
              className="p-button-primary login-submit"
              disabled={loading}
            />
          </form>

          <Divider align="center">
            <span className="login-divider-text">ou</span>
          </Divider>

          <Button
            label="Sortear Usuário Aleatório"
            type="button"
            icon="pi pi-random"
            className="p-button-outlined p-button-secondary login-random-btn"
            onClick={handleRandomLogin}
            disabled={loading}
          />

          <p className="login-hint">
            Ao sortear, o e-mail aparece visível e a senha é preenchida automaticamente, protegida por bolinhas.
          </p>
        </Card>
      </div>
    </div>
  );
}