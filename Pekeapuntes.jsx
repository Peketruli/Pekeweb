/* PekeOS - App de Apuntes

Single-file React component (default export) ready to drop into a React + Tailwind project.
- Usa TailwindCSS para estilos
- Guarda datos en localStorage (puedes reemplazar por API fácilmente)
- Estructura: Ramas -> Asignaturas -> Apuntes
- Soporta añadir apuntes con texto y adjuntos (imagen/pdf como base64)

Instrucciones de uso:
1. Copia este archivo en tu proyecto React (por ejemplo src/PekeNotesApp.jsx)
2. Asegúrate de tener Tailwind configurado.
3. Importa y renderiza el componente en App.jsx: `import PekeNotesApp from './PekeNotesApp'` y úsalo.

Notas:
- Es un punto de partida: backend, autenticación y subida real de ficheros deben implementarse según tus necesidades.
*/

import React, { useEffect, useMemo, useState } from 'react'

// Datos iniciales (puedes modificarlos o cargarlos desde API)
const INITIAL_STRUCTURE = {
  Letras: [
    'Historia',
    'Lengua',
    'Inglés',
    'Euskera',
    'Filosofía'
  ],
  Ciencias: [
    'Matemáticas',
    'Física',
    'Química',
    'Biología',
    'Tecnología'
  ],
  Orokorrak: [
    'Tutoría',
    'Educación Física',
    'Opcionales',
    'Orientación'
  ]
}

const STORAGE_KEY = 'pekeos_apuntes_v1'

// Utilidad para generar id simple
const id = () => `${Date.now()}_${Math.floor(Math.random() * 10000)}`

// Guarda/lee del localStorage
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // crear estructura vacía con asignaturas
      const bySubject = {}
      Object.keys(INITIAL_STRUCTURE).forEach(branch => {
        INITIAL_STRUCTURE[branch].forEach(subject => {
          bySubject[subject] = []
        })
      })
      return { subjects: bySubject, branches: INITIAL_STRUCTURE }
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Error cargando storage', e)
    return { subjects: {}, branches: INITIAL_STRUCTURE }
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Error guardando storage', e)
  }
}

