import { useMemo, useState } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'
import { downloadTextFile } from '../../lib/download'

export function StudentCoursesPage() {
  const { db, session, applyCourse } = useDb()
  const [onlyOpen, setOnlyOpen] = useState(true)

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
              return (
                <tr key={c.id}>
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
                  <td>
                    {applied ? <Tag tone="green">已报名</Tag> : <Tag tone="blue">可报名</Tag>}
                  </td>
                  <td>
                    <div className="row">
                      <button
                        className="btnGhost"
                        onClick={() => {
                          const lines = [
                            '培训报名表',
                            '',
                            `课程名称：${c.title}`,
                            `课程主题：${c.topic}`,
                            `培训时间：${c.startDate} ~ ${c.endDate}`,
                            `培训地点：${c.location}`,
                            '',
                            '学员信息（演示用，可自行填写）：',
                            '姓名：',
                            '性别：',
                            '公司名称：',
                            '工作岗位：',
                            '技术水平：',
                            '联系方式：',
                          ]
                          downloadTextFile(`报名表-${c.title}.doc`, lines.join('\n'), 'application/msword;charset=utf-8')
                        }}
                      >
                        下载报名表（Word）
                      </button>
                      <button
                        className="btnPrimary"
                        disabled={applied || !student}
                        onClick={() => student && applyCourse(c.id, student.id, waived)}
                      >
                        {applied ? '已报名' : '报名'}
                      </button>
                    </div>
                  </td>
                </tr>
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
