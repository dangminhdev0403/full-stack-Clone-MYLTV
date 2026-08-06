# Graph Report - full-stack-Clone-MYLTV  (2026-08-06)

## Corpus Check
- 362 files · ~288,171 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2505 nodes · 5434 edges · 168 communities (118 shown, 50 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e482e239`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- identity-access.module.ts
- tuition.controller.ts
- auth-api.ts
- parseApiResponse
- SkipAuthorization
- news-page.tsx
- planned-surface.tsx
- attendance.client.ts
- user-management.service.ts
- NotificationsService
- student-administration.validation.ts
- use-academic-structure.ts
- schemas.ts
- students.client.ts
- timetable-homework.controller.ts
- tuition-page.tsx
- account.service.ts
- compilerOptions
- NewsService
- student-detail-page.tsx
- feedback.controller.ts
- auth.constants.ts
- PrismaService
- news.controller.ts
- auth.service.ts
- AuthConfigService
- student-administration.service.spec.ts
- events-page.tsx
- students-page.tsx
- zod-schemas.ts
- StudentAdministrationService
- compilerOptions
- dependencies
- authenticated-user.ts
- attendance-page.tsx
- tuition.client.ts
- RequirePermission
- student-detail-page.test.tsx
- admin-nav-items.ts
- teacher-capacity-panel.tsx
- ok
- academic-structure.validation.ts
- ScoresService
- proxy.ts
- scripts
- feedback.client.ts
- attendance.service.ts
- news.service.spec.ts
- dependencies
- devDependencies
- feedback-page.test.tsx
- notifications-page.tsx
- admin-dashboard.tsx
- StudentContextService
- PROJECT PLANS
- users-page.tsx
- admin-dashboard.test.tsx
- seed.ts
- jest
- PermissionService
- academic-context.service.ts
- FeedbackService
- student-tuition-panel.tsx
- verify-contract.cjs
- account.service.spec.ts
- successSchema
- app/layout.tsx
- env.config.ts
- events.client.ts
- student-profile-panel.tsx
- front-end/package.json
- devDependencies
- web_cloneMYLTV Rules
- academic-structure-manager.test.tsx
- exclude
- academic-context.client.ts
- homeworks.client.ts
- api-contract/package.json
- backend/package.json
- PROJECT RULES
- web_cloneMYLTV Plans
- nest-cli.json
- student-attendance-panel.tsx
- api-response.ts
- Bounded Context Endpoint Map
- authenticated-backend.test.ts
- app-shell.tsx
- form-control.tsx
- next.config.ts
- dotenv
- Backend Guide
- AcademicStructureController
- @prisma/adapter-pg
- eslint
- timetable.client.ts
- @eslint/eslintrc
- globals
- permission.service.spec.ts
- @nestjs/cli
- @nestjs/schematics
- @nestjs/testing
- prettier
- 2026-07-18 — Student detail tabs, profile UI, Tuition integration, and UAT account provisioning
- source-map-support
- supertest
- ts-jest
- ts-loader
- ts-node
- tsconfig-paths
- @types/bcrypt
- @types/express
- @types/jest
- @types/node
- @types/passport
- @types/passport-jwt
- @types/pg
- typescript-eslint
- front-end/eslint.config.mjs
- use-logout.test.ts
- token-refresh.test.ts
- native-dialogs.test.ts
- tailwindcss
- student-administration.service.ts
- @testing-library/react
- @testing-library/user-event
- typescript
- postcss.config.mjs
- { GET, POST }
- AuthenticatedUser
- web_cloneMYLTV Architecture
- academic-structure.service.spec.ts
- student-services.service.ts
- Contract Guide
- Frontend Guide
- Integration Guide
- backend/README.md
- Frontend API Contract Handoff
- academic-context.service.spec.ts
- Frontend Architecture
- Contract Changes
- Module Map
- DESIGN.md
- homework-statistics.ts
- Agent Instructions for web_cloneMYLTV
- web_cloneMYLTV Architecture Docs
- student-context.service.ts
- School API Contract Sync Package
- @nestjs/passport
- Implementation Status
- front-end/README.md
- backend/AGENTS.md
- backend/CODEX.md
- eslint-config-prettier
- eslint-plugin-prettier
- CODEX.md
- front-end/AGENTS.md
- front-end/CODEX.md
- timetable-page.tsx
- AdminShell
- @nestjs/common
- jest
- @tailwindcss/postcss

## God Nodes (most connected - your core abstractions)
1. `AuthenticatedUser` - 162 edges
2. `ok()` - 94 edges
3. `PrismaService` - 88 edges
4. `RequirePermission()` - 85 edges
5. `parseApiResponse()` - 79 edges
6. `CurrentUser` - 70 edges
7. `successSchema()` - 63 edges
8. `SkipAuthorization()` - 35 edges
9. `AuditService` - 31 edges
10. `NewsService` - 30 edges

## Surprising Connections (you probably didn't know these)
- `resolveAdminEndpoint()` --references--> `id`  [EXTRACTED]
  front-end/lib/api/admin-route.ts → backend/src/modules/billing/tuition/tuition.validation.ts
- `AcademicContextController` --references--> `RequireRole()`  [EXTRACTED]
  backend/src/modules/academics/academic-context/academic-context.controller.ts → backend/src/common/auth/require-role.decorator.ts
- `AcademicStructureController` --references--> `RequireRole()`  [EXTRACTED]
  backend/src/modules/academics/academic-structure/academic-structure.controller.ts → backend/src/common/auth/require-role.decorator.ts
- `AttendanceController` --references--> `RequireRole()`  [EXTRACTED]
  backend/src/modules/academics/attendance/attendance.controller.ts → backend/src/common/auth/require-role.decorator.ts
- `AdminScoresController` --references--> `RequireRole()`  [EXTRACTED]
  backend/src/modules/academics/scores/scores.controller.ts → backend/src/common/auth/require-role.decorator.ts

## Import Cycles
- None detected.

## Communities (168 total, 50 thin omitted)

### Community 0 - "identity-access.module.ts"
Cohesion: 0.14
Nodes (18): AppModule, Module, AcademicsModule, Module, BillingModule, Module, CommunicationModule, Module (+10 more)

### Community 1 - "tuition.controller.ts"
Cohesion: 0.08
Nodes (34): TuitionCreateDto, TuitionListQueryDto, TuitionStatus, TuitionUpdateDto, AppTuitionServicesController, AppTuitionSummaryController, Body, Controller (+26 more)

### Community 2 - "auth-api.ts"
Cohesion: 0.06
Nodes (42): id, Context, DELETE, forward(), GET, PATCH, POST, PUT (+34 more)

### Community 3 - "parseApiResponse"
Cohesion: 0.07
Nodes (49): assignStudentEnrollmentMock, createGradeLevelMock, createSchoolClassMock, getClassRosterMock, listAcademicYearsMock, listClassesMock, listGradeLevelsMock, useSessionMock (+41 more)

### Community 4 - "SkipAuthorization"
Cohesion: 0.08
Nodes (14): SelfController, SkipAuthorization(), AdminEventsController, StudentServicesController, Body, Controller, Delete, Get (+6 more)

### Community 5 - "news-page.tsx"
Cohesion: 0.07
Nodes (37): categoryConfig, categoryLabels, errorMessage(), NewsPage(), normalizeCategory(), statusLabels, listNewsMock, publishNewsMock (+29 more)

### Community 6 - "planned-surface.tsx"
Cohesion: 0.13
Nodes (4): getAdminNavItemByHref(), PlannedSurface(), getCurrentAcademicContext, useSession

### Community 7 - "attendance.client.ts"
Cohesion: 0.13
Nodes (17): createMock, listMock, studentsMock, updateMock, AttendanceSession, AttendanceStatus, AttendanceWritePayload, createAttendanceSession() (+9 more)

### Community 8 - "user-management.service.ts"
Cohesion: 0.07
Nodes (33): isPermissionKey(), CreateUserRequestDto, DisableUserResponseDto, ResetPasswordRequestDto, ResetPasswordResponseDto, UpdateUserRequestDto, UserDetailDto, UserListQueryDto (+25 more)

### Community 9 - "NotificationsService"
Cohesion: 0.09
Nodes (19): NotificationListQueryDto, NotificationWriteRequestDto, AdminNotificationsController, AppNotificationsController, Controller, Get, Query, NotificationsService (+11 more)

### Community 10 - "student-administration.validation.ts"
Cohesion: 0.10
Nodes (25): SwitchStudentRequestDto, booleanish, createStudentSchema, guardianContactSchema, nonEmptyString, nullableText, nullableYear, optionalNullableString (+17 more)

### Community 11 - "use-academic-structure.ts"
Cohesion: 0.05
Nodes (59): AcademicClassesManager(), translateErrorMessage(), AcademicStructureManager(), formatVietnameseMutationError(), boundResource, useAcademicYearsQuery(), useAssignEnrollmentMutation(), useClassesQuery() (+51 more)

### Community 12 - "schemas.ts"
Cohesion: 0.06
Nodes (31): apiErrorSchema, attendancePeriodSchema, attendanceRecordSchema, attendanceStatusSchema, busTrackingResponseSchema, clubItemSchema, coinFundResponseSchema, coinTransactionSchema (+23 more)

### Community 13 - "students.client.ts"
Cohesion: 0.13
Nodes (19): StudentListResult, students, createStudent(), getStudent(), listSchema, listStudents(), mutate(), replaceStudentAccounts() (+11 more)

### Community 14 - "timetable-homework.controller.ts"
Cohesion: 0.08
Nodes (24): AdminTimetableHomeworkController, AppTimetableHomeworkController, Body, Controller, Get, Param, Patch, Query (+16 more)

### Community 15 - "tuition-page.tsx"
Cohesion: 0.15
Nodes (15): buildQuery(), ChargeRow(), CreateDialog(), EditDialog(), errorText(), money(), statusConfig, statusLabels (+7 more)

### Community 16 - "account.service.ts"
Cohesion: 0.13
Nodes (19): ApiSuccessEnvelope, AccountController, ChangePasswordFn, GetCurrentActorFn, Body, Controller, Get, Put (+11 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 18 - "NewsService"
Cohesion: 0.18
Nodes (3): Delete, NewsService, Injectable

### Community 19 - "student-detail-page.tsx"
Cohesion: 0.12
Nodes (11): errorMessage(), readTab(), StudentDetailPage(), validTabs, StudentDetailTab, StudentDetailTabs(), tabs, initials() (+3 more)

### Community 20 - "feedback.controller.ts"
Cohesion: 0.18
Nodes (14): FEEDBACK_STATUSES, FeedbackListQueryDto, FeedbackStatus, FeedbackStatusUpdateDto, AdminFeedbackController, Controller, Query, listSchema (+6 more)

### Community 21 - "auth.constants.ts"
Cohesion: 0.17
Nodes (10): IS_PUBLIC_KEY, REQUIRED_PERMISSIONS_KEY, REQUIRED_ROLES_KEY, SKIP_AUTHORIZATION_KEY, AuthenticatedRequest, actor, PermissionKey, PERMISSIONS (+2 more)

### Community 22 - "PrismaService"
Cohesion: 0.10
Nodes (8): actor, HomeworkRow, actor, AuditService, RecordAuditEvent, Injectable, PrismaService, Injectable

### Community 23 - "news.controller.ts"
Cohesion: 0.10
Nodes (30): NewsAudienceDto, NewsListQueryDto, NewsPinRequestDto, NewsReorderRequestDto, NewsWriteRequestDto, AdminNewsController, AppNewsController, Body (+22 more)

### Community 24 - "auth.service.ts"
Cohesion: 0.05
Nodes (45): AppController, Controller, Get, AppService, Injectable, OpenController, Public(), AuthController (+37 more)

### Community 25 - "AuthConfigService"
Cohesion: 0.12
Nodes (9): JwtPayload, JwtStrategy, Injectable, AdminSeedService, Injectable, seedIdentityAccess(), SeedIdentityAccessOptions, AuthConfigService (+1 more)

### Community 26 - "student-administration.service.spec.ts"
Cohesion: 0.08
Nodes (21): AccountIdRecord, CountStudents, CreateStudent, CreateStudentAccountLinks, CreateStudentGuardianContacts, DeleteStudentAccountLinks, DeleteStudentGuardianContacts, FindFirstStudentAccountLink (+13 more)

### Community 27 - "events-page.tsx"
Cohesion: 0.28
Nodes (7): EventStatInput, summarizeEvents(), EventsPage(), events, useAdminEventsQuery(), useCreateAdminEventMutation(), useDeleteAdminEventMutation()

### Community 28 - "students-page.tsx"
Cohesion: 0.11
Nodes (10): buildQuery(), emptyFilters, errorMessage(), Filters, grades, initials(), StudentsPage(), StudentTable() (+2 more)

### Community 29 - "zod-schemas.ts"
Cohesion: 0.09
Nodes (22): AttendanceHistoryItemSchema, AttendanceSessionDetailSchema, AttendanceTodaySchema, AttendanceTodayZod, DateStringSchema, FeedbackSubmitSchema, FeedbackSubmitZod, IsoDateTimeStringSchema (+14 more)

### Community 31 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+13 more)

### Community 32 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, bcrypt, @nestjs/core, @nestjs/jwt, @nestjs/platform-express, passport, passport-jwt, pg (+13 more)

### Community 33 - "authenticated-user.ts"
Cohesion: 0.17
Nodes (6): AuthenticatedRequest, AdminController, SecureController, RequireRole(), StudentContextController, Controller

### Community 34 - "attendance-page.tsx"
Cohesion: 0.18
Nodes (13): AttendanceEditor(), AttendancePage(), buildQuery(), CreateSessionCard(), errorText(), formatDate(), initials(), statusOptions (+5 more)

### Community 35 - "tuition.client.ts"
Cohesion: 0.14
Nodes (17): charge, createMock, listMock, result, sessionUser, updateMock, createTuitionCharge(), getTuitionCharge() (+9 more)

### Community 36 - "RequirePermission"
Cohesion: 0.07
Nodes (29): CurrentUser, RequirePermission(), Body, Post, Post, Body, Get, Param (+21 more)

### Community 37 - "student-detail-page.test.tsx"
Cohesion: 0.12
Nodes (13): getAttendanceMock, getBusMock, getScoresMock, getStudentMock, listTuitionMock, sessionUser, updateStudentMock, StudentTransportPanel() (+5 more)

### Community 38 - "admin-nav-items.ts"
Cohesion: 0.20
Nodes (13): AdminBreadcrumb, AdminNavGroup, adminNavGroups, AdminNavItem, adminNavItems, AdminRouteReadiness, getVisibleAdminNavGroups(), implementedAdminRoutes (+5 more)

### Community 39 - "teacher-capacity-panel.tsx"
Cohesion: 0.15
Nodes (10): Badge(), BadgeProps, Panel(), PanelProps, studentFollowUps, StudentFollowUpItem, stateStyles, teacherCapacity (+2 more)

### Community 40 - "ok"
Cohesion: 0.17
Nodes (7): ok(), Get, Query, AcademicStructureService, Injectable, requireActor(), SaveRewardDisciplineDto

### Community 41 - "academic-structure.validation.ts"
Cohesion: 0.14
Nodes (25): ClassEnrollmentPayload, SchoolClassPayload, AssignStudentEnrollmentDto, assignStudentEnrollmentSchema, booleanCoerce, CreateGradeLevelDto, createGradeLevelSchema, CreateSchoolClassDto (+17 more)

### Community 42 - "ScoresService"
Cohesion: 0.11
Nodes (21): AdminScoresController, AppScoresController, Controller, Get, Param, Query, calculateAverage(), isUuid() (+13 more)

### Community 43 - "proxy.ts"
Cohesion: 0.17
Nodes (9): metadata, LoginPage(), { replace, refresh, signIn }, safeCallbackUrl(), AuthTokenState, isUsableAuthToken(), config, getCookieName() (+1 more)

### Community 44 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, db:push, db:reset, db:seed, format, lint, prisma:generate (+10 more)

### Community 45 - "feedback.client.ts"
Cohesion: 0.18
Nodes (13): FeedbackItem, feedbackItemSchema, FeedbackList, FeedbackListQuery, feedbackListQuerySchema, feedbackListSchema, FeedbackStatus, feedbackStatusSchema (+5 more)

### Community 46 - "attendance.service.ts"
Cohesion: 0.06
Nodes (37): AppAttendanceController, AttendanceController, StudentAttendanceController, Body, Controller, Get, Param, Patch (+29 more)

### Community 47 - "news.service.spec.ts"
Cohesion: 0.16
Nodes (4): StudentAudienceProfile, StudentAudienceService, StudentAudienceTarget, Injectable

### Community 48 - "dependencies"
Cohesion: 0.12
Nodes (17): @dangminhdev04032005/query-resource, dependencies, @dangminhdev04032005/query-resource, next, next-auth, react, react-dom, sweetalert2 (+9 more)

### Community 49 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint-config-next, devDependencies, eslint, eslint-config-next, jsdom, @testing-library/jest-dom, @types/node, @types/react (+9 more)

### Community 50 - "feedback-page.test.tsx"
Cohesion: 0.21
Nodes (9): FeedbackPage(), detailMock, listMock, sessionUser, updateMock, feedback, useFeedbackDetailQuery(), useFeedbackQuery() (+1 more)

### Community 51 - "notifications-page.tsx"
Cohesion: 0.20
Nodes (9): emptyForm, NotificationsPage(), queryMock, updateMock, notifications, useCreateNotificationMutation(), useNotificationsQuery(), useUpdateNotificationMutation() (+1 more)

### Community 52 - "admin-dashboard.tsx"
Cohesion: 0.22
Nodes (7): AdminDashboard(), SummaryCardProps, HomeworksPage(), useArchiveHomeworkMutation(), useCreateHomeworkMutation(), useHomeworksQuery(), useStudentsQuery()

### Community 53 - "StudentContextService"
Cohesion: 0.27
Nodes (4): AccountSwitchOptionDto, StudentSummaryDto, StudentContextService, Injectable

### Community 54 - "PROJECT PLANS"
Cohesion: 0.11
Nodes (17): 2026-07-07 - vi-feature-modules-dashboard, 2026-07-08 - replace-admin-with-stitch-edumanager-template, 2026-07-08 - route-stitch-edumanager-admin-pages, 2026-07-13 - admin-module-boundary-refactor, PROJECT PLANS, Remaining blockers / risks, Remaining blockers / risks, Remaining blockers / risks (+9 more)

### Community 55 - "users-page.tsx"
Cohesion: 0.19
Nodes (6): message(), UsersPage(), useCreateUserMutation(), users, useUsersQuery(), userResource

### Community 56 - "admin-dashboard.test.tsx"
Cohesion: 0.12
Nodes (17): listAttendanceMock, listFeedbackMock, listNewsMock, listNotificationsMock, listStudentsMock, listTuitionMock, listUsersMock, createNotification() (+9 more)

### Community 57 - "seed.ts"
Cohesion: 0.14
Nodes (17): @prisma/client, AcademicContextSeedService, Injectable, seedAcademicContext(), roleSeeds, seedUatAccounts(), createPrismaClientOptions(), main() (+9 more)

### Community 58 - "jest"
Cohesion: 0.15
Nodes (13): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+5 more)

### Community 59 - "PermissionService"
Cohesion: 0.28
Nodes (4): PermissionGuard, Injectable, PermissionService, Injectable

### Community 60 - "academic-context.service.ts"
Cohesion: 0.13
Nodes (20): JwtAuthenticationGuard, Injectable, CurrentAcademicYearRecord, CurrentSemesterRecord, CreateAcademicYearDto, createAcademicYearSchema, CreateSemesterDto, createSemesterSchema (+12 more)

### Community 61 - "FeedbackService"
Cohesion: 0.29
Nodes (4): FeedbackAdminListQuery, FeedbackStatusCommand, FeedbackService, Injectable

### Community 62 - "student-tuition-panel.tsx"
Cohesion: 0.22
Nodes (8): formatDate(), formatMoney(), Money(), StudentTuitionPanel(), StudentTuitionQuery(), Summary(), listMock, ApiClientError

### Community 63 - "verify-contract.cjs"
Cohesion: 0.17
Nodes (11): frontendMirror, frontendMirrorPath, fs, jsonPath, mirror, mirrorPath, path, root (+3 more)

### Community 64 - "account.service.spec.ts"
Cohesion: 0.18
Nodes (8): AccountRecord, FindAccount, FindAccountArgs, PermissionGrant, RevokeRefreshSessions, RevokeRefreshSessionsArgs, UpdateAccount, UpdateAccountArgs

### Community 65 - "successSchema"
Cohesion: 0.25
Nodes (12): createUser(), disableUser(), getUser(), listSchema, listUsers(), mutate(), resetUserPassword(), fetchMock (+4 more)

### Community 66 - "app/layout.tsx"
Cohesion: 0.29
Nodes (5): beVietnam, geistMono, metadata, AppProviders(), createQueryClient()

### Community 67 - "env.config.ts"
Cohesion: 0.29
Nodes (7): ConfigSchema, createFrontendEnvConfig(), formatFrontendEnvError(), FrontendEnvConfig, FrontendEnvInput, getFrontendEnvConfig(), RuntimeEnvInput

### Community 68 - "events.client.ts"
Cohesion: 0.29
Nodes (8): AdminEvent, adminEventSchema, createAdminEvent(), CreateEventPayload, deleteAdminEvent(), eventsListSchema, listAdminEvents(), eventsResource

### Community 69 - "student-profile-panel.tsx"
Cohesion: 0.31
Nodes (8): formatDateOnly(), formatDateTime(), genderLabel(), GuardianCard(), phoneHref(), relationshipLabel(), StudentProfilePanel(), StudentGuardianContact

### Community 70 - "front-end/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, start, test (+1 more)

### Community 71 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @eslint/js, prisma, @types/supertest, typescript, typescript, @eslint/js, prisma (+1 more)

### Community 72 - "web_cloneMYLTV Rules"
Cohesion: 0.12
Nodes (15): 1. Documentation Rules, 1. Documentation Rules, 2. Repository / Dependency Rules, 2. Repository / Dependency Rules, 3. Architecture Rules, 3. Architecture Rules, 4. Backend Rules, 4. Backend Rules (+7 more)

### Community 73 - "academic-structure-manager.test.tsx"
Cohesion: 0.22
Nodes (6): createAcademicYearMock, getCurrentAcademicContextMock, listAcademicYearsMock, listSemestersMock, setSemesterCurrentMock, useSessionMock

### Community 74 - "exclude"
Cohesion: 0.25
Nodes (7): exclude, extends, node_modules, dist, **/*spec.ts, test, ./tsconfig.json

### Community 75 - "academic-context.client.ts"
Cohesion: 0.32
Nodes (6): AcademicContext, academicContextSchema, getCurrentAcademicContext(), mapPeriod(), periodSchema, fetchMock

### Community 76 - "homeworks.client.ts"
Cohesion: 0.18
Nodes (13): homeworks, archiveHomework(), createHomework(), CreateHomeworkPayload, HomeworkItem, homeworkItemSchema, homeworkListSchema, HomeworkQuery (+5 more)

### Community 77 - "api-contract/package.json"
Cohesion: 0.25
Nodes (7): description, license, name, private, scripts, verify, version

### Community 78 - "backend/package.json"
Cohesion: 0.29
Nodes (6): author, description, license, name, private, version

### Community 79 - "PROJECT RULES"
Cohesion: 0.14
Nodes (13): API Logging Rule (Mandatory), API Transport Rule (Mandatory), Auth & Routing Rules, Change Tracking Rule (Mandatory), Core Rules, Data Fetching, Execution Contract (Mandatory), Git Commit Rule (Mandatory) (+5 more)

### Community 80 - "web_cloneMYLTV Plans"
Cohesion: 0.15
Nodes (12): Current Architecture Direction, Historical Notes, Known Risks, P0 — Contract SSOT & Verification Baseline, P1 — Identity & Access, P2 — User Management, P3 — News Pilot & Communication, P4 — Context Migration & App Integration (+4 more)

### Community 81 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 82 - "student-attendance-panel.tsx"
Cohesion: 0.38
Nodes (3): useStudentAttendanceQuery(), labels, StudentAttendancePanel()

### Community 83 - "api-response.ts"
Cohesion: 0.12
Nodes (15): ApiErrorEnvelope, fail(), ERROR_CODES, getExceptionType(), getRequestId(), getSafeMessage(), GlobalExceptionFilter, HttpExceptionBody (+7 more)

### Community 84 - "Bounded Context Endpoint Map"
Cohesion: 0.15
Nodes (12): Academics, API Catalog v1 (School App), Billing, Bounded Context Endpoint Map, Communication, Envelope And Authorization, Identity & Access, Notes For Consumers (+4 more)

### Community 85 - "authenticated-backend.test.ts"
Cohesion: 0.50
Nodes (3): readAuthToken, refreshAuthTokenSingleFlight, writeAuthToken

### Community 90 - "Backend Guide"
Cohesion: 0.17
Nodes (11): 10. Quality Gates, 1. Purpose, 2. Strategic Direction, 3. Standard Module Shape, 4. Bounded Context Ownership, 5. Controller Rules, 6. Application Service Rules, 7. Persistence Rules (+3 more)

### Community 91 - "AcademicStructureController"
Cohesion: 0.27
Nodes (7): AcademicStructureController, Body, Controller, Param, Patch, Post, Put

### Community 94 - "timetable.client.ts"
Cohesion: 0.43
Nodes (5): getStudentTimetable(), saveTimetable(), SaveTimetablePayload, TimetableItem, timetableItemSchema

### Community 102 - "2026-07-18 — Student detail tabs, profile UI, Tuition integration, and UAT account provisioning"
Cohesion: 0.17
Nodes (11): 2026-07-18 — Student detail tabs, profile UI, Tuition integration, and UAT account provisioning, Billing / Tuition, Completed Delivery Records, Delivered behavior, Direct database UAT accounts and roles, Remaining limitation, Scope preservation, Status (+3 more)

### Community 124 - "student-administration.service.ts"
Cohesion: 0.24
Nodes (11): ReplaceStudentAccountsRequestDto, ReplaceStudentAccountsResponseDto, StudentDetailDto, StudentGenderDto, StudentGuardianContactDto, StudentGuardianRelationshipDto, StudentListQueryDto, StudentListResponseDto (+3 more)

### Community 134 - "AuthenticatedUser"
Cohesion: 0.15
Nodes (12): AuthenticatedUser, AcademicContextController, Body, Controller, Get, Param, Patch, Post (+4 more)

### Community 135 - "web_cloneMYLTV Architecture"
Cohesion: 0.18
Nodes (10): 1. Executive Decision, 2. Runtime Model, 3. Repository Shape, 4. Dependency Direction, 5. Bounded Context Direction, 6. Platform Core First, 7. Contract Boundary, 8. Microservice Extraction Position (+2 more)

### Community 136 - "academic-structure.service.spec.ts"
Cohesion: 0.20
Nodes (9): MockAcademicYearDelegate, MockAccountDelegate, MockAuditService, MockClassEnrollmentDelegate, MockFn, MockGradeLevelDelegate, MockPrismaClient, MockSchoolClassDelegate (+1 more)

### Community 137 - "student-services.service.ts"
Cohesion: 0.50
Nodes (3): OrderUniformsDto, RegisterMealsDto, SubmitFeedbackDto

### Community 138 - "Contract Guide"
Cohesion: 0.20
Nodes (9): 1. Purpose, 2. Source of Truth, 3. Global API Conventions, 4. Envelope Policy, 5. Endpoint Grouping, 6. Contract Change Policy, 7. Validation Policy, 8. Migration To OpenAPI (+1 more)

### Community 139 - "Frontend Guide"
Cohesion: 0.20
Nodes (9): 1. Purpose, 2. Target Shape, 3. Route Rules, 4. Feature Module Standard, 5. Data / API Rules, 6. Session / Security Rules, 7. Contract Alignment, 8. Runtime Rules (+1 more)

### Community 140 - "Integration Guide"
Cohesion: 0.20
Nodes (9): 1. Purpose, 2. Current Decision, 3. What Makes Extraction Easier, 4. Future Integration Options, 5. Extraction Criteria, 6. Extraction Steps, 7. Extraction Readiness Checklist, 8. What Not To Do Early (+1 more)

### Community 141 - "backend/README.md"
Cohesion: 0.20
Nodes (9): Compile and run the project, Deployment, Description, License, Project setup, Resources, Run tests, Stay in touch (+1 more)

### Community 142 - "Frontend API Contract Handoff"
Cohesion: 0.20
Nodes (9): Auth, Roles, And Scope, Consumer Filtering, Frontend Acceptance Checklist, Frontend API Contract Handoff, Frontend Client Organization, Mock Strategy, Path And ID Convention, Source Files (+1 more)

### Community 143 - "academic-context.service.spec.ts"
Cohesion: 0.29
Nodes (7): currentAcademicYear(), currentSemester(), MockAcademicYearDelegate, MockAuditService, MockFn, MockPrismaClient, MockSemesterDelegate

### Community 144 - "Frontend Architecture"
Cohesion: 0.22
Nodes (8): Application structure, Authentication and session model, Core layer, Data and API layering, Feature architecture, Folder Structure, Frontend Architecture, Overview

### Community 145 - "Contract Changes"
Cohesion: 0.22
Nodes (8): 0.1.0, 0.1.1, 1.0.0 - 2026-07-13, Contract Changes, Unreleased - 2026-07-13, Unreleased - 2026-07-16, Unreleased - 2026-07-25, Unreleased - 2026-07-26

### Community 146 - "Module Map"
Cohesion: 0.25
Nodes (7): API Direction, Bounded Contexts, Dependency Direction, Extraction Notes, Module Map, Ownership Rules, When To Add A New Module

### Community 147 - "DESIGN.md"
Cohesion: 0.25
Nodes (7): Brand & Style, Colors, Components, Elevation & Depth, Layout & Spacing, Shapes, Typography

### Community 149 - "Agent Instructions for web_cloneMYLTV"
Cohesion: 0.33
Nodes (5): Agent Instructions for web_cloneMYLTV, Before Final Report, Enforceable Coding Rules, Project Direction, Required Reading Before Changes

### Community 150 - "web_cloneMYLTV Architecture Docs"
Cohesion: 0.33
Nodes (5): Current Strategic Direction, Documents, Read Order For AI/Developers, Task Routing Table, web_cloneMYLTV Architecture Docs

### Community 151 - "student-context.service.ts"
Cohesion: 0.13
Nodes (9): AccessTokenSubject, AuthTokenService, Injectable, SwitchStudentResponseDto, LinkWithStudent, AuthTokenServiceMock, linkRecord(), studentRecord() (+1 more)

### Community 152 - "School API Contract Sync Package"
Cohesion: 0.33
Nodes (5): Consumer Rules, Frontend Handoff, School API Contract Sync Package, Structure, Verify

### Community 154 - "Implementation Status"
Cohesion: 0.40
Nodes (4): Bounded-Context Matrix, Implementation Status, Status Change Rule, Status Legend

### Community 155 - "front-end/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 163 - "timetable-page.tsx"
Cohesion: 0.48
Nodes (5): TimetablePage(), timetable, useSaveTimetableMutation(), useTimetableQuery(), timetableResource

### Community 165 - "AdminShell"
Cohesion: 0.13
Nodes (8): AdminShell(), Icon(), getCurrentAcademicContext, logout, useSession, academicContext, useAcademicContextQuery(), academicContextResource

## Knowledge Gaps
- **794 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+789 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `id` connect `auth-api.ts` to `tuition.controller.ts`?**
  _High betweenness centrality (0.287) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _794 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `identity-access.module.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13978494623655913 - nodes in this community are weakly interconnected._
- **Should `tuition.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07581453634085213 - nodes in this community are weakly interconnected._
- **Should `auth-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061581920903954805 - nodes in this community are weakly interconnected._
- **Should `parseApiResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `SkipAuthorization` be split into smaller, more focused modules?**
  _Cohesion score 0.0771478667445938 - nodes in this community are weakly interconnected._