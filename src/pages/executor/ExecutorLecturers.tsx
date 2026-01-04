import { useDb } from '../../state/db'

export function ExecutorLecturersPage() {
  const { db } = useDb()
  const lecturers = db.users.filter((u) => u.expertise)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">讲师资料管理</h2>
      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">讲师列表（原Excel讲师资料电子化）</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>职称/头衔</th>
              <th>擅长领域</th>
              <th>Email</th>
              <th>电话</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((l) => (
              <tr key={l.id}>
                <td>{l.name}</td>
                <td className="muted small">{l.title}</td>
                <td className="muted small">{l.expertise}</td>
                <td className="muted small">{l.email}</td>
                <td className="muted small">{l.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

