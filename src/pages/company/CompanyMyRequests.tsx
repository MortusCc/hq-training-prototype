import { useMemo } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'

export function CompanyMyRequestsPage() {
  const { db, session } = useDb()

  const companyUser = useMemo(() => db.users.find((u) => u.id === session?.userId) ?? null, [db.users, session?.userId])
  const companyId = companyUser?.companyId ?? ''
  const company = useMemo(() => (companyId ? db.companies.find((c) => c.id === companyId) ?? null : null), [companyId, db.companies])

  const myRequests = useMemo(() => (companyId ? db.requests.filter((r) => r.companyId === companyId) : []), [companyId, db.requests])

  function statusTag(status: string) {
    if (status === '待评审') return <Tag tone="orange">待评审</Tag>
    if (status === '已立项') return <Tag tone="blue">已立项</Tag>
    if (status === '已拒绝') return <Tag tone="red">已拒绝</Tag>
    return <Tag tone="gray">{status}</Tag>
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">我的培训申请（软件公司端）</h2>

      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="cardTitle">申请列表</div>
            <div className="muted small">
              {company ? `当前公司：${company.name}` : '未绑定公司，请使用演示软件公司用户进入。'}
            </div>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>申请标题</th>
              <th>提交时间</th>
              <th>状态</th>
              <th>经理批注</th>
              <th>后续</th>
            </tr>
          </thead>
          <tbody>
            {myRequests.map((r) => {
              const executor = r.assignedExecutorId ? db.users.find((u) => u.id === r.assignedExecutorId) : undefined
              return (
                <tr key={r.id}>
                  <td>
                    {r.title}
                    <div className="muted small">期望：{r.preferredDateRange}</div>
                  </td>
                  <td className="muted small">{r.createdAt}</td>
                  <td>{statusTag(r.status)}</td>
                  <td className="muted small">{r.managerNote ?? '-'}</td>
                  <td className="muted small">
                    {r.status === '已立项' ? (
                      <div style={{ display: 'grid', gap: 4 }}>
                        <div>{executor ? `执行人：${executor.name}` : '执行人：待指定'}</div>
                        <div>{r.generatedCourseId ? `已生成培训计划：${r.generatedCourseId}` : '培训计划：待生成'}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              )
            })}
            {myRequests.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  暂无申请记录。可先在「提交培训申请」中提交一条申请。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

