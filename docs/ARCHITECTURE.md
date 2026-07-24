# Architecture

The Express application follows routes → controllers → services → Prisma repositories/models. Validation middleware executes before controllers, and the service layer owns authorization boundaries. The Next App Router client uses React Query for API state and Zustand only for in-memory access-token state. Shared Zod schemas live in `packages/shared`.

Detection is dependency-inverted behind `DetectionProvider`; only the simulation provider knows how matches are constructed. Alert creation uses a confidence threshold of 0.80, with 0.92+ marked critical. This threshold is a documented product assumption and should be tuned with real detection data.
