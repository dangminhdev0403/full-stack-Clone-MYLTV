# Graph Report - full-stack-Clone-MYLTV  (2026-08-06)

## Corpus Check
- 384 files · ~310,112 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2670 nodes · 5943 edges · 175 communities (125 shown, 50 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cdfa30fe`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- authenticated-user.ts
- timetable-homework.controller.ts
- auth-api.ts
- NotificationsService
- successSchema
- news-page.tsx
- SkipAuthorization
- academics.module.ts
- attendance-page.tsx
- PrismaService
- attendance.service.ts
- auth.service.ts
- student-detail-page.tsx
- schemas.ts
- RequireRole
- AuthenticatedUser
- feedback.controller.ts
- use-academic-structure.ts
- CurrentUser
- AdminShell
- tuition.service.ts
- identity-access.module.ts
- seed.ts
- RequirePermission
- tuition-page.tsx
- account.service.ts
- news.controller.ts
- compilerOptions
- students-page.tsx
- academic-structure.validation.ts
- auth.controller.ts
- role.validation.ts
- StudentAdministrationService
- student-administration.service.spec.ts
- admin-dashboard.test.tsx
- student-administration.validation.ts
- students.client.ts
- zod-schemas.ts
- .record
- compilerOptions
- system-audit-page.tsx
- grades-page.test.tsx
- admin-nav-items.ts
- dependencies
- api-response.ts
- .update
- student-context.service.ts
- parseApiResponse
- tuition.client.ts
- student-administration.controller.ts
- teacher-capacity-panel.tsx
- timetable.client.ts
- proxy.ts
- scripts
- ok
- grades-page.tsx
- PROJECT PLANS
- users.client.ts
- dependencies
- devDependencies
- feedback-page.test.tsx
- notifications-page.tsx
- student-detail-page.test.tsx
- feedback.client.ts
- web_cloneMYLTV Rules
- academic-context.service.ts
- .update
- users-page.tsx
- scores.client.ts
- RoleController
- PROJECT RULES
- homeworks.client.ts
- web_cloneMYLTV Plans
- jest
- RoleService
- events-page.tsx
- academic-context.client.ts
- Bounded Context Endpoint Map
- Backend Guide
- 2026-07-18 — Student detail tabs, profile UI, Tuition integration, and UAT account provisioning
- verify-contract.cjs
- web_cloneMYLTV Architecture
- app.controller.ts
- AuthController
- account.service.spec.ts
- AuditController
- student-administration.service.ts
- UserManagementController
- homeworks-page.tsx
- Contract Guide
- Frontend Guide
- Integration Guide
- backend/README.md
- academic-structure.service.spec.ts
- app/layout.tsx
- env.config.ts
- events.client.ts
- front-end/package.json
- Frontend API Contract Handoff
- devDependencies
- PermissionService
- AuthService
- AdminEventsController
- Frontend Architecture
- Contract Changes
- Module Map
- exclude
- DESIGN.md
- api-contract/package.json
- backend/package.json
- student-context.service.spec.ts
- Agent Instructions for web_cloneMYLTV
- web_cloneMYLTV Architecture Docs
- nest-cli.json
- StudentContextController
- School API Contract Sync Package
- JwtAuthenticationGuard
- Implementation Status
- FailureController
- homework-statistics.ts
- authenticated-backend.test.ts
- front-end/README.md
- app-shell.tsx
- form-control.tsx
- next.config.ts
- backend/AGENTS.md
- backend/CODEX.md
- dotenv
- @nestjs/common
- @nestjs/passport
- @prisma/adapter-pg
- eslint
- @eslint/eslintrc
- eslint-plugin-prettier
- globals
- jest
- @nestjs/cli
- @nestjs/schematics
- @nestjs/testing
- prettier
- prisma
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
- CODEX.md
- front-end/AGENTS.md
- front-end/CODEX.md
- front-end/eslint.config.mjs
- use-logout.test.ts
- token-refresh.test.ts
- native-dialogs.test.ts
- tailwindcss
- @tailwindcss/postcss
- @testing-library/react
- @testing-library/user-event
- typescript
- postcss.config.mjs
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `AuthenticatedUser` - 176 edges
2. `ok()` - 120 edges
3. `PrismaService` - 100 edges
4. `RequirePermission()` - 99 edges
5. `parseApiResponse()` - 89 edges
6. `CurrentUser` - 79 edges
7. `successSchema()` - 67 edges
8. `AuditService` - 39 edges
9. `SkipAuthorization()` - 35 edges
10. `AdminShell()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `resolveAdminEndpoint()` --references--> `id`  [EXTRACTED]
  front-end/lib/api/admin-route.ts → backend/src/modules/billing/tuition/tuition.validation.ts
- `AppController` --references--> `Public()`  [EXTRACTED]
  backend/src/app.controller.ts → backend/src/common/auth/public.decorator.ts
- `AcademicContextController` --references--> `RequireRole()`  [EXTRACTED]
  backend/src/modules/academics/academic-context/academic-context.controller.ts → backend/src/common/auth/require-role.decorator.ts
- `AcademicStructureController` --references--> `RequireRole()`  [EXTRACTED]
  backend/src/modules/academics/academic-structure/academic-structure.controller.ts → backend/src/common/auth/require-role.decorator.ts
- `AdminScoresController` --references--> `RequireRole()`  [EXTRACTED]
  backend/src/modules/academics/scores/scores.controller.ts → backend/src/common/auth/require-role.decorator.ts

## Import Cycles
- None detected.

## Communities (175 total, 50 thin omitted)

### Community 0 - "authenticated-user.ts"
Cohesion: 0.06
Nodes (40): currentAcademicYear(), currentSemester(), MockAcademicYearDelegate, MockAuditService, MockFn, MockPrismaClient, MockSemesterDelegate, PermissionKey (+32 more)

### Community 1 - "timetable-homework.controller.ts"
Cohesion: 0.07
Nodes (33): AdminTimetableHomeworkController, AppTimetableHomeworkController, Body, Controller, Get, Param, Patch, Post (+25 more)

### Community 2 - "auth-api.ts"
Cohesion: 0.06
Nodes (42): id, Context, DELETE, forward(), GET, PATCH, POST, PUT (+34 more)

### Community 3 - "NotificationsService"
Cohesion: 0.08
Nodes (23): NotificationListQueryDto, NotificationWriteRequestDto, AdminNotificationsController, AppNotificationsController, Body, Controller, Get, Param (+15 more)

### Community 4 - "successSchema"
Cohesion: 0.06
Nodes (51): assignStudentEnrollmentMock, createGradeLevelMock, createSchoolClassMock, getClassRosterMock, listAcademicYearsMock, listClassesMock, listGradeLevelsMock, useSessionMock (+43 more)

### Community 5 - "news-page.tsx"
Cohesion: 0.07
Nodes (36): categoryConfig, categoryLabels, errorMessage(), NewsPage(), normalizeCategory(), statusLabels, listNewsMock, publishNewsMock (+28 more)

### Community 6 - "SkipAuthorization"
Cohesion: 0.09
Nodes (11): SelfController, SkipAuthorization(), StudentServicesController, Body, Get, Param, Post, Query (+3 more)

### Community 7 - "academics.module.ts"
Cohesion: 0.09
Nodes (28): AcademicsModule, Module, AdminScoresController, AppScoresController, Body, Controller, Get, Param (+20 more)

### Community 8 - "attendance-page.tsx"
Cohesion: 0.07
Nodes (32): AttendanceEditor(), AttendancePage(), buildQuery(), CreateSessionCard(), errorText(), formatDate(), initials(), statusOptions (+24 more)

### Community 9 - "PrismaService"
Cohesion: 0.08
Nodes (15): actor, NewsRecord, AuditService, ListAuditLogsQueryDto, RecordAuditEvent, Injectable, AssignAccountRolesDto, StudentAudienceProfile (+7 more)

### Community 10 - "attendance.service.ts"
Cohesion: 0.08
Nodes (28): Query, assertRecords(), AttendanceService, dateOnly(), mapWriteError(), nullableTrim(), positiveInt(), requireActor() (+20 more)

### Community 11 - "auth.service.ts"
Cohesion: 0.06
Nodes (23): JwtPayload, JwtStrategy, Injectable, AccountWithPermissions, AccountRecord, CreateRefreshSession, CreateRefreshSessionArgs, FindAccount (+15 more)

### Community 12 - "student-detail-page.tsx"
Cohesion: 0.06
Nodes (25): useStudentScoreSummaryQuery(), errorMessage(), readTab(), StudentDetailPage(), validTabs, StudentDetailTab, StudentDetailTabs(), tabs (+17 more)

### Community 13 - "schemas.ts"
Cohesion: 0.05
Nodes (39): formatDate(), formatMoney(), Money(), StudentTuitionPanel(), StudentTuitionQuery(), Summary(), listMock, ApiClientError (+31 more)

### Community 14 - "RequireRole"
Cohesion: 0.11
Nodes (14): IS_PUBLIC_KEY, REQUIRED_PERMISSIONS_KEY, REQUIRED_ROLES_KEY, SKIP_AUTHORIZATION_KEY, AuthenticatedRequest, AuthenticatedRequest, AdminController, RequireRole() (+6 more)

### Community 15 - "AuthenticatedUser"
Cohesion: 0.14
Nodes (13): AuthenticatedUser, NewsAudienceDto, NewsPinRequestDto, NewsReorderRequestDto, NewsWriteRequestDto, AdminNewsController, Body, Delete (+5 more)

### Community 16 - "feedback.controller.ts"
Cohesion: 0.09
Nodes (20): FEEDBACK_STATUSES, FeedbackAdminListQuery, FeedbackListQueryDto, FeedbackStatus, FeedbackStatusCommand, FeedbackStatusUpdateDto, AdminFeedbackController, Controller (+12 more)

### Community 17 - "use-academic-structure.ts"
Cohesion: 0.12
Nodes (32): AdminReportsPage(), AcademicClassesManager(), translateErrorMessage(), AcademicStructureManager(), formatVietnameseMutationError(), AcademicStructurePage(), boundResource, useAcademicYearsQuery() (+24 more)

### Community 18 - "CurrentUser"
Cohesion: 0.14
Nodes (20): CurrentUser, AcademicStructureController, Body, Controller, Get, Param, Patch, Post (+12 more)

### Community 19 - "AdminShell"
Cohesion: 0.10
Nodes (16): AdminBusPage(), AdminClubsPage(), AdminMealsPage(), AdminSurveysPage(), AdminUniformsPage(), AdminShell(), Icon(), getCurrentAcademicContext (+8 more)

### Community 20 - "tuition.service.ts"
Cohesion: 0.11
Nodes (21): TuitionCreateDto, TuitionListQueryDto, TuitionStatus, TuitionUpdateDto, Query, ChargeRecord, deriveStatus(), mapWriteError() (+13 more)

### Community 21 - "identity-access.module.ts"
Cohesion: 0.12
Nodes (18): AppModule, Module, HttpLoggerMiddleware, Injectable, BillingModule, Module, CommunicationModule, Module (+10 more)

### Community 22 - "seed.ts"
Cohesion: 0.11
Nodes (20): @prisma/client, AcademicContextSeedService, Injectable, seedAcademicContext(), seedIdentityAccess(), SeedIdentityAccessOptions, roleSeeds, seedUatAccounts() (+12 more)

### Community 23 - "RequirePermission"
Cohesion: 0.14
Nodes (18): SecureController, RequirePermission(), AcademicContextController, Body, Controller, Get, Param, Patch (+10 more)

### Community 24 - "tuition-page.tsx"
Cohesion: 0.11
Nodes (21): AdminDashboard(), SummaryCardProps, useNewsQuery(), useStudentsQuery(), buildQuery(), ChargeRow(), CreateDialog(), EditDialog() (+13 more)

### Community 25 - "account.service.ts"
Cohesion: 0.13
Nodes (17): ApiSuccessEnvelope, AccountController, ChangePasswordFn, GetCurrentActorFn, Body, Controller, Put, AccountService (+9 more)

### Community 26 - "news.controller.ts"
Cohesion: 0.11
Nodes (20): NewsListQueryDto, AppNewsController, Controller, Get, Query, audience, createNewsSchema, fields (+12 more)

### Community 27 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 28 - "students-page.tsx"
Cohesion: 0.09
Nodes (13): buildQuery(), emptyFilters, errorMessage(), Filters, grades, initials(), StudentsPage(), StudentTable() (+5 more)

### Community 29 - "academic-structure.validation.ts"
Cohesion: 0.11
Nodes (23): ClassEnrollmentPayload, SchoolClassPayload, AssignStudentEnrollmentDto, assignStudentEnrollmentSchema, booleanCoerce, CreateGradeLevelDto, createGradeLevelSchema, CreateSchoolClassDto (+15 more)

### Community 30 - "auth.controller.ts"
Cohesion: 0.15
Nodes (19): LoginFn, LogoutFn, RefreshFn, AccountRole, LoginRequestDto, LoginResponseDto, LogoutRequestDto, LogoutResponseDto (+11 more)

### Community 31 - "role.validation.ts"
Cohesion: 0.14
Nodes (20): Get, Query, assignAccountRolesSchema, booleanCoerce, createRoleSchema, ListRolesQueryDto, listRolesQuerySchema, nonEmptyString (+12 more)

### Community 32 - "StudentAdministrationService"
Cohesion: 0.16
Nodes (4): StudentListQueryDto, StudentWriteRequestDto, StudentAdministrationService, Injectable

### Community 33 - "student-administration.service.spec.ts"
Cohesion: 0.08
Nodes (21): AccountIdRecord, CountStudents, CreateStudent, CreateStudentAccountLinks, CreateStudentGuardianContacts, DeleteStudentAccountLinks, DeleteStudentGuardianContacts, FindFirstStudentAccountLink (+13 more)

### Community 34 - "admin-dashboard.test.tsx"
Cohesion: 0.12
Nodes (17): listAttendanceMock, listFeedbackMock, listNewsMock, listNotificationsMock, listStudentsMock, listTuitionMock, listUsersMock, createNotification() (+9 more)

### Community 35 - "student-administration.validation.ts"
Cohesion: 0.10
Nodes (20): SwitchStudentRequestDto, booleanish, createStudentSchema, guardianContactSchema, nonEmptyString, nullableText, nullableYear, optionalNullableString (+12 more)

### Community 36 - "students.client.ts"
Cohesion: 0.15
Nodes (15): listStudentsMock, createStudent(), getStudent(), listSchema, listStudents(), mutate(), replaceStudentAccounts(), StudentSummary (+7 more)

### Community 37 - "zod-schemas.ts"
Cohesion: 0.09
Nodes (22): AttendanceHistoryItemSchema, AttendanceSessionDetailSchema, AttendanceTodaySchema, AttendanceTodayZod, DateStringSchema, FeedbackSubmitSchema, FeedbackSubmitZod, IsoDateTimeStringSchema (+14 more)

### Community 39 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+13 more)

### Community 40 - "system-audit-page.tsx"
Cohesion: 0.16
Nodes (14): fields, SystemAuditPage(), queryMock, refetch, sessionMock, toIso(), boundResource, useAuditLogsQuery() (+6 more)

### Community 41 - "grades-page.test.tsx"
Cohesion: 0.10
Nodes (17): createAcademicYearMock, getCurrentAcademicContextMock, listAcademicYearsMock, listSemestersMock, setSemesterCurrentMock, useSessionMock, getCurrentAcademicContext(), listAcademicYears() (+9 more)

### Community 42 - "admin-nav-items.ts"
Cohesion: 0.14
Nodes (17): AdminBreadcrumb, AdminNavGroup, adminNavGroups, AdminNavItem, adminNavItems, AdminRouteReadiness, getAdminNavItemByHref(), getVisibleAdminNavGroups() (+9 more)

### Community 43 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, bcrypt, @nestjs/core, @nestjs/jwt, @nestjs/platform-express, passport, passport-jwt, pg (+13 more)

### Community 44 - "api-response.ts"
Cohesion: 0.15
Nodes (12): ApiErrorEnvelope, fail(), ERROR_CODES, getExceptionType(), getRequestId(), getSafeMessage(), GlobalExceptionFilter, HttpExceptionBody (+4 more)

### Community 45 - ".update"
Cohesion: 0.11
Nodes (12): AppTuitionServicesController, AppTuitionSummaryController, Body, Controller, Get, Param, Patch, Post (+4 more)

### Community 46 - "student-context.service.ts"
Cohesion: 0.18
Nodes (8): AccountSwitchOptionDto, StudentSummaryDto, SwitchStudentResponseDto, StudentContextServiceMock, LinkWithStudent, StudentContextService, StudentRecord, Injectable

### Community 47 - "parseApiResponse"
Cohesion: 0.14
Nodes (19): busTrackingSchema, clubSchema, clubsResponseSchema, fetchBusTracking(), fetchClubs(), fetchMeals(), fetchSurveys(), fetchUniforms() (+11 more)

### Community 48 - "tuition.client.ts"
Cohesion: 0.16
Nodes (15): charge, createMock, listMock, result, sessionUser, updateMock, createTuitionCharge(), getTuitionCharge() (+7 more)

### Community 49 - "student-administration.controller.ts"
Cohesion: 0.16
Nodes (14): StudentAdministrationController, Body, Controller, Get, Param, Patch, Post, Put (+6 more)

### Community 50 - "teacher-capacity-panel.tsx"
Cohesion: 0.15
Nodes (10): Badge(), BadgeProps, Panel(), PanelProps, studentFollowUps, StudentFollowUpItem, stateStyles, teacherCapacity (+2 more)

### Community 51 - "timetable.client.ts"
Cohesion: 0.19
Nodes (13): useCurrentAcademicContextQuery(), monday(), TimetablePage(), timetable, useAdminTimetableQuery(), useSaveTimetableMutation(), AdminTimetable, SaveTimetablePayload (+5 more)

### Community 52 - "proxy.ts"
Cohesion: 0.17
Nodes (9): metadata, LoginPage(), { replace, refresh, signIn }, safeCallbackUrl(), AuthTokenState, isUsableAuthToken(), config, getCookieName() (+1 more)

### Community 53 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, db:push, db:reset, db:seed, format, lint, prisma:generate (+10 more)

### Community 54 - "ok"
Cohesion: 0.31
Nodes (3): ok(), AcademicContextService, Injectable

### Community 55 - "grades-page.tsx"
Cohesion: 0.20
Nodes (11): useSemestersQuery(), GradesPage(), ScoreStatInput, summarizeScores(), scores, useSaveRewardMutation(), useSaveScoreMutation(), useScoresQuery() (+3 more)

### Community 56 - "PROJECT PLANS"
Cohesion: 0.11
Nodes (17): 2026-07-07 - vi-feature-modules-dashboard, 2026-07-08 - replace-admin-with-stitch-edumanager-template, 2026-07-08 - route-stitch-edumanager-admin-pages, 2026-07-13 - admin-module-boundary-refactor, PROJECT PLANS, Remaining blockers / risks, Remaining blockers / risks, Remaining blockers / risks (+9 more)

### Community 57 - "users.client.ts"
Cohesion: 0.22
Nodes (12): createUser(), disableUser(), getUser(), listSchema, listUsers(), mutate(), resetUserPassword(), fetchMock (+4 more)

### Community 58 - "dependencies"
Cohesion: 0.12
Nodes (17): @dangminhdev04032005/query-resource, dependencies, @dangminhdev04032005/query-resource, next, next-auth, react, react-dom, sweetalert2 (+9 more)

### Community 59 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint-config-next, devDependencies, eslint, eslint-config-next, jsdom, @testing-library/jest-dom, @types/node, @types/react (+9 more)

### Community 60 - "feedback-page.test.tsx"
Cohesion: 0.21
Nodes (9): FeedbackPage(), detailMock, listMock, sessionUser, updateMock, feedback, useFeedbackDetailQuery(), useFeedbackQuery() (+1 more)

### Community 61 - "notifications-page.tsx"
Cohesion: 0.20
Nodes (9): emptyForm, NotificationsPage(), queryMock, updateMock, notifications, useCreateNotificationMutation(), useNotificationsQuery(), useUpdateNotificationMutation() (+1 more)

### Community 62 - "student-detail-page.test.tsx"
Cohesion: 0.14
Nodes (10): getStudentAttendance(), getAttendanceMock, getBusMock, getScoresMock, getStudentMock, listTuitionMock, sessionUser, updateStudentMock (+2 more)

### Community 63 - "feedback.client.ts"
Cohesion: 0.18
Nodes (13): FeedbackItem, feedbackItemSchema, FeedbackList, FeedbackListQuery, feedbackListQuerySchema, feedbackListSchema, FeedbackStatus, feedbackStatusSchema (+5 more)

### Community 64 - "web_cloneMYLTV Rules"
Cohesion: 0.12
Nodes (15): 1. Documentation Rules, 1. Documentation Rules, 2. Repository / Dependency Rules, 2. Repository / Dependency Rules, 3. Architecture Rules, 3. Architecture Rules, 4. Backend Rules, 4. Backend Rules (+7 more)

### Community 65 - "academic-context.service.ts"
Cohesion: 0.17
Nodes (13): CurrentAcademicYearRecord, CurrentSemesterRecord, CreateAcademicYearDto, createAcademicYearSchema, CreateSemesterDto, createSemesterSchema, dateSchema, nonEmptyString (+5 more)

### Community 66 - ".update"
Cohesion: 0.17
Nodes (8): AppAttendanceController, StudentAttendanceController, Body, Controller, Get, Param, Patch, Post

### Community 67 - "users-page.tsx"
Cohesion: 0.19
Nodes (6): message(), UsersPage(), useCreateUserMutation(), users, useUsersQuery(), userResource

### Community 68 - "scores.client.ts"
Cohesion: 0.24
Nodes (12): getScores(), getStudentRewards(), getStudentScores(), getStudentScoreSummary(), RewardDiscipline, rewardDisciplineSchema, saveRewardDiscipline(), saveScore() (+4 more)

### Community 69 - "RoleController"
Cohesion: 0.31
Nodes (7): RoleController, Body, Controller, Param, Patch, Post, Put

### Community 70 - "PROJECT RULES"
Cohesion: 0.14
Nodes (13): API Logging Rule (Mandatory), API Transport Rule (Mandatory), Auth & Routing Rules, Change Tracking Rule (Mandatory), Core Rules, Data Fetching, Execution Contract (Mandatory), Git Commit Rule (Mandatory) (+5 more)

### Community 71 - "homeworks.client.ts"
Cohesion: 0.23
Nodes (11): archiveHomework(), createHomework(), CreateHomeworkPayload, HomeworkItem, homeworkItemSchema, homeworkListSchema, HomeworkQuery, listHomeworks() (+3 more)

### Community 72 - "web_cloneMYLTV Plans"
Cohesion: 0.15
Nodes (12): Current Architecture Direction, Historical Notes, Known Risks, P0 — Contract SSOT & Verification Baseline, P1 — Identity & Access, P2 — User Management, P3 — News Pilot & Communication, P4 — Context Migration & App Integration (+4 more)

### Community 73 - "jest"
Cohesion: 0.15
Nodes (13): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+5 more)

