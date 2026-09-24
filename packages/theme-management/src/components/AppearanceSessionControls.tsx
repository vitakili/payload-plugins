'use client'

import { useForm } from '@payloadcms/ui'
import { Lock, LockOpen, Undo2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  clearAppearanceUndo,
  toggleAppearanceLock,
  useAppearanceSession,
  type AppearanceLock,
  type AppearanceSource,
} from '../hooks/useAppearanceSession.js'
import { useThemeTranslations } from '../hooks/useThemeTranslations.js'

const LOCKS: AppearanceLock[] = ['colors', 'fonts', 'style']
const UNDO_TIMEOUT_MS = 10_000

export const formatTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))

/**
 * "Keep my: Colours · Fonts · Style" toggles. Locks apply to every bulk action
 * (theme preset, style preset, palette generator) for the current editing session.
 */
export function AppearanceLocks() {
  const { locks } = useAppearanceSession()
  const t = useThemeTranslations().appearance

  return (
    <div className="tm-appearance-locks">
      <div className="tm-appearance-locks__row" role="group" aria-label={t.locksLabel}>
        <span className="tm-appearance-locks__label" aria-hidden="true">
          {t.locksLabel}
        </span>
        {LOCKS.map((lock) => {
          const locked = locks[lock]
          const Icon = locked ? Lock : LockOpen
          return (
            <button
              key={lock}
              type="button"
              className={`tm-appearance-lock${locked ? ' is-locked' : ''}`}
              aria-pressed={locked}
              onClick={() => toggleAppearanceLock(lock)}
            >
              <Icon size={14} aria-hidden />
              {t[lock]}
            </button>
          )
        })}
      </div>
      <p className="tm-appearance-locks__hint">{t.locksHint}</p>
    </div>
  )
}

/**
 * One-step undo for the last bulk change made from `source`. Stays for 10 s,
 * paused while the pointer or keyboard focus is inside it.
 */
export function AppearanceUndoBar({ sources }: { sources: AppearanceSource[] }) {
  const { undo } = useAppearanceSession()
  const { dispatchFields, setModified } = useForm()
  const t = useThemeTranslations().appearance
  const [paused, setPaused] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const barRef = useRef<HTMLDivElement>(null)
  const visible = undo !== null && sources.includes(undo.source)

  useEffect(() => {
    if (!visible || paused || !undo) return
    const timer = window.setTimeout(() => clearAppearanceUndo(undo.id), UNDO_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [visible, paused, undo])

  useEffect(() => {
    if (visible && undo) setAnnouncement(formatTemplate(t.applied, { name: undo.label }))
  }, [visible, undo, t.applied])

  const handleUndo = () => {
    if (!undo) return
    undo.entries.forEach(({ path, value }) => dispatchFields({ type: 'UPDATE', path, value }))
    setModified(true)
    clearAppearanceUndo(undo.id)
    setAnnouncement(t.undone)
  }

  return (
    <>
      {/* Always-mounted live region so both "applied" and "reverted" are announced. */}
      <span className="tm-sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
      {visible && undo ? (
        <div
          ref={barRef}
          className="tm-appearance-undo"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(event) => {
            if (!barRef.current?.contains(event.relatedTarget as Node)) setPaused(false)
          }}
        >
          <span className="tm-appearance-undo__text">
            {formatTemplate(t.applied, { name: undo.label })}
          </span>
          <button type="button" className="tm-appearance-undo__action" onClick={handleUndo}>
            <Undo2 size={14} aria-hidden />
            {t.undo}
          </button>
          <button
            type="button"
            className="tm-appearance-undo__dismiss"
            aria-label={t.dismiss}
            onClick={() => clearAppearanceUndo(undo.id)}
          >
            <X size={14} aria-hidden />
          </button>
        </div>
      ) : null}
    </>
  )
}
