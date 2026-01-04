import { Link } from 'react-router-dom'
import { Tag } from '../components/Tag'
import { useDb } from '../state/db'

export function DashboardPage() {
  const { db, session } = useDb()

  const publishedCourses = db.courses.filter((c) => c.status === '已发布').length
  const pendingRequests = db.requests.filter((r) => r.status === '待评审').length
  const todayCourses = db.courses.filter((c) => c.startDate <= db.appToday && c.endDate >= db.appToday).length
  const enrollments = db.enrollments.length

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">工作台</h2>
      <div className="grid3">
        <div className="card">
          <div className="kpiValue">{pendingRequests}</div>
          <div className="kpiLabel">待评审培训申请</div>
        </div>
        <div className="card">
          <div className="kpiValue">{publishedCourses}</div>
          <div className="kpiLabel">已发布课程</div>
        </div>
        <div className="card">
          <div className="kpiValue">{todayCourses}</div>
          <div className="kpiLabel">今日进行中课程</div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">快捷入口</div>
            <div className="muted small">根据当前角色展示常用操作</div>
          </div>
          <div className="row">
            {session?.role === 'manager' ? (
              <>
                <Link className="navItem" to="/manager/requests">
                  培训申请评审
                </Link>
                <Link className="navItem" to="/manager/courses">
                  课程总览
                </Link>
                <Link className="navItem" to="/reports">
                  统计报表
                </Link>
              </>
            ) : null}
            {session?.role === 'executor' ? (
              <>
                <Link className="navItem" to="/executor/courses">
                  课程管理
                </Link>
                <Link className="navItem" to="/executor/enrollments">
                  报名与通知
                </Link>
                <Link className="navItem" to="/executor/notices">
                  网站通知/导出
                </Link>
              </>
            ) : null}
            {session?.role === 'company' ? (
              <>
                <Link className="navItem" to="/company/requests">
                  提交培训申请
                </Link>
                <Link className="navItem" to="/company/my">
                  我的申请
                </Link>
              </>
            ) : null}
            {session?.role === 'student' ? (
              <>
                <Link className="navItem" to="/student/courses">
                  课程浏览/报名
                </Link>
                <Link className="navItem" to="/student/my">
                  我的报名
                </Link>
                <Link className="navItem" to="/student/evaluation">
                  课程评价
                </Link>
              </>
            ) : null}
            {session?.role === 'onsite' ? (
              <>
                <Link className="navItem" to="/onsite/checkin">
                  签到名单/资料发放
                </Link>
                <Link className="navItem" to="/onsite/survey">
                  课程评价/报告
                </Link>
              </>
            ) : null}
          </div>
          <div className="split" />
          <div className="hint small">提示：右上角可修改「当前日期」，用于模拟开课、签到、评价等时间点。</div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">关键状态概览</div>
            <div className="muted small">报名总数：{enrollments}</div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="row">
              <Tag tone="blue">已发布课程</Tag>
              <span className="muted small">{db.courses.filter((c) => c.status === '已发布').length} 门</span>
            </div>
            <div className="row">
              <Tag tone="orange">草稿课程</Tag>
              <span className="muted small">{db.courses.filter((c) => c.status === '草稿').length} 门</span>
            </div>
            <div className="row">
              <Tag tone="green">已结课</Tag>
              <span className="muted small">{db.courses.filter((c) => c.status === '已结课').length} 门</span>
            </div>
            <div className="row">
              <Tag tone="gray">待评审申请</Tag>
              <span className="muted small">{db.requests.filter((r) => r.status === '待评审').length} 条</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
