import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Garanta que a sua instância configurada do Supabase está neste caminho

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

  // Autenticação com o Supabase Auth
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
      // Chamada real para validar as credenciais no banco do Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        setError(authError.message || 'E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Monta o objeto com os dados reais do utilizador autenticado
        const usuarioReal = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        };

        setSuccessMessage(`Login bem-sucedido, ${usuarioReal.name}! Redirecionando...`);
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioReal));

        setTimeout(() => {
          navigate('/home');
        }, 1200);
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      setError('Erro de conexão ao tentar validar o acesso.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Painel de destaque esquerdo */}
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
              <label htmlFor="password">Senha</label>
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
        </Card>
      </div>
    </div>
  );
}