# API Catalog v1 (School App)

Shared contract for Sổ Liên Lạc Điện Tử. Base path is `/api/v1`; external JSON fields use `snake_case`.

Path parameters use `{id}` for the primary resource when the resource segment already identifies it, such as `/students/{id}`. Do not put multiple IDs in one path; put secondary or action target IDs in the request body or query instead, such as `POST /students/{id}/homeworks/submit` with `homework_id` in the request body.

## Envelope And Authorization

All endpoints return:

```json
{ "success": true, "data": {}, "meta": {} }
```

Errors return:

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Human-readable message", "details": [] }, "request_id": "opaque-request-id" }
```

Authorization is intentionally lean. The contract uses fixed role policy plus student/class ownership scopes through `x-allowed-roles` and `x-scope`; it does not define a full RBAC administration surface.

## Bounded Context Endpoint Map

### Identity & Access

| Management UI | App/mobile | Purpose |
| --- | --- | --- |
| `POST /auth/login` | `POST /auth/login` | Login with username/password. |
| `POST /auth/refresh-token` | `POST /auth/refresh-token` | Refresh token. |
| `POST /auth/logout` | `POST /auth/logout` | Logout current device/session. |
| `GET /me` | `GET /me` | Current actor and active student id. |
| `PUT /me/password` | `PUT /me/password` | Change own password. |

### User Management

| Management UI | Compatibility | Purpose |
| --- | --- | --- |
| `GET /admin/users` | `GET /users` | List users. |
| `POST /admin/users` | `POST /users` | Create user. |
| `GET /admin/users/{id}` | `GET /users/{id}` | Read user detail. |
| `PATCH /admin/users/{id}` | `PATCH /users/{id}` | Update user. |
| `POST /admin/users/{id}/disable` | `POST /users/{id}/disable` | Disable user. |
| `POST /admin/users/{id}/reset-password` | `POST /users/{id}/reset-password` | Reset password with placeholder-only examples. |

### Student Administration

| Management UI | App/mobile | Purpose |
| --- | --- | --- |
| `GET /admin/students` | `GET /me/student` | Admin list feeds selected student profile display. |
| `POST /admin/students` | - | Create student. |
| `GET /admin/students/{id}` | `GET /me/accounts` | Student detail and linked student switcher data. |
| `PATCH /admin/students/{id}` | - | Update student. |
| `PUT /admin/students/{id}/accounts` | `POST /me/accounts/switch` | Manage and consume account-student links. |

### Communication

| Management UI | App/mobile | Purpose |
| --- | --- | --- |
| `/admin/news` | `GET /home/news` | Publish and display school news. |
| `GET/POST /admin/notifications`, `GET/PATCH /admin/notifications/{id}` | `GET /notifications`, `GET /notifications/{id}`, `PATCH /notifications/{id}/read` | Validated, permission-protected admin list/detail/create/update and app consumption. |
| `/admin/feedback` | `POST /feedback` | Review and submit feedback. |

### Academics

| Management UI | App/mobile | Purpose |
| --- | --- | --- |
| `/admin/attendance` | `GET /home/attendance/today`, `GET /students/{id}/attendance` | Attendance management and student display. |
| `/admin/timetable` | `GET /students/{id}/timetable` | Admin list/detail remains planned; app/student display route is separate and must not back the management UI. |
| `/admin/scores` | `GET /students/{id}/scores` | Admin list/detail remains planned; app/student display route is separate and must not back the management UI. |
| `/admin/homework` | `GET /students/{id}/homeworks`, `POST /students/{id}/homeworks/submit` | Admin list/detail/update/delete remains planned; student assignment/submission routes are separate. |
| `/admin/reward-discipline` | `GET /students/{id}/reward-discipline` | Admin list/detail remains planned; app/student display route is separate and must not back the management UI. |
| `/admin/online-study` | `GET /students/{id}/online-study` | Online study sessions. |

### Billing

| Management UI | App/mobile | Purpose |
| --- | --- | --- |
| `/admin/tuition` | `GET /home/tuition/summary`, `GET /services/tuition` | Tuition setup and display. |
| `/admin/payment-requests` | `POST /services/tuition/payment-request` | Payment request review and creation. |

### Student Services

| Management UI | App/mobile | Purpose |
| --- | --- | --- |
| `/admin/meals` | `GET /services/meals`, `POST /services/meals/register` | Meal service registration. |
| `/admin/events` | `GET /services/events`, `POST /services/events/{id}/register` | Events. |
| `/admin/surveys` | `GET /services/surveys`, `POST /services/surveys/{id}/submit` | Surveys. |
| `/admin/clubs` | `GET /services/clubs`, `POST /services/clubs/{id}/register` | Clubs. |
| `/admin/bus` | `GET /students/{id}/bus-route`, `GET /services/bus-tracking` | Bus assignment and tracking. |
| `/admin/uniforms` | `GET /services/uniforms`, `POST /services/uniforms/orders` | Uniform catalog and orders. |
| `/admin/coin-fund` | `GET /services/coin-fund` | Coin fund balance and transactions. |

### Shared Platform

| Management UI | App/mobile | Purpose |
| --- | --- | --- |
| `POST /uploads` | `POST /uploads` | Multipart upload for feedback, avatar, and attachments. |

## Notes For Consumers

- Prefer `/admin/...` endpoints for Management UI work.
- `/users` remains only as a compatibility surface while clients migrate.
- App/mobile endpoints are scoped to the active linked student unless the path explicitly includes a student `{id}`; the backend must enforce ownership.
- Generated clients should consume `openapi/v1/openapi.json` as the machine-readable source.
