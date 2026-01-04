import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { roleLabel, useDb } from '../state/db'

type NavItem = { to: string; label: string }

function useNavItems() {
  const { session } = useDb()
  return useMemo(() => {
    const role = session?.role
    const common: NavItem[] = [{ to: '/dashboard', label: '工作台' }]
    if (!role) return common
    if (role === 'manager') {
      return [...common, { to: '/manager/requests', label: '培训申请评审' }, { to: '/manager/courses', label: '培训课程总览' }, { to: '/reports', label: '统计报表' }]
    }
    if (role === 'executor') {
      return [
        ...common,
        { to: '/executor/courses', label: '课程管理' },
        { to: '/executor/lecturers', label: '讲师管理' },
        { to: '/executor/enrollments', label: '报名与通知' },
        { to: '/executor/notices', label: '网站通知/导出' },
        { to: '/reports', label: '统计报表' },
      ]
    }
    if (role === 'student') {
      return [...common, { to: '/student/courses', label: '课程浏览/报名' }, { to: '/student/my', label: '我的报名' }, { to: '/student/evaluation', label: '课程评价' }]
    }
    return [...common, { to: '/onsite/checkin', label: '签到名单/资料发放' }, { to: '/onsite/survey', label: '课程评价/报告' }]
  }, [session?.role])
}

function crumbFromPath(pathname: string): string {
  const map: Record<string, string> = {
    '/dashboard': '工作台',
    '/manager/requests': '经理端 / 培训申请评审',
    '/manager/courses': '经理端 / 培训课程总览',
    '/executor/courses': '执行人端 / 课程管理',
    '/executor/lecturers': '执行人端 / 讲师管理',
    '/executor/enrollments': '执行人端 / 报名与通知',
    '/executor/notices': '执行人端 / 网站通知与导出',
    '/student/courses': '学员端 / 课程浏览与报名',
    '/student/my': '学员端 / 我的报名',
    '/student/evaluation': '学员端 / 课程评价',
    '/onsite/checkin': '工作人员端 / 签到名单与资料发放',
    '/onsite/survey': '工作人员端 / 培训调查与评价报告',
    '/reports': '统计报表',
  }
  return map[pathname] ?? pathname
}

export function AppLayout() {
  const { db, session, logout, resetDemo, setToday } = useDb()
  const navItems = useNavItems()
  const location = useLocation()
  const navigate = useNavigate()

  if (!session && location.pathname !== '/login') {
    return null
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandTitle">HQ技术培训管理系统</div>
          <div className="brandSub">高保真度原型（前端演示，无后端/数据库）</div>
        </div>

        <div className="navGroupTitle">导航</div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `navItem ${isActive ? 'navItemActive' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <div className="hint small">
          演示建议：先用「经理端」立项，再用「执行人端」发布通知，然后用「学员端」报名、缴费、签到与评价，最后在「工作人员端」核对名单、发放资料并汇总评价。
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbarLeft">
            <div className="pill">
              当前日期：{' '}
              <input
                className="input"
                style={{ minWidth: 160, padding: '6px 10px', borderRadius: 999 }}
                type="date"
                value={db.appToday}
                onChange={(e) => setToday(e.target.value)}
              />
            </div>
            <div className="crumb">{crumbFromPath(location.pathname)}</div>
          </div>
          <div className="topbarRight">
            {session ? (
              <>
                <span className="pill">
                  {roleLabel(session.role)} · {session.name}
                </span>
                <button
                  className="btnGhost"
                  onClick={() => {
                    resetDemo()
                    navigate('/login', { replace: true })
                  }}
                >
                  重置演示数据
                </button>
                <button
                  className="btnGhost"
                  onClick={() => {
                    logout()
                    navigate('/login', { replace: true })
                  }}
                >
                  退出
                </button>
              </>
            ) : null}
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
