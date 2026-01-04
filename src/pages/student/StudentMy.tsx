import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'

export function StudentMyPage() {
  const { db, session, payEnrollment } = useDb()
  const studentId = session?.userId
  const enrollments = db.enrollments.filter((e) => e.studentId === studentId)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">我的报名</h2>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>课程</th>
              <th>时间</th>
              <th>地点</th>
              <th>状态</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => {
              const course = db.courses.find((c) => c.id === e.courseId)
              if (!course) return null
              let tone: 'gray' | 'blue' | 'green' | 'orange' | 'red' = 'gray'
              if (e.status === '已报名') tone = 'orange'
              if (e.status === '已确认') tone = 'blue'
              if (e.status === '已缴费' || e.status === '已签到' || e.status === '已完成') tone = 'green'
              if (e.status === '已拒绝') tone = 'red'
              const canPay = e.status === '已确认' && course.feeCny > 0 && !e.waived
              return (
                <tr key={e.id}>
                  <td>{course.title}</td>
                  <td className="muted small">
                    {course.startDate} ~ {course.endDate}
                  </td>
                  <td className="muted small">{course.location}</td>
                  <td>
                    <Tag tone={tone}>{e.status}</Tag>
                    {e.waived ? <div className="muted small">免收培训费（委托方学员）</div> : null}
                  </td>
                  <td>
                    {canPay ? (
                      <button className="btnPrimary" onClick={() => payEnrollment(e.id)}>
                        立即缴费（模拟）
                      </button>
                    ) : (
                      <span className="muted small">{e.paidAt ? `已缴费：${e.paidAt}` : '-'}</span>
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
      </div>
    </div>
  )
}

