import { Injectable, NotFoundException } from '@nestjs/common';
import { pagination } from '../common/api-response';
import { dateOnly, limitFrom, optionalString, pageFrom, skipFrom } from '../common/query';
import { PrismaService } from '../prisma/prisma.service';

type ManagementDomain =
  | 'students'
  | 'news'
  | 'notifications'
  | 'attendance'
  | 'tuition'
  | 'grades'
  | 'timetable'
  | 'homeworks'
  | 'meals'
  | 'events'
  | 'surveys'
  | 'clubs'
  | 'bus'
  | 'uniforms';

type CrudPayload = Record<string, any>;

const DOMAIN_ENDPOINTS: Record<ManagementDomain, string[]> = {
  students: ['/me/student', '/me/accounts'],
  news: ['/home/news'],
  notifications: ['/notifications', '/notifications/{notification_id}'],
  attendance: ['/home/attendance/today', '/students/{student_id}/attendance'],
  tuition: ['/home/tuition/summary', '/services/tuition'],
  grades: ['/students/{student_id}/scores'],
  timetable: ['/students/{student_id}/timetable'],
  homeworks: ['/students/{student_id}/homeworks'],
  meals: ['/services/meals'],
  events: ['/services/events'],
  surveys: ['/services/surveys'],
  clubs: ['/services/clubs'],
  bus: ['/students/{student_id}/bus-route', '/services/bus-tracking'],
  uniforms: ['/services/uniforms'],
};

@Injectable()
export class ManagementService {
  constructor(private readonly prisma: PrismaService) {}

  inventory() {
    return Object.entries(DOMAIN_ENDPOINTS).map(([domain, androidEndpoints]) => ({
      domain,
      androidEndpoints,
      basePath: `/api/v1/admin/management/${domain}`,
      supports: { list: true, detail: true, create: true, update: true },
    }));
  }

  async list(domain: string, query: Record<string, unknown>) {
    switch (this.assertDomain(domain)) {
      case 'students':
        return this.listStudents(query);
      case 'news':
        return this.paginated(query, this.newsWhere(query), this.prisma.newsArticle, this.mapNews, [{ isPinned: 'desc' }, { publishedAt: 'desc' }]);
      case 'notifications':
        return this.paginated(query, this.notificationWhere(query), this.prisma.notification, this.mapNotification, { sentAt: 'desc' });
      case 'attendance':
        return this.paginated(query, this.studentScopedWhere(query, { status: optionalString(query.status) }), this.prisma.attendanceRecord, this.mapAttendance, { date: 'desc' });
      case 'tuition':
        return this.paginated(query, this.studentScopedWhere(query, { schoolYear: optionalString(query.school_year), semester: optionalString(query.semester), status: optionalString(query.status) }), this.prisma.tuitionItem, this.mapTuition, { dueDate: 'asc' });
      case 'grades':
        return this.paginated(query, this.studentScopedWhere(query, { schoolYear: optionalString(query.school_year), semester: optionalString(query.semester), subjectId: optionalString(query.subject_id) }), this.prisma.scoreRecord, this.mapScore, { schoolYear: 'desc' }, { subject: true });
      case 'timetable':
        return this.paginated(query, this.defined({ className: optionalString(query.class_name), weekStart: this.dateOrUndefined(query.week_start), dayCode: optionalString(query.day) }), this.prisma.timetableLesson, this.mapTimetable, [{ date: 'asc' }, { period: 'asc' }], { subject: true });
      case 'homeworks':
        return this.paginated(query, this.studentScopedWhere(query, { subjectId: optionalString(query.subject_id), status: optionalString(query.status) }), this.prisma.homework, this.mapHomework, { deadline: 'asc' }, { subject: true });
      case 'meals':
        return this.paginated(query, this.studentScopedWhere(query, { date: this.dateOrUndefined(query.date), status: optionalString(query.status) }), this.prisma.mealRecord, this.mapMeal, { date: 'asc' });
      case 'events':
        return this.paginated(query, this.defined({ status: optionalString(query.status) }), this.prisma.event, this.mapEvent, { startAt: 'asc' });
      case 'surveys':
        return this.paginated(query, {}, this.prisma.survey, this.mapSurvey, { deadline: 'asc' }, { questions: true });
      case 'clubs':
        return this.paginated(query, this.defined({ status: optionalString(query.status) }), this.prisma.club, this.mapClub, { name: 'asc' });
      case 'bus':
        return this.paginated(query, {}, this.prisma.busRoute, this.mapBusRoute, { name: 'asc' });
      case 'uniforms':
        return this.paginated(query, this.defined({ category: optionalString(query.category), ...(optionalString(query.keyword) ? { name: { contains: optionalString(query.keyword), mode: 'insensitive' as const } } : {}) }), this.prisma.uniformProduct, this.mapUniform, { name: 'asc' });
    }
  }

