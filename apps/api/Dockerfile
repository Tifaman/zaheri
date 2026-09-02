# Built with the repo root as context (see render.yaml's dockerContext),
# since this is a pnpm workspace — @zaheri/api depends on @zaheri/types via
# a workspace symlink that only resolves correctly if node_modules is
# installed at the workspace root, not from within apps/api alone.
#
# Node 22, not 20: the root package.json pins packageManager to
# pnpm@11.24.0, which requires Node >=22.13 — corepack fails on Node 20
# (throws on a missing node:sqlite builtin) even though the app code
# itself only needs Node >=20.
FROM node:22

RUN corepack enable
WORKDIR /repo

COPY . .
RUN pnpm install --frozen-lockfile

# Must run before the build: PrismaService imports from the generated
# client's output path, so tsc/nest build needs it to already exist.
RUN pnpm --filter @zaheri/api exec prisma generate

# '...' selects @zaheri/api and the workspace deps it needs (@zaheri/types),
# building both in dependency order — apps/web is untouched.
RUN pnpm --filter @zaheri/api... run build

WORKDIR /repo/apps/api
EXPOSE 3000
# Render's free tier doesn't support preDeployCommand, so migrations (and
# the upsert-based seed) run on every container start instead — both are
# idempotent, so this is safe to repeat on every boot/redeploy.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && (pnpm run seed; node dist/main.js)"]
