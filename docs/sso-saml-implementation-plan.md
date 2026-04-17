# SSO/SAML Implementation Plan (Step 72)

## 1. Objective

Define a production-ready SSO/SAML architecture for Team and Enterprise organizations so customer-managed identity providers (IdPs) can authenticate users into GitHub Mastery Ecosystem with centralized access control.

## 2. Scope

### In scope
- SAML 2.0 Service Provider (SP) integration for organization-scoped sign-in.
- Organization-level SSO configuration lifecycle (draft, verified, enabled, disabled).
- IdP metadata ingestion and certificate rotation handling.
- Just-in-time (JIT) membership linking for known organization domains and configured claims.
- Audit events for SSO configuration and authentication outcomes.
- Backward-compatible coexistence with existing OAuth + email-based identity flows.

### Out of scope (handled in later steps)
- SCIM lifecycle provisioning and deprovisioning (Step 73).
- End-user self-service account linking UI beyond minimal required controls.
- Full enterprise governance policy center and advanced org controls (Step 78).

## 3. Architecture Decisions

## 3.1 Identity model
- Keep existing `User` as the principal identity.
- Add an `SsoConnection` model keyed by organization:
  - protocol (`saml`)
  - status (`draft|verified|enabled|disabled`)
  - entity identifiers (SP + IdP)
  - ACS URL and audience
  - certificates (active + next for rotation)
  - claim mapping config (email, firstName, lastName, displayName, groups)
  - enforcement mode (`optional|required`)
- Add `SsoLoginEvent` audit model:
  - organizationId, connectionId, userId (nullable), emailClaim, outcome, reason, ip, userAgent, timestamp.

## 3.2 Request/response flow
1. User selects organization SSO entry point (e.g. `/sso/{orgSlug}`).
2. SP creates signed AuthnRequest and redirects to IdP SSO endpoint.
3. IdP posts SAML response to ACS endpoint (`/api/v1/sso/saml/acs`).
4. SP validates:
   - signature (expected cert)
   - issuer/entity ID
   - audience restriction
   - destination ACS URL
   - time bounds (`NotBefore` / `NotOnOrAfter`)
   - optional InResponseTo correlation
5. SP maps claims to canonical user profile fields.
6. Membership resolution:
   - locate user by verified email
   - if missing and JIT enabled, create user
   - verify org membership eligibility from mapping rules
7. Issue platform session and redirect to org dashboard.
8. Emit audit event for success/failure.

## 3.3 Coexistence and enforcement
- Existing OAuth providers remain active.
- Organization-level policy controls SSO enforcement:
  - `optional`: OAuth allowed.
  - `required`: org members must authenticate via SSO for org routes and org-admin actions.
- Admin break-glass path remains available for platform admins.

## 4. Data model plan

Add the following entities in Prisma (exact field names can be tuned during implementation):

- `SsoConnection`
  - `id`, `organizationId`, `protocol`, `status`
  - `idpEntityId`, `idpSsoUrl`, `idpCertificatePem`, `idpCertificateNextPem?`
  - `spEntityId`, `spAcsUrl`, `audience`
  - `attributeMapping` (JSON)
  - `enforcementMode`
  - `createdAt`, `updatedAt`, `verifiedAt?`, `enabledAt?`

- `SsoLoginEvent`
  - `id`, `organizationId`, `ssoConnectionId`
  - `userId?`, `emailClaim?`, `nameId?`
  - `outcome` (`success|rejected|error`)
  - `failureCode?`, `details` (JSON)
  - `ipAddress?`, `userAgent?`, `createdAt`

Recommended indexes:
- `SsoConnection.organizationId` unique (one active SAML config per org initially).
- `SsoLoginEvent.organizationId, createdAt` for audit pagination.
- `SsoLoginEvent.outcome, createdAt` for operational reporting.

## 5. API plan

Versioned endpoints:
- `GET /api/v1/org/sso/saml` — fetch org SSO config summary.
- `POST /api/v1/org/sso/saml` — create/update draft config.
- `POST /api/v1/org/sso/saml/verify` — run metadata/certificate/issuer validation checks.
- `POST /api/v1/org/sso/saml/enable` — enable enforcement mode.
- `POST /api/v1/org/sso/saml/disable` — disable SSO enforcement.
- `GET /api/v1/org/sso/saml/events` — list auth audit events with filters.

Public/auth endpoints:
- `GET /sso/{orgSlug}` — initiate SAML login.
- `POST /api/v1/sso/saml/acs` — assertion consumer endpoint.

Legacy aliases under `/api/org/*` should include deprecation headers when introduced.

## 6. Security controls and compliance requirements

- Validate XML signatures against pinned IdP cert.
- Reject unsigned assertions and weak signature algorithms.
- Enforce strict destination/audience matching.
- Protect against replay by storing assertion IDs with TTL and rejecting duplicates.
- Enforce narrow clock skew tolerance.
- Encrypt SSO secrets/certs at rest (KMS-backed encryption in production).
- Log all SSO configuration mutations and login outcomes in immutable audit trail.
- Apply rate limiting and bot protection on ACS endpoint.
- Include incident response runbook for IdP compromise and certificate rollover.

## 7. Operational requirements

- Provide metadata download endpoint for customer IdP setup.
- Support certificate rotation with dual-cert validation window.
- Track configuration health:
  - cert expiry horizon alerts (30/14/7 days)
  - verification status in org admin UI
- Add dashboard metrics:
  - SSO login success rate
  - rejected assertions by reason
  - organizations with expiring certificates

## 8. Rollout plan

1. **Phase A (internal)**: schema + feature flags + non-enforcing draft config APIs.
2. **Phase B (beta orgs)**: verification flow + ACS integration for allowlisted orgs.
3. **Phase C (general availability)**: enforceable mode for Team/Enterprise orgs.
4. **Phase D (hardening)**: cert-rotation alerts, replay telemetry, and runbook drills.

Feature flags:
- `SSO_SAML_ENABLED`
- `SSO_SAML_ENFORCEMENT_ENABLED`
- `SSO_SAML_JIT_ENABLED`

## 9. Testing strategy

### Unit tests
- claim mapping parser
- assertion validation logic (issuer/audience/time/signature)
- enforcement policy decisions

### Integration tests
- SSO config create/verify/enable/disable routes
- ACS processing success/failure paths
- JIT user creation and membership linking
- replay attack rejection

### End-to-end tests
- IdP-initiated and SP-initiated login journeys
- enforced org route access with SSO required
- fallback behavior when SSO disabled

## 10. Risks and mitigations

- **Risk:** misconfigured claim mapping prevents account resolution.  
  **Mitigation:** pre-enable verification checks and dry-run claim previews.

- **Risk:** certificate expiry causes login outage.  
  **Mitigation:** expiry alerting + dual-cert rotation support.

- **Risk:** over-strict enforcement locks out org admins.  
  **Mitigation:** platform-admin break-glass path and staged enforcement toggle.

- **Risk:** XML signature handling vulnerabilities.  
  **Mitigation:** vetted SAML library, strict parser config, and security review.

## 11. Dependencies

- Step 71 organization provisioning model (completed).
- Step 73 SCIM plan for full identity lifecycle (next).
- Security controls from Phase 9 (rate limiting, incident runbook, secret scanning).

## 12. Definition of done for Step 72

Step 72 is complete when:
- this implementation plan is documented and linked in project docs,
- SSO/SAML scope and architecture decisions are explicit,
- security/rollout/testing requirements are defined for implementation in subsequent steps.
