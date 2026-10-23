# agents-ui

> **Retired on 2026-10-23.** agents-api, agents-ui and the agent runners were
> parked at zero replicas on 2026-09-01, when Hermes replaced them, and the
> operator retired them on 2026-10-23. JorisJonkers-dev/fleet-infra#531 removes
> them from the cluster. Nothing deploys from this repository any more; it is
> kept for its history. Whether to archive it is the operator's call.

Vue/Vite web and native shell interface for the JorisJonkers.dev agent
platform.

## What It Is

`agents-ui` is a source-available Vue application for agent workspaces,
sessions, repositories, projects, and credential setup. It consumes the
published `agents-api` and `auth-api` client packages and shared UI primitives
from `@jorisjonkers-dev/vue-web-commons`.

## Local Use

```bash
pnpm install
pnpm test
pnpm dev
```

GitHub Packages access is required for private `@jorisjonkers-dev` packages.

## Related

- API: [`agents-api`](https://github.com/JorisJonkers-dev/agents-api)
- Auth API: [`auth-api`](https://github.com/JorisJonkers-dev/auth-api)
- Shared UI package: [`@jorisjonkers-dev/vue-web-commons`](https://github.com/JorisJonkers-dev/vue-web-commons)

## Links

- [Organization profile](https://github.com/JorisJonkers-dev)
- [Security policy](https://github.com/JorisJonkers-dev/.github/security/policy)
- [License](./LICENSE)

Copyright (c) Joris Jonkers. Source available for viewing only; use, copying,
modification, redistribution, deployment, or reuse is not licensed. See
[LICENSE](./LICENSE).
