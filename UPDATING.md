# Updating the upstream version

Upstream is HeyForm's official image on Docker Hub, `heyform/community-edition`,
pinned by tag in `startos/manifest/index.ts`. It is built from the
[heyform/heyform](https://github.com/heyform/heyform) release of the same name.
The database (`mongo`) and cache (`valkey/valkey`) images are pinned beside it
and bumped on their own.

## Determining the upstream version

HeyForm tags releases `vX.Y.Z` on GitHub and pushes the image with the same
tag, `v` included:

```bash
gh release view -R heyform/heyform --json tagName -q .tagName
curl -s "https://hub.docker.com/v2/repositories/heyform/community-edition/tags?page_size=10&ordering=last_updated" \
  | jq -r '.results[].name'
```

Ignore `latest` and the `-rc.N` tags. Confirm both architectures:

```bash
docker manifest inspect heyform/community-edition:vX.Y.Z | jq -r '.manifests[].platform.architecture'
```

## Applying the bump

1. Read the release notes and the diff of `packages/server/src/environments/index.ts`
   between the two tags. Every variable `startos/main.ts` sets must still exist
   under the same name.
2. Check what the package relies on beyond the environment:
   - `packages/server/src/utils/smtp/index.ts` still passes `SMTP_IGNORE_CERT`
     straight to `rejectUnauthorized`. If upstream fixes that inversion,
     `startos/main.ts` must switch to `false`.
   - The account script in `startos/utils.ts` loads
     `dist/src/model/user.model.js` (`UserSchema`, registered as `UserModel`)
     and `dist/src/utils/crypto.js` (`passwordHash`) from
     `/app/packages/server` in the image, and writes `password` and
     `isEmailVerified`. Run **Create or Reset Account** on the new image and
     sign in with the result.
   - `GET /health/ready` still exists, and uploads still land in
     `/app/packages/server/static/upload`.
   - `packages/server/package.json`: the `mongoose` version decides which
     MongoDB the `mongo` image may run (see below).
3. Set `images.heyform.source.dockerTag` to `heyform/community-edition:vX.Y.Z`.
4. In `startos/versions/current.ts`, set `version` to `X.Y.Z:0` (no `v`) and
   rewrite the release notes.

HeyForm needs no schema migrations; Mongoose applies model changes as
documents are written.

## The database and cache images

A new `mongo` 7.0 patch or Valkey patch is a tag change only. MongoDB must stay
within what HeyForm's MongoDB driver supports: today's `mongoose` ships driver
5.9, supported up to MongoDB 7.0. A MongoDB **major** also needs an existing
install's `featureCompatibilityVersion` raised before the new binary starts, so
it is a migration of its own, not part of a routine bump.
