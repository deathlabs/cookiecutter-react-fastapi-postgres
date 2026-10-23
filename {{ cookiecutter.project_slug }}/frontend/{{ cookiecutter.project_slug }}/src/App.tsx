import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

type Item = { id: number; name: string; description: string | null }
const ITEMS_URL = '/api/v1/items/'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null
    throw new Error(body?.detail ?? `Request failed (${response.status})`)
  }
  return response.status === 204 ? (undefined as T) : response.json()
}

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [lookupId, setLookupId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [busy, setBusy] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const listItems = useCallback(async () => {
    setBusy(true)
    setError('')
    try {
      setItems(await request<Item[]>(ITEMS_URL))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load items')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    request<Item[]>(ITEMS_URL).then(setItems).catch((requestError: unknown) => {
      setError(requestError instanceof Error ? requestError.message : 'Could not load items')
    }).finally(() => setBusy(false))
  }, [])

  function resetForm() {
    setName('')
    setDescription('')
    setEditingId(null)
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) { setError('Name is required'); return }
    setBusy(true); setError(''); setMessage('')
    try {
      const isEditing = editingId !== null
      await request<Item>(isEditing ? `${ITEMS_URL}${editingId}` : ITEMS_URL, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, description: description.trim() || null }),
      })
      setMessage(isEditing ? 'Item updated' : 'Item created')
      resetForm()
      await listItems()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save item')
      setBusy(false)
    }
  }

  async function getItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const id = Number(lookupId)
    if (!Number.isInteger(id) || id < 1) { setError('Enter a positive numeric ID'); return }
    setBusy(true); setError(''); setMessage('')
    try {
      setSelectedItem(await request<Item>(`${ITEMS_URL}${id}`))
    } catch (requestError) {
      setSelectedItem(null)
      setError(requestError instanceof Error ? requestError.message : 'Could not get item')
    } finally { setBusy(false) }
  }

  function startEdit(item: Item) {
    setEditingId(item.id); setName(item.name); setDescription(item.description ?? '')
    setMessage(`Editing item ${item.id}`); setError('')
  }

  async function deleteItem(item: Item) {
    if (!window.confirm(`Delete “${item.name}”?`)) return
    setBusy(true); setError(''); setMessage('')
    try {
      await request<void>(`${ITEMS_URL}${item.id}`, { method: 'DELETE' })
      if (editingId === item.id) resetForm()
      if (selectedItem?.id === item.id) setSelectedItem(null)
      setMessage('Item deleted')
      await listItems()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete item')
      setBusy(false)
    }
  }

  return <>
    <section id="center">
      <div className="hero">
        <img src={heroImg} className="base" width="170" height="179" alt="" />
        <img src={reactLogo} className="framework" alt="React logo" />
        <img src={viteLogo} className="vite" alt="Vite logo" />
      </div>
      <div><h1>Get started</h1><p>Edit <code>src/App.tsx</code> and save to test <code>HMR</code></p></div>
      <section className="item-demo" aria-labelledby="item-demo-title">
        <div className="item-demo__heading"><h2 id="item-demo-title">Items</h2><button type="button" onClick={() => void listItems()} disabled={busy}>Refresh list</button></div>
        <form className="item-form" onSubmit={saveItem}>
          <label>Name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={200} required /></label>
          <label>Description<input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} /></label>
          <button type="submit" disabled={busy}>{editingId === null ? 'Create item' : 'Save edit'}</button>
          {editingId !== null && <button type="button" onClick={resetForm}>Cancel</button>}
        </form>
        <form className="lookup-form" onSubmit={getItem}>
          <label htmlFor="item-id">Get item by ID</label>
          <input id="item-id" type="number" min="1" step="1" value={lookupId} onChange={(event) => setLookupId(event.target.value)} required />
          <button type="submit" disabled={busy}>Get item</button>
        </form>
        <div className="item-feedback" aria-live="polite">
          {busy && <span>Working…</span>}{error && <span className="error">{error}</span>}{message && <span className="success">{message}</span>}
        </div>
        {selectedItem && <p className="selected-item"><strong>Item {selectedItem.id}:</strong> {selectedItem.name}{selectedItem.description && ` — ${selectedItem.description}`}</p>}
        <ul className="item-list" aria-label="Items">
          {items.length === 0 && !busy && <li className="empty">No items yet.</li>}
          {items.map((item) => <li key={item.id}>
            <span><strong>#{item.id} {item.name}</strong>{item.description && <small>{item.description}</small>}</span>
            <span className="item-actions"><button type="button" onClick={() => startEdit(item)} disabled={busy}>Edit</button><button type="button" onClick={() => void deleteItem(item)} disabled={busy}>Delete</button></span>
          </li>)}
        </ul>
      </section>
    </section>
    <div className="ticks"></div>
    <section id="next-steps">
      <div id="docs"><svg className="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#documentation-icon"></use></svg><h2>Documentation</h2><p>Your questions, answered</p><ul><li><a href="https://vite.dev/" target="_blank"><img className="logo" src={viteLogo} alt="" />Explore Vite</a></li><li><a href="https://react.dev/" target="_blank"><img className="button-icon" src={reactLogo} alt="" />Learn more</a></li></ul></div>
      <div id="social"><svg className="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#social-icon"></use></svg><h2>Connect with us</h2><p>Join the Vite community</p><ul>
        <li><a href="https://github.com/vitejs/vite" target="_blank"><svg className="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>GitHub</a></li>
        <li><a href="https://chat.vite.dev/" target="_blank"><svg className="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#discord-icon"></use></svg>Discord</a></li>
        <li><a href="https://x.com/vite_js" target="_blank"><svg className="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#x-icon"></use></svg>X.com</a></li>
        <li><a href="https://bsky.app/profile/vite.dev" target="_blank"><svg className="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#bluesky-icon"></use></svg>Bluesky</a></li>
      </ul></div>
    </section>
    <div className="ticks"></div><section id="spacer"></section>
  </>
}

export default App
