import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'

export function OnsiteSurveyPage() {
  const { db, endCourse } = useDb()

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">培训调查与评价报告（现场端）</h2>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>课程</th>
              <th>状态</th>
              <th>报名人数</th>
              <th>完成问卷数</th>
              <th>平均满意度</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {db.courses.map((c) => {
              const courseEnrollments = db.enrollments.filter((e) => e.courseId === c.id)
              const surveys = db.surveys.filter((s) => s.courseId === c.id)
              const avg =
                surveys.length === 0 ? 0 : Math.round((surveys.reduce((sum, s) => sum + s.satisfaction, 0) / surveys.length) * 10) / 10
              const tone: 'gray' | 'blue' | 'green' | 'orange' | 'red' =
                c.status === '已结课' ? 'gray' : c.status === '已发布' ? 'blue' : 'green'
              return (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>
                    <Tag tone={tone}>{c.status}</Tag>
                  </td>
                  <td className="muted small">{courseEnrollments.length}</td>
                  <td className="muted small">{surveys.length}</td>
                  <td className="muted small">{avg ? `${avg} / 5` : '-'}</td>
                  <td>
                    {c.status !== '已结课' && (
                      <button className="btnGhost" onClick={() => endCourse(c.id)}>
                        标记课程已结课
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {db.courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted">
                  暂无课程。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

