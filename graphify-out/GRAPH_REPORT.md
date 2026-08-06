# Graph Report - full-stack-Clone-MYLTV  (2026-08-06)

## Corpus Check
- 382 files · ~308,447 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2661 nodes · 5903 edges · 161 communities (120 shown, 41 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4e5eee69`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- successSchema
- user-management.service.ts
- timetable-homework.controller.ts
- academics.module.ts
- SkipAuthorization
- app.module.ts
- auth-api.ts
- tuition.controller.ts
- news-page.tsx
- authenticated-user.ts
- attendance-page.tsx
- student-detail-page.tsx
- auth.controller.ts
- RequireRole
- account.service.ts
- ScoresService
- AdminShell
- academic-structure.validation.ts
- news.controller.ts
- students-page.tsx
- schemas.ts
- RequirePermission
- notifications.controller.ts
- dependencies
- PrismaService
- compilerOptions
- use-academic-structure.ts
- student-administration.validation.ts
- devDependencies
- StudentContextService
- NewsService
- role.validation.ts
- student-administration.service.spec.ts
- admin-dashboard.test.tsx
- scores.client.ts
- prisma.service.ts
- tuition-page.tsx
- zod-schemas.ts
- feedback.validation.ts
- StudentAdministrationService
- compilerOptions
- system-audit-page.tsx
- admin-nav-items.ts
- AuthenticatedUser
- AcademicStructureController
- admin-dashboard.tsx
- tuition.client.ts
- teacher-capacity-panel.tsx
- seed.ts
- NotificationsService
- RoleController
- proxy.ts
- parseApiResponse
- students.client.ts
- scripts
- PROJECT PLANS
- users.client.ts
- ok
- FeedbackService
- auth.service.spec.ts
- dependencies
- feedback-page.test.tsx
- grades-page.tsx
- notifications-page.tsx
- feedback.client.ts
- devDependencies
- web_cloneMYLTV Rules
- CurrentUser
- academic-context.service.ts
- news.service.spec.ts
- StudentAdministrationController
- student-detail-page.test.tsx
- homeworks.client.ts
- current-user.decorator.ts
- PROJECT RULES
- student-tuition-panel.tsx
- web_cloneMYLTV Plans
- jest
- events-page.tsx
- Bounded Context Endpoint Map
- Backend Guide
- 2026-07-18 — Student detail tabs, profile UI, Tuition integration, and UAT account provisioning
- academic-context.client.ts
- timetable.client.ts
- verify-contract.cjs
- web_cloneMYLTV Architecture
- student-administration.service.ts
- Contract Guide
- Frontend Guide
- Integration Guide
- backend/README.md
- academic-structure.service.spec.ts
- useClassesQuery
- homeworks-page.tsx
- app/layout.tsx
- env.config.ts
- events.client.ts
- front-end/package.json
- Frontend API Contract Handoff
- Frontend Architecture
- Contract Changes
- Module Map
- academic-context.service.spec.ts
- seedAcademicContext
- exclude
- timetable-page.tsx
- DESIGN.md
- api-contract/package.json
- backend/package.json
- Agent Instructions for web_cloneMYLTV
- web_cloneMYLTV Architecture Docs
- nest-cli.json
- School API Contract Sync Package
- Implementation Status
- tuition.service.spec.ts
- seed-identity-access.ts
- homework-statistics.ts
- authenticated-backend.test.ts
- front-end/README.md
- app-shell.tsx
- form-control.tsx
- next.config.ts
- backend/AGENTS.md
- backend/CODEX.md
- @eslint/eslintrc
- jest
- @nestjs/cli
- prettier
- prisma
- supertest
- ts-loader
- tsconfig-paths
- @types/bcrypt
- @types/jest
- @types/passport
- @types/passport-jwt
- @types/pg
- @types/supertest
- typescript
- typescript-eslint
- CODEX.md
- eslint-config-next
- front-end/AGENTS.md
- front-end/CODEX.md
- front-end/eslint.config.mjs
- use-logout.test.ts
- token-refresh.test.ts
- native-dialogs.test.ts
- tailwindcss
- @testing-library/react
- @testing-library/user-event
- typescript
- postcss.config.mjs
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `AuthenticatedUser` - 176 edges
2. `PrismaService` - 100 edges
3. `RequirePermission()` - 99 edges
4. `ok()` - 98 edges
5. `parseApiResponse()` - 89 edges
6. `CurrentUser` - 79 edges
7. `successSchema()` - 67 edges
8. `AuditService` - 39 edges
9. `SkipAuthorization()` - 35 edges
10. `AdminShell()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `resolveAdminEndpoint()` --references--> `id`  [EXTRACTED]
  front-end/lib/api/admin-route.ts → backend/src/modules/billing/tuition/tuition.validation.ts
- `seedAcademicContext()` --references--> `@prisma/client`  [EXTRACTED]
  backend/src/modules/academics/bootstrap/seed-academic-context.ts → backend/package.json
- `AppController` --references--> `Public()`  [EXTRACTED]
  backend/src/app.controller.ts → backend/src/common/auth/public.decorator.ts
- `AcademicContextController` --references--> `RequireRole()`  [EXTRACTED]
  backend/src/modules/academics/academic-context/academic-context.controller.ts → backend/src/common/auth/require-role.decorator.ts
- `AcademicStructureController` --references--> `RequireRole()`  [EXTRACTED]
  backend/src/modules/academics/academic-structure/academic-structure.controller.ts → backend/src/common/auth/require-role.decorator.ts

## Import Cycles
- None detected.

## Communities (161 total, 41 thin omitted)

### Community 0 - "successSchema"
Cohesion: 0.05
Nodes (65): assignStudentEnrollmentMock, createGradeLevelMock, createSchoolClassMock, getClassRosterMock, listAcademicYearsMock, listClassesMock, listGradeLevelsMock, useSessionMock (+57 more)

### Community 1 - "user-management.service.ts"
Cohesion: 0.06
Nodes (38): CreateUserRequestDto, DisableUserResponseDto, ResetPasswordRequestDto, ResetPasswordResponseDto, UpdateUserRequestDto, UserDetailDto, UserListQueryDto, UserListResponseDto (+30 more)

### Community 2 - "timetable-homework.controller.ts"
Cohesion: 0.07
Nodes (33): AdminTimetableHomeworkController, AppTimetableHomeworkController, Body, Controller, Get, Param, Patch, Post (+25 more)

### Community 3 - "academics.module.ts"
Cohesion: 0.07
Nodes (38): AppAttendanceController, AttendanceController, actor, StudentAttendanceController, Body, Controller, Get, Param (+30 more)

### Community 4 - "SkipAuthorization"
Cohesion: 0.07
Nodes (17): SelfController, SkipAuthorization(), AdminEventsController, StudentServicesController, Body, Controller, Delete, Get (+9 more)

### Community 5 - "app.module.ts"
Cohesion: 0.05
Nodes (37): AppController, Controller, Get, AppModule, Module, AppService, Injectable, fail() (+29 more)

### Community 6 - "auth-api.ts"
Cohesion: 0.06
Nodes (42): id, Context, DELETE, forward(), GET, PATCH, POST, PUT (+34 more)

### Community 7 - "tuition.controller.ts"
Cohesion: 0.07
Nodes (34): TuitionCreateDto, TuitionListQueryDto, TuitionStatus, TuitionUpdateDto, AppTuitionServicesController, AppTuitionSummaryController, Body, Controller (+26 more)

### Community 8 - "news-page.tsx"
Cohesion: 0.07
Nodes (36): categoryConfig, categoryLabels, errorMessage(), NewsPage(), normalizeCategory(), statusLabels, listNewsMock, publishNewsMock (+28 more)

### Community 9 - "authenticated-user.ts"
Cohesion: 0.08
Nodes (18): AuthenticatedRequest, PermissionGuard, Injectable, JwtPayload, JwtStrategy, Injectable, AccountWithPermissions, AccessTokenSubject (+10 more)

### Community 10 - "attendance-page.tsx"
Cohesion: 0.07
Nodes (32): AttendanceEditor(), AttendancePage(), buildQuery(), CreateSessionCard(), errorText(), formatDate(), initials(), statusOptions (+24 more)

### Community 11 - "student-detail-page.tsx"
Cohesion: 0.06
Nodes (25): useStudentScoreSummaryQuery(), errorMessage(), readTab(), StudentDetailPage(), validTabs, StudentDetailTab, StudentDetailTabs(), tabs (+17 more)

### Community 12 - "auth.controller.ts"
Cohesion: 0.08
Nodes (28): OpenController, Public(), AccountController, Controller, AuthController, LoginFn, LogoutFn, RefreshFn (+20 more)

### Community 13 - "RequireRole"
Cohesion: 0.09
Nodes (20): IS_PUBLIC_KEY, REQUIRED_PERMISSIONS_KEY, REQUIRED_ROLES_KEY, SKIP_AUTHORIZATION_KEY, JwtAuthenticationGuard, Injectable, AdminController, RequireRole() (+12 more)

### Community 14 - "account.service.ts"
Cohesion: 0.08
Nodes (27): ApiErrorEnvelope, ApiSuccessEnvelope, ChangePasswordFn, GetCurrentActorFn, Body, Get, Put, AccountService (+19 more)

### Community 15 - "ScoresService"
Cohesion: 0.09
Nodes (22): AdminScoresController, AppScoresController, Body, Controller, Get, Param, Post, Query (+14 more)

### Community 16 - "AdminShell"
Cohesion: 0.09
Nodes (17): AdminBusPage(), AdminClubsPage(), AdminMealsPage(), AdminSurveysPage(), AdminUniformsPage(), AdminShell(), Icon(), getCurrentAcademicContext (+9 more)

### Community 17 - "academic-structure.validation.ts"
Cohesion: 0.12
Nodes (31): ClassEnrollmentPayload, SchoolClassPayload, AssignStudentEnrollmentDto, assignStudentEnrollmentSchema, booleanCoerce, CreateGradeLevelDto, createGradeLevelSchema, CreateSchoolClassDto (+23 more)

### Community 18 - "news.controller.ts"
Cohesion: 0.12
Nodes (25): NewsAudienceDto, NewsListQueryDto, NewsPinRequestDto, NewsReorderRequestDto, NewsWriteRequestDto, AppNewsController, Controller, Get (+17 more)

### Community 19 - "students-page.tsx"
Cohesion: 0.08
Nodes (15): buildQuery(), emptyFilters, errorMessage(), Filters, grades, initials(), StudentsPage(), StudentTable() (+7 more)

### Community 20 - "schemas.ts"
Cohesion: 0.06
Nodes (31): apiErrorSchema, attendancePeriodSchema, attendanceRecordSchema, attendanceStatusSchema, busTrackingResponseSchema, clubItemSchema, coinFundResponseSchema, coinTransactionSchema (+23 more)

### Community 21 - "RequirePermission"
Cohesion: 0.13
Nodes (14): SecureController, RequirePermission(), AcademicContextController, Body, Controller, Get, Param, Patch (+6 more)

### Community 22 - "notifications.controller.ts"
Cohesion: 0.13
Nodes (18): NotificationListQueryDto, NotificationWriteRequestDto, AdminNotificationsController, AppNotificationsController, Body, Controller, Post, Query (+10 more)

### Community 23 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, bcrypt, dotenv, @nestjs/common, @nestjs/core, @nestjs/jwt, @nestjs/passport, @nestjs/platform-express (+21 more)

### Community 24 - "PrismaService"
Cohesion: 0.14
Nodes (7): requireActor(), AuditService, Injectable, RoleService, Injectable, PrismaService, Injectable

### Community 25 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 26 - "use-academic-structure.ts"
Cohesion: 0.17
Nodes (24): AcademicClassesManager(), translateErrorMessage(), AcademicStructureManager(), formatVietnameseMutationError(), boundResource, useAssignEnrollmentMutation(), useClassRosterQuery(), useCreateAcademicYearMutation() (+16 more)

### Community 27 - "student-administration.validation.ts"
Cohesion: 0.11
Nodes (23): StudentListQueryDto, Query, booleanish, createStudentSchema, guardianContactSchema, nonEmptyString, nullableText, nullableYear (+15 more)

### Community 28 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, globals, @nestjs/schematics, @nestjs/testing (+17 more)

### Community 29 - "StudentContextService"
Cohesion: 0.14
Nodes (10): AccountSwitchOptionDto, StudentSummaryDto, validateSwitchStudent(), StudentContextController, Body, Controller, Get, Post (+2 more)

### Community 31 - "role.validation.ts"
Cohesion: 0.15
Nodes (21): AssignAccountRolesDto, assignAccountRolesSchema, booleanCoerce, CreateRoleDto, createRoleSchema, ListRolesQueryDto, listRolesQuerySchema, nonEmptyString (+13 more)

### Community 32 - "student-administration.service.spec.ts"
Cohesion: 0.08
Nodes (21): AccountIdRecord, CountStudents, CreateStudent, CreateStudentAccountLinks, CreateStudentGuardianContacts, DeleteStudentAccountLinks, DeleteStudentGuardianContacts, FindFirstStudentAccountLink (+13 more)

### Community 33 - "admin-dashboard.test.tsx"
Cohesion: 0.12
Nodes (17): listAttendanceMock, listFeedbackMock, listNewsMock, listNotificationsMock, listStudentsMock, listTuitionMock, listUsersMock, createNotification() (+9 more)

### Community 34 - "scores.client.ts"
Cohesion: 0.13
Nodes (19): classesMock, getScoresMock, mockSession, saveScoreMock, semestersMock, studentsMock, yearsMock, getScores() (+11 more)

### Community 35 - "prisma.service.ts"
Cohesion: 0.12
Nodes (12): actor, AuditController, listAuditLogsQuerySchema, Controller, Get, Query, validateListAuditLogsQuery(), isSensitiveKey() (+4 more)

### Community 36 - "tuition-page.tsx"
Cohesion: 0.13
Nodes (17): useAcademicContextQuery(), buildQuery(), ChargeRow(), CreateDialog(), EditDialog(), errorText(), money(), statusConfig (+9 more)

### Community 37 - "zod-schemas.ts"
Cohesion: 0.09
Nodes (22): AttendanceHistoryItemSchema, AttendanceSessionDetailSchema, AttendanceTodaySchema, AttendanceTodayZod, DateStringSchema, FeedbackSubmitSchema, FeedbackSubmitZod, IsoDateTimeStringSchema (+14 more)

### Community 38 - "feedback.validation.ts"
Cohesion: 0.13
Nodes (17): FEEDBACK_STATUSES, FeedbackListQueryDto, FeedbackStatus, FeedbackStatusCommand, FeedbackStatusUpdateDto, Body, Get, Param (+9 more)

### Community 40 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+13 more)

### Community 41 - "system-audit-page.tsx"
Cohesion: 0.16
Nodes (14): fields, SystemAuditPage(), queryMock, refetch, sessionMock, toIso(), boundResource, useAuditLogsQuery() (+6 more)

### Community 42 - "admin-nav-items.ts"
Cohesion: 0.14
Nodes (17): AdminBreadcrumb, AdminNavGroup, adminNavGroups, AdminNavItem, adminNavItems, AdminRouteReadiness, getAdminNavItemByHref(), getVisibleAdminNavGroups() (+9 more)

### Community 43 - "AuthenticatedUser"
Cohesion: 0.25
Nodes (3): AuthenticatedUser, AcademicStructureService, Injectable

### Community 44 - "AcademicStructureController"
Cohesion: 0.19
Nodes (9): AcademicStructureController, Body, Controller, Get, Param, Patch, Post, Put (+1 more)

### Community 45 - "admin-dashboard.tsx"
Cohesion: 0.14
Nodes (8): AdminDashboard(), SummaryCardProps, message(), UsersPage(), useCreateUserMutation(), users, useUsersQuery(), userResource

### Community 46 - "tuition.client.ts"
Cohesion: 0.16
Nodes (15): charge, createMock, listMock, result, sessionUser, updateMock, createTuitionCharge(), getTuitionCharge() (+7 more)

### Community 47 - "teacher-capacity-panel.tsx"
Cohesion: 0.15
Nodes (10): Badge(), BadgeProps, Panel(), PanelProps, studentFollowUps, StudentFollowUpItem, stateStyles, teacherCapacity (+2 more)

### Community 48 - "seed.ts"
Cohesion: 0.19
Nodes (15): @prisma/client, roleSeeds, seedUatAccounts(), createPrismaClientOptions(), main(), seedAcademicStructure(), seedDynamicRoles(), seedNewsAndNotifications() (+7 more)

### Community 50 - "RoleController"
Cohesion: 0.20
Nodes (9): RoleController, Body, Controller, Get, Param, Patch, Post, Put (+1 more)

### Community 51 - "proxy.ts"
Cohesion: 0.17
Nodes (9): metadata, LoginPage(), { replace, refresh, signIn }, safeCallbackUrl(), AuthTokenState, isUsableAuthToken(), config, getCookieName() (+1 more)

### Community 52 - "parseApiResponse"
Cohesion: 0.16
Nodes (17): getNews(), busTrackingSchema, clubSchema, clubsResponseSchema, fetchBusTracking(), fetchClubs(), fetchMeals(), fetchSurveys() (+9 more)

### Community 53 - "students.client.ts"
Cohesion: 0.19
Nodes (14): createStudent(), getStudent(), listSchema, listStudents(), mutate(), replaceStudentAccounts(), StudentSummary, StudentWritePayload (+6 more)

### Community 54 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, db:push, db:reset, db:seed, format, lint, prisma:generate (+10 more)

### Community 55 - "PROJECT PLANS"
Cohesion: 0.11
Nodes (17): 2026-07-07 - vi-feature-modules-dashboard, 2026-07-08 - replace-admin-with-stitch-edumanager-template, 2026-07-08 - route-stitch-edumanager-admin-pages, 2026-07-13 - admin-module-boundary-refactor, PROJECT PLANS, Remaining blockers / risks, Remaining blockers / risks, Remaining blockers / risks (+9 more)

### Community 56 - "users.client.ts"
Cohesion: 0.22
Nodes (12): createUser(), disableUser(), getUser(), listSchema, listUsers(), mutate(), resetUserPassword(), fetchMock (+4 more)

### Community 57 - "ok"
Cohesion: 0.34
Nodes (3): ok(), AcademicContextService, Injectable

### Community 58 - "FeedbackService"
Cohesion: 0.18
Nodes (3): FeedbackAdminListQuery, FeedbackService, Injectable

### Community 59 - "auth.service.spec.ts"
Cohesion: 0.12
Nodes (12): AccountRecord, CreateRefreshSession, CreateRefreshSessionArgs, FindAccount, FindAccountArgs, FindRefreshSession, FindRefreshSessionArgs, PermissionGrant (+4 more)

### Community 60 - "dependencies"
Cohesion: 0.12
Nodes (17): @dangminhdev04032005/query-resource, dependencies, @dangminhdev04032005/query-resource, next, next-auth, react, react-dom, sweetalert2 (+9 more)

### Community 61 - "feedback-page.test.tsx"
Cohesion: 0.21
Nodes (9): FeedbackPage(), detailMock, listMock, sessionUser, updateMock, feedback, useFeedbackDetailQuery(), useFeedbackQuery() (+1 more)

### Community 62 - "grades-page.tsx"
Cohesion: 0.21
Nodes (10): GradesPage(), ScoreStatInput, summarizeScores(), scores, useSaveRewardMutation(), useSaveScoreMutation(), useScoresQuery(), useStudentRewardsQuery() (+2 more)

### Community 63 - "notifications-page.tsx"
Cohesion: 0.20
Nodes (9): emptyForm, NotificationsPage(), queryMock, updateMock, notifications, useCreateNotificationMutation(), useNotificationsQuery(), useUpdateNotificationMutation() (+1 more)

### Community 64 - "feedback.client.ts"
Cohesion: 0.18
Nodes (13): FeedbackItem, feedbackItemSchema, FeedbackList, FeedbackListQuery, feedbackListQuerySchema, feedbackListSchema, FeedbackStatus, feedbackStatusSchema (+5 more)

### Community 65 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, eslint, jsdom, @tailwindcss/postcss, @testing-library/jest-dom, @types/node, @types/react, @types/react-dom (+9 more)

### Community 66 - "web_cloneMYLTV Rules"
Cohesion: 0.12
Nodes (15): 1. Documentation Rules, 1. Documentation Rules, 2. Repository / Dependency Rules, 2. Repository / Dependency Rules, 3. Architecture Rules, 3. Architecture Rules, 4. Backend Rules, 4. Backend Rules (+7 more)

### Community 67 - "CurrentUser"
Cohesion: 0.28
Nodes (7): CurrentUser, AdminNewsController, Body, Delete, Param, Patch, Post

### Community 68 - "academic-context.service.ts"
Cohesion: 0.17
Nodes (13): CurrentAcademicYearRecord, CurrentSemesterRecord, CreateAcademicYearDto, createAcademicYearSchema, CreateSemesterDto, createSemesterSchema, dateSchema, nonEmptyString (+5 more)

### Community 69 - "news.service.spec.ts"
Cohesion: 0.15
Nodes (4): StudentAudienceProfile, StudentAudienceService, StudentAudienceTarget, Injectable

### Community 70 - "StudentAdministrationController"
Cohesion: 0.18
Nodes (10): ReplaceStudentAccountsRequestDto, StudentWriteRequestDto, StudentAdministrationController, Body, Controller, Get, Param, Patch (+2 more)

### Community 71 - "student-detail-page.test.tsx"
Cohesion: 0.15
Nodes (10): getStudentAttendance(), getAttendanceMock, getBusMock, getScoresMock, getStudentMock, listTuitionMock, sessionUser, updateStudentMock (+2 more)

### Community 72 - "homeworks.client.ts"
Cohesion: 0.21
Nodes (12): archiveHomework(), createHomework(), CreateHomeworkPayload, HomeworkItem, homeworkItemSchema, homeworkListSchema, HomeworkQuery, listHomeworks() (+4 more)

### Community 73 - "current-user.decorator.ts"
Cohesion: 0.16
Nodes (7): AuthenticatedRequest, SwitchStudentRequestDto, LinkWithStudent, AuthTokenServiceMock, linkRecord(), studentRecord(), StudentRecord

### Community 74 - "PROJECT RULES"
Cohesion: 0.14
Nodes (13): API Logging Rule (Mandatory), API Transport Rule (Mandatory), Auth & Routing Rules, Change Tracking Rule (Mandatory), Core Rules, Data Fetching, Execution Contract (Mandatory), Git Commit Rule (Mandatory) (+5 more)

### Community 75 - "student-tuition-panel.tsx"
Cohesion: 0.21
Nodes (9): formatDate(), formatMoney(), Money(), StudentTuitionPanel(), StudentTuitionQuery(), Summary(), listMock, useTuitionListQuery() (+1 more)

### Community 76 - "web_cloneMYLTV Plans"
Cohesion: 0.15
Nodes (12): Current Architecture Direction, Historical Notes, Known Risks, P0 — Contract SSOT & Verification Baseline, P1 — Identity & Access, P2 — User Management, P3 — News Pilot & Communication, P4 — Context Migration & App Integration (+4 more)

### Community 77 - "jest"
Cohesion: 0.15
Nodes (13): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+5 more)

