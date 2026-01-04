import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="card">
      <div className="cardTitle">页面不存在</div>
      <div className="muted" style={{ marginTop: 8 }}>
        请从左侧导航进入，或返回工作台。
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <Link className="navItem" to="/dashboard">
          返回工作台
        </Link>
      </div>
    </div>
  )
}