### Community 74 - "RoleService"
Cohesion: 0.22
Nodes (7): isPermissionKey(), RoleService, Injectable, CreateRoleDto, ReplaceRolePermissionsDto, UpdateRoleDto, UpdateRoleStatusDto

### Community 75 - "events-page.tsx"
Cohesion: 0.28
Nodes (7): EventStatInput, summarizeEvents(), EventsPage(), events, useAdminEventsQuery(), useCreateAdminEventMutation(), useDeleteAdminEventMutation()

### Community 76 - "academic-context.client.ts"
Cohesion: 0.21
Nodes (9): academicContext, useAcademicContextQuery(), AcademicContext, academicContextSchema, getCurrentAcademicContext(), mapPeriod(), periodSchema, fetchMock (+1 more)

### Community 77 - "Bounded Context Endpoint Map"
Cohesion: 0.15
Nodes (12): Academics, API Catalog v1 (School App), Billing, Bounded Context Endpoint Map, Communication, Envelope And Authorization, Identity & Access, Notes For Consumers (+4 more)

### Community 78 - "Backend Guide"
Cohesion: 0.17
Nodes (11): 10. Quality Gates, 1. Purpose, 2. Strategic Direction, 3. Standard Module Shape, 4. Bounded Context Ownership, 5. Controller Rules, 6. Application Service Rules, 7. Persistence Rules (+3 more)

### Community 79 - "2026-07-18 — Student detail tabs, profile UI, Tuition integration, and UAT account provisioning"
Cohesion: 0.17
Nodes (11): 2026-07-18 — Student detail tabs, profile UI, Tuition integration, and UAT account provisioning, Billing / Tuition, Completed Delivery Records, Delivered behavior, Direct database UAT accounts and roles, Remaining limitation, Scope preservation, Status (+3 more)

### Community 80 - "verify-contract.cjs"
Cohesion: 0.17
Nodes (11): frontendMirror, frontendMirrorPath, fs, jsonPath, mirror, mirrorPath, path, root (+3 more)

### Community 81 - "web_cloneMYLTV Architecture"
Cohesion: 0.18
Nodes (10): 1. Executive Decision, 2. Runtime Model, 3. Repository Shape, 4. Dependency Direction, 5. Bounded Context Direction, 6. Platform Core First, 7. Contract Boundary, 8. Microservice Extraction Position (+2 more)

### Community 82 - "app.controller.ts"
Cohesion: 0.29
Nodes (5): AppController, Controller, Get, AppService, Injectable

### Community 83 - "AuthController"
Cohesion: 0.27
Nodes (6): OpenController, Public(), AuthController, Body, Controller, Post

### Community 84 - "account.service.spec.ts"
Cohesion: 0.18
Nodes (8): AccountRecord, FindAccount, FindAccountArgs, PermissionGrant, RevokeRefreshSessions, RevokeRefreshSessionsArgs, UpdateAccount, UpdateAccountArgs