### Community 78 - "events-page.tsx"
Cohesion: 0.28
Nodes (7): EventStatInput, summarizeEvents(), EventsPage(), events, useAdminEventsQuery(), useCreateAdminEventMutation(), useDeleteAdminEventMutation()

### Community 79 - "Bounded Context Endpoint Map"
Cohesion: 0.15
Nodes (12): Academics, API Catalog v1 (School App), Billing, Bounded Context Endpoint Map, Communication, Envelope And Authorization, Identity & Access, Notes For Consumers (+4 more)

### Community 80 - "Backend Guide"
Cohesion: 0.17
Nodes (11): 10. Quality Gates, 1. Purpose, 2. Strategic Direction, 3. Standard Module Shape, 4. Bounded Context Ownership, 5. Controller Rules, 6. Application Service Rules, 7. Persistence Rules (+3 more)

### Community 81 - "2026-07-18 — Student detail tabs, profile UI, Tuition integration, and UAT account provisioning"
Cohesion: 0.17
Nodes (11): 2026-07-18 — Student detail tabs, profile UI, Tuition integration, and UAT account provisioning, Billing / Tuition, Completed Delivery Records, Delivered behavior, Direct database UAT accounts and roles, Remaining limitation, Scope preservation, Status (+3 more)

### Community 82 - "academic-context.client.ts"
Cohesion: 0.23
Nodes (8): academicContext, AcademicContext, academicContextSchema, getCurrentAcademicContext(), mapPeriod(), periodSchema, fetchMock, academicContextResource

