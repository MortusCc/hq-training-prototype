import { useState } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'

export function OnsiteCheckinPage() {
  const { db, giveMaterial } = useDb()
  const [courseId, setCourseId] = useState<string>('')

  const currentId = courseId || db.courses[0]?.id
  const course = db.courses.find((c) => c.id === currentId) ?? null
  const enrollments = db.enrollments.filter((e) => e.courseId === currentId)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">签到名单与资料发放（现场端）</h2>

      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="cardTitle">选择课程</div>
            <div className="muted small">现场工作人员核对签到名单，并为已签到学员发放资料。</div>
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
                  <th>缴费</th>
                  <th>签到</th>
                  <th>资料</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const student = db.users.find((u) => u.id === e.studentId)
                  const company = student?.companyId ? db.companies.find((c) => c.id === student.companyId) : undefined
                  const checkinTone: 'gray' | 'blue' | 'green' | 'orange' | 'red' =
                    e.status === '已签到' || e.status === '已完成' ? 'green' : e.status === '已拒绝' ? 'red' : 'orange'
                  const paidText = e.waived ? '免收' : e.paidAt ? `已缴费（${e.paidAt}）` : course.feeCny <= 0 ? '免费' : '未缴费'
                  const canGive = !e.materialGiven && (e.status === '已签到' || e.status === '已完成')
                  return (
                    <tr key={e.id}>
                      <td>{student?.name}</td>
                      <td className="muted small">{company?.name ?? '-'}</td>
                      <td className="muted small">{paidText}</td>
                      <td>
                        <Tag tone={checkinTone}>{e.checkedInAt ? '已签到' : e.status === '已拒绝' ? '已拒绝' : '未签到'}</Tag>
                        {e.checkedInAt ? <div className="muted small">签到时间：{e.checkedInAt}</div> : null}
                      </td>
                      <td>{e.materialGiven ? <Tag tone="green">已发</Tag> : <Tag tone="gray">未发</Tag>}</td>
                      <td className="row">
                        {canGive ? (
                          <button className="btnGhost" onClick={() => giveMaterial(e.id)}>
                            发放资料
                          </button>
                        ) : (
                          <span className="muted small">{e.materialGiven ? '已发放' : '未签到，暂不可发放'}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted">
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
