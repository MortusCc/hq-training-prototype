import { useState } from 'react'
import { Tag } from '../../components/Tag'
import { useDb } from '../../state/db'
import { downloadTextFile, toCsv } from '../../lib/download'

export function ExecutorNoticesPage() {
  const { db } = useDb()
  const [courseId, setCourseId] = useState<string>('')

  const currentId = courseId || db.courses[0]?.id
  const course = db.courses.find((c) => c.id === currentId) ?? null
  const notice = course?.noticeHtmlId ? db.notices.find((n) => n.id === course.noticeHtmlId) ?? null : null

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 className="pageTitle">网站通知与导出（与原网站/邮件系统接口）</h2>

      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="cardTitle">选择课程</div>
            <div className="muted small">导出培训通知 HTML 文件和收件人 Excel（CSV）。</div>
          </div>
          <select className="select" value={currentId ?? ''} onChange={(e) => setCourseId(e.target.value)}>
            {db.courses.map((c) => (
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
                时间：{course.startDate} ~ {course.endDate} · 地点：{course.location}
              </span>
            </div>

            <div className="row">
              <button
                className="btnPrimary"
                onClick={() => {
                  if (!notice) return
                  downloadTextFile(`课程通知-${course.title}.html`, notice.html, 'text/html;charset=utf-8')
                }}
                disabled={!notice}
              >
                导出培训通知 HTML
              </button>
              <button
                className="btnGhost"
                onClick={() => {
                  downloadTextFile(`邮件收件人-${course.title}.csv`, toCsv(db.emailContacts))
                }}
              >
                导出邮件收件人 CSV
              </button>
              <button
                className="btnGhost"
                onClick={() => {
                  const rows = db.enrollments
                    .filter((e) => e.courseId === course.id)
                    .map((e) => {
                      const student = db.users.find((u) => u.id === e.studentId)
                      const company = student?.companyId ? db.companies.find((c) => c.id === student.companyId) : undefined
                      return {
                        学员: student?.name ?? '',
                        公司: company?.name ?? '',
                        邮箱: student?.email ?? '',
                        电话: student?.phone ?? '',
                        状态: e.status,
                        是否免收培训费: e.waived ? '是' : '否',
                        报名时间: e.createdAt,
                      }
                    })
                  downloadTextFile(`报名名单-${course.title}.csv`, toCsv(rows))
                }}
              >
                导出报名名单 CSV
              </button>
              {!notice ? <span className="muted small">尚未生成通知，请在「课程管理」中点击生成。</span> : null}
            </div>
          </div>
        ) : (
          <div className="muted small">暂无课程。</div>
        )}
      </div>
    </div>
  )
}
