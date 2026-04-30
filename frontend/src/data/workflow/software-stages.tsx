import type { SVGProps } from "react";
import type { Stage } from "./types";

// ---------------------------------------------------------------------------
// Software Engineering (backend-specialized) — the loop I ran at
// Javanan Sharq and Raimo Studio.
// ---------------------------------------------------------------------------

function baseProps(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: "0 0 40 40",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

function RequirementsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <rect x="10" y="6" width="20" height="28" rx="1.5" />
      <line x1="14" y1="12" x2="26" y2="12" />
      <line x1="14" y1="17" x2="26" y2="17" />
      <line x1="14" y1="22" x2="26" y2="22" />
      <line x1="14" y1="27" x2="22" y2="27" />
      <circle cx="12" cy="6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DevelopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path d="M14 12 L7 20 L14 28" />
      <path d="M26 12 L33 20 L26 28" />
      <line x1="22" y1="9" x2="18" y2="31" />
    </svg>
  );
}

function DataIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <ellipse cx="20" cy="10" rx="11" ry="4" />
      <path d="M9 10 V20 C9 22 14 24 20 24 C26 24 31 22 31 20 V10" />
      <path d="M9 20 V30 C9 32 14 34 20 34 C26 34 31 32 31 30 V20" />
    </svg>
  );
}

function DeployIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="10" cy="20" r="3" />
      <circle cx="30" cy="20" r="3" />
      <line x1="13" y1="20" x2="27" y2="20" />
      <path d="M18 15 L22 20 L18 25" />
      <line x1="10" y1="8" x2="10" y2="17" />
      <line x1="30" y1="23" x2="30" y2="32" />
    </svg>
  );
}

function MonitorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <rect x="5" y="8" width="30" height="20" rx="1.5" />
      <line x1="5" y1="24" x2="35" y2="24" />
      <path d="M9 22 L14 17 L18 20 L23 12 L28 19 L31 16" />
      <line x1="16" y1="28" x2="24" y2="28" />
      <line x1="14" y1="32" x2="26" y2="32" />
    </svg>
  );
}

