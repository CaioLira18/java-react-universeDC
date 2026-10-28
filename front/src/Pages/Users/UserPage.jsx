import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AUTH_KEY, notifyAuthChanged } from '../../auth'
import './UserPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const readAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch (error) {
    console.error('Não foi possível ler os dados de autenticação salvos.', error)
    return null
  }
}

export const UserPage = () => {
  const navigate = useNavigate()
  const [auth, setAuth] = useState(readAuth)
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    if (!auth?.token) {
      navigate('/login', { replace: true })
      return undefined
    }

    let cancelled = false
    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403
            ? 'Sua sessão expirou. Entre novamente.'
            : `Erro ${response.status} ao carregar o perfil.`)
        }

        const currentProfile = await response.json()
        if (cancelled) return
        setProfile(currentProfile)
        setForm((previous) => ({
          ...previous,
          name: currentProfile.name || '',
          email: currentProfile.email || '',
        }))
        setImageFailed(false)
      } catch (loadError) {
        if (!cancelled) {
          console.error('Não foi possível carregar o perfil.', loadError)
          setError(loadError.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [auth?.token, navigate])

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const updateAuth = (updatedAuth) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedAuth))
    setAuth(updatedAuth)
    notifyAuthChanged()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (form.password && form.password !== form.confirmPassword) {
      setError('As senhas não conferem.')
      return
    }

    if (form.password && form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setSaving(true)
    let savedAuth = auth
    let profileWasSaved = false

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password || null,
        }),
      })

      if (!response.ok) {
        const responseMessage = await response.text()
        throw new Error(responseMessage || `Erro ${response.status} ao salvar o perfil.`)
      }

      savedAuth = await response.json()
      updateAuth(savedAuth)
      profileWasSaved = true
      setForm((previous) => ({ ...previous, password: '', confirmPassword: '' }))

      if (selectedImage) {
        const uploadData = new FormData()
        uploadData.append('file', selectedImage)
        const uploadResponse = await fetch(`${API_URL}/users/me/media`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${savedAuth.token}` },
          body: uploadData,
        })

        if (!uploadResponse.ok) {
          const responseMessage = await uploadResponse.text()
          throw new Error(responseMessage || `Erro ${uploadResponse.status} ao enviar a foto.`)
        }

        savedAuth = await uploadResponse.json()
        updateAuth(savedAuth)
        setSelectedImage(null)
        setImagePreview('')
      }

      const profileResponse = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${savedAuth.token}` },
      })
      if (!profileResponse.ok) {
        throw new Error(`Perfil salvo, mas não foi possível atualizar a exibição (erro ${profileResponse.status}).`)
      }

      setProfile(await profileResponse.json())
      setImageFailed(false)
      setNotice('Perfil atualizado com sucesso.')
    } catch (saveError) {
      console.error('Não foi possível salvar o perfil.', saveError)
      setError(saveError.message)
      if (profileWasSaved) {
        setNotice('Os dados foram salvos, mas ocorreu um erro ao concluir as demais alterações.')
      }
    } finally {
      setSaving(false)
    }
  }

  const displayedImage = imagePreview || profile?.imageUrl
  const initial = form.name.trim().charAt(0).toUpperCase() || '?'

  if (loading) {
    return (
      <main className="userPage">
        <p className="userPage__message" role="status">Carregando perfil...</p>
      </main>
    )
  }

  return (
    <main className="userPage">
      <div className="userPage__wrap">
        <p className="userPage__bubble">Sua identidade heroica</p>

        <section className="userPage__card" aria-labelledby="userPageTitle">
          <h1 className="userPage__title" id="userPageTitle">Meu perfil</h1>

          {error && <p className="userPage__alert userPage__alert--error" role="alert">{error}</p>}
          {notice && <p className="userPage__alert userPage__alert--success" role="status">{notice}</p>}

          {profile ? (
            <>
              <div className="userPage__summary">
                <div className="userPage__avatar">
                  {displayedImage && !imageFailed ? (
                    <img
                      src={displayedImage}
                      alt={`Foto de perfil de ${profile.name}`}
                      onError={() => setImageFailed(true)}
                    />
                  ) : (
                    <span aria-hidden="true">{initial}</span>
                  )}
                </div>
                <div>
                  <h2>{profile.name}</h2>
                  <p>{profile.email}</p>
                  <span className="userPage__role">{profile.role}</span>
                </div>
              </div>

              <form className="userPage__form" onSubmit={handleSubmit}>
                <label className="userPage__field">
                  <span>Nome</span>
                  <input
                    type="text"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                  />
                </label>

                <label className="userPage__field">
                  <span>E-mail</span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
                  />
                </label>

                <label className="userPage__field">
                  <span>Foto de perfil</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null
                      setSelectedImage(file)
                      setImagePreview(file ? URL.createObjectURL(file) : '')
                    }}
                  />
                </label>

                <p className="userPage__section-label">Alterar senha (opcional)</p>
                <label className="userPage__field">
                  <span>Nova senha</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    value={form.password}
                    onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
                  />
                </label>

                <label className="userPage__field">
                  <span>Confirmar nova senha</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    value={form.confirmPassword}
                    onChange={(event) => setForm((previous) => ({ ...previous, confirmPassword: event.target.value }))}
                  />
                </label>

                <div className="userPage__actions">
                  <button type="submit" className="userPage__save" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                  <Link to="/" className="userPage__back">Voltar</Link>
                </div>
              </form>
            </>
          ) : (
            <p className="userPage__message">
              Não foi possível exibir os dados do perfil. <Link to="/login">Entre novamente</Link>.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}

export default UserPage