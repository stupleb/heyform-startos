ARG IMAGE
FROM ${IMAGE}
# The base image's CA store is only as current as its last release.
RUN apk upgrade --no-cache ca-certificates-bundle \
 && ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr /etc/ssl/certs/ca-certificates.crt
# Node otherwise trusts its compiled-in roots instead of the system store.
ENV NODE_OPTIONS=--use-openssl-ca
RUN node -e "process.exit(require('tls').getCACertificates('default').some((p) => p.includes('MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr')) ? 1 : 0)"