export const SOFTWARE_STAGES: Stage[] = [
  {
    key: "requirements",
    label: "Requirements & Design",
    desc: "Gather, model, design.",
    overview:
      "Business intent becomes a contract. Stakeholder interviews turn into user stories; user stories become bounded contexts, entity models, API shapes, and transaction boundaries. Non-functional budgets (latency, throughput, cost) get written down so they can be measured. The design survives review from engineering and product before any code ships.",
    Icon: RequirementsIcon,
    subStages: [
      {
        id: "discovery",
        label: "Discovery · Stakeholder Interviews",
        detail:
          "Sit with product, ops, and the users who'll actually touch the feature. Capture intent, not requirements — requirements come later. Write short user stories with acceptance criteria so the team can argue about the edges before the ticket gets built. Flag policy, compliance, and data-residency constraints early; they're almost always the hidden cost.",
        standards: ["INVEST", "BDD"],
      },
      {
        id: "domain",
        label: "Domain Modeling · DDD",
        detail:
          "Sketch aggregates, entities, and value objects on a whiteboard until the domain experts nod. Pick ubiquitous-language names that survive into the code. Draw bounded contexts and their integration points — synchronous API, event, or shared data. Most bugs three months from now live on the seams you draw today.",
        standards: ["DDD", "Hexagonal Architecture"],
      },
      {
        id: "api",
        label: "API Design · Contracts",
        detail:
          "Define the public shape: REST resources or RPC endpoints, request/response schemas, pagination, idempotency keys, problem+json error shapes. Write the OpenAPI/proto before the handler — consumers start their work in parallel. Version the contract from day one so breaking changes are intentional.",
        standards: ["OpenAPI 3", "RFC 7807", "SemVer"],
      },
      {
        id: "schema",
        label: "Schema & Migration Plan",
        detail:
          "Tables, indexes, foreign keys, constraints — designed against the query patterns, not hopeful generality. Write the first migration and the rollback at the same time. Pick a migration runner and commit to the forward-compatible rule so deploys never block on a manual step.",
        standards: ["ACID", "Postgres / MySQL best practice"],
      },
      {
        id: "nfr",
        label: "Non-Functional Budgets",
        detail:
          "Put numbers on latency (p50/p95/p99), throughput, error budget, cost-per-request, and availability targets. Budgets are promises: every architectural choice from here has to defend itself against them. Review with SRE / ops so there are no surprises in staging.",
        standards: ["SRE golden signals", "SLI / SLO"],
      },
    ],
  },
  {
    key: "develop",
    label: "Development",
    desc: "Build, test, review.",
    overview:
      "Short-lived branches. Tests land with the feature — unit for logic, integration for handlers, contract tests for anything crossing a boundary. Code review is adversarial on correctness, security, and performance, then collaborative on readability. Merges keep trunk green. No exceptions.",
    Icon: DevelopIcon,
    subStages: [
      {
        id: "branch",
        label: "Feature Branch · TDD Loop",
        detail:
          "Cut a short-lived branch named after the ticket. Drive implementation red-green-refactor: write the failing test first so design pressure comes from the test, not the shipping date. Commit often, rebase on main, rerun the local suite before pushing.",
        standards: ["Trunk-Based Development", "TDD"],
      },
      {
        id: "implement",
        label: "Implementation · .NET / Python",
        detail:
          "Clean architecture layers: domain → application → infrastructure. Dependency inversion at the boundaries so tests don't depend on the network. C# and .NET for the heavy services; Python for glue, scripting, and data pipelines. Keep functions small enough that a reviewer can hold the whole thing in their head.",
        standards: ["SOLID", "Clean Architecture", "12-Factor"],
      },
      {
        id: "tests",
        label: "Unit · Integration · Contract Tests",
        detail:
          "Fast unit tests own business logic and edge cases. Integration tests own handlers end-to-end against a real (ephemeral) database. Contract tests pin the shape between services so nobody ships a breaking change accidentally. Coverage is a floor, not a ceiling.",
        standards: ["xUnit / pytest", "Pact (contract)", "Testcontainers"],
      },
      {
        id: "review",
        label: "Code Review",
        detail:
          "Review for correctness first, security second, performance third, style last. Checklists for the dangerous cases — auth, input validation, secret handling, N+1 queries. A PR is a teaching opportunity in both directions; junior authors should leave PRs having learned something. Senior reviewers should too.",
        standards: ["OWASP Top 10", "Google Code Review Guide"],
      },
      {
        id: "merge",
        label: "Green CI · Merge",
        detail:
          "The merge gate runs the whole pipeline: build, lint, test, security scan, package. Trunk stays green so the deploy pipeline can fire on every merge. If CI flakes, fix the flake before the next feature lands — broken windows compound fast.",
        standards: ["Conventional Commits", "SemVer"],
      },
    ],
  },
  {
    key: "data",
    label: "Data & Storage",
    desc: "Model, migrate, query.",
    overview:
      "State is the hard part. Schemas evolve with the feature work. Migrations ship with the code, forward-compatible by default. Queries are explained and indexed against real query plans, not assumptions. Caching and backpressure isolate the database from every hot path.",
    Icon: DataIcon,
    subStages: [
      {
        id: "migrate",
        label: "Forward-Compatible Migrations",
        detail:
          "Never a schema change that requires code+DB to deploy together. Add columns nullable, write old + new, then cut over, then drop old. Migrations are small, reversible, run in CI against a copy of production, and ship with the code that uses them.",
        standards: ["Expand / Contract", "Zero-Downtime Deploys"],
      },
      {
        id: "query",
        label: "Query Optimization · Indexing",
        detail:
          "EXPLAIN every hot query. Pick indexes against the actual query patterns — covering indexes, partial indexes, expression indexes where they earn their keep. Catch N+1s in integration tests. Log slow queries in production and investigate before they become incidents.",
        standards: ["EXPLAIN / ANALYZE", "pg_stat_statements"],
      },
      {
        id: "cache",
        label: "Caching Strategy",
        detail:
          "Cache what's expensive and stale-tolerant. Redis for shared state, HTTP/CDN caching for public responses, in-process memoization for small-fan-out reads. Always think about invalidation — a cache bug is worse than no cache at all.",
        standards: ["Cache-Aside", "RFC 7234 (HTTP caching)"],
      },
      {
        id: "consistency",
        label: "Consistency · Transactions · Outbox",
        detail:
          "Pick a consistency model per bounded context. Inside one context, relational transactions. Across contexts, choose between strong coordination (2PC, rare) or eventual consistency with saga / outbox. The outbox pattern turns 'write DB + publish event' into a single durable commit.",
        standards: ["ACID", "Outbox Pattern", "Saga"],
      },
      {
        id: "observability",
        label: "Observability of Data",
        detail:
          "Structured logs from the DB driver, metrics on every query class, traces that span code → DB → back. Dashboards on connection pool saturation, replication lag, index bloat. You want to know a storage problem is coming before it becomes a pager.",
        standards: ["OpenTelemetry", "RED / USE methods"],
      },
    ],
  },
  {
    key: "deploy",
    label: "CI/CD & Deploy",
    desc: "Package, pipeline, ship.",
    overview:
      "Every merge runs the whole pipeline. Build, test, scan, package into a container, deploy to staging, run smoke and contract tests, then promote to production with health gates. Raimo's pipeline cut our deploys from an hour to twenty-five minutes — pure discipline, no magic.",
    Icon: DeployIcon,
    subStages: [
      {
        id: "pipeline",
        label: "Build · Test Pipeline",
        detail:
          "Azure Pipelines / GitHub Actions wiring. Cache the dependency layer. Parallelize test suites. Fail fast on lint and unit; save heavy integration tests for after. Publish artifacts with the commit SHA baked in so any build is traceable back to source.",
        standards: ["Pipeline-as-Code", "Reproducible Builds"],
      },
      {
        id: "container",
        label: "Container Build · Image Scan",
        detail:
          "Docker multi-stage build: compile in a heavy layer, ship only the runtime artifacts in a slim distroless base. Scan the final image with Trivy / Grype before publish. SBOM generated and signed — supply chain attacks are real and increasingly cheap.",
        standards: ["OCI Image Spec", "SLSA", "Distroless"],
      },
      {
        id: "iac",
        label: "Infrastructure-as-Code",
        detail:
          "Kubernetes manifests / Helm charts checked into Git. Same templates promoted across staging and prod with environment-specific values. Secrets handled by a secret manager — never in the chart. Drift detection runs on a schedule; any out-of-band change pages someone.",
        standards: ["GitOps", "Kubernetes", "Helm"],
      },
      {
        id: "staging",
        label: "Staging Gates · Smoke · Canary",
        detail:
          "Deploy to staging automatically. Run smoke suite end-to-end against the deployed environment. Canary to a small fraction of prod traffic first; watch golden signals for a few minutes before scaling. Rollback is one click and always tested.",
        standards: ["Progressive Delivery", "Blue-Green"],
      },
      {
        id: "promote",
        label: "Prod Promotion · Health Gates",
        detail:
          "Promotion is automated after staging green. Health probes gate traffic during rollout. Feature flags decouple 'deployed' from 'released' — code in prod, off by default, flipped on when ops is ready. Nothing pushed on Friday after 3pm unless the building is on fire.",
        standards: ["Feature Flags", "Circuit Breakers"],
      },
    ],
  },
  {
    key: "monitor",
    label: "Monitor & Incident",
    desc: "Observe, alert, learn.",
    overview:
      "Production tells you when you're wrong. Golden signals on every service dashboard. Alerts tied to error budgets, not fixed thresholds. On-call rotations that people actually sleep through. Post-mortems that are blameless on culture and ruthless on prevention.",
    Icon: MonitorIcon,
    subStages: [
      {
        id: "dashboards",
        label: "Dashboards · Golden Signals",
        detail:
          "Every service ships with a dashboard showing latency, traffic, errors, and saturation (Google's four golden signals). Plus business metrics the service actually cares about. Dashboards are versioned as code, not clicked together in the UI.",
        standards: ["SRE Golden Signals", "USE Method"],
      },
      {
        id: "alerts",
        label: "Alerts · On-Call Rotation",
        detail:
          "Alerts page only when a human must act now; everything else goes to a ticket. Tied to error budgets and SLOs, not arbitrary thresholds. On-call rotation documented, with clear primary/secondary and a way to escalate. Runbooks link directly from the alert.",
        standards: ["SRE SLO / Error Budget", "PagerDuty / Opsgenie"],
      },
      {
        id: "incident",
        label: "Incident Response",
        detail:
          "Declared incidents have an Incident Commander, a scribe, and a comms lead — even in a team of four. Focus on mitigation first, diagnosis second. Status page updated as soon as customer impact is confirmed. Slack channel retained for the post-mortem.",
        standards: ["ICS (Incident Command)", "Blameless Post-mortem"],
      },
      {
        id: "postmortem",
        label: "Post-Mortem · Timeline · Actions",
        detail:
          "Within a week, write the timeline, the root cause, and the action items. Actions have owners and dates. 'Be more careful' is not an action. The document is shared across the org — institutional memory so the next team doesn't re-hit the same rake.",
        standards: ["Google SRE Post-mortem", "5 Whys"],
      },
      {
        id: "learning",
        label: "Continuous Learning · Feed-Back",
        detail:
          "Findings from incidents flow back into design reviews, runbooks, and — most importantly — pre-mortems for the next launch. Measure the second derivative: are we learning, or tripping on the same class of problem? If the latter, escalate to architecture, not engineers.",
        standards: ["Post-Incident Review"],
      },
    ],
  },
];