### Community 85 - "AuditController"
Cohesion: 0.18
Nodes (8): AuditController, Controller, Get, Query, validateListAuditLogsQuery(), isSensitiveKey(), redactMetadata(), SENSITIVE_KEY_PATTERNS

### Community 86 - "student-administration.service.ts"
Cohesion: 0.27
Nodes (9): ReplaceStudentAccountsRequestDto, ReplaceStudentAccountsResponseDto, StudentDetailDto, StudentGenderDto, StudentGuardianContactDto, StudentGuardianRelationshipDto, StudentListResponseDto, CreateStudentFields (+1 more)

### Community 87 - "UserManagementController"
Cohesion: 0.31
Nodes (6): Body, Controller, Param, Patch, Post, UserManagementController

### Community 88 - "homeworks-page.tsx"
Cohesion: 0.31
Nodes (6): HomeworksPage(), homeworks, useArchiveHomeworkMutation(), useCreateHomeworkMutation(), useHomeworksQuery(), homeworksResource

### Community 89 - "Contract Guide"
Cohesion: 0.20
Nodes (9): 1. Purpose, 2. Source of Truth, 3. Global API Conventions, 4. Envelope Policy, 5. Endpoint Grouping, 6. Contract Change Policy, 7. Validation Policy, 8. Migration To OpenAPI (+1 more)