### Community 83 - "timetable.client.ts"
Cohesion: 0.27
Nodes (9): timetable, AdminTimetable, getAdminTimetable(), saveTimetable(), SaveTimetablePayload, timetableItemSchema, timetableSchema, TimetableScope (+1 more)

### Community 84 - "verify-contract.cjs"
Cohesion: 0.17
Nodes (11): frontendMirror, frontendMirrorPath, fs, jsonPath, mirror, mirrorPath, path, root (+3 more)

### Community 85 - "web_cloneMYLTV Architecture"
Cohesion: 0.18
Nodes (10): 1. Executive Decision, 2. Runtime Model, 3. Repository Shape, 4. Dependency Direction, 5. Bounded Context Direction, 6. Platform Core First, 7. Contract Boundary, 8. Microservice Extraction Position (+2 more)

### Community 86 - "student-administration.service.ts"
Cohesion: 0.25
Nodes (9): ReplaceStudentAccountsResponseDto, StudentDetailDto, StudentGenderDto, StudentGuardianContactDto, StudentGuardianRelationshipDto, StudentListResponseDto, SwitchStudentResponseDto, CreateStudentFields (+1 more)

### Community 87 - "Contract Guide"
Cohesion: 0.20
Nodes (9): 1. Purpose, 2. Source of Truth, 3. Global API Conventions, 4. Envelope Policy, 5. Endpoint Grouping, 6. Contract Change Policy, 7. Validation Policy, 8. Migration To OpenAPI (+1 more)

