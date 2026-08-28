---
title: On-call runbook
description: Template for an incident runbook — replace the contents, keep the shape.
icon: 🚨
section: Operations
order: 1
tags: [oncall, incident, template]
status: review
updated: 2026-08-20
owner: Ana Ruiz
---

## Scope

This page is a **shape to copy**, not real procedure. Replace every section
below with the client's actual process.

## First fifteen minutes

1. **Acknowledge** the page so the rotation knows it's owned.
2. **Assess** — is this user-visible? How many users? Which regions?
3. **Communicate** before you debug. Post in the incident channel with: what's
   broken, who's on it, when you'll next update.
4. **Mitigate before you diagnose.** Roll back first, understand later.

## Severity levels

| Level | Definition                          | Response                    |
| ----- | ----------------------------------- | --------------------------- |
| SEV1  | Complete outage or data loss        | Page immediately, all hands |
| SEV2  | Major feature broken, no workaround | Page during business hours  |
| SEV3  | Degraded, workaround exists         | Next business day           |

## Escalation

If you cannot mitigate within 30 minutes, escalate. Escalating is not failure —
sitting on a SEV1 alone is.

## After

Every SEV1 and SEV2 gets a written postmortem within five working days. Blameless:
the goal is a changed system, not a changed person.

## Related

- [[engineering/deploy]] — how rollbacks work
- [[handbook/onboarding]] — how new engineers join the rotation
