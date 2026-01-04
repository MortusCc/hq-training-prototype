import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setSession } from '../state/session'
import type { Role, Session } from '../types'
import { roleLabel, useDb } from '../state/db'

type Preset = { role: Role; name: string; hint: string; email?: string }

export function LoginPage() {
  const { db, refreshSession } = useDb()
  const navigate = useNavigate()
  const presets: Preset[] = useMemo(
    () => [
      { role: 'manager', name: '赵经理', hint: '评审培训申请、立项并分配执行人' },
      { role: 'executor', name: '李执行', hint: '发布课程、管理讲师、报名与通知' },
      { role: 'student', name: '张学员', hint: '浏览通知、报名、缴费、评价' },
      { role: 'onsite', name: '周现场', hint: '核对名单、发放资料、汇总课程评价' },
      { role: 'company', name: '王敏', hint: '在线填写培训申请，提交给经理端评审' },
    ],
    [],
  )

  const [role, setRole] = useState<Role>('manager')
  const [name, setName] = useState('赵经理')

  const usersForRole = db.users.filter((u) => u.role === role || (role === 'executor' && u.expertise))

  function loginWithUser(userId: string) {
    const user = db.users.find((u) => u.id === userId)
    if (!user) return
    const session: Session = { role, name: user.name, userId: user.id }
    setSession(session)
    refreshSession(session)
    navigate('/dashboard', { replace: true })
  }

  function loginQuick(p: Preset) {
    setRole(p.role)
    setName(p.name)
    const user = db.users.find((u) => u.role === p.role && u.name === p.name)
    if (!user) return
    const session: Session = { role: p.role, name: p.name, userId: user.id }
    setSession(session)
    refreshSession(session)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="loginShell">
      <div className="loginPanel">
        <div className="loginHero">
          <h1 className="loginTitle">HQ技术培训管理系统</h1>
          <div className="muted">用于课程综合实践：高保真度原型系统（可运行、可交互、无后端）。</div>
          <div className="split" />
          <div className="row">
            {presets.map((p) => (
              <button key={p.role} className="btnPrimary" onClick={() => loginQuick(p)}>
                一键进入 {roleLabel(p.role)}
              </button>
            ))}
          </div>
          <div className="split" />
          <div className="hint small">
            数据在浏览器本地保存。可随时点击右上角「重置演示数据」恢复到初始状态。
          </div>
        </div>

        <div className="card loginCard">
          <div className="cardHeader">
            <div>
              <div className="cardTitle">自定义进入</div>
              <div className="muted small">选择角色与用户，快速切换不同端的界面。</div>
            </div>
          </div>

          <div className="row">
            <select className="select" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="manager">经理端</option>
              <option value="executor">执行人端</option>
              <option value="student">学员端</option>
              <option value="onsite">工作人员端</option>
              <option value="company">软件公司端</option>
            </select>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="显示名称（演示用）" />
          </div>

          <div className="split" />

          <div className="muted small">选择一个演示用户：</div>
          <div style={{ marginTop: 10 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>邮箱</th>
                  <th>电话</th>
                  <th>说明</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {usersForRole.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="muted">{u.email}</td>
                    <td className="muted">{u.phone}</td>
                    <td className="muted">{u.expertise ? `讲师：${u.expertise}` : '-'}</td>
                    <td>
                      <button className="btnPrimary" onClick={() => loginWithUser(u.id)}>
                        进入
                      </button>
                    </td>
                  </tr>
                ))}
                {usersForRole.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="muted">
                      暂无该角色用户
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