### Community 88 - "Frontend Guide"
Cohesion: 0.20
Nodes (9): 1. Purpose, 2. Target Shape, 3. Route Rules, 4. Feature Module Standard, 5. Data / API Rules, 6. Session / Security Rules, 7. Contract Alignment, 8. Runtime Rules (+1 more)

### Community 89 - "Integration Guide"
Cohesion: 0.20
Nodes (9): 1. Purpose, 2. Current Decision, 3. What Makes Extraction Easier, 4. Future Integration Options, 5. Extraction Criteria, 6. Extraction Steps, 7. Extraction Readiness Checklist, 8. What Not To Do Early (+1 more)

### Community 90 - "backend/README.md"
Cohesion: 0.20
Nodes (9): Compile and run the project, Deployment, Description, License, Project setup, Resources, Run tests, Stay in touch (+1 more)

### Community 91 - "academic-structure.service.spec.ts"
Cohesion: 0.20
Nodes (9): MockAcademicYearDelegate, MockAccountDelegate, MockAuditService, MockClassEnrollmentDelegate, MockFn, MockGradeLevelDelegate, MockPrismaClient, MockSchoolClassDelegate (+1 more)

### Community 92 - "useClassesQuery"
Cohesion: 0.38
Nodes (6): AdminReportsPage(), AcademicStructurePage(), useAcademicYearsQuery(), useClassesQuery(), usePromoteCohortMutation(), useTransferStudentsMutation()

