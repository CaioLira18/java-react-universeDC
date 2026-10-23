import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../Login/Login.css'
import './Register.css'

const API_URL = 'http://localhost:8080';

export const Register = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    imageUrl: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === 'imageUrl') setImageFailed(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedImage(file);
    if (!file) {
      setForm((prev) => ({ ...prev, imageUrl: '' }));
      return;
    }

    setForm((prev) => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
    setImageFailed(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          imageUrl: form.imageUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        setError(
          res.status === 409 || res.status === 500
            ? 'Não foi possível criar a conta. Esse e-mail já pode estar cadastrado.'
            : `Erro ${res.status} ao criar a conta. Tente novamente.`
        );
        return;
      }

      const createdUser = await res.json();
      let imageUploadFailed = false;

      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);

        try {
          const uploadRes = await fetch(`${API_URL}/users/${createdUser.id}/media`, {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) {
            console.error('Media upload failed', await uploadRes.text());
            imageUploadFailed = true;
          }
        } catch (uploadError) {
          console.error('Media upload failed', uploadError);
          imageUploadFailed = true;
        }
      }

      navigate('/login', {
        state: {
          registered: true,
          email: form.email.trim(),
          imageUploadFailed,
        },
      });
    } catch (err) {
      console.error(err);
      setError(`Não foi possível falar com o servidor. A API está rodando em ${API_URL}?`);
    } finally {
      setLoading(false);
    }
  };

  const showPreview = form.imageUrl.trim() && !imageFailed;

  return (
    <main className="auth">
      <div className="auth__wrap">
        <p className="auth__bubble">Todo herói tem um começo!</p>

        <form className="auth__card" onSubmit={handleSubmit}>
          <h1 className="auth__title"><span>Criar conta</span></h1>

          <label className="auth__field">
            <span className="auth__label">Nome</span>
            <input
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={handleChange('name')}
            />
          </label>

          <label className="auth__field">
            <span className="auth__label">E-mail</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange('email')}
            />
          </label>

          <label className="auth__field">
            <span className="auth__label">Senha</span>
            <div className="auth__password">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange('password')}
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

          <label className="auth__field">
            <span className="auth__label">Confirmar senha</span>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
            />
          </label>

          <label className="auth__field">
            <span className="auth__label">
              Foto de perfil <span className="auth__hint">(opcional)</span>
            </span>
            <div className="register__avatar-row">
              <div className="register__avatar" aria-hidden="true">
                {showPreview ? (
                  <img
                    src={form.imageUrl.trim()}
                    alt=""
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <span>{form.name.trim().charAt(0).toUpperCase() || '?'}</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </label>

          {error && <p className="auth__error" role="alert">{error}</p>}

          <button type="submit" className="auth__submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>

          <p className="auth__switch">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </div>
    </main>
  )
}

export default Register;
