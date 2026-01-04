export type Role = 'manager' | 'executor' | 'student' | 'onsite'

export type Id = string

export type RequestStatus = '待评审' | '已立项' | '已拒绝'
export type CourseStatus = '草稿' | '已发布' | '已开课' | '已结课'
export type EnrollmentStatus = '已报名' | '已确认' | '已缴费' | '已签到' | '已完成' | '已拒绝'

export interface Session {
  role: Role
  name: string
  userId: Id
}

export interface Company {
  id: Id
  name: string
  contactName: string
  contactEmail: string
  contactPhone: string
  vipClient: boolean
}

export interface TrainingRequest {
  id: Id
  companyId: Id
  title: string
  desiredTopics: string
  preferredDateRange: string
  budgetNote: string
  status: RequestStatus
  createdAt: string
  managerNote?: string
  assignedExecutorId?: Id
  generatedCourseId?: Id
}

export interface User {
  id: Id
  role: Role
  name: string
  email: string
  phone: string
  companyId?: Id
  title?: string
  expertise?: string
}

export interface Course {
  id: Id
  requestId?: Id
  title: string
  topic: string
  startDate: string
  endDate: string
  location: string
  feeCny: number
  lecturerId?: Id
  executorId: Id
  status: CourseStatus
  noticeHtmlId?: Id
  reminderSentAt?: string
}

export interface EnrollmentForm {
  name: string
  gender: string
  companyName: string
  jobTitle: string
  skillLevel: string
  email: string
  phone: string
  note: string
}

export interface Enrollment {
  id: Id
  courseId: Id
  studentId: Id
  status: EnrollmentStatus
  createdAt: string
  confirmedAt?: string
  paidAt?: string
  checkedInAt?: string
  materialGiven: boolean
  waived: boolean
  form?: EnrollmentForm
}

export interface Survey {
  id: Id
  courseId: Id
  studentId: Id
  satisfaction: 1 | 2 | 3 | 4 | 5
  comment: string
  createdAt: string
}

export interface NoticeHtml {
  id: Id
  courseId: Id
  html: string
  createdAt: string
}

export interface Db {
  appToday: string
  users: User[]
  companies: Company[]
  requests: TrainingRequest[]
  courses: Course[]
  enrollments: Enrollment[]
  surveys: Survey[]
  notices: NoticeHtml[]
  emailContacts: { name: string; email: string }[]
}
