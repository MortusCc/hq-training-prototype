import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Db, Enrollment, EnrollmentForm, Id, Session, TrainingRequest } from '../types'
import { todayIso } from '../lib/date'
import { createSeedDb } from '../lib/seed'
import { clearSession, getSession } from './session'
import { DbContext } from './db'

const DB_KEY = 'hq_prototype_db_v1'

function loadDb(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) return createSeedDb()
    return JSON.parse(raw) as Db
  } catch {
    return createSeedDb()
  }
}

function saveDb(db: Db): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  window.dispatchEvent(new Event('hq-db'))
}

function newId(prefix: string): Id {
  const s = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}_${s}`
}

export function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDbState] = useState<Db>(() => {
    const loaded = loadDb()
    if (!loaded.appToday) loaded.appToday = todayIso()
    return loaded
  })
  const [session, setSessionState] = useState<Session | null>(() => getSession())

  useEffect(() => {
    const onDb = () => setDbState(loadDb())
    const onSession = () => setSessionState(getSession())
    window.addEventListener('hq-db', onDb)
    window.addEventListener('hq-session', onSession)
    return () => {
      window.removeEventListener('hq-db', onDb)
      window.removeEventListener('hq-session', onSession)
    }
  }, [])

  const refreshSession = useCallback((next: Session | null) => setSessionState(next), [])

  const setToday = useCallback((iso: string) => {
    const next: Db = { ...loadDb(), appToday: iso }
    saveDb(next)
  }, [])

  const resetDemo = useCallback(() => {
    const seeded = createSeedDb()
    saveDb(seeded)
    clearSession()
    setSessionState(null)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSessionState(null)
  }, [])

  const createRequest = useCallback((payload: Omit<TrainingRequest, 'id' | 'status' | 'createdAt'>) => {
    const now = `${loadDb().appToday} 09:00`
    const next: Db = loadDb()
    next.requests = [
      {
        id: newId('req'),
        status: '待评审',
        createdAt: now,
        ...payload,
      },
      ...next.requests,
    ]
    saveDb(next)
  }, [])

  const approveRequest = useCallback((requestId: Id, executorId: Id, managerNote: string) => {
    const next = loadDb()
    const req = next.requests.find((r) => r.id === requestId)
    if (!req) return
    req.status = '已立项'
    req.managerNote = managerNote
    req.assignedExecutorId = executorId
    if (!req.generatedCourseId) {
      const courseId = newId('crs')
      req.generatedCourseId = courseId
      next.courses = [
        {
          id: courseId,
          requestId: req.id,
          title: req.title.replace('申请', '').trim() || req.title,
          topic: req.desiredTopics.split('、')[0] ?? req.desiredTopics,
          startDate: next.appToday,
          endDate: next.appToday,
          location: '待确定',
          feeCny: 1999,
          executorId,
          status: '草稿',
        },
        ...next.courses,
      ]
    }
    saveDb(next)
  }, [])

  const rejectRequest = useCallback((requestId: Id, managerNote: string) => {
    const next = loadDb()
    const req = next.requests.find((r) => r.id === requestId)
    if (!req) return
    req.status = '已拒绝'
    req.managerNote = managerNote
    saveDb(next)
  }, [])

  const updateCourse = useCallback((courseId: Id, patch: Partial<Db['courses'][number]>) => {
    const next = loadDb()
    const course = next.courses.find((c) => c.id === courseId)
    if (!course) return
    Object.assign(course, patch)
    saveDb(next)
  }, [])

  const publishCourseNotice = useCallback((courseId: Id) => {
    const next = loadDb()
    const course = next.courses.find((c) => c.id === courseId)
    if (!course) return
    course.status = '已发布'
    const lecturer = course.lecturerId ? next.users.find((u) => u.id === course.lecturerId) : undefined
    const html = `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${course.title} - 培训通知</title></head>
