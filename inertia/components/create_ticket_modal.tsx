import { useEffect, useRef, useState } from 'react'
import { Form } from '@adonisjs/inertia/react'

export type Option = { id: number; name: string; slug?: string; color?: string | null; level?: number }
export type TechnicianOption = { id: number; fullName: string | null }

export type TicketFormOptions = {
  priorities: Option[]
  categories: Option[]
  groups: Option[]
  technicians: TechnicianOption[]
}

export default function CreateTicketModal({
  open,
  onClose,
  options,
}: {
  open: boolean
  onClose: () => void
  options: TicketFormOptions
}) {
  const [selectedGroups, setSelectedGroups] = useState<number[]>([])
  const [selectedTechs, setSelectedTechs] = useState<number[]>([])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setSelectedGroups([])
      setSelectedTechs([])
    }
  }, [open])

  if (!open) return null

  const toggle = (list: number[], id: number, setter: (v: number[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>New ticket</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <Form
          route="tickets.store"
          onSuccess={onClose}
          resetOnSuccess
          className="modal-body"
        >
          {({ errors, processing }) => (
            <>
              <div className="form-grid">
                <div className="field col-span-2">
                  <label htmlFor="title">Title</label>
                  <input id="title" name="title" type="text" required placeholder="Short summary" />
                  {errors.title && <span className="field-error">{errors.title}</span>}
                </div>

                <div className="field col-span-2">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    required
                    placeholder="Describe the issue in detail…"
                  />
                  {errors.description && <span className="field-error">{errors.description}</span>}
                </div>

                <div className="field">
                  <label htmlFor="priorityId">Priority</label>
                  <select id="priorityId" name="priorityId" required defaultValue="">
                    <option value="" disabled>
                      Select…
                    </option>
                    {options.priorities.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.priorityId && <span className="field-error">{errors.priorityId}</span>}
                </div>

                <div className="field">
                  <label htmlFor="categoryId">Category</label>
                  <select id="categoryId" name="categoryId" required defaultValue="">
                    <option value="" disabled>
                      Select…
                    </option>
                    {options.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <span className="field-error">{errors.categoryId}</span>}
                </div>

                <div className="field">
                  <label>Groups</label>
                  <div className="chip-group">
                    {options.groups.map((g) => {
                      const active = selectedGroups.includes(g.id)
                      return (
                        <label key={g.id} className={`chip ${active ? 'chip-active' : ''}`}>
                          <input
                            type="checkbox"
                            name="groupIds[]"
                            value={g.id}
                            checked={active}
                            onChange={() => toggle(selectedGroups, g.id, setSelectedGroups)}
                          />
                          {g.name}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="field col-span-2">
                  <label>Assigned technicians</label>
                  <TechniciansCombobox
                    all={options.technicians}
                    selected={selectedTechs}
                    onChange={setSelectedTechs}
                  />
                  <span className="muted" style={{ fontSize: 12 }}>
                    Leave empty to keep the ticket awaiting assignment.
                  </span>
                </div>
              </div>

              <footer className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={processing}>
                  {processing ? 'Creating…' : 'Create ticket'}
                </button>
              </footer>
            </>
          )}
        </Form>
      </div>
    </div>
  )
}

function TechniciansCombobox({
  all,
  selected,
  onChange,
}: {
  all: TechnicianOption[]
  selected: number[]
  onChange: (ids: number[]) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const byId = new Map(all.map((t) => [t.id, t]))
  const available = all.filter((t) => !selected.includes(t.id))
  const filtered = available.filter((t) =>
    (t.fullName ?? '').toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    setActiveIdx(0)
  }, [query, open])

  const add = (id: number) => {
    onChange([...selected, id])
    setQuery('')
    inputRef.current?.focus()
  }
  const remove = (id: number) => onChange(selected.filter((x) => x !== id))

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (filtered[activeIdx]) {
        e.preventDefault()
        add(filtered[activeIdx].id)
      }
    } else if (e.key === 'Backspace' && query === '' && selected.length > 0) {
      remove(selected[selected.length - 1])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="combobox">
      <div className="combobox-input" onClick={() => inputRef.current?.focus()}>
        {selected.map((id) => {
          const t = byId.get(id)
          if (!t) return null
          return (
            <span key={id} className="combobox-tag">
              <input type="hidden" name="technicianIds[]" value={id} />
              {t.fullName ?? `#${id}`}
              <button
                type="button"
                className="combobox-tag-remove"
                aria-label={`Remove ${t.fullName ?? id}`}
                onClick={(e) => {
                  e.stopPropagation()
                  remove(id)
                }}
              >
                ×
              </button>
            </span>
          )
        })}
        <input
          ref={inputRef}
          type="text"
          className="combobox-field"
          value={query}
          placeholder={selected.length === 0 ? 'Search technicians…' : ''}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      {open && (
        <ul className="combobox-menu" role="listbox">
          {filtered.length === 0 ? (
            <li className="combobox-empty">
              {available.length === 0 ? 'All technicians selected' : 'No match'}
            </li>
          ) : (
            filtered.map((t, idx) => (
              <li
                key={t.id}
                role="option"
                aria-selected={idx === activeIdx}
                className={`combobox-option ${idx === activeIdx ? 'is-active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault()
                  add(t.id)
                }}
                onMouseEnter={() => setActiveIdx(idx)}
              >
                {t.fullName ?? `#${t.id}`}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