  async detail(domain: string, id: string) {
    const model = this.modelFor(this.assertDomain(domain));
    const include = this.includeFor(domain);
    const item = await model.findUnique({ where: { id }, ...(include ? { include } : {}) });
    if (!item) throw new NotFoundException(`${domain} record not found`);
    return this.mapperFor(domain)(item);
  }

  async create(domain: string, body: CrudPayload) {
    switch (this.assertDomain(domain)) {
      case 'students':
        return this.mapStudent(await this.prisma.student.create({ data: this.studentData(body) as any, include: { accounts: true } }));
      case 'news':
        return this.mapNews(await this.prisma.newsArticle.create({ data: this.newsData(body) as any }));
      case 'notifications':
        return this.mapNotification(await this.prisma.notification.create({ data: this.notificationData(body) as any }));
      case 'attendance':
        return this.mapAttendance(await this.prisma.attendanceRecord.upsert({ where: { studentId_date: { studentId: body.student_id, date: this.requiredDate(body.date) } }, update: this.attendanceData(body) as any, create: { ...this.attendanceData(body), studentId: body.student_id, date: this.requiredDate(body.date) } as any }));
      case 'tuition':
        return this.mapTuition(await this.prisma.tuitionItem.create({ data: this.tuitionData(body) as any }));
      case 'grades':
        return this.mapScore(await this.prisma.scoreRecord.upsert({ where: { studentId_subjectId_schoolYear_semester: { studentId: body.student_id, subjectId: body.subject_id, schoolYear: body.school_year, semester: body.semester } }, update: this.scoreData(body) as any, create: { ...this.scoreData(body), studentId: body.student_id, subjectId: body.subject_id, schoolYear: body.school_year, semester: body.semester } as any, include: { subject: true } }));
      case 'timetable':
        return this.mapTimetable(await this.prisma.timetableLesson.create({ data: this.timetableData(body) as any, include: { subject: true } }));
      case 'homeworks':
        return this.mapHomework(await this.prisma.homework.create({ data: this.homeworkData(body) as any, include: { subject: true } }));
      case 'meals':
        return this.mapMeal(await this.prisma.mealRecord.upsert({ where: { studentId_date: { studentId: body.student_id, date: this.requiredDate(body.date) } }, update: this.mealData(body) as any, create: { ...this.mealData(body), studentId: body.student_id, date: this.requiredDate(body.date) } as any }));
      case 'events':
        return this.mapEvent(await this.prisma.event.create({ data: this.eventData(body) as any }));
      case 'surveys':
        return this.mapSurvey(await this.prisma.survey.create({ data: this.surveyCreateData(body) as any, include: { questions: true } }));
      case 'clubs':
        return this.mapClub(await this.prisma.club.create({ data: this.clubData(body) as any }));
      case 'bus':
        return this.mapBusRoute(await this.prisma.busRoute.create({ data: this.busRouteData(body) as any }));
      case 'uniforms':
        return this.mapUniform(await this.prisma.uniformProduct.create({ data: this.uniformData(body) as any }));
    }
  }

