import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'

export function StudentMyPage() {
  const { db, session, checkInEnrollment, payEnrollment } = useDb()
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
              const isCourseDay = course.startDate <= db.appToday && course.endDate >= db.appToday
              const isPaidOrFree = e.waived || course.feeCny <= 0 || Boolean(e.paidAt)
              const canCheckIn = e.status !== '已拒绝' && isCourseDay && !e.checkedInAt && isPaidOrFree
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
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div className="row">
                        {canPay ? (
                          <button className="btnPrimary" onClick={() => payEnrollment(e.id)}>
                            立即缴费（模拟）
                          </button>
                        ) : null}
                        {canCheckIn ? (
                          <button className="btnGhost" onClick={() => checkInEnrollment(e.id)}>
                            到场签到（模拟）
                          </button>
                        ) : null}
                        {!canPay && !canCheckIn ? <span className="muted small">-</span> : null}
                      </div>

                      <div className="muted small">
                        <div>{e.waived ? '缴费：免收培训费' : e.paidAt ? `缴费：${e.paidAt}` : '缴费：未缴费'}</div>
                        <div>{e.checkedInAt ? `签到：${e.checkedInAt}` : isCourseDay ? '签到：未签到' : '签到：未到签到时间'}</div>
                      </div>
                    </div>
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