export default function PekeNotesApp() {
  const [state, setState] = useState(() => loadState())
  const [currentBranch, setCurrentBranch] = useState('')
  const [currentSubject, setCurrentSubject] = useState('')
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    saveState(state)
  }, [state])

  // Lista de asignaturas para branch seleccionado
  const subjects = useMemo(() => {
    if (!currentBranch) return []
    return state.branches[currentBranch] || []
  }, [currentBranch, state.branches])

  function ensureSubjectExists(subject) {
    if (state.subjects[subject]) return
    const newSubjects = { ...state.subjects, [subject]: [] }
    const newBranches = { ...state.branches }
    // add subject to Orokorrak si no se encuentra (solo por defecto)
    saveAndSet({ ...state, subjects: newSubjects, branches: newBranches })
  }

  function saveAndSet(newState) {
    setState(newState)
    saveState(newState)
  }

  function openSubject(subject) {
    setCurrentSubject(subject)
    setShowAdd(false)
    setEditingNote(null)
  }

  function addNote({ title, content, attachments, author }) {
    const note = {
      id: id(),
      title: title || 'Sin título',
      content: content || '',
      attachments: attachments || [],
      author: author || 'Anon',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0
    }
    const existing = state.subjects[currentSubject] || []
    const updated = { ...state.subjects, [currentSubject]: [note, ...existing] }
    saveAndSet({ ...state, subjects: updated })
  }

  function updateNote(noteId, patch) {
    const arr = (state.subjects[currentSubject] || []).map(n => n.id === noteId ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)
    saveAndSet({ ...state, subjects: { ...state.subjects, [currentSubject]: arr } })
  }

  function deleteNote(noteId) {
    if (!confirm('¿Eliminar este apunte?')) return
    const arr = (state.subjects[currentSubject] || []).filter(n => n.id !== noteId)
    saveAndSet({ ...state, subjects: { ...state.subjects, [currentSubject]: arr } })
  }

  function toggleLike(noteId) {
    const arr = (state.subjects[currentSubject] || []).map(n => n.id === noteId ? { ...n, likes: (n.likes || 0) + 1 } : n)
    saveAndSet({ ...state, subjects: { ...state.subjects, [currentSubject]: arr } })
  }

  function filteredNotes() {
    const all = state.subjects[currentSubject] || []
    const q = query.trim().toLowerCase()
    let filtered = all.filter(n => {
      if (!q) return true
      return (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q) || (n.author || '').toLowerCase().includes(q)
    })
    if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (sortBy === 'oldest') filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    if (sortBy === 'top') filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    return filtered
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold">PekeOS — Apuntes</h1>
          <div className="text-sm text-gray-600">Almacenado localmente</div>
        </header>

        {/* Main layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar: Branches & Subjects */}
          <aside className="col-span-1 md:col-span-1 bg-white p-4 rounded-2xl shadow-sm">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium">Ramas</h2>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {Object.keys(state.branches).map(branch => (
                    <button key={branch} onClick={() => { setCurrentBranch(branch); setCurrentSubject('') }} className={`p-2 rounded-lg text-sm font-medium shadow-sm ${currentBranch === branch ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {branch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium">Asignaturas</h3>
                <div className="mt-2 space-y-2 max-h-64 overflow-auto pr-2">
                  {subjects.length === 0 && (
                    <div className="text-sm text-gray-500">Elige una rama para ver asignaturas.</div>
                  )}
                  {subjects.map(s => (
                    <div key={s} className="flex items-center justify-between">
                      <button onClick={() => openSubject(s)} className={`text-left w-full py-2 px-3 rounded-lg ${currentSubject === s ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}>
                        {s}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <AddSubjectForm branches={state.branches} onAdd={(branchName, subjectName) => {
                    // add subject to branch and subjects map
                    const newBranches = { ...state.branches }
                    newBranches[branchName] = [...newBranches[branchName], subjectName]
                    const newSubjects = { ...state.subjects, [subjectName]: [] }
                    saveAndSet({ ...state, branches: newBranches, subjects: newSubjects })
                  }} />
                </div>
              </div>

              <div className="pt-2 border-t" />
              <div className="text-xs text-gray-500">Consejo: los archivos se guardan en el navegador. Implementa un backend para compartir entre usuarios.</div>
            </div>
          </aside>

          {/* Main content */}
          <main className="col-span-1 md:col-span-3">
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              {!currentSubject ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <h2 className="text-xl font-semibold">Selecciona una asignatura</h2>
                  <p className="text-sm text-gray-500 mt-2">Pulsa una asignatura en la izquierda para ver y añadir apuntes.</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold">{currentSubject}</h2>
                      <div className="text-sm text-gray-500">{(state.subjects[currentSubject] || []).length} apuntes</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar apuntes..." className="px-3 py-2 border rounded-lg text-sm" />
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                        <option value="newest">Más recientes</option>
                        <option value="oldest">Más antiguos</option>
                        <option value="top">Más votados</option>
                      </select>
                      <button onClick={() => { setShowAdd(true); setEditingNote(null) }} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium">Añadir apunte</button>
                    </div>
                  </div>

                  <NotesList notes={filteredNotes()} onEdit={(n) => { setEditingNote(n); setShowAdd(true) }} onDelete={deleteNote} onLike={toggleLike} />
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Add / Edit modal drawer */}
        {showAdd && (
          <AddEditDrawer
            note={editingNote}
            onCancel={() => { setShowAdd(false); setEditingNote(null) }}
            onSave={(payload) => {
              if (!currentSubject) return alert('Selecciona una asignatura primero')
              if (editingNote) {
                updateNote(editingNote.id, { ...payload })
              } else {
                addNote(payload)
              }
              setShowAdd(false)
              setEditingNote(null)
            }}
          />
        )}

      </div>
    </div>
  )
}

/* ---------- Componentes internos ---------- */

