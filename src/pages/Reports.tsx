import { Tag } from '../components/Tag'
import { useDb } from '../state/db'

export function ReportsPage() {
  const { db } = useDb()

  const totalCourses = db.courses.length
  const totalStudents = db.enrollments.length
  const totalRevenue = db.enrollments.reduce((sum, e) => {
    if (!e.paidAt) return sum
    const course = db.courses.find((c) => c.id === e.courseId)
    if (!course) return sum
    if (e.waived) return sum
    return sum + course.feeCny
  }, 0)

  const executorWorkload = db.users
    .filter((u) => u.role === 'executor')
    .map((u) => ({
      id: u.id,
      name: u.name,
      courseCount: db.courses.filter((c) => c.executorId === u.id).length,
      enrollmentCount: db.enrollments.filter((e) => {
        const c = db.courses.find((cc) => cc.id === e.courseId)
        return c?.executorId === u.id
      }).length,
    }))

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">统计与分析报表</h2>

      <div className="grid3">
        <div className="card">
          <div className="kpiValue">{totalCourses}</div>
          <div className="kpiLabel">累计课程门次</div>
        </div>
        <div className="card">
          <div className="kpiValue">{totalStudents}</div>
          <div className="kpiLabel">报名学员人次</div>
        </div>
        <div className="card">
          <div className="kpiValue">{totalRevenue}</div>
          <div className="kpiLabel">累计培训收入（元）</div>
        </div>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">执行人工作量概览</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>执行人</th>
              <th>负责课程门数</th>
              <th>关联报名人次</th>
              <th>强度标签</th>
            </tr>
          </thead>
          <tbody>
            {executorWorkload.map((w) => {
              const tone: 'gray' | 'blue' | 'green' | 'orange' | 'red' =
                w.enrollmentCount > 20 ? 'red' : w.enrollmentCount > 10 ? 'orange' : 'green'
              const label = w.enrollmentCount > 20 ? '偏高' : w.enrollmentCount > 10 ? '适中' : '偏低'
              return (
                <tr key={w.id}>
                  <td>{w.name}</td>
                  <td className="muted small">{w.courseCount}</td>
                  <td className="muted small">{w.enrollmentCount}</td>
                  <td>
                    <Tag tone={tone}>{label}</Tag>
                  </td>
                </tr>
              )
            })}
            {executorWorkload.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  暂无执行人。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