### Community 93 - "homeworks-page.tsx"
Cohesion: 0.36
Nodes (5): HomeworksPage(), homeworks, useArchiveHomeworkMutation(), useCreateHomeworkMutation(), useHomeworksQuery()

### Community 94 - "app/layout.tsx"
Cohesion: 0.29
Nodes (5): beVietnam, geistMono, metadata, AppProviders(), createQueryClient()

### Community 95 - "env.config.ts"
Cohesion: 0.29
Nodes (7): ConfigSchema, createFrontendEnvConfig(), formatFrontendEnvError(), FrontendEnvConfig, FrontendEnvInput, getFrontendEnvConfig(), RuntimeEnvInput

### Community 96 - "events.client.ts"
Cohesion: 0.29
Nodes (8): AdminEvent, adminEventSchema, createAdminEvent(), CreateEventPayload, deleteAdminEvent(), eventsListSchema, listAdminEvents(), eventsResource

### Community 97 - "front-end/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, start, test (+1 more)

### Community 98 - "Frontend API Contract Handoff"
Cohesion: 0.20
Nodes (9): Auth, Roles, And Scope, Consumer Filtering, Frontend Acceptance Checklist, Frontend API Contract Handoff, Frontend Client Organization, Mock Strategy, Path And ID Convention, Source Files (+1 more)

