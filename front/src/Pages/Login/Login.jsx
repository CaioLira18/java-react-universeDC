import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AUTH_KEY, notifyAuthChanged } from '../../auth'
import './Login.css'
import { API_URL } from '../../config'

export const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;
  const imageUploadFailed = location.state?.imageUploadFailed;

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        setError(
          res.status === 401 || res.status === 403 || res.status === 400 || res.status === 404
            ? 'E-mail ou senha incorretos.'
            : `Erro ${res.status} ao entrar. Tente novamente.`
        );
        return;
      }

      const data = await res.json(); // { token, email, name, role }
      localStorage.setItem(AUTH_KEY, JSON.stringify(data));
      notifyAuthChanged();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(`Não foi possível falar com o servidor. A API está rodando em ${API_URL}?`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth__wrap">
        <p className="auth__bubble">Pronto para a missão?</p>

        <form className="auth__card" onSubmit={handleSubmit}>
          <h1 className="auth__title"><span>Entrar</span></h1>

          {justRegistered && (
            <p className="auth__notice" role="status">
              {imageUploadFailed
                ? 'Conta criada, mas não foi possível enviar a foto de perfil. Faça login para continuar.'
                : 'Conta criada! Faça login para continuar.'}
            </p>
          )}

          <label className="auth__field">
            <span className="auth__label">E-mail</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth__field">
            <span className="auth__label">Senha</span>
            <div className="auth__password">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth__toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </label>

          {error && <p className="auth__error" role="alert">{error}</p>}

          <button type="submit" className="auth__submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="auth__switch">
            Ainda não tem conta? <Link to="/register">Criar conta</Link>
          </p>
        </form>
      </div>
    </main>
  )
}

export default Login;
