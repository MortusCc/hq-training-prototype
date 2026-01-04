import { useMemo, useState } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'

type RequestForm = {
  companyId: string
  title: string
  desiredTopics: string
  preferredDateRange: string
  budgetNote: string
}

export function CompanyRequestsPage() {
  const { db, session, createRequest } = useDb()

  const companyUser = useMemo(() => db.users.find((u) => u.id === session?.userId), [db.users, session?.userId])
  const defaultCompanyId = companyUser?.companyId ?? db.companies[0]?.id ?? ''

  const [submittedAt, setSubmittedAt] = useState<string>('')
  const [form, setForm] = useState<RequestForm>({
    companyId: defaultCompanyId,
    title: '',
    desiredTopics: '',
    preferredDateRange: '',
    budgetNote: '',
  })

  const company = useMemo(() => db.companies.find((c) => c.id === form.companyId) ?? null, [db.companies, form.companyId])

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">提交培训申请（软件公司端）</h2>

      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="cardTitle">在线填写申请表</div>
            <div className="muted small">提交后将进入「经理端 - 培训申请评审」等待处理。</div>
          </div>
          {submittedAt ? <Tag tone="green">已提交：{submittedAt}</Tag> : <Tag tone="orange">未提交</Tag>}
        </div>

        <table className="table">
          <tbody>
            <tr>
              <th style={{ width: 120 }}>申请公司</th>
              <td>
                <select
                  className="select"
                  value={form.companyId}
                  onChange={(e) => {
                    const companyId = e.target.value
                    setForm((p) => ({ ...p, companyId }))
                  }}
                >
                  {db.companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.vipClient ? '（重要客户）' : ''}
                    </option>
                  ))}
                </select>
                {company ? (
                  <div className="muted small" style={{ marginTop: 6 }}>
                    联系人：{company.contactName} · {company.contactPhone} · {company.contactEmail}
                  </div>
                ) : null}
              </td>
            </tr>

            <tr>
              <th>申请标题</th>
              <td>
                <input className="input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="例如：云原生架构实践培训申请" />
              </td>
            </tr>

            <tr>
              <th>期望内容</th>
              <td>
                <textarea
                  className="textarea"
                  value={form.desiredTopics}
                  onChange={(e) => setForm((p) => ({ ...p, desiredTopics: e.target.value }))}
                  placeholder="例如：Kubernetes、微服务治理、DevOps落地、可观测性"
                />
              </td>
            </tr>

            <tr>
              <th>期望时间</th>
              <td>
                <input
                  className="input"
                  value={form.preferredDateRange}
                  onChange={(e) => setForm((p) => ({ ...p, preferredDateRange: e.target.value }))}
                  placeholder="例如：2026-01-10 ~ 2026-01-20"
                />
              </td>
            </tr>

            <tr>
              <th>预算备注</th>
              <td>
                <textarea
                  className="textarea"
                  value={form.budgetNote}
                  onChange={(e) => setForm((p) => ({ ...p, budgetNote: e.target.value }))}
                  placeholder="例如：希望含3天线下实操，费用可商议"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="row" style={{ marginTop: 10 }}>
          <button
            className="btnPrimary"
            onClick={() => {
              const trimmed = {
                companyId: form.companyId.trim(),
                title: form.title.trim(),
                desiredTopics: form.desiredTopics.trim(),
                preferredDateRange: form.preferredDateRange.trim(),
                budgetNote: form.budgetNote.trim(),
              }

              if (!trimmed.companyId || !trimmed.title || !trimmed.desiredTopics || !trimmed.preferredDateRange) {
                window.alert('请至少填写：申请公司、申请标题、期望内容、期望时间。')
                return
              }

              createRequest(trimmed)
              setSubmittedAt(`${db.appToday} 09:00`)
              setForm((p) => ({
                ...p,
                title: '',
                desiredTopics: '',
                preferredDateRange: '',
                budgetNote: '',
              }))
            }}
          >
            提交申请
          </button>
          <button
            className="btnGhost"
            onClick={() => {
              setSubmittedAt('')
              setForm({
                companyId: defaultCompanyId,
                title: '',
                desiredTopics: '',
                preferredDateRange: '',
                budgetNote: '',
              })
            }}
          >
            清空表单
          </button>
        </div>
      </div>
    </div>
  )
}

