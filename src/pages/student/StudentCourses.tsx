import { Fragment, useMemo, useState } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'
import type { EnrollmentForm } from '../../types'

export function StudentCoursesPage() {
  const { db, session, applyCourse } = useDb()
  const [onlyOpen, setOnlyOpen] = useState(true)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [form, setForm] = useState<EnrollmentForm>({
    name: '',
    gender: '',
    companyName: '',
    jobTitle: '',
    skillLevel: '',
    email: '',
    phone: '',
    note: '',
  })

  const student = useMemo(() => db.users.find((u) => u.id === session?.userId), [db.users, session?.userId])

  const visibleCourses = db.courses.filter((c) => {
    if (!onlyOpen) return c.status === '已发布'
    return c.status === '已发布'
  })

  function hasApplied(courseId: string): boolean {
    if (!student) return false
    return db.enrollments.some((e) => e.courseId === courseId && e.studentId === student.id)
  }

  function isWaived(courseId: string): boolean {
    if (!student?.companyId) return false
    const course = db.courses.find((c) => c.id === courseId)
    if (!course?.requestId) return false
    const req = db.requests.find((r) => r.id === course.requestId)
    return req?.companyId === student.companyId
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">课程浏览与报名（学员端）</h2>
      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="cardTitle">可报名课程</div>
            <div className="muted small">来源于执行人发布的培训通知。</div>
          </div>
          <label className="row small">
            <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
            只显示已发布课程
          </label>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>课程</th>
              <th>时间/地点</th>
              <th>费用</th>
              <th>状态</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibleCourses.map((c) => {
              const lecturer = c.lecturerId ? db.users.find((u) => u.id === c.lecturerId) : undefined
              const applied = hasApplied(c.id)
              const waived = isWaived(c.id)
              const showForm = editingCourseId === c.id && !applied

              return (
                <Fragment key={c.id}>
                  <tr>
                    <td>
                      {c.title}
                      <div className="muted small">主题：{c.topic}</div>
                      <div className="muted small">讲师：{lecturer?.name ?? '待定'}</div>
                      {c.requestId ? <div className="muted small">委托培训：来自软件公司定制培训申请</div> : <div className="muted small">公开课：面向社会开放报名</div>}
                    </td>
                    <td className="muted small">
                      {c.startDate} ~ {c.endDate}
                      <br />
                      {c.location}
                    </td>
                    <td className="muted small">{waived ? '委托方学员免收培训费' : c.feeCny <= 0 ? '免费' : `${c.feeCny} 元/人`}</td>
                    <td>{applied ? <Tag tone="green">已报名</Tag> : <Tag tone="blue">可报名</Tag>}</td>
                    <td>
                      <div className="row">
                        <button
                          className={showForm ? 'btnGhost' : 'btnPrimary'}
                          disabled={!student || applied}
                          onClick={() => {
                            if (!student || applied) return
                            setEditingCourseId((prev) => {
                              const next = prev === c.id ? null : c.id
                              if (next) {
                                const companyName = student.companyId ? db.companies.find((x) => x.id === student.companyId)?.name ?? '' : ''
                                setForm({
                                  name: student.name,
                                  gender: '',
                                  companyName,
                                  jobTitle: '',
                                  skillLevel: '',
                                  email: student.email,
                                  phone: student.phone,
                                  note: '',
                                })
                              }
                              return next
                            })
                          }}
                        >
                          {applied ? '已报名' : showForm ? '收起报名表' : '填写报名表'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {showForm ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="card" style={{ marginTop: 10 }}>
                          <div className="cardHeader">
                            <div>
                              <div className="cardTitle">培训报名表（网页填写）</div>
                              <div className="muted small">
                                提交后将生成一条报名记录{waived ? '（委托方学员免收培训费）' : ''}。
                              </div>
                            </div>
                          </div>

                          <table className="table" style={{ marginTop: 8 }}>
                            <tbody>
                              <tr>
                                <th style={{ width: 140 }}>姓名</th>
                                <td>
                                  <input className="input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                                </td>
                                <th style={{ width: 140 }}>性别</th>
                                <td>
                                  <select className="select" value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
                                    <option value="">请选择</option>
                                    <option value="男">男</option>
                                    <option value="女">女</option>
                                    <option value="其他">其他</option>
                                  </select>
                                </td>
                              </tr>
                              <tr>
                                <th>公司名称</th>
                                <td>
                                  <input
                                    className="input"
                                    value={form.companyName}
                                    onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                                  />
                                </td>
                                <th>工作岗位</th>
                                <td>
                                  <input className="input" value={form.jobTitle} onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))} />
                                </td>
                              </tr>
                              <tr>
                                <th>技术水平</th>
                                <td>
                                  <input
                                    className="input"
                                    value={form.skillLevel}
                                    onChange={(e) => setForm((p) => ({ ...p, skillLevel: e.target.value }))}
                                    placeholder="例如：初级/中级/高级"
                                  />
                                </td>
                                <th>邮箱</th>
                                <td>
                                  <input
                                    className="input"
                                    value={form.email}
                                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                    placeholder="用于通知（演示）"
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th>电话</th>
                                <td>
                                  <input
                                    className="input"
                                    value={form.phone}
                                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                    placeholder="用于联系（演示）"
                                  />
                                </td>
                                <th>备注</th>
                                <td>
                                  <input className="input" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          <div className="row" style={{ marginTop: 10 }}>
                            <button className="btnGhost" onClick={() => setEditingCourseId(null)}>
                              取消
                            </button>
                            <button
                              className="btnPrimary"
                              onClick={() => {
                                if (!student) return
                                const trimmed: EnrollmentForm = {
                                  name: form.name.trim(),
                                  gender: form.gender.trim(),
                                  companyName: form.companyName.trim(),
                                  jobTitle: form.jobTitle.trim(),
                                  skillLevel: form.skillLevel.trim(),
                                  email: form.email.trim(),
                                  phone: form.phone.trim(),
                                  note: form.note.trim(),
                                }

                                if (!trimmed.name || !trimmed.companyName || !trimmed.email || !trimmed.phone) {
                                  window.alert('请至少填写：姓名、公司名称、邮箱、电话。')
                                  return
                                }

                                applyCourse(c.id, student.id, waived, trimmed)
                                setEditingCourseId(null)
                              }}
                            >
                              提交报名
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
            {visibleCourses.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  暂无可报名课程。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
