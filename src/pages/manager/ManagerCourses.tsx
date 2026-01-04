import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'

export function ManagerCoursesPage() {
  const { db } = useDb()

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">培训课程总览</h2>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>课程名称</th>
              <th>主题</th>
              <th>时间</th>
              <th>地点</th>
              <th>讲师</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {db.courses.map((c) => {
              const lecturer = c.lecturerId ? db.users.find((u) => u.id === c.lecturerId) : undefined
              const req = c.requestId ? db.requests.find((r) => r.id === c.requestId) : undefined
              const company = req ? db.companies.find((co) => co.id === req.companyId) : undefined
              return (
                <tr key={c.id}>
                  <td>
                    {c.title}
                    <div className="muted small">{company ? `来源：${company.name}` : '公开课'}</div>
                  </td>
                  <td className="muted small">{c.topic}</td>
                  <td className="muted small">
                    {c.startDate} ~ {c.endDate}
                  </td>
                  <td className="muted small">{c.location}</td>
                  <td className="muted small">{lecturer ? lecturer.name : '待定'}</td>
                  <td>
                    {c.status === '草稿' && <Tag tone="orange">草稿</Tag>}
                    {c.status === '已发布' && <Tag tone="blue">已发布</Tag>}
                    {c.status === '已开课' && <Tag tone="green">进行中</Tag>}
                    {c.status === '已结课' && <Tag tone="gray">已结课</Tag>}
                  </td>
                </tr>
              )
            })}
            {db.courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted">
                  暂无课程
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