<body style="font-family:Microsoft YaHei,system-ui,Segoe UI,Arial;line-height:1.6;color:#0f172a;">
<h2>培训通知：${course.title}</h2>
<p><b>主题</b>：${course.topic}</p>
<p><b>时间</b>：${course.startDate} 至 ${course.endDate}</p>
<p><b>地点</b>：${course.location}</p>
<p><b>讲师</b>：${lecturer ? `${lecturer.name}（${lecturer.title ?? '讲师'}）` : '待定'}</p>
<p><b>费用</b>：${course.feeCny <= 0 ? '免费' : `${course.feeCny} 元/人`}</p>
<hr/>
<p>报名方式：登录 HQ技术培训管理系统，进入「学员端 - 课程报名」。</p>
<p style="color:#64748b;">本通知由 HQ技术培训管理系统自动生成，用于原型演示。</p>
</body>
</html>`
    const noticeId = newId('ntc')
    course.noticeHtmlId = noticeId
    next.notices = [
      {
        id: noticeId,
        courseId: course.id,
        html,
        createdAt: `${next.appToday} 11:30`,
      },
      ...next.notices,
    ]
    saveDb(next)
  }, [])

  const sendCourseReminder = useCallback((courseId: Id) => {
    const next = loadDb()
    const course = next.courses.find((c) => c.id === courseId)
    if (!course) return
    course.reminderSentAt = `${next.appToday} 18:00`
    saveDb(next)
  }, [])

  const applyCourse = useCallback((courseId: Id, studentId: Id, waived: boolean, form: EnrollmentForm) => {
    const next = loadDb()
    const existing = next.enrollments.find((e) => e.courseId === courseId && e.studentId === studentId)
    if (existing) return
    const now = `${next.appToday} 10:00`
    next.enrollments = [
      {
        id: newId('enr'),
        courseId,
        studentId,
        status: '已报名',
        createdAt: now,
        materialGiven: false,
        waived,
        form,
      },
      ...next.enrollments,
    ]
    saveDb(next)
  }, [])

  const confirmEnrollment = useCallback((enrollmentId: Id) => {
    const next = loadDb()
    const enr = next.enrollments.find((e) => e.id === enrollmentId)
    if (!enr) return
    if (enr.status === '已拒绝') return
    enr.status = '已确认'
    enr.confirmedAt = `${next.appToday} 10:20`
    saveDb(next)
  }, [])

  const payEnrollment = useCallback((enrollmentId: Id) => {
    const next = loadDb()
    const enr = next.enrollments.find((e) => e.id === enrollmentId)
    if (!enr) return
    if (enr.status === '已拒绝') return
    enr.status = '已缴费'
    enr.paidAt = `${next.appToday} 10:40`
    saveDb(next)
  }, [])

  const checkInEnrollment = useCallback((enrollmentId: Id) => {
    const next = loadDb()
    const enr = next.enrollments.find((e) => e.id === enrollmentId)
    if (!enr) return
    if (enr.status === '已拒绝') return
    enr.status = '已签到'
    enr.checkedInAt = `${next.appToday} 08:50`
    saveDb(next)
  }, [])

  const giveMaterial = useCallback((enrollmentId: Id) => {
    const next = loadDb()
    const enr = next.enrollments.find((e) => e.id === enrollmentId)
    if (!enr) return
    enr.materialGiven = true
    saveDb(next)
  }, [])

  const submitSurvey = useCallback(
    (courseId: Id, studentId: Id, satisfaction: 1 | 2 | 3 | 4 | 5, comment: string) => {
      const next = loadDb()
      const existing = next.surveys.find((s) => s.courseId === courseId && s.studentId === studentId)
      if (existing) {
        existing.satisfaction = satisfaction
        existing.comment = comment
        existing.createdAt = `${next.appToday} 19:00`
      } else {
        next.surveys = [
          {
            id: newId('svy'),
            courseId,
            studentId,
            satisfaction,
            comment,
            createdAt: `${next.appToday} 19:00`,
          },
          ...next.surveys,
        ]
      }

      const enr = next.enrollments.find((e) => e.courseId === courseId && e.studentId === studentId)
      if (enr && enr.status !== '已拒绝') {
        enr.status = '已完成'
      }
      saveDb(next)
    },
    [],
  )

  const writeOverallEvaluationSummary = useCallback((courseId: Id, summary: string, writerName: string) => {
    const next = loadDb()
    const course = next.courses.find((c) => c.id === courseId)
    if (!course) return
    course.overallEvaluationSummary = summary
    course.overallEvaluationUpdatedAt = `${next.appToday} 20:10`
    course.overallEvaluationWriterName = writerName
    saveDb(next)
  }, [])

  const endCourse = useCallback((courseId: Id) => {
    const next = loadDb()
    const course = next.courses.find((c) => c.id === courseId)
    if (!course) return
    course.status = '已结课'
    const updated: Enrollment[] = next.enrollments.map((e) => {
      if (e.courseId !== courseId) return e
      if (e.status === '已拒绝') return e
      if (e.status === '已签到' || e.status === '已缴费' || e.status === '已确认' || e.status === '已报名') {
        return { ...e, status: '已完成' }
      }
      return e
    })
    next.enrollments = updated
    saveDb(next)
  }, [])

  const value = useMemo(
    () => ({
      db,
      session,
      refreshSession,
      setToday,
      resetDemo,
      logout,
      approveRequest,
      rejectRequest,
      createRequest,
      updateCourse,
      publishCourseNotice,
      sendCourseReminder,
      applyCourse,
      confirmEnrollment,
      payEnrollment,
      checkInEnrollment,
      giveMaterial,
      submitSurvey,
      writeOverallEvaluationSummary,
      endCourse,
    }),
    [
      applyCourse,
      approveRequest,
      checkInEnrollment,
      confirmEnrollment,
      createRequest,
      db,
      endCourse,
      giveMaterial,
      logout,
      payEnrollment,
      publishCourseNotice,
      refreshSession,
      rejectRequest,
      resetDemo,
      sendCourseReminder,
      session,
      setToday,
      submitSurvey,
      updateCourse,
      writeOverallEvaluationSummary,
    ],
  )

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>
}