### Community 90 - "Frontend Guide"
Cohesion: 0.20
Nodes (9): 1. Purpose, 2. Target Shape, 3. Route Rules, 4. Feature Module Standard, 5. Data / API Rules, 6. Session / Security Rules, 7. Contract Alignment, 8. Runtime Rules (+1 more)

### Community 91 - "Integration Guide"
Cohesion: 0.20
Nodes (9): 1. Purpose, 2. Current Decision, 3. What Makes Extraction Easier, 4. Future Integration Options, 5. Extraction Criteria, 6. Extraction Steps, 7. Extraction Readiness Checklist, 8. What Not To Do Early (+1 more)

### Community 92 - "backend/README.md"
Cohesion: 0.20
Nodes (9): Compile and run the project, Deployment, Description, License, Project setup, Resources, Run tests, Stay in touch (+1 more)

### Community 93 - "academic-structure.service.spec.ts"
Cohesion: 0.20
Nodes (9): MockAcademicYearDelegate, MockAccountDelegate, MockAuditService, MockClassEnrollmentDelegate, MockFn, MockGradeLevelDelegate, MockPrismaClient, MockSchoolClassDelegate (+1 more)

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

### Community 99 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, eslint-config-prettier, @eslint/js, @types/supertest, typescript, typescript, eslint-config-prettier, @eslint/js (+1 more)