function AddSubjectForm({ branches, onAdd }) {
  const [branch, setBranch] = useState(Object.keys(branches)[0] || '')
  const [name, setName] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return alert('Nombre de asignatura vacío')
    onAdd(branch, name.trim())
    setName('')
  }

  return (
    <form onSubmit={submit} className="mt-3">
      <div className="text-sm text-gray-600 mb-2">Añadir asignatura</div>
      <div className="flex gap-2">
        <select value={branch} onChange={e => setBranch(e.target.value)} className="px-2 py-2 border rounded-lg text-sm">
          {Object.keys(branches).map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre asignatura" className="px-2 py-2 border rounded-lg text-sm flex-1" />
        <button type="submit" className="px-3 py-2 rounded-lg bg-green-600 text-white">Crear</button>
      </div>
    </form>
  )
}

function NotesList({ notes, onEdit, onDelete, onLike }) {
  if (!notes || notes.length === 0) return <div className="py-8 text-center text-gray-500">No hay apuntes aún.</div>
  return (
    <div className="space-y-4">
      {notes.map(n => (
        <article key={n.id} className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{n.title}</h3>
              <div className="text-xs text-gray-500">por {n.author} • {new Date(n.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onLike(n.id)} className="text-sm px-2 py-1 rounded-md border">👍 {n.likes || 0}</button>
              <button onClick={() => onEdit(n)} className="text-sm px-2 py-1 rounded-md border">Editar</button>
              <button onClick={() => onDelete(n.id)} className="text-sm px-2 py-1 rounded-md border text-red-600">Eliminar</button>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{n.content}</div>
          <div className="mt-3 flex gap-3">
            {n.attachments && n.attachments.map((a, i) => (
              <AttachmentPreview key={i} file={a} />
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

function AttachmentPreview({ file }) {
  // file: { name, type, data (base64) }
  if (!file) return null
  const isImage = file.type && file.type.startsWith('image/')
  const isPdf = file.type && file.type === 'application/pdf'
  return (
    <div className="w-28 h-20 border rounded-lg overflow-hidden bg-gray-50 p-1 text-xs">
      {isImage ? (
        <img src={file.data} alt={file.name} className="w-full h-full object-cover" />
      ) : isPdf ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-sm font-medium">PDF</div>
          <div className="text-xs">{file.name}</div>
        </div>
      ) : (
        <div className="p-2 text-xs">{file.name}</div>
      )}
    </div>
  )
}

function AddEditDrawer({ note, onCancel, onSave }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [author, setAuthor] = useState(note?.author || 'Alumno')
  const [attachments, setAttachments] = useState(note?.attachments || [])

  function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    // read as data URLs
    const readers = files.map(f => new Promise((res) => {
      const r = new FileReader()
      r.onload = () => {
        res({ name: f.name, type: f.type, data: r.result })
      }
      r.readAsDataURL(f)
    }))
    Promise.all(readers).then(arr => {
      setAttachments(prev => [...prev, ...arr])
    })
  }

  function removeAttachment(idx) {
    setAttachments(prev => prev.filter((_, i) => i !== idx))
  }

  function submit(e) {
    e.preventDefault()
    if (!title.trim() && !content.trim()) return alert('Añade título o contenido')
    onSave({ title: title.trim(), content: content.trim(), attachments, author: author.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onCancel} />
      <div className="w-full md:w-2/5 bg-white p-6 shadow-2xl overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{note ? 'Editar apunte' : 'Nuevo apunte'}</h3>
          <button onClick={onCancel} className="text-gray-500">Cerrar</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md" />
          </div>

          <div>
            <label className="text-sm font-medium">Contenido</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} className="w-full mt-1 px-3 py-2 border rounded-md" />
          </div>

          <div>
            <label className="text-sm font-medium">Autor</label>
            <input value={author} onChange={e => setAuthor(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md" />
          </div>

          <div>
            <label className="text-sm font-medium">Adjuntar archivos (imagen / pdf)</label>
            <input type="file" multiple onChange={handleFiles} className="block mt-2" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {attachments.map((a, i) => (
                <div key={i} className="relative">
                  <AttachmentPreview file={a} />
                  <button type="button" onClick={() => removeAttachment(i)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Guardar</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border">Cancelar</button>
            {note && <div className="text-sm text-gray-500">Última edición: {new Date(note.updatedAt).toLocaleString()}</div>}
          </div>
        </form>
      </div>
    </div>
  )
}
