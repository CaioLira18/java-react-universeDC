import React, { useEffect, useState, useCallback } from 'react'
import './Admin.css'
import { AUTH_KEY } from '../../auth'

const API_URL = 'http://localhost:8080';

/*
  Para cadastrar um campo novo, basta adicionar uma linha em "fields".
  type: 'text' | 'textarea' | 'number' | 'url'
  O "name" precisa ser igual ao atributo da entidade no Java.
*/
const RESOURCES = {
  characters: {
    label: 'Personagens',
    singular: 'personagem',
    path: '/characters',
    titleField: 'name',
    imageField: 'background',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'true_name', label: 'Nome verdadeiro', type: 'text' },
      { name: 'description', label: 'Descrição', type: 'textarea' },
      { name: 'powers', label: 'Poderes', type: 'textarea' },
      { name: 'planet', label: 'Planeta', type: 'text' },
      { name: 'first_appearance', label: 'Primeira aparição', type: 'text' },
      { name: 'first_appearance_year', label: 'Ano da primeira aparição', type: 'number' },
    ],
  },
  movies: {
    label: 'Filmes',
    singular: 'filme',
    path: '/movies',
    titleField: 'title',
    imageField: 'verticalImage',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
    ],
  },
  series: {
    label: 'Séries',
    singular: 'série',
    path: '/series',
    titleField: 'title',
    imageField: 'serieLogo',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
    ],
  },
  games: {
    label: 'Jogos',
    singular: 'jogo',
    path: '/games',
    titleField: 'title',
    imageField: 'gameLogo',
    fields: [
      { name: 'title', label: 'Nome do jogo', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea', required: true },
    ],
  },
};

const emptyForm = (fields) =>
  Object.fromEntries(fields.map((f) => [f.name, '']));

const SUPERGIRL_PRESET = {
  name: 'Supergirl',
  true_name: 'Kara Zor-El',
  description: 'Heroína kryptoniana e prima do Superman, enviada à Terra para sobreviver à destruição de Krypton.',
  powers: 'Voo, superforça, supervelocidade, visão de calor, sopro congelante e invulnerabilidade.',
  planet: 'Krypton',
  first_appearance: 'Action Comics #252',
  first_appearance_year: '1959',
}

const request = async (method, path, body) => {
  let auth = null
  try {
    auth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch (error) {
    console.error('Não foi possível ler a sessão para a chamada administrativa.', error)
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const responseText = await res.text()
    throw new Error(responseText || `Erro ${res.status} ao falar com a API`)
  }
  return res.status === 204 ? null : res.json();
};

const uploadMedia = async (path, file) => {
  let auth = null
  try {
    auth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch (error) {
    console.error('Não foi possível ler a sessão para o envio da mídia.', error)
  }

  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: formData,
  })
  if (!res.ok) {
    const responseText = await res.text()
    throw new Error(responseText || `Erro ${res.status} ao enviar a mídia`)
  }
  return res.json()
}

const uploadGameMedia = (gameId, file) => uploadMedia(`/games/${gameId}/media`, file)
const uploadMovieMedia = (movieId, file) => uploadMedia(`/movies/${movieId}/media`, file)
const uploadSeriesMedia = (seriesId, file) => uploadMedia(`/series/${seriesId}/media`, file)
const uploadCatalogMedia = (resourceKey, itemId, file) =>
  uploadMedia(`/${resourceKey}/${itemId}/media`, file)

const uploadGameCharacterMedia = (gameId, characterId, file) =>
  uploadMedia(`/games/${gameId}/characters/${characterId}/media`, file)

const uploadCharacterMedia = (characterId, field, file) => {
  const query = new URLSearchParams({ field })
  return uploadMedia(`/characters/${characterId}/media?${query}`, file)
}

const uploadAppearanceMedia = (characterId, contentId, file) => {
  const query = new URLSearchParams({ characterId, contentId })
  return uploadMedia(`/character-appearances/media?${query}`, file)
}

