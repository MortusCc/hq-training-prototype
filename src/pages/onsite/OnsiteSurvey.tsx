import { useMemo, useState } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'
import type { Id } from '../../types'

export function OnsiteSurveyPage() {
  const { db, endCourse, session, writeOverallEvaluationSummary } = useDb()
  const [courseId, setCourseId] = useState<string>('')
  const [summaryDraft, setSummaryDraft] = useState<string>('')

  const currentId = courseId || db.courses[0]?.id
  const course = db.courses.find((c) => c.id === currentId) ?? null

  const surveys = useMemo(() => db.surveys.filter((s) => s.courseId === currentId), [currentId, db.surveys])
  const avg =
    surveys.length === 0 ? 0 : Math.round((surveys.reduce((sum, s) => sum + s.satisfaction, 0) / surveys.length) * 10) / 10

  function handleSelect(nextId: string) {
    setCourseId(nextId)
    const nextCourse = db.courses.find((c) => c.id === nextId)
    setSummaryDraft(nextCourse?.overallEvaluationSummary ?? '')
  }

  function handleSaveSummary() {
    if (!course) return
    const writerName = session?.name ?? '工作人员'
    writeOverallEvaluationSummary(course.id as Id, (summaryDraft || '暂无总体评价。').trim(), writerName)
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">培训调查与评价报告（工作人员端）</h2>
      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="cardTitle">选择课程</div>
            <div className="muted small">查看学员个人课程评价，并填写总体课程评价。</div>
          </div>
          <select className="select" value={currentId ?? ''} onChange={(e) => handleSelect(e.target.value)}>
            {db.courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {course ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="row">
              <Tag tone={course.status === '已结课' ? 'gray' : 'blue'}>{course.status}</Tag>
              <Tag tone="blue">{course.title}</Tag>
              <span className="muted small">
                {course.startDate} ~ {course.endDate} · {course.location}
              </span>
              {course.status !== '已结课' ? (
                <button className="btnGhost" onClick={() => endCourse(course.id)}>
                  标记已结课（演示用）
                </button>
              ) : null}
            </div>

            <div className="row">
              <span className="muted small">完成问卷数：{surveys.length}</span>
              <span className="muted small">平均满意度：{avg ? `${avg} / 5` : '-'}</span>
              {course.overallEvaluationUpdatedAt ? (
                <span className="muted small">
                  总体评价更新时间：{course.overallEvaluationUpdatedAt}（{course.overallEvaluationWriterName ?? '工作人员'}）
                </span>
              ) : (
                <span className="muted small">总体评价：未填写</span>
              )}
            </div>

            <div className="card" style={{ padding: 12 }}>
              <div className="cardTitle">学员个人课程评价</div>
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

            <div className="card" style={{ padding: 12 }}>
              <div className="cardTitle">总体课程评价</div>
              <div className="muted small" style={{ marginTop: 6 }}>
                将学员意见进行归纳总结，形成总体评价，用于归档与复盘。
              </div>
              <textarea
                className="textarea"
                style={{ marginTop: 10 }}
                value={summaryDraft}
                onChange={(e) => setSummaryDraft(e.target.value)}
                placeholder="例如：学员整体满意度较高，普遍认可案例讲解与互动环节；建议后续增加实战演练时间与课后资料包。"
              />
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btnPrimary" onClick={handleSaveSummary}>
                  保存总体评价
                </button>
                {course.overallEvaluationSummary ? <span className="muted small">已保存，可继续修改。</span> : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="muted small">暂无课程。</div>
        )}
      </div>
    </div>
  )
}