### Community 100 - "PermissionService"
Cohesion: 0.28
Nodes (4): PermissionGuard, Injectable, PermissionService, Injectable

### Community 101 - "AuthService"
Cohesion: 0.42
Nodes (3): AuthService, Injectable, RefreshTokenResponseDto

### Community 102 - "AdminEventsController"
Cohesion: 0.22
Nodes (4): AdminEventsController, Controller, Delete, Patch

### Community 103 - "Frontend Architecture"
Cohesion: 0.22
Nodes (8): Application structure, Authentication and session model, Core layer, Data and API layering, Feature architecture, Folder Structure, Frontend Architecture, Overview

### Community 104 - "Contract Changes"
Cohesion: 0.22
Nodes (8): 0.1.0, 0.1.1, 1.0.0 - 2026-07-13, Contract Changes, Unreleased - 2026-07-13, Unreleased - 2026-07-16, Unreleased - 2026-07-25, Unreleased - 2026-07-26

### Community 105 - "Module Map"
Cohesion: 0.25
Nodes (7): API Direction, Bounded Contexts, Dependency Direction, Extraction Notes, Module Map, Ownership Rules, When To Add A New Module

### Community 106 - "exclude"
Cohesion: 0.25
Nodes (7): exclude, extends, node_modules, dist, **/*spec.ts, test, ./tsconfig.json

### Community 107 - "DESIGN.md"
Cohesion: 0.25
Nodes (7): Brand & Style, Colors, Components, Elevation & Depth, Layout & Spacing, Shapes, Typography

### Community 108 - "api-contract/package.json"
Cohesion: 0.25
Nodes (7): description, license, name, private, scripts, verify, version

### Community 109 - "backend/package.json"
Cohesion: 0.29
Nodes (6): author, description, license, name, private, version

### Community 110 - "student-context.service.spec.ts"
Cohesion: 0.33
Nodes (3): AuthTokenServiceMock, linkRecord(), studentRecord()

### Community 111 - "Agent Instructions for web_cloneMYLTV"
Cohesion: 0.33
Nodes (5): Agent Instructions for web_cloneMYLTV, Before Final Report, Enforceable Coding Rules, Project Direction, Required Reading Before Changes

### Community 112 - "web_cloneMYLTV Architecture Docs"
Cohesion: 0.33
Nodes (5): Current Strategic Direction, Documents, Read Order For AI/Developers, Task Routing Table, web_cloneMYLTV Architecture Docs

### Community 113 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 114 - "StudentContextController"
Cohesion: 0.40
Nodes (3): StudentContextController, Controller, Get

### Community 115 - "School API Contract Sync Package"
Cohesion: 0.33
Nodes (5): Consumer Rules, Frontend Handoff, School API Contract Sync Package, Structure, Verify

### Community 117 - "Implementation Status"
Cohesion: 0.40
Nodes (4): Bounded-Context Matrix, Implementation Status, Status Change Rule, Status Legend

### Community 118 - "FailureController"
Cohesion: 0.50
Nodes (3): FailureController, Controller, Get

### Community 120 - "authenticated-backend.test.ts"
Cohesion: 0.50
Nodes (3): readAuthToken, refreshAuthTokenSingleFlight, writeAuthToken

### Community 121 - "front-end/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **834 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+829 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `id` connect `auth-api.ts` to `tuition.service.ts`?**
  _High betweenness centrality (0.289) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _834 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `authenticated-user.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056338028169014086 - nodes in this community are weakly interconnected._
- **Should `timetable-homework.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0741745816372682 - nodes in this community are weakly interconnected._
- **Should `auth-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061581920903954805 - nodes in this community are weakly interconnected._
- **Should `NotificationsService` be split into smaller, more focused modules?**
  _Cohesion score 0.0771478667445938 - nodes in this community are weakly interconnected._
- **Should `successSchema` be split into smaller, more focused modules?**
  _Cohesion score 0.06328320802005012 - nodes in this community are weakly interconnected._