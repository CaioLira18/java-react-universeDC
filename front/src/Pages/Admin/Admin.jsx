import React, { useEffect, useState, useCallback } from 'react'
import './Admin.css'

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
      { name: 'background', label: 'Imagem de fundo (URL)', type: 'url', required: true },
      { name: 'verticalmage', label: 'Imagem das polaroids (URL)', type: 'url' },
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
      { name: 'verticalImage', label: 'Pôster vertical (URL)', type: 'url' },
      { name: 'movieLogo', label: 'Logo do filme (URL)', type: 'url' },
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
      { name: 'serieLogo', label: 'Logo da série (URL)', type: 'url' },
    ],
  },
};

const emptyForm = (fields) =>
  Object.fromEntries(fields.map((f) => [f.name, '']));

const request = async (method, path, body) => {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao falar com a API`);
  return res.status === 204 ? null : res.json();
};

export const Admin = () => {

  const [resourceKey, setResourceKey] = useState('characters');
  const resource = RESOURCES[resourceKey];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm(resource.fields));
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');
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

  // trocou de aba: limpa o formulário e recarrega a lista
  useEffect(() => {
    setEditing(null);
    setForm(emptyForm(resource.fields));
    setFilter('');
    loadItems();
  }, [resourceKey, loadItems]);

  const startEdit = (item) => {
    setEditing(item);
    const values = {};
    resource.fields.forEach((f) => { values[f.name] = item[f.name] ?? ''; });
    setForm(values);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm(resource.fields));
  };

  const handleChange = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // campos vazios viram null; números viram number
    const clean = {};
    resource.fields.forEach((f) => {
      const v = form[f.name];
      if (v === '' || v === undefined) clean[f.name] = null;
      else clean[f.name] = f.type === 'number' ? Number(v) : v;
    });

    try {
      if (editing) {
        // mantém os campos que o formulário não mostra (ex.: appearances)
        await request('PUT', `${resource.path}/${editing.id}`, { ...editing, ...clean });
        notify('ok', `${resource.singular} atualizado!`);
      } else {
        await request('POST', resource.path, clean);
        notify('ok', `${resource.singular} cadastrado!`);
      }
      cancelEdit();
      loadItems();
    } catch (err) {
      notify('error', err.message);
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

  const visibleItems = items.filter((item) =>
    String(item[resource.titleField] || '')
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  const previewUrl = form[resource.imageField];

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
              onClick={() => setResourceKey(key)}
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

          {resource.fields.map((f) => (
            <label key={f.name} className="admin__field">
              <span className="admin__label">
                {f.label}{f.required && ' *'}
              </span>
              {f.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={form[f.name]}
                  required={f.required}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              ) : (
                <input
                  type={f.type}
                  value={form[f.name]}
                  required={f.required}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              )}
            </label>
          ))}

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
