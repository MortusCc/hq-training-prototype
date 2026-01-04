import { useMemo, useState } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'
import type { Id } from '../../types'

export function ExecutorCoursesPage() {
  const { db, updateCourse, publishCourseNotice, sendCourseReminder, endCourse } = useDb()
  const [selectedId, setSelectedId] = useState<Id | null>(null)
  const [showEvaluation, setShowEvaluation] = useState(false)

  const current = selectedId ? db.courses.find((c) => c.id === selectedId) ?? null : null
  const lecturers = db.users.filter((u) => u.expertise)
  const surveys = useMemo(() => (current ? db.surveys.filter((s) => s.courseId === current.id) : []), [current, db.surveys])
  const avg =
    surveys.length === 0 ? 0 : Math.round((surveys.reduce((sum, s) => sum + s.satisfaction, 0) / surveys.length) * 10) / 10

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">课程管理（执行人端）</h2>

      <div className="grid2">
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">课程列表</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>课程名称</th>
                <th>时间</th>
                <th>状态</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {db.courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td className="muted small">
                    {c.startDate} ~ {c.endDate}
                  </td>
                  <td>
                    {c.status === '草稿' && <Tag tone="orange">草稿</Tag>}
                    {c.status === '已发布' && <Tag tone="blue">已发布</Tag>}
                    {c.status === '已开课' && <Tag tone="green">进行中</Tag>}
                    {c.status === '已结课' && <Tag tone="gray">已结课</Tag>}
                  </td>
                  <td>
                    <button
                      className="btnGhost"
                      onClick={() => {
                        setSelectedId(c.id)
                        setShowEvaluation(false)
                      }}
                    >
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
              {db.courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    暂无课程
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">课程详情与发布</div>
          </div>

          {current ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="row">
                <span className="muted small">课程名称</span>
                <input
                  className="input"
                  value={current.title}
                  onChange={(e) => updateCourse(current.id, { title: e.target.value })}
                />
              </div>
              <div className="row">
                <span className="muted small">主题</span>
                <input
                  className="input"
                  value={current.topic}
                  onChange={(e) => updateCourse(current.id, { topic: e.target.value })}
                />
              </div>
              <div className="row">
                <span className="muted small">时间</span>
                <input
                  className="input"
                  type="date"
                  value={current.startDate}
                  onChange={(e) => updateCourse(current.id, { startDate: e.target.value })}
                />
                <span>至</span>
                <input
                  className="input"
                  type="date"
                  value={current.endDate}
                  onChange={(e) => updateCourse(current.id, { endDate: e.target.value })}
                />
              </div>
              <div className="row">
                <span className="muted small">地点</span>
                <input
                  className="input"
                  value={current.location}
                  onChange={(e) => updateCourse(current.id, { location: e.target.value })}
                />
              </div>
              <div className="row">
                <span className="muted small">费用（元/人）</span>
                <input
                  className="input"
                  type="number"
                  value={current.feeCny}
                  onChange={(e) => updateCourse(current.id, { feeCny: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="row">
                <span className="muted small">讲师</span>
                <select
                  className="select"
                  value={current.lecturerId ?? ''}
                  onChange={(e) => updateCourse(current.id, { lecturerId: e.target.value || undefined })}
                >
                  <option value="">待定</option>
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}（{l.title ?? '讲师'}）
                    </option>
                  ))}
                </select>
              </div>

              <div className="row">
                <button className="btnPrimary" onClick={() => publishCourseNotice(current.id)}>
                  生成培训通知（HTML）并标记为已发布
                </button>
                {current.reminderSentAt ? (
                  <span className="muted small">已发送开课前提醒：{current.reminderSentAt}</span>
                ) : (
                  <button className="btnGhost" onClick={() => sendCourseReminder(current.id)}>
                    发送开课前提醒（模拟）
                  </button>
                )}
                {current.status !== '已结课' ? (
                  <button className="btnGhost" onClick={() => endCourse(current.id)}>
                    结束课程并归档
                  </button>
                ) : null}
                <button
                  className="btnGhost"
                  onClick={() => setShowEvaluation((v) => !v)}
                  disabled={current.status !== '已结课' && surveys.length === 0 && !current.overallEvaluationSummary}
                >
                  查看课程评价
                </button>
              </div>

              {showEvaluation ? (
                <div className="card" style={{ padding: 12 }}>
                  <div className="cardHeader">
                    <div>
                      <div className="cardTitle">课程评价</div>
                      <div className="muted small">
                        平均满意度：{avg ? `${avg} / 5` : '-'}（{surveys.length} 份评价）
                      </div>
                    </div>
                    <button className="btnGhost" onClick={() => setShowEvaluation(false)}>
                      收起
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: 10 }}>
                    <div>
                      <div className="muted small">总体课程评价</div>
                      <div style={{ marginTop: 6 }}>{current.overallEvaluationSummary ? current.overallEvaluationSummary : '暂无总体评价。'}</div>
                      {current.overallEvaluationUpdatedAt ? (
                        <div className="muted small" style={{ marginTop: 6 }}>
                          更新时间：{current.overallEvaluationUpdatedAt}（{current.overallEvaluationWriterName ?? '工作人员'}）
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <div className="muted small">学员个人课程评价</div>
                      <table className="table" style={{ marginTop: 10 }}>
                        <thead>
                          <tr>
                            <th>学员</th>
                            <th>满意度</th>
                            <th>意见与建议</th>
                            <th>提交时间</th>
                          </tr>
                        </thead>
                        <tbody>
                          {surveys.map((s) => {
                            const student = db.users.find((u) => u.id === s.studentId)
                            return (
                              <tr key={s.id}>
                                <td>{student?.name ?? '-'}</td>
                                <td className="muted small">{s.satisfaction} / 5</td>
                                <td>{s.comment}</td>
                                <td className="muted small">{s.createdAt}</td>
                              </tr>
                            )
                          })}
                          {surveys.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="muted">
                                暂无学员评价。
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="muted small">请在左侧选择一门课程。</div>
          )}
        </div>
      </div>
    </div>
  )
}
