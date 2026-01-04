import { useState } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'
import type { Id } from '../../types'

export function ManagerRequestsPage() {
  const { db, approveRequest, rejectRequest } = useDb()
  const [selectedId, setSelectedId] = useState<Id | null>(null)
  const [note, setNote] = useState('')

  const [executorId, setExecutorId] = useState<string>(() => {
    const first = db.users.find((u) => u.role === 'executor')
    return first ? first.id : ''
  })

  const executors = db.users.filter((u) => u.role === 'executor')

  function statusTag(status: string) {
    if (status === '待评审') return <Tag tone="orange">待评审</Tag>
    if (status === '已立项') return <Tag tone="blue">已立项</Tag>
    if (status === '已拒绝') return <Tag tone="red">已拒绝</Tag>
    return <Tag tone="gray">{status}</Tag>
  }

  const current = selectedId ? db.requests.find((r) => r.id === selectedId) ?? null : null

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">培训申请评审</h2>

      <div className="grid2">
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">收到的培训申请</div>
            <div className="muted small">来源于各软件公司提交的培训需求</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>申请标题</th>
                <th>公司</th>
                <th>期望时间</th>
                <th>状态</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {db.requests.map((r) => {
                const company = db.companies.find((c) => c.id === r.companyId)
                return (
                  <tr key={r.id}>
                    <td>{r.title}</td>
                    <td className="muted">
                      {company?.name}
                      {company?.vipClient ? '（重要客户）' : ''}
                    </td>
                    <td className="muted small">{r.preferredDateRange}</td>
                    <td>{statusTag(r.status)}</td>
                    <td>
                      <button className="btnGhost" onClick={() => setSelectedId(r.id)}>
                        查看
                      </button>
                    </td>
                  </tr>
                )
              })}
              {db.requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    暂无申请
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">申请详情 / 立项决策</div>
            <div className="muted small">选择左侧一条申请进行评审。</div>
          </div>

          {current ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="row">
                <Tag tone="gray">申请标题</Tag>
                <span>{current.title}</span>
              </div>
              <div className="row">
                <Tag tone="gray">期望内容</Tag>
                <span className="muted small">{current.desiredTopics}</span>
              </div>
              <div className="row">
                <Tag tone="gray">期望时间</Tag>
                <span className="muted small">{current.preferredDateRange}</span>
              </div>
              <div className="row">
                <Tag tone="gray">预算备注</Tag>
                <span className="muted small">{current.budgetNote}</span>
              </div>
              <div className="row">
                <Tag tone="gray">经理批注</Tag>
              </div>
              <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} />

              <div className="row">
                <Tag tone="gray">指定执行人</Tag>
                <select className="select" value={executorId} onChange={(e) => setExecutorId(e.target.value)}>
                  {executors.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row">
                <button
                  className="btnPrimary"
                  onClick={() => {
                    if (!executorId) return
                    approveRequest(current.id, executorId, note || '同意立项。')
                    setNote('')
                  }}
                >
                  立项并生成课程草稿
                </button>
                <button
                  className="btnDanger"
                  onClick={() => {
                    rejectRequest(current.id, note || '当前暂不适合安排培训。')
                    setNote('')
                  }}
                >
                  拒绝申请
                </button>
              </div>
            </div>
          ) : (
            <div className="muted small">请先在左侧选择一条申请。</div>
          )}
        </div>
      </div>
    </div>
  )
}

