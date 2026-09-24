'use client'

import { useSyncExternalStore } from 'react'

/**
 * Editing-session state shared by the Appearance Settings fields: which parts of
 * the look are locked, and a one-step undo snapshot of the last bulk change
 * (theme preset, style preset or generated palette).
 *
 * Deliberately not persisted: locks reset on reload and nothing new is stored in
 * the document. The fields live in separate React trees (Payload renders each
 * custom field on its own), so the state sits in a tiny module-level store.
 */

export type AppearanceLock = 'colors' | 'fonts' | 'style'
export type AppearanceSource = 'theme' | 'style' | 'palette'

export interface UndoEntry {
  path: string
  value: unknown
}

export interface AppearanceUndo {
  id: number
  source: AppearanceSource
  label: string
  entries: UndoEntry[]
}

interface AppearanceSessionState {
  locks: Record<AppearanceLock, boolean>
  undo: AppearanceUndo | null
}

let state: AppearanceSessionState = {
  locks: { colors: false, fonts: false, style: false },
  undo: null,
}
let nextUndoId = 1
const listeners = new Set<() => void>()

function setState(next: AppearanceSessionState) {
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function toggleAppearanceLock(lock: AppearanceLock) {
  setState({ ...state, locks: { ...state.locks, [lock]: !state.locks[lock] } })
}

export function recordAppearanceUndo(source: AppearanceSource, label: string, entries: UndoEntry[]) {
  if (entries.length === 0) return
  setState({ ...state, undo: { id: nextUndoId++, source, label, entries } })
}

export function clearAppearanceUndo(id?: number) {
  if (!state.undo || (id !== undefined && state.undo.id !== id)) return
  setState({ ...state, undo: null })
}

export function getAppearanceSession(): AppearanceSessionState {
  return state
}

/** Test helper: restore the initial session state. */
export function resetAppearanceSession() {
  setState({ locks: { colors: false, fonts: false, style: false }, undo: null })
}

export function useAppearanceSession(): AppearanceSessionState {
  return useSyncExternalStore(subscribe, getAppearanceSession, getAppearanceSession)
}

type FormFieldsState = Record<string, { value?: unknown } | undefined> | undefined
type Dispatch = (action: { type: 'UPDATE'; path: string; value: unknown }) => void

/**
 * Collects field writes for one bulk action, remembering each field's previous
 * value (first write wins) so the whole action can be undone in one step.
 */
export function createBulkWriter(formFields: FormFieldsState, dispatchFields: Dispatch) {
  const previous = new Map<string, unknown>()

  return {
    write(path: string, value: unknown) {
      if (!previous.has(path)) previous.set(path, formFields?.[path]?.value)
      dispatchFields({ type: 'UPDATE', path, value })
    },
    commit(source: AppearanceSource, label: string) {
      const entries = [...previous.entries()].map(([path, value]) => ({ path, value }))
      recordAppearanceUndo(source, label, entries)
    },
  }
}
