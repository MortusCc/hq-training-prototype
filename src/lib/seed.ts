import type { Company, Course, Db, Enrollment, NoticeHtml, Survey, TrainingRequest, User } from '../types'
import { todayIso } from './date'

function id(prefix: string): string {
  const s = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}_${s}`
}

export function createSeedDb(): Db {
  const companies: Company[] = [
    {
      id: id('cmp'),
      name: '东辰软件有限公司',
      contactName: '王敏',
      contactEmail: 'wangmin@dongchen-soft.com',
      contactPhone: '13800001111',
      vipClient: true,
    },
    {
      id: id('cmp'),
      name: '启航科技股份有限公司',
      contactName: '陈凯',
      contactEmail: 'chenkai@qihang-tech.com',
      contactPhone: '13900002222',
      vipClient: false,
    },
  ]

  const users: User[] = [
    { id: id('usr'), role: 'manager', name: '赵经理', email: 'manager@hq.com', phone: '010-88886666' },
    { id: id('usr'), role: 'executor', name: '李执行', email: 'executor@hq.com', phone: '010-88887777' },
    { id: id('usr'), role: 'onsite', name: '周现场', email: 'onsite@hq.com', phone: '010-88889999' },
    {
      id: id('usr'),
      role: 'student',
      name: '张学员',
      email: 'zhang.student@dongchen-soft.com',
      phone: '13600003333',
      companyId: companies[0]!.id,
    },
    {
      id: id('usr'),
      role: 'student',
      name: '刘学员',
      email: 'liu.student@qihang-tech.com',
      phone: '13700004444',
      companyId: companies[1]!.id,
    },
    {
      id: id('usr'),
      role: 'executor',
      name: '孙执行',
      email: 'sun.executor@hq.com',
      phone: '010-88883333',
    },
    {
      id: id('usr'),
      role: 'student',
      name: '王学员',
      email: 'wang.student@example.com',
      phone: '13500005555',
      companyId: companies[0]!.id,
    },
    {
      id: id('usr'),
      role: 'student',
      name: '赵学员',
      email: 'zhao.student@example.com',
      phone: '13400006666',
      companyId: companies[1]!.id,
    },
  ]

  const lecturers: User[] = [
    {
      id: id('lec'),
      role: 'executor',
      name: '（占位）',
      email: 'placeholder@hq.com',
      phone: '000',
    },
    {
      id: id('lec'),
      role: 'executor',
      name: '（占位2）',
      email: 'placeholder2@hq.com',
      phone: '000',
    },
  ]

  const realLecturers: User[] = [
    {
      id: id('lec'),
      role: 'executor',
      name: '唐教授',
      email: 'tang.prof@example.com',
      phone: '15000001111',
      title: '首席架构师',
      expertise: '云原生 / 微服务 / 架构治理',
    },
    {
      id: id('lec'),
      role: 'executor',
      name: '吴专家',
      email: 'wu.expert@example.com',
      phone: '15000002222',
      title: '数据平台负责人',
      expertise: '数据仓库 / 实时计算 / 数据治理',
    },
    {
      id: id('lec'),
      role: 'executor',
      name: '马讲师',
      email: 'ma.teacher@example.com',
      phone: '15000003333',
      title: '高级工程师',
      expertise: '前端工程化 / React / 性能优化',
    },
  ]

  const allUsers: User[] = [...users, ...lecturers, ...realLecturers]

  const executorId = allUsers.find((u) => u.role === 'executor' && u.email === 'executor@hq.com')!.id

  const requests: TrainingRequest[] = [
    {
      id: id('req'),
      companyId: companies[0]!.id,
      title: '云原生架构实践培训申请',
      desiredTopics: 'Kubernetes、微服务治理、DevOps落地、可观测性',
      preferredDateRange: '2026-01-10 ~ 2026-01-20',
      budgetNote: '希望含3天线下实操，费用可商议',
      status: '待评审',
      createdAt: `${todayIso()} 09:12`,
    },
    {
      id: id('req'),
      companyId: companies[1]!.id,
      title: '数据治理与实时数仓培训申请',
      desiredTopics: '数据治理体系、指标体系、实时链路、质量监控',
      preferredDateRange: '2026-01-15 ~ 2026-01-30',
      budgetNote: '可线上或线下，按人头或按班计费均可',
      status: '已立项',
      createdAt: `${todayIso()} 10:02`,
      managerNote: '已立项，优先安排实战案例与答疑。',
      assignedExecutorId: executorId,
    },
  ]

  const courses: Course[] = [
    {
      id: id('crs'),
      requestId: requests[1]!.id,
      title: '数据治理与实时数仓（实战班）',
      topic: '数据治理 / 实时数仓',
      startDate: '2026-01-18',
      endDate: '2026-01-19',
      location: '线上（腾讯会议）',
      feeCny: 1999,
      lecturerId: realLecturers[1]!.id,
      executorId,
      status: '已发布',
      reminderSentAt: `${todayIso()} 13:20`,
    },
    {
      id: id('crs'),
      title: '前端工程化与性能优化（公开课）',
      topic: '前端工程化 / 性能优化',
      startDate: '2026-01-22',
      endDate: '2026-01-22',
      location: '浩奇公司培训教室A-302',
      feeCny: 899,
      lecturerId: realLecturers[2]!.id,
      executorId,
      status: '已发布',
    },
    {
      id: id('crs'),
      title: '项目管理与团队协作（结课示例）',
      topic: '项目管理 / 团队协作',
      startDate: '2025-12-20',
      endDate: '2025-12-20',
      location: '浩奇公司培训教室B-201',
      feeCny: 499,
      lecturerId: realLecturers[0]!.id,
      executorId,
      status: '已结课',
    },
  ]

  requests[1]!.generatedCourseId = courses[0]!.id

  const enrollments: Enrollment[] = [
    {
      id: id('enr'),
      courseId: courses[0]!.id,
      studentId: users.find((u) => u.role === 'student' && u.name === '刘学员')!.id,
      status: '已缴费',
      createdAt: `${todayIso()} 10:20`,
      confirmedAt: `${todayIso()} 10:22`,
      paidAt: `${todayIso()} 10:40`,
      materialGiven: false,
      waived: false,
    },
    {
      id: id('enr'),
      courseId: courses[1]!.id,
      studentId: users.find((u) => u.role === 'student' && u.name === '张学员')!.id,
      status: '已确认',
      createdAt: `${todayIso()} 11:05`,
      confirmedAt: `${todayIso()} 11:06`,
      materialGiven: false,
      waived: false,
    },
    {
      id: id('enr'),
      courseId: courses[2]!.id,
      studentId: users.find((u) => u.role === 'student' && u.name === '张学员')!.id,
      status: '已完成',
      createdAt: `2025-12-10 09:30`,
      confirmedAt: `2025-12-10 09:35`,
      paidAt: `2025-12-10 09:50`,
      checkedInAt: `2025-12-20 08:45`,
      materialGiven: true,
      waived: false,
    },
  ]

  const notices: NoticeHtml[] = []
  const surveys: Survey[] = [
    {
      id: id('svy'),
      courseId: courses[2]!.id,
      studentId: users.find((u) => u.role === 'student' && u.name === '张学员')!.id,
      satisfaction: 4,
      comment: '整体内容很实用，案例讲解清晰；建议增加更多小组实战演练与课后资料包。',
      createdAt: `2025-12-20 19:00`,
    },
  ]

  const emailContacts = [
    { name: '周一鸣', email: 'zhou.yiming@example.com' },
    { name: '杜思琪', email: 'du.siqi@example.com' },
    { name: '彭子航', email: 'peng.zihang@example.com' },
    { name: '钱若宁', email: 'qian.ruoning@example.com' },
    { name: '孙博文', email: 'sun.bowen@example.com' },
    { name: '方雨涵', email: 'fang.yuhan@example.com' },
    { name: '叶景辰', email: 'ye.jingchen@example.com' },
    { name: '罗致远', email: 'luo.zhiyuan@example.com' },
    { name: '石嘉宁', email: 'shi.jianing@example.com' },
    { name: '魏子墨', email: 'wei.zimo@example.com' },
  ]

  return {
    appToday: todayIso(),
    users: allUsers,
    companies,
    requests,
    courses,
    enrollments,
    surveys,
    notices,
    emailContacts,
  }
}