### Community 99 - "Frontend Architecture"
Cohesion: 0.22
Nodes (8): Application structure, Authentication and session model, Core layer, Data and API layering, Feature architecture, Folder Structure, Frontend Architecture, Overview

### Community 100 - "Contract Changes"
Cohesion: 0.22
Nodes (8): 0.1.0, 0.1.1, 1.0.0 - 2026-07-13, Contract Changes, Unreleased - 2026-07-13, Unreleased - 2026-07-16, Unreleased - 2026-07-25, Unreleased - 2026-07-26

### Community 101 - "Module Map"
Cohesion: 0.25
Nodes (7): API Direction, Bounded Contexts, Dependency Direction, Extraction Notes, Module Map, Ownership Rules, When To Add A New Module

### Community 102 - "academic-context.service.spec.ts"
Cohesion: 0.29
Nodes (7): currentAcademicYear(), currentSemester(), MockAcademicYearDelegate, MockAuditService, MockFn, MockPrismaClient, MockSemesterDelegate

### Community 103 - "seedAcademicContext"
Cohesion: 0.36
Nodes (3): AcademicContextSeedService, Injectable, seedAcademicContext()

### Community 104 - "exclude"
Cohesion: 0.25
Nodes (7): exclude, extends, node_modules, dist, **/*spec.ts, test, ./tsconfig.json

### Community 105 - "timetable-page.tsx"
Cohesion: 0.39
Nodes (5): monday(), TimetablePage(), useAdminTimetableQuery(), useSaveTimetableMutation(), TimetableItem

### Community 106 - "DESIGN.md"
Cohesion: 0.25
Nodes (7): Brand & Style, Colors, Components, Elevation & Depth, Layout & Spacing, Shapes, Typography

### Community 107 - "api-contract/package.json"
Cohesion: 0.25
Nodes (7): description, license, name, private, scripts, verify, version

### Community 108 - "backend/package.json"
Cohesion: 0.29
Nodes (6): author, description, license, name, private, version

### Community 109 - "Agent Instructions for web_cloneMYLTV"
Cohesion: 0.33
Nodes (5): Agent Instructions for web_cloneMYLTV, Before Final Report, Enforceable Coding Rules, Project Direction, Required Reading Before Changes

### Community 110 - "web_cloneMYLTV Architecture Docs"
Cohesion: 0.33
Nodes (5): Current Strategic Direction, Documents, Read Order For AI/Developers, Task Routing Table, web_cloneMYLTV Architecture Docs

### Community 111 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 112 - "School API Contract Sync Package"
Cohesion: 0.33
Nodes (5): Consumer Rules, Frontend Handoff, School API Contract Sync Package, Structure, Verify

### Community 113 - "Implementation Status"
Cohesion: 0.40
Nodes (4): Bounded-Context Matrix, Implementation Status, Status Change Rule, Status Legend

### Community 118 - "authenticated-backend.test.ts"
Cohesion: 0.50
Nodes (3): readAuthToken, refreshAuthTokenSingleFlight, writeAuthToken

### Community 119 - "front-end/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **831 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+826 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `id` connect `auth-api.ts` to `tuition.controller.ts`?**
  _High betweenness centrality (0.299) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _831 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `successSchema` be split into smaller, more focused modules?**
  _Cohesion score 0.04924102184376157 - nodes in this community are weakly interconnected._
- **Should `user-management.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061569416498993966 - nodes in this community are weakly interconnected._
- **Should `timetable-homework.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07372229760289462 - nodes in this community are weakly interconnected._
- **Should `academics.module.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0662004662004662 - nodes in this community are weakly interconnected._
- **Should `SkipAuthorization` be split into smaller, more focused modules?**
  _Cohesion score 0.07093253968253968 - nodes in this community are weakly interconnected._