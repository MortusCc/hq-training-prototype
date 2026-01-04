import { createContext, useContext } from 'react'
import type { Db, Enrollment, Id, Role, Session, TrainingRequest } from '../types'

export type DbContextValue = {
  db: Db
  session: Session | null
  refreshSession: (next: Session | null) => void
  setToday: (iso: string) => void
  resetDemo: () => void
  logout: () => void
  approveRequest: (requestId: Id, executorId: Id, managerNote: string) => void
  rejectRequest: (requestId: Id, managerNote: string) => void
  createRequest: (payload: Omit<TrainingRequest, 'id' | 'status' | 'createdAt'>) => void
  updateCourse: (courseId: Id, patch: Partial<Db['courses'][number]>) => void
  publishCourseNotice: (courseId: Id) => void
  sendCourseReminder: (courseId: Id) => void
  applyCourse: (courseId: Id, studentId: Id, waived: boolean) => void
  confirmEnrollment: (enrollmentId: Id) => void
  payEnrollment: (enrollmentId: Id) => void
  checkInEnrollment: (enrollmentId: Id) => void
  giveMaterial: (enrollmentId: Id) => void
  submitSurvey: (courseId: Id, studentId: Id, satisfaction: 1 | 2 | 3 | 4 | 5, comment: string) => void
  endCourse: (courseId: Id) => void
}

export const DbContext = createContext<DbContextValue | null>(null)

export function useDb() {
  const ctx = useContext(DbContext)
  if (!ctx) throw new Error('useDb must be used within DbProvider')
  return ctx
}

export function roleLabel(role: Role): string {
  switch (role) {
    case 'manager':
      return '经理端'
    case 'executor':
      return '执行人端'
    case 'student':
      return '学员端'
    case 'onsite':
      return '现场端'
  }
}

export type { Db, Enrollment, Id }

