import { useMemo, useState } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'
import type { Id } from '../../types'

export function StudentEvaluationPage() {
  const { db, session, submitSurvey } = useDb()
  const studentId = session?.userId as Id | undefined
  const [courseId, setCourseId] = useState<string>('')
  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5>(5)
  const [comment, setComment] = useState('')

  const finishedEnrollments = useMemo(
    () => db.enrollments.filter((e) => e.studentId === studentId && e.status === '已完成'),
    [db.enrollments, studentId],
  )

  const availableCourses = finishedEnrollments
    .map((e) => db.courses.find((c) => c.id === e.courseId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  const currentId = courseId || availableCourses[0]?.id
  const course = db.courses.find((c) => c.id === currentId) ?? null
  const existingSurvey = db.surveys.find((s) => s.courseId === currentId && s.studentId === studentId)

  function handleSubmit() {
    if (!studentId || !currentId) return
    submitSurvey(currentId as Id, studentId, score, comment || '整体满意，暂无特别建议。')
    setComment('')
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">课程评价（学员端）</h2>
      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="cardTitle">选择已结课课程</div>
            <div className="muted small">只展示已完成报名的课程。</div>
          </div>
          <select className="select" value={currentId ?? ''} onChange={(e) => setCourseId(e.target.value)}>
            {availableCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {course ? (
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="row">
              <Tag tone="blue">{course.title}</Tag>
              <span className="muted small">
                时间：{course.startDate} ~ {course.endDate}
              </span>
            </div>

            <div className="row">
              <span className="muted small">满意度评分（1-5）</span>
              <select
                className="select"
                value={score}
                onChange={(e) => setScore(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
              >
                <option value={5}>5 - 非常满意</option>
                <option value={4}>4 - 满意</option>
                <option value={3}>3 - 一般</option>
                <option value={2}>2 - 不太满意</option>
                <option value={1}>1 - 不满意</option>
              </select>
            </div>

            <div className="row">
              <span className="muted small">意见与建议</span>
            </div>
            <textarea
              className="textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="请填写对课程内容、讲师授课、组织安排等方面的评价。"
            />

            <div className="row">
              <button className="btnPrimary" onClick={handleSubmit}>
                提交评价
              </button>
              {existingSurvey ? (
                <span className="muted small">
                  已提交评价（{existingSurvey.createdAt}），再次提交将覆盖原评价。
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="muted small">暂无可评价课程。</div>
        )}
      </div>
    </div>
  )
}