export const Admin = () => {

  const [resourceKey, setResourceKey] = useState('characters');
  const resource = RESOURCES[resourceKey];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm(resource.fields));
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');
  const [games, setGames] = useState([])
  const [movies, setMovies] = useState([])
  const [series, setSeries] = useState([])
  const [selectedGameId, setSelectedGameId] = useState('')
  const [gameCharacterImage, setGameCharacterImage] = useState('')
  const [gameCharacterImageFile, setGameCharacterImageFile] = useState(null)
  const [gameMediaFile, setGameMediaFile] = useState(null)
  const [movieMediaFile, setMovieMediaFile] = useState(null)
  const [seriesMediaFile, setSeriesMediaFile] = useState(null)
  const [bannerMediaFile, setBannerMediaFile] = useState(null)
  const [galleryMediaFiles, setGalleryMediaFiles] = useState([])
  const [galleryImagesToRemove, setGalleryImagesToRemove] = useState([])
  const [characterBackgroundFile, setCharacterBackgroundFile] = useState(null)
  const [characterVerticalFile, setCharacterVerticalFile] = useState(null)
  const [linkingGame, setLinkingGame] = useState(false)
  const [appearanceType, setAppearanceType] = useState('movie')
  const [selectedContentId, setSelectedContentId] = useState('')
  const [appearanceImageFile, setAppearanceImageFile] = useState(null)
  const [linkingAppearance, setLinkingAppearance] = useState(false)
  const [toast, setToast] = useState(null); // { type: 'ok' | 'error', text }

  const notify = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadItems = useCallback(() => {
    setLoading(true);
    request('GET', resource.path)
      .then(setItems)
      .catch((err) => {
        setItems([]);
        notify('error', `${err.message}. A API está rodando em ${API_URL}?`);
      })
      .finally(() => setLoading(false));
  }, [resource.path]);

  useEffect(() => {
    request('GET', '/games')
      .then((data) => {
        setGames(data)
        setSelectedGameId((current) => current || data[0]?.id || '')
      })
      .catch((err) => notify('error', `Não foi possível carregar os jogos: ${err.message}`))
  }, []);

  useEffect(() => {
    Promise.all([request('GET', '/movies'), request('GET', '/series')])
      .then(([movieItems, seriesItems]) => {
        setMovies(movieItems)
        setSeries(seriesItems)
      })
      .catch((err) => notify('error', `Não foi possível carregar filmes e séries: ${err.message}`))
  }, []);

  // trocou de aba: limpa o formulário e recarrega a lista
  useEffect(() => {
    setEditing(null);
    setForm(emptyForm(resource.fields));
    setFilter('');
    loadItems();
  }, [resourceKey, loadItems]);

  useEffect(() => {
    if (resourceKey !== 'characters' || !editing) return

    const linkedGameIds = new Set(
      (editing.gameAppearances || []).map((appearance) => appearance.game?.id)
    )
    const currentGameIsAvailable = games.some(
      (game) => game.id === selectedGameId && !linkedGameIds.has(game.id)
    )
    if (!currentGameIsAvailable) {
      setSelectedGameId(games.find((game) => !linkedGameIds.has(game.id))?.id || '')
    }
  }, [resourceKey, editing, games, selectedGameId])

  const startEdit = (item) => {
    setEditing(item);
    setGameMediaFile(null)
    setMovieMediaFile(null)
    setSeriesMediaFile(null)
    setBannerMediaFile(null)
    setGalleryMediaFiles([])
    setGalleryImagesToRemove([])
    setGameCharacterImageFile(null)
    setCharacterBackgroundFile(null)
    setCharacterVerticalFile(null)
    setAppearanceImageFile(null)
    const values = {};
    resource.fields.forEach((f) => { values[f.name] = item[f.name] ?? ''; });
    setForm(values);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm(resource.fields));
    setGameMediaFile(null)
    setMovieMediaFile(null)
    setSeriesMediaFile(null)
    setBannerMediaFile(null)
    setGalleryMediaFiles([])
    setGalleryImagesToRemove([])
    setGameCharacterImageFile(null)
    setGameCharacterImage('')
    setCharacterBackgroundFile(null)
    setCharacterVerticalFile(null)
    setAppearanceImageFile(null)
    setCharacterBackgroundFile(null)
    setCharacterVerticalFile(null)
    setAppearanceImageFile(null)
  };

  const handleChange = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const fillSupergirlPreset = () => {
    setEditing(null)
    setForm({ ...emptyForm(resource.fields), ...SUPERGIRL_PRESET })
    setCharacterBackgroundFile(null)
    setCharacterVerticalFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resourceKey === 'characters' && !editing && !characterBackgroundFile) {
      notify('error', 'Selecione a imagem de fundo do personagem.')
      return
    }
    if (['games', 'movies', 'series'].includes(resourceKey) && !editing && !bannerMediaFile) {
      notify('error', 'Selecione o banner estático.')
      return
    }
    setSaving(true);

    // campos vazios viram null; números viram number
    const clean = {};
    resource.fields.forEach((f) => {
      const v = form[f.name];
      if (v === '' || v === undefined) clean[f.name] = null;
      else clean[f.name] = f.type === 'number' ? Number(v) : v;
    });

    let savedItem = null
    try {
      if (editing) {
        const updatePayload = resourceKey === 'characters'
          ? {
              ...clean,
              background: editing.background,
              logo: editing.logo,
              verticalmage: editing.verticalmage,
            }
          : resourceKey === 'series'
            ? {
                ...clean,
                serieLogo: editing.serieLogo,
                banner: editing.banner,
                images: editing.images || [],
              }
          : resourceKey === 'movies'
            ? {
                ...clean,
                verticalImage: editing.verticalImage,
                movieLogo: null,
                year: editing.year,
                duration: editing.duration,
                banner: editing.banner,
                images: editing.images || [],
              }
          : resourceKey === 'games'
            ? {
                ...clean,
                gameLogo: editing.gameLogo,
                banner: editing.banner,
                images: editing.images || [],
              }
          : { ...editing, ...clean }
        savedItem = await request('PUT', `${resource.path}/${editing.id}`, updatePayload);
      } else {
        savedItem = await request('POST', resource.path, clean);
      }

      if (resourceKey === 'games' && gameMediaFile) {
        const { url } = await uploadGameMedia(savedItem.id, gameMediaFile)
        savedItem = await request('PUT', `/games/${savedItem.id}`, {
          ...savedItem,
          gameLogo: url,
        })
      }

      if (resourceKey === 'movies' && movieMediaFile) {
        const { url } = await uploadMovieMedia(savedItem.id, movieMediaFile)
        savedItem = await request('PUT', `/movies/${savedItem.id}`, {
          ...savedItem,
          verticalImage: url,
          movieLogo: null,
        })
      }

      if (resourceKey === 'series' && seriesMediaFile) {
        const { url } = await uploadSeriesMedia(savedItem.id, seriesMediaFile)
        savedItem = await request('PUT', `/series/${savedItem.id}`, {
          ...savedItem,
          serieLogo: url,
        })
      }

      if (
        ['games', 'movies', 'series'].includes(resourceKey) &&
        (bannerMediaFile || galleryMediaFiles.length > 0 || galleryImagesToRemove.length > 0)
      ) {
        const banner = bannerMediaFile
          ? await uploadCatalogMedia(resourceKey, savedItem.id, bannerMediaFile).then(({ url }) => url)
          : savedItem.banner || editing?.banner || null
        const images = (savedItem.images || editing?.images || [])
          .filter((image) => !galleryImagesToRemove.includes(image))
        for (const file of galleryMediaFiles) {
          const { url } = await uploadCatalogMedia(resourceKey, savedItem.id, file)
          images.push(url)
        }
        savedItem = await request('PUT', `${resource.path}/${savedItem.id}`, {
          ...savedItem,
          banner,
          images,
        })
      }

      if (resourceKey === 'characters' && characterBackgroundFile) {
        savedItem = await uploadCharacterMedia(savedItem.id, 'background', characterBackgroundFile)
      }
      if (resourceKey === 'characters' && characterVerticalFile) {
        savedItem = await uploadCharacterMedia(savedItem.id, 'verticalmage', characterVerticalFile)
      }

      notify('ok', `${resource.singular} ${editing ? 'atualizado' : 'cadastrado'}!`);
      cancelEdit();
      loadItems();
    } catch (err) {
      if (savedItem?.id && (resourceKey === 'games' || resourceKey === 'movies' || resourceKey === 'series' || resourceKey === 'characters')) {
        setEditing(savedItem)
        if (!editing) {
          const values = {}
          resource.fields.forEach((field) => { values[field.name] = savedItem[field.name] ?? '' })
          setForm(values)
        }
        loadItems()
        notify('error', `O ${resource.singular} foi salvo, mas não foi possível concluir o envio da mídia: ${err.message}`)
      } else {
        notify('error', err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const name = item[resource.titleField] || 'este item';
    if (!window.confirm(`Excluir "${name}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await request('DELETE', `${resource.path}/${item.id}`);
      notify('ok', `${resource.singular} excluído.`);
      if (editing?.id === item.id) cancelEdit();
      loadItems();
    } catch (err) {
      notify('error', err.message);
    }
  };

  const linkGameToCharacter = async () => {
    if (!editing || !selectedGameId || (!gameCharacterImage.trim() && !gameCharacterImageFile)) {
      notify('error', 'Selecione um jogo e informe uma URL ou selecione a imagem do personagem.')
      return
    }

    setLinkingGame(true)
    try {
      const characterImage = gameCharacterImageFile
        ? (await uploadGameCharacterMedia(selectedGameId, editing.id, gameCharacterImageFile)).url
        : gameCharacterImage.trim()
      await request('POST', '/character-game-appearances', {
        characterId: editing.id,
        gameId: selectedGameId,
        characterImage,
      })
      const updatedCharacter = await request('GET', `/characters/${editing.id}`)
      setEditing(updatedCharacter)
      setGameCharacterImage('')
      setGameCharacterImageFile(null)
      loadItems()
      notify('ok', 'Jogo relacionado ao personagem!')
    } catch (err) {
      notify('error', err.message)
    } finally {
      setLinkingGame(false)
    }
  }

  const unlinkGameFromCharacter = async (appearance) => {
    try {
      await request('DELETE', `/character-game-appearances/${appearance.id}`)
      const updatedCharacter = await request('GET', `/characters/${editing.id}`)
      setEditing(updatedCharacter)
      loadItems()
      notify('ok', 'Relação com o jogo removida.')
    } catch (err) {
      notify('error', err.message)
    }
  }

  const linkContentToCharacter = async () => {
    if (!editing || !selectedContentId || !appearanceImageFile) {
      notify('error', 'Selecione um filme ou série e envie a imagem do personagem.')
      return
    }

    setLinkingAppearance(true)
    try {
      const { url: characterImage } = await uploadAppearanceMedia(
        editing.id,
        selectedContentId,
        appearanceImageFile
      )
      await request('POST', '/character-appearances', {
        characterId: editing.id,
        contentId: selectedContentId,
        characterImage,
      })
      const updatedCharacter = await request('GET', `/characters/${editing.id}`)
      setEditing(updatedCharacter)
      setAppearanceImageFile(null)
      setSelectedContentId('')
      loadItems()
      notify('ok', 'Filme ou série relacionado ao personagem!')
    } catch (err) {
      notify('error', err.message)
    } finally {
      setLinkingAppearance(false)
    }
  }

  const unlinkContentFromCharacter = async (appearance) => {
    try {
      await request('DELETE', `/character-appearances/${appearance.id}`)
      const updatedCharacter = await request('GET', `/characters/${editing.id}`)
      setEditing(updatedCharacter)
      loadItems()
      notify('ok', 'Relação com filme ou série removida.')
    } catch (err) {
      notify('error', err.message)
    }
  }

  const visibleItems = items.filter((item) =>
    String(item[resource.titleField] || '')
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  const previewUrl = form[resource.imageField] || editing?.[resource.imageField];
  const linkedGameIds = new Set(
    (editing?.gameAppearances || []).map((appearance) => appearance.game?.id)
  )
  const availableGames = games.filter((game) => !linkedGameIds.has(game.id))
  const contentOptions = (appearanceType === 'movie' ? movies : series).filter(
    (content) => !(editing?.appearances || []).some((appearance) => appearance.content?.id === content.id)
  )

  return (
    <div className="admin">
      <header className="admin__header">
        <h1 className="admin__title">Painel de controle</h1>
        <nav className="admin__tabs" aria-label="Tipo de cadastro">
          {Object.entries(RESOURCES).map(([key, r]) => (
            <button
              key={key}
              type="button"
              className={`admin__tab${key === resourceKey ? ' active' : ''}`}
              onClick={() => {
                setResourceKey(key)
                setGameMediaFile(null)
                setMovieMediaFile(null)
                setSeriesMediaFile(null)
                setBannerMediaFile(null)
                setGalleryMediaFiles([])
                setGalleryImagesToRemove([])
                setGameCharacterImageFile(null)
                setGameCharacterImage('')
              }}
              aria-pressed={key === resourceKey}
            >
              {r.label}
            </button>
          ))}
        </nav>
      </header>

      {toast && (
        <div className={`admin__toast admin__toast--${toast.type}`} role="status">
          {toast.text}
        </div>
      )}

      <div className="admin__layout">

        {/* ---------- Formulário ---------- */}
        <form className="admin__form" onSubmit={handleSubmit}>
          <h2 className="admin__form-title">
            {editing ? `Editar ${resource.singular}` : `Novo ${resource.singular}`}
          </h2>

          {resourceKey === 'characters' && !editing && (
            <button
              type="button"
              className="admin__btn admin__btn--preset"
              onClick={fillSupergirlPreset}
            >
              Preencher dados da Supergirl
            </button>
          )}

          {resource.fields.map((f) => (
            <label key={f.name} className="admin__field">
              <span className="admin__label">
                {f.label}{f.required && ' *'}
              </span>
              {f.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={form[f.name] ?? ''}
                  required={f.required}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              ) : (
                <input
                  type={f.type}
                  value={form[f.name] ?? ''}
                  required={f.required}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              )}
            </label>
          ))}

          {resourceKey === 'characters' && (
            <>
              <label className="admin__field">
                <span className="admin__label">Imagem de fundo do personagem{!editing && ' *'}</span>
                <input
                  key={characterBackgroundFile?.name || 'character-background-empty'}
                  type="file"
                  accept="image/*"
                  required={!editing && !characterBackgroundFile}
                  onChange={(event) => setCharacterBackgroundFile(event.target.files?.[0] || null)}
                />
                <span className="admin__file-name">
                  {characterBackgroundFile
                    ? `${characterBackgroundFile.name} (${(characterBackgroundFile.size / (1024 * 1024)).toFixed(1)} MB)`
                    : editing?.background
                      ? 'Imagem atual mantida se nenhum arquivo for escolhido'
                      : 'Obrigatória no cadastro — limite de 25 MB'}
                </span>
              </label>
              <label className="admin__field">
                <span className="admin__label">Imagem das polaroids (opcional)</span>
                <input
                  key={characterVerticalFile?.name || 'character-vertical-empty'}
                  type="file"
                  accept="image/*"
                  onChange={(event) => setCharacterVerticalFile(event.target.files?.[0] || null)}
                />
                <span className="admin__file-name">
                  {characterVerticalFile
                    ? `${characterVerticalFile.name} (${(characterVerticalFile.size / (1024 * 1024)).toFixed(1)} MB)`
                    : editing?.verticalmage
                      ? 'Imagem atual mantida se nenhum arquivo for escolhido'
                      : 'Limite de 25 MB'}
                </span>
              </label>
            </>
          )}

          {resourceKey === 'games' && (
            <label className="admin__field">
              <span className="admin__label">Enviar logo ou capa para o armazenamento do jogo</span>
              <input
                key={gameMediaFile?.name || 'game-media-empty'}
                type="file"
                accept="image/*"
                onChange={(event) => setGameMediaFile(event.target.files?.[0] || null)}
              />
              <span className="admin__file-name">
                {gameMediaFile
                  ? `${gameMediaFile.name} (${(gameMediaFile.size / (1024 * 1024)).toFixed(1)} MB)`
                  : 'Nenhum arquivo selecionado — limite de 25 MB'}
              </span>
            </label>
          )}

          {resourceKey === 'series' && (
            <label className="admin__field">
              <span className="admin__label">Logo da série (opcional)</span>
              <input
                key={seriesMediaFile?.name || 'series-media-empty'}
                type="file"
                accept="image/*"
                onChange={(event) => setSeriesMediaFile(event.target.files?.[0] || null)}
              />
              <span className="admin__file-name">
                {seriesMediaFile
                  ? `${seriesMediaFile.name} (${(seriesMediaFile.size / (1024 * 1024)).toFixed(1)} MB)`
                  : editing?.serieLogo
                    ? 'Imagem atual mantida se nenhum arquivo for escolhido'
                    : 'Nenhum arquivo selecionado — limite de 25 MB'}
              </span>
            </label>
          )}

          {resourceKey === 'movies' && (
            <label className="admin__field">
              <span className="admin__label">Pôster do filme (opcional)</span>
              <input
                key={movieMediaFile?.name || 'movie-media-empty'}
                type="file"
                accept="image/*"
                onChange={(event) => setMovieMediaFile(event.target.files?.[0] || null)}
              />
              <span className="admin__file-name">
                {movieMediaFile
                  ? `${movieMediaFile.name} (${(movieMediaFile.size / (1024 * 1024)).toFixed(1)} MB)`
                  : editing?.verticalImage
                    ? 'Pôster atual mantido se nenhum arquivo for escolhido'
                    : 'Nenhum arquivo selecionado — limite de 25 MB'}
              </span>
            </label>
          )}

          {['games', 'movies', 'series'].includes(resourceKey) && (
            <>
              <label className="admin__field">
                <span className="admin__label">Banner estático{!editing && ' *'}</span>
                <input
                  key={bannerMediaFile?.name || 'catalog-banner-empty'}
                  type="file"
                  accept="image/*"
                  required={!editing && !bannerMediaFile}
                  onChange={(event) => setBannerMediaFile(event.target.files?.[0] || null)}
                />
                <span className="admin__file-name">
                  {bannerMediaFile
                    ? `${bannerMediaFile.name} (${(bannerMediaFile.size / (1024 * 1024)).toFixed(1)} MB)`
                    : editing?.banner
                      ? 'Banner atual mantido se nenhum arquivo for escolhido'
                      : 'Nenhum arquivo selecionado — limite de 25 MB'}
                </span>
              </label>
              <label className="admin__field">
                <span className="admin__label">Imagens da galeria (opcional)</span>
                <input
                  key={galleryMediaFiles.map((file) => file.name).join('|') || 'catalog-gallery-empty'}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => setGalleryMediaFiles(Array.from(event.target.files || []))}
                />
                <span className="admin__file-name">
                  {galleryMediaFiles.length > 0
                    ? `${galleryMediaFiles.length} imagem(ns) selecionada(s)`
                    : `Imagens atuais: ${editing?.images?.length || 0} — arquivos de até 25 MB cada`}
                </span>
              </label>
              {editing?.images?.length > 0 && (
                <ul className="admin__game-links" aria-label="Imagens atuais da galeria">
                  {editing.images.map((image) => {
                    const markedForRemoval = galleryImagesToRemove.includes(image)
                    return (
                      <li className="admin__game-link-row" key={image}>
                        <img src={image} alt="" />
                        <span>{markedForRemoval ? 'Será removida ao salvar' : 'Imagem da galeria'}</span>
                        <button
                          type="button"
                          className={`admin__btn admin__btn--small${markedForRemoval ? '' : ' admin__btn--danger'}`}
                          onClick={() => setGalleryImagesToRemove((current) => (
                            markedForRemoval
                              ? current.filter((url) => url !== image)
                              : [...current, image]
                          ))}
                        >
                          {markedForRemoval ? 'Manter' : 'Remover'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}

          {resourceKey === 'characters' && editing && (
            <>
            <section className="admin__game-link">
              <h3 className="admin__game-link-title">Aparições em jogos</h3>
              {editing.gameAppearances?.length > 0 ? (
                <ul className="admin__game-links">
                  {editing.gameAppearances.map((appearance) => (
                    <li key={appearance.id} className="admin__game-link-row">
                      <img src={appearance.characterImage} alt="" />
                      <span>{appearance.game?.title || 'Jogo'}</span>
                      <button
                        type="button"
                        className="admin__btn admin__btn--small admin__btn--danger"
                        onClick={() => unlinkGameFromCharacter(appearance)}
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="admin__empty">Nenhum jogo relacionado.</p>
              )}

              <div className="admin__game-link-form">
                <label className="admin__field">
                  <span className="admin__label">Jogo</span>
                  <select
                    value={selectedGameId}
                    onChange={(event) => setSelectedGameId(event.target.value)}
                  >
                    <option value="" disabled>Selecione um jogo</option>
                    {availableGames.map((game) => (
                      <option key={game.id} value={game.id}>{game.title}</option>
                    ))}
                  </select>
                </label>
                <label className="admin__field">
                  <span className="admin__label">Imagem do personagem nesse jogo (URL opcional)</span>
                  <input
                    type="url"
                    value={gameCharacterImage}
                    onChange={(event) => setGameCharacterImage(event.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <label className="admin__field">
                  <span className="admin__label">Ou enviar imagem para a pasta deste jogo</span>
                  <input
                    key={gameCharacterImageFile?.name || 'character-image-empty'}
                    type="file"
                    accept="image/*"
                    onChange={(event) => setGameCharacterImageFile(event.target.files?.[0] || null)}
                  />
                  <span className="admin__file-name">
                    {gameCharacterImageFile
                      ? `${gameCharacterImageFile.name} (${(gameCharacterImageFile.size / (1024 * 1024)).toFixed(1)} MB)`
                      : 'Nenhum arquivo selecionado — limite de 25 MB'}
                  </span>
                </label>
                <button
                  type="button"
                  className="admin__btn admin__btn--primary"
                  disabled={linkingGame || availableGames.length === 0}
                  onClick={linkGameToCharacter}
                >
                  {linkingGame ? 'Relacionando...' : 'Relacionar jogo'}
                </button>
              </div>
            </section>
            <section className="admin__game-link">
              <h3 className="admin__game-link-title">Aparições em filmes e séries</h3>
              {editing.appearances?.length > 0 ? (
                <ul className="admin__game-links">
                  {editing.appearances.map((appearance) => (
                    <li key={appearance.id} className="admin__game-link-row">
                      <img src={appearance.characterImage} alt="" />
                      <span>
                        {appearance.content?.title || 'Conteúdo'}
                        {' · '}
                        {appearance.content?.movieLogo !== undefined ? 'Filme' : 'Série'}
                      </span>
                      <button
                        type="button"
                        className="admin__btn admin__btn--small admin__btn--danger"
                        onClick={() => unlinkContentFromCharacter(appearance)}
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="admin__empty">Nenhum filme ou série relacionado.</p>
              )}

              <div className="admin__game-link-form">
                <label className="admin__field">
                  <span className="admin__label">Tipo</span>
                  <select
                    value={appearanceType}
                    onChange={(event) => {
                      setAppearanceType(event.target.value)
                      setSelectedContentId('')
                      setAppearanceImageFile(null)
                    }}
                  >
                    <option value="movie">Filme</option>
                    <option value="series">Série</option>
                  </select>
                </label>
                <label className="admin__field">
                  <span className="admin__label">Filme ou série</span>
                  <select
                    value={selectedContentId}
                    onChange={(event) => setSelectedContentId(event.target.value)}
                  >
                    <option value="" disabled>Selecione um título</option>
                    {contentOptions.map((content) => (
                      <option key={content.id} value={content.id}>{content.title}</option>
                    ))}
                  </select>
                </label>
                <label className="admin__field">
                  <span className="admin__label">Imagem do personagem neste conteúdo</span>
                  <input
                    key={appearanceImageFile?.name || 'appearance-image-empty'}
                    type="file"
                    accept="image/*"
                    onChange={(event) => setAppearanceImageFile(event.target.files?.[0] || null)}
                  />
                  <span className="admin__file-name">
                    {appearanceImageFile
                      ? `${appearanceImageFile.name} (${(appearanceImageFile.size / (1024 * 1024)).toFixed(1)} MB)`
                      : 'Obrigatória — limite de 25 MB'}
                  </span>
                </label>
                <button
                  type="button"
                  className="admin__btn admin__btn--primary"
                  disabled={linkingAppearance || contentOptions.length === 0 || !appearanceImageFile}
                  onClick={linkContentToCharacter}
                >
                  {linkingAppearance ? 'Relacionando...' : 'Relacionar filme/série'}
                </button>
                {contentOptions.length === 0 && (
                  <p className="admin__empty">
                    Não há {appearanceType === 'movie' ? 'filmes' : 'séries'} disponíveis para relacionar.
                  </p>
                )}
              </div>
            </section>
            </>
          )}

          {previewUrl && (
            <div className="admin__preview">
              <img src={previewUrl} alt="Pré-visualização" />
            </div>
          )}

          <div className="admin__actions">
            <button type="submit" className="admin__btn admin__btn--primary" disabled={saving}>
              {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar'}
            </button>
            {editing && (
              <button type="button" className="admin__btn" onClick={cancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* ---------- Lista ---------- */}
        <section className="admin__list">
          <div className="admin__list-head">
            <h2 className="admin__list-title">
              {resource.label} <span className="admin__count">{items.length}</span>
            </h2>
            <input
              type="search"
              className="admin__search"
              placeholder="Buscar pelo nome"
              aria-label="Buscar pelo nome"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          {loading && <p className="admin__empty">Carregando...</p>}

          {!loading && visibleItems.length === 0 && (
            <p className="admin__empty">
              {items.length === 0
                ? `Nenhum ${resource.singular} cadastrado ainda. Use o formulário para criar o primeiro.`
                : 'Nada encontrado para essa busca.'}
            </p>
          )}

          <ul className="admin__rows">
            {visibleItems.map((item) => (
              <li
                key={item.id}
                className={`admin__row${editing?.id === item.id ? ' editing' : ''}`}
              >
                <div className="admin__thumb">
                  {item[resource.imageField] && (
                    <img src={item[resource.imageField]} alt="" loading="lazy" />
                  )}
                </div>
                <span className="admin__row-name">{item[resource.titleField]}</span>
                <div className="admin__row-actions">
                  <button type="button" className="admin__btn admin__btn--small" onClick={() => startEdit(item)}>
                    Editar
                  </button>
                  <button type="button" className="admin__btn admin__btn--small admin__btn--danger" onClick={() => handleDelete(item)}>
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default Admin;
