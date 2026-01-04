import { useMemo, useState } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'
import type { Id } from '../../types'

export function ExecutorEnrollmentsPage() {
  const { db, confirmEnrollment, payEnrollment, sendCourseReminder } = useDb()
  const [courseId, setCourseId] = useState<string>('')

  const options = useMemo(
    () =>
      db.courses.map((c) => ({
        id: c.id,
        label: `${c.title}（${c.startDate}）`,
      })),
    [db.courses],
  )

  const currentId = courseId || options[0]?.id
  const enrollments = db.enrollments.filter((e) => e.courseId === currentId)
  const course = db.courses.find((c) => c.id === currentId) ?? null

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">报名与通知管理</h2>
      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="cardTitle">选择课程</div>
            <div className="muted small">展示对应课程的报名名单，支持确认与收费。</div>
          </div>
          <select className="select" value={currentId ?? ''} onChange={(e) => setCourseId(e.target.value)}>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {course ? (
          <>
            <div className="row">
              <span className="muted small">
                {course.title} · {course.location}
              </span>
              <span className="muted small">
                时间：{course.startDate} ~ {course.endDate}
              </span>
              {course.reminderSentAt ? (
                <Tag tone="green">已发送上课前提醒（{course.reminderSentAt}）</Tag>
              ) : (
                <button className="btnGhost" onClick={() => sendCourseReminder(course.id)}>
                  发送上课前提醒（模拟）
                </button>
              )}
            </div>

            <table className="table" style={{ marginTop: 10 }}>
              <thead>
                <tr>
                  <th>学员</th>
                  <th>公司</th>
                  <th>状态</th>
                  <th>时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const student = db.users.find((u) => u.id === e.studentId)
                  const company = student?.companyId ? db.companies.find((c) => c.id === student.companyId) : undefined
                  const status = e.status
                  let tone: 'gray' | 'blue' | 'green' | 'orange' | 'red' = 'gray'
                  if (status === '已报名') tone = 'orange'
                  if (status === '已确认') tone = 'blue'
                  if (status === '已缴费') tone = 'green'
                  if (status === '已签到') tone = 'green'
                  if (status === '已完成') tone = 'gray'
                  if (status === '已拒绝') tone = 'red'
                  return (
                    <tr key={e.id}>
                      <td>{student?.name}</td>
                      <td className="muted small">{company?.name ?? '-'}</td>
                      <td>
                        <Tag tone={tone}>{status}</Tag>
                      </td>
                      <td className="muted small">
                        报名：{e.createdAt}
                        <br />
                        {e.confirmedAt ? <>确认：{e.confirmedAt}</> : null}
                        {e.paidAt ? (
                          <>
                            <br />
                            缴费：{e.paidAt}
                          </>
                        ) : null}
                      </td>
                      <td className="row">
                        {e.status === '已报名' && (
                          <button className="btnGhost" onClick={() => confirmEnrollment(e.id as Id)}>
                            确认报名
                          </button>
                        )}
                        {e.status === '已确认' && (
                          <button className="btnGhost" onClick={() => payEnrollment(e.id as Id)}>
                            标记已收款
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="muted">
                      暂无报名记录
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </>
        ) : (
          <div className="muted small">暂无课程。</div>
        )}
      </div>
    </div>
  )
}
