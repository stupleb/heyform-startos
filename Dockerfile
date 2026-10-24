ARG IMAGE
FROM ${IMAGE}
# The base image's CA store is only as current as its last release.
RUN apk upgrade --no-cache ca-certificates-bundle \
 && ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr /etc/ssl/certs/ca-certificates.crt
# Node otherwise trusts its compiled-in roots instead of the system store.
ENV NODE_OPTIONS=--use-openssl-ca
# Upstream's Node predates the October 2026 security release.
COPY --from=node:22.23.4-alpine3.23 /usr/local/bin/node /usr/local/bin/node
ENV NODE_VERSION=22.23.4
RUN [ "$(node --version)" = v22.23.4 ]
RUN node -e "process.exit(require('tls').getCACertificates('default').some((p) => p.includes('MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr')) ? 1 : 0)"
