import type { Session } from '../types'

const KEY = 'hq_prototype_session_v1'

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function setSession(session: Session): void {
  localStorage.setItem(KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('hq-session'))
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event('hq-session'))
}