  async update(domain: string, id: string, body: CrudPayload) {
    switch (this.assertDomain(domain)) {
      case 'students':
        return this.mapStudent(await this.prisma.student.update({ where: { id }, data: this.studentData(body), include: { accounts: true } }));
      case 'news':
        return this.mapNews(await this.prisma.newsArticle.update({ where: { id }, data: this.newsData(body) }));
      case 'notifications':
        return this.mapNotification(await this.prisma.notification.update({ where: { id }, data: this.notificationData(body) }));
      case 'attendance':
        return this.mapAttendance(await this.prisma.attendanceRecord.update({ where: { id }, data: this.attendanceData(body) }));
      case 'tuition':
        return this.mapTuition(await this.prisma.tuitionItem.update({ where: { id }, data: this.tuitionData(body) }));
      case 'grades':
        return this.mapScore(await this.prisma.scoreRecord.update({ where: { id }, data: this.scoreData(body), include: { subject: true } }));
      case 'timetable':
        return this.mapTimetable(await this.prisma.timetableLesson.update({ where: { id }, data: this.timetableData(body), include: { subject: true } }));
      case 'homeworks':
        return this.mapHomework(await this.prisma.homework.update({ where: { id }, data: this.homeworkData(body), include: { subject: true } }));
      case 'meals':
        return this.mapMeal(await this.prisma.mealRecord.update({ where: { id }, data: this.mealData(body) }));
      case 'events':
        return this.mapEvent(await this.prisma.event.update({ where: { id }, data: this.eventData(body) }));
      case 'surveys':
        return this.mapSurvey(await this.prisma.survey.update({ where: { id }, data: this.surveyUpdateData(body), include: { questions: true } }));
      case 'clubs':
        return this.mapClub(await this.prisma.club.update({ where: { id }, data: this.clubData(body) }));
      case 'bus':
        return this.mapBusRoute(await this.prisma.busRoute.update({ where: { id }, data: this.busRouteData(body) }));
      case 'uniforms':
        return this.mapUniform(await this.prisma.uniformProduct.update({ where: { id }, data: this.uniformData(body) }));
    }
  }

