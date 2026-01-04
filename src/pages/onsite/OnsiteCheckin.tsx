import { useState } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'
import type { Id } from '../../types'

export function OnsiteCheckinPage() {
  const { db, checkInEnrollment, giveMaterial, payEnrollment } = useDb()
  const [courseId, setCourseId] = useState<string>('')

  const currentId = courseId || db.courses[0]?.id
  const course = db.courses.find((c) => c.id === currentId) ?? null
  const enrollments = db.enrollments.filter((e) => e.courseId === currentId)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">签到与收费（现场端）</h2>

      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="cardTitle">选择课程</div>
            <div className="muted small">现场工作人员根据报名名单进行签到、收费、发资料。</div>
          </div>
          <select className="select" value={currentId ?? ''} onChange={(e) => setCourseId(e.target.value)}>
            {db.courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {course ? (
          <>
            <div className="row">
              <Tag tone="blue">{course.title}</Tag>
              <span className="muted small">
                {course.startDate} · {course.location}
              </span>
            </div>

            <table className="table" style={{ marginTop: 10 }}>
              <thead>
                <tr>
                  <th>学员</th>
                  <th>公司</th>
                  <th>状态</th>
                  <th>资料</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const student = db.users.find((u) => u.id === e.studentId)
                  const company = student?.companyId ? db.companies.find((c) => c.id === student.companyId) : undefined
                  const tone: 'gray' | 'blue' | 'green' | 'orange' | 'red' = e.status === '已签到' ? 'green' : 'orange'
                  const needPay = course.feeCny > 0 && !e.waived && !e.paidAt
                  return (
                    <tr key={e.id}>
                      <td>{student?.name}</td>
                      <td className="muted small">{company?.name ?? '-'}</td>
                      <td>
                        <Tag tone={tone}>{e.status}</Tag>
                        {e.checkedInAt ? <div className="muted small">签到时间：{e.checkedInAt}</div> : null}
                      </td>
                      <td>{e.materialGiven ? <Tag tone="green">已发</Tag> : <Tag tone="gray">未发</Tag>}</td>
                      <td className="row">
                        {e.status !== '已签到' && (
                          <button className="btnPrimary" onClick={() => checkInEnrollment(e.id as Id)}>
                            签到
                          </button>
                        )}
                        {needPay ? (
                          <button className="btnGhost" onClick={() => payEnrollment(e.id as Id)}>
                            收取培训费
                          </button>
                        ) : (
                          <span className="muted small">{e.waived ? '免收培训费' : e.paidAt ? `已收款：${e.paidAt}` : '-'}</span>
                        )}
                        {!e.materialGiven && (
                          <button className="btnGhost" onClick={() => giveMaterial(e.id as Id)}>
                            发放资料
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