  private async listStudents(query: Record<string, unknown>) {
    const page = pageFrom(query.page);
    const limit = limitFrom(query.limit);
    const keyword = optionalString(query.keyword);
    const where = keyword ? { OR: [{ code: { contains: keyword, mode: 'insensitive' as const } }, { fullName: { contains: keyword, mode: 'insensitive' as const } }, { className: { contains: keyword, mode: 'insensitive' as const } }] } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({ where, include: { accounts: true }, orderBy: { fullName: 'asc' }, skip: skipFrom(page, limit), take: limit }),
      this.prisma.student.count({ where }),
    ]);
    return { items: items.map((item) => this.mapStudent(item)), pagination: pagination(page, limit, total) };
  }

  private async paginated(query: Record<string, unknown>, where: CrudPayload, model: any, mapper: (value: any) => CrudPayload, orderBy: any, include?: any) {
    const page = pageFrom(query.page);
    const limit = limitFrom(query.limit);
    const [items, total] = await this.prisma.$transaction([
      model.findMany({ where, ...(include ? { include } : {}), orderBy, skip: skipFrom(page, limit), take: limit }),
      model.count({ where }),
    ]);
    return { items: items.map((item) => mapper.call(this, item)), pagination: pagination(page, limit, total) };
  }

  private assertDomain(domain: string): ManagementDomain {
    if (domain in DOMAIN_ENDPOINTS) return domain as ManagementDomain;
    throw new NotFoundException(`Unsupported management domain: ${domain}`);
  }

  private modelFor(domain: ManagementDomain): any {
    const models: Record<ManagementDomain, any> = {
      students: this.prisma.student,
      news: this.prisma.newsArticle,
      notifications: this.prisma.notification,
      attendance: this.prisma.attendanceRecord,
      tuition: this.prisma.tuitionItem,
      grades: this.prisma.scoreRecord,
      timetable: this.prisma.timetableLesson,
      homeworks: this.prisma.homework,
      meals: this.prisma.mealRecord,
      events: this.prisma.event,
      surveys: this.prisma.survey,
      clubs: this.prisma.club,
      bus: this.prisma.busRoute,
      uniforms: this.prisma.uniformProduct,
    };
    return models[domain];
  }

  private includeFor(domain: string) {
    return ['grades', 'timetable', 'homeworks'].includes(domain) ? { subject: true } : domain === 'students' ? { accounts: true } : domain === 'surveys' ? { questions: true } : undefined;
  }

  private mapperFor(domain: string) {
    const mappers: Record<string, (value: any) => CrudPayload> = {
      students: this.mapStudent,
      news: this.mapNews,
      notifications: this.mapNotification,
      attendance: this.mapAttendance,
      tuition: this.mapTuition,
      grades: this.mapScore,
      timetable: this.mapTimetable,
      homeworks: this.mapHomework,
      meals: this.mapMeal,
      events: this.mapEvent,
      surveys: this.mapSurvey,
      clubs: this.mapClub,
      bus: this.mapBusRoute,
      uniforms: this.mapUniform,
    };
    return (value: any) => mappers[domain].call(this, value);
  }

  private defined(values: CrudPayload) {
    return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
  }

  private studentScopedWhere(query: Record<string, unknown>, extra: CrudPayload) {
    return this.defined({ studentId: optionalString(query.student_id), ...extra });
  }

  private newsWhere(query: Record<string, unknown>) {
    const keyword = optionalString(query.keyword);
    return this.defined({ ...(keyword ? { OR: [{ title: { contains: keyword, mode: 'insensitive' as const } }, { summary: { contains: keyword, mode: 'insensitive' as const } }, { content: { contains: keyword, mode: 'insensitive' as const } }] } : {}), category: this.newsCategory(optionalString(query.category)) });
  }

  private notificationWhere(query: Record<string, unknown>) {
    const keyword = optionalString(query.keyword);
    return this.defined({ ...(keyword ? { OR: [{ title: { contains: keyword, mode: 'insensitive' as const } }, { content: { contains: keyword, mode: 'insensitive' as const } }] } : {}), tag: optionalString(query.tag) });
  }

  private dateOrUndefined(value: unknown) {
    const text = optionalString(value);
    return text ? new Date(`${text}T00:00:00.000Z`) : undefined;
  }

  private requiredDate(value: unknown) {
    const text = optionalString(value);
    if (!text) throw new NotFoundException('Required date is missing');
    return new Date(`${text}T00:00:00.000Z`);
  }

  private newsCategory(value: unknown) {
    const text = optionalString(value)?.split(' ').join('_');
    return text || undefined;
  }

  private mapStudent(item: any) {
    return { id: item.id, code: item.code, full_name: item.fullName, avatar_url: item.avatarUrl, grade: item.grade, class_name: item.className, school_name: item.schoolName, account_count: item.accounts?.length ?? 0, updated_at: item.updatedAt?.toISOString?.() };
  }

  private mapNews(item: any) {
    return { id: item.id, title: item.title, summary: item.summary, content: item.content, image_url: item.imageUrl, published_at: item.publishedAt?.toISOString?.(), category: item.category?.split('_').join(' '), is_pinned: item.isPinned, updated_at: item.updatedAt?.toISOString?.() };
  }

  private mapNotification(item: any) {
    return { id: item.id, title: item.title, sender: item.sender, sent_at: item.sentAt?.toISOString?.(), content: item.content, tag: item.tag, attachments: item.attachments ?? [], is_read: item.reads?.[0]?.isRead ?? false, updated_at: item.updatedAt?.toISOString?.() };
  }

  private mapAttendance(item: any) {
    return { id: item.id, student_id: item.studentId, date: dateOnly(item.date), day_name: item.dayName, status: item.status, arrived_at: item.arrivedAt, left_at: item.leftAt, morning_check_in: item.morningCheckIn, afternoon_check_in: item.afternoonCheckIn, leave_time: item.leaveTime, note: item.note, confirmed_by_parent: item.confirmedByParent };
  }

  private mapTuition(item: any) {
    return { id: item.id, student_id: item.studentId, title: item.title, amount: item.amount, paid_amount: item.paidAmount, remaining_amount: Math.max(item.amount - item.paidAmount, 0), due_date: dateOnly(item.dueDate), school_year: item.schoolYear, semester: item.semester, status: item.status };
  }

  private mapScore(item: any) {
    return { id: item.id, student_id: item.studentId, subject_id: item.subjectId, subject_name: item.subject?.name, school_year: item.schoolYear, semester: item.semester, oral_scores: item.oralScores, fifteen_minute_scores: item.fifteenMinuteScores, midterm_score: item.midtermScore, final_score: item.finalScore, average_score: item.averageScore, teacher_comment: item.teacherComment };
  }

  private mapTimetable(item: any) {
    return { id: item.id, class_name: item.className, week_start: dateOnly(item.weekStart), day_code: item.dayCode, date: dateOnly(item.date), period: item.period, subject_id: item.subjectId, subject: item.subject?.name, time: item.time, room: item.room, teacher: item.teacher, status: item.status };
  }

  private mapHomework(item: any) {
    return { id: item.id, student_id: item.studentId, subject_id: item.subjectId, subject: item.subject?.name, title: item.title, content: item.content, teacher: item.teacher, assigned_at: item.assignedAt?.toISOString?.(), deadline: item.deadline?.toISOString?.(), status: item.status };
  }

  private mapMeal(item: any) {
    return { id: item.id, student_id: item.studentId, date: dateOnly(item.date), breakfast: item.breakfast, lunch: item.lunch, snack: item.snack, status: item.status };
  }

  private mapEvent(item: any) {
    return { id: item.id, title: item.title, description: item.description, start_at: item.startAt?.toISOString?.(), end_at: item.endAt?.toISOString?.(), location: item.location, registration_deadline: item.registrationDeadline?.toISOString?.(), status: item.status };
  }

  private mapSurvey(item: any) {
    return { id: item.id, title: item.title, description: item.description, deadline: item.deadline?.toISOString?.(), questions: item.questions?.map((question) => ({ id: question.id, type: question.type, content: question.content, options: question.options, required: question.required })) ?? [] };
  }

  private mapClub(item: any) {
    return { id: item.id, name: item.name, description: item.description, teacher: item.teacher, schedule: item.schedule, location: item.location, fee: item.fee, status: item.status };
  }

  private mapBusRoute(item: any) {
    return { id: item.id, route_id: item.id, route_name: item.name, driver_name: item.driverName, driver_phone: item.driverPhone, bus_plate: item.busPlate, current_location: { lat: item.currentLat ?? 0, lng: item.currentLng ?? 0, updated_at: item.locationUpdatedAt?.toISOString?.() ?? null }, next_stop: item.nextStop, estimated_arrival_time: item.estimatedArrivalTime };
  }

  private mapUniform(item: any) {
    return { id: item.id, name: item.name, category: item.category, price: item.price, currency: item.currency, sizes: item.sizes, image_url: item.imageUrl, stock: item.stock };
  }

  private studentData(body: CrudPayload) { return this.defined({ code: body.code, fullName: body.full_name, avatarUrl: body.avatar_url, grade: body.grade, className: body.class_name, schoolName: body.school_name }); }
  private newsData(body: CrudPayload) { return this.defined({ title: body.title, summary: body.summary, content: body.content, imageUrl: body.image_url, category: this.newsCategory(body.category), isPinned: body.is_pinned, publishedAt: body.published_at ? new Date(body.published_at) : undefined }); }
  private notificationData(body: CrudPayload) { return this.defined({ title: body.title, sender: body.sender, content: body.content, tag: body.tag, attachments: body.attachments, sentAt: body.sent_at ? new Date(body.sent_at) : undefined }); }
  private attendanceData(body: CrudPayload) { return this.defined({ date: body.date ? this.requiredDate(body.date) : undefined, dayName: body.day_name, status: body.status, arrivedAt: body.arrived_at, leftAt: body.left_at, morningCheckIn: body.morning_check_in, afternoonCheckIn: body.afternoon_check_in, leaveTime: body.leave_time, note: body.note, confirmedByParent: body.confirmed_by_parent }); }
  private tuitionData(body: CrudPayload) { return this.defined({ studentId: body.student_id, title: body.title, amount: body.amount, paidAmount: body.paid_amount, dueDate: body.due_date ? this.requiredDate(body.due_date) : undefined, schoolYear: body.school_year, semester: body.semester, status: body.status }); }
  private scoreData(body: CrudPayload) { return this.defined({ oralScores: body.oral_scores, fifteenMinuteScores: body.fifteen_minute_scores, midtermScore: body.midterm_score, finalScore: body.final_score, averageScore: body.average_score, teacherComment: body.teacher_comment }); }
  private timetableData(body: CrudPayload) { return this.defined({ className: body.class_name, weekStart: body.week_start ? this.requiredDate(body.week_start) : undefined, dayCode: body.day_code, date: body.date ? this.requiredDate(body.date) : undefined, period: body.period, subjectId: body.subject_id, time: body.time, room: body.room, teacher: body.teacher, status: body.status }); }
  private homeworkData(body: CrudPayload) { return this.defined({ studentId: body.student_id, subjectId: body.subject_id, title: body.title, content: body.content, teacher: body.teacher, assignedAt: body.assigned_at ? new Date(body.assigned_at) : undefined, deadline: body.deadline ? new Date(body.deadline) : undefined, status: body.status }); }
  private mealData(body: CrudPayload) { return this.defined({ date: body.date ? this.requiredDate(body.date) : undefined, breakfast: body.breakfast, lunch: body.lunch, snack: body.snack, status: body.status }); }
  private eventData(body: CrudPayload) { return this.defined({ title: body.title, description: body.description, startAt: body.start_at ? new Date(body.start_at) : undefined, endAt: body.end_at ? new Date(body.end_at) : undefined, location: body.location, registrationDeadline: body.registration_deadline ? new Date(body.registration_deadline) : undefined, status: body.status }); }
  private surveyCreateData(body: CrudPayload) { return this.defined({ title: body.title, description: body.description, deadline: body.deadline ? new Date(body.deadline) : undefined, questions: Array.isArray(body.questions) ? { create: body.questions.map((question) => ({ type: question.type, content: question.content, options: question.options ?? [], required: question.required ?? true })) } : undefined }); }
  private surveyUpdateData(body: CrudPayload) { return this.defined({ title: body.title, description: body.description, deadline: body.deadline ? new Date(body.deadline) : undefined }); }
  private clubData(body: CrudPayload) { return this.defined({ name: body.name, description: body.description, teacher: body.teacher, schedule: body.schedule, location: body.location, fee: body.fee, status: body.status }); }
  private busRouteData(body: CrudPayload) { return this.defined({ name: body.route_name ?? body.name, driverName: body.driver_name, driverPhone: body.driver_phone, busPlate: body.bus_plate, currentLat: body.current_location?.lat ?? body.current_lat, currentLng: body.current_location?.lng ?? body.current_lng, nextStop: body.next_stop, estimatedArrivalTime: body.estimated_arrival_time }); }
  private uniformData(body: CrudPayload) { return this.defined({ name: body.name, category: body.category, price: body.price, currency: body.currency, sizes: body.sizes, imageUrl: body.image_url, stock: body.stock }); }
}
