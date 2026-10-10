<p align="center">
  <img src="icon.svg" alt="HeyForm Logo" width="21%">
</p>

# HeyForm on StartOS

> Everything not listed in this document should behave the same as upstream
> HeyForm. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[HeyForm](https://github.com/heyform/heyform) is an open-source form builder for conversational forms, surveys, quizzes and polls. This package runs its community edition with MongoDB and Valkey beside it, with accounts, email and integrations managed from StartOS actions.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Three unmodified upstream images, each in its own subcontainer, all sharing the service's network namespace.

| Subcontainer     | Image                       | Runs                                                                                                   |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| `heyform`        | `heyform/community-edition` | The Node.js server: dashboard, public form pages, GraphQL API and uploaded files, through its entrypoint |
| `mongo`          | `mongo`                     | `mongod`, listening on `127.0.0.1:27017` only, cache capped at 0.25 GB                                   |
| `valkey`         | `valkey/valkey`             | `valkey-server`, listening on `127.0.0.1:6379` only, append-only file on; its tini entrypoint runs as the container's init |
| `manage-account` | `heyform/community-edition` | Temporary, only while **Create or Reset Account** runs                                                   |

Architectures: x86_64 and aarch64. The `mongo` image's aarch64 build needs an ARMv8.2-A processor, which rules out the Raspberry Pi 4.

The `heyform` subcontainer also gets the StartOS root CA at `/app/startos-root-ca.crt`, written on every start and named in `NODE_EXTRA_CA_CERTS`, so HeyForm trusts HTTPS addresses served by this server (an AI service, for example).

## Volume and Data Layout

Four volumes. HeyForm keeps no files of its own outside them.

| Volume    | Mount point                                    | Contents                                                                       |
| --------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| `startos` | (not mounted)                                  | `store.json`: generated secrets and every StartOS-side setting                 |
| `uploads` | `/app/packages/server/static/upload` (`heyform`) | Files uploaded by form builders and respondents, served at `/static/upload/` |
| `db`      | `/data/db` (`mongo`)                           | The MongoDB data directory; HeyForm uses the `heyform` database                |
| `valkey`  | `/data` (`valkey`)                             | Valkey's append-only file: login sessions, rate-limit counters, queued jobs    |

The `mongo` and `valkey` entrypoints chown their data directories to their own users on every start.

## File Models

One model, `store.json` on the `startos` volume. HeyForm has no configuration file: the package passes everything as environment variables on every start, and HeyForm re-reads them at each launch, so the values below are re-asserted every time and nothing set inside HeyForm overrides them.

`store.json` holds:

- `sessionKey`, `formEncryptionKey` — generated at install, never rotated. They become `SESSION_KEY` (encrypts login cookies) and `FORM_ENCRYPTION_KEY` (encrypts the tokens of forms being filled in).
- `primaryUrl` — the address chosen with **Set Primary URL**, empty until then. `APP_HOMEPAGE_URL` is this URL while its hostname is one of the interface's addresses, and otherwise the preferred address: a public domain over HTTPS, else the `.local` address.
- `signups` → `APP_DISABLE_REGISTRATION` (inverted); `googleFonts` → `ENABLE_GOOGLE_FONTS`. Both default off.
- `smtp` → `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, and `SMTP_IGNORE_CERT=true`. Upstream passes that last value straight to Node's `rejectUnauthorized`, so `true` is what turns certificate checking on.
- `ai` → `OPENAI_BASE_URL`, `OPENAI_API_KEY` (`none` when left empty, since HeyForm refuses an empty key), `OPENAI_GPT_MODEL`.
- `stripe` → `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_CONNECT_CLIENT_ID`, and `STRIPE_WEBHOOK_SECRET_KEY` once set.
- `recaptcha` → `GOOGLE_RECAPTCHA_KEY`, `GOOGLE_RECAPTCHA_SECRET`; `akismetKey` → `AKISMET_KEY`.
- `accountCreated` — set by the first successful **Create or Reset Account**; it only decides whether the first-account task is shown.

Always set, not stored: `MONGO_URI`, `REDIS_HOST`, `REDIS_PORT`, `TRUST_PROXY=1` (StartOS's proxy replaces `X-Forwarded-For` with the visitor's address, so rate limits and spam checks see real visitors), `NODE_EXTRA_CA_CERTS`.

A hand edit to `store.json` survives and takes effect at the next start, but every key except `accountCreated` has an action that owns it.

## Dependencies

None.

## Network Access and Interfaces

One interface, `ui` (type `ui`), on port 9157 over HTTP; StartOS adds TLS and is asked for 9157 as the HTTPS port as well, so the HTTPS addresses keep the same port through a reinstall or a restore. It serves the dashboard, the public form pages (`/form/<id>`), the GraphQL API (`/graphql`), uploads (`/static/upload/`) and `/health/ready`.

Signing in works at one address only, the primary URL. HeyForm's session cookies carry `Domain=<primary URL host>; Secure`, so a browser drops them on every other address and signing in there loops back to the login page. Share links and upload links are built from the same URL. Filling in a form needs no login, so respondents can use any of the interface's addresses. The **Set Primary URL** list offers only the interface's HTTPS addresses and onion addresses, since a `Secure` cookie can't be set over plain HTTP outside Tor Browser. **Open UI** opens the address in `APP_HOMEPAGE_URL`.

## Installation and First-Run Flow

On install the package generates both secrets and leaves public sign-up off. HeyForm starts at the preferred address (see [File Models](#file-models)) without any account, and raises two **important** tasks, **Create or Reset Account** and **Set Primary URL**; the service runs normally while they are open.

Accounts made by the package are created through HeyForm's own user schema and password hash, and are marked email-verified. That flag matters: the dashboard sends any unverified account to a screen that waits for an emailed code, whatever `VERIFY_USER_EMAIL` says, so a package-made account could never get past it without SMTP. HeyForm has no administrator role; the first person to sign in creates a workspace like anyone else.

## Actions

**Create or Reset Account** — run to make an account, or when someone has lost their password. Creates the account if no user has that email address (emails are lowercased), otherwise replaces its password. Either way it sets `isEmailVerified`, so it also frees an in-app sign-up stuck waiting for a code. Takes a few seconds in a temporary subcontainer, needs HeyForm running (MongoDB must be up), and doesn't restart anything. Safe to repeat; each run makes a new 24-character password and returns the email and password. Existing login sessions are not ended.

**Enable Sign-ups / Disable Sign-ups** — opens or closes the public sign-up page. Restarts HeyForm. People with a workspace invitation link can sign up either way.

**Set Primary URL** — run after adding a public domain, or when the primary-URL task appears. Restarts HeyForm. Upload links already stored keep the old address, and the action warns about that once a URL is set.

**Configure SMTP** — Disabled, StartOS system SMTP, or a custom server. Restarts HeyForm. HeyForm queues mail whether or not SMTP is set: sign-up codes, workspace invitations, password resets, new-response notifications, and an alert to the account on each sign-in from a new device. With SMTP disabled, each of those logs three failed attempts (`MailQueue#… failed … connect ECONNREFUSED 127.0.0.1:587`) and is dropped; that log line is expected, not a fault.

**Enable Google Fonts / Disable Google Fonts** — whether form pages load their theme font from Google. Restarts HeyForm.

**Configure AI** (Integrations) — an OpenAI-compatible base URL, optional key and model. Enables **Create with AI** and form translation. Restarts HeyForm. The model must support JSON output (translation asks for `response_format: json_object`).

**Configure Stripe** (Integrations) — keys for Stripe Connect, from a Stripe account set up as a Connect platform with OAuth for Standard accounts (see [Limitations and Differences](#limitations-and-differences)). Its form shows the OAuth redirect URI under Connect Client ID and the webhook URL under Webhook Signing Secret, both built from the current primary URL; they change when the primary URL does. Restarts HeyForm. Each form connects its own Stripe account in the form editor.

**Configure Spam Protection** (Integrations) — reCAPTCHA keys and an Akismet key. Restarts HeyForm. Each form switches them on under **Settings → Protection**.

No action is hidden.

## Tasks

Two tasks, both **important**: neither stops HeyForm.

- **Create or Reset Account** — raised at every init while `accountCreated` is false. Cleared by the first successful run of the action and never raised again, even if every account is later deleted. An account created through the sign-up page does not clear it.
- **Set Primary URL** — raised while no primary URL has been chosen, or while the stored one's hostname is not among the interface's addresses (a domain removed, an address disabled), pre-filled with the preferred address. It clears itself when a primary URL is chosen or the stored address comes back. Meanwhile HeyForm runs at the preferred address, so sign-in and new links use that one.

## Health Checks

**Web Interface** probes `GET http://127.0.0.1:9157/health/ready`, which returns 200 only while HeyForm is connected to both MongoDB and Valkey. A probe fails after three misses two seconds apart, and failures in the first 60 seconds count as starting. A failure after start-up means HeyForm has lost MongoDB or Valkey: look in the service logs for the `mongo` or `valkey` daemon.

MongoDB (its port is listening) and Valkey (`valkey-cli ping`, three tries) have internal checks that aren't shown; HeyForm starts only once both pass, and a failed one stops HeyForm with it.

## Backups and Restore

The `startos`, `uploads` and `db` volumes are copied whole (`ofVolumes`). StartOS stops HeyForm before a backup, so MongoDB's data files are copied with `mongod` shut down cleanly, and restore puts the same files back.

The `valkey` volume is left out. A restored instance comes up with everyone logged out and with any queued emails or webhook deliveries gone; nothing else needs rebuilding.

## Limitations and Differences

1. Signing in works at the primary URL only (see [Network Access and Interfaces](#network-access-and-interfaces)). Images and files keep the address HeyForm used when they were uploaded: an earlier primary URL, or the preferred address while the chosen one was gone.
2. A Raspberry Pi 4 can't run the package: the MongoDB image needs ARMv8.2-A.
3. Webhooks reach public addresses only. HeyForm itself rejects private, loopback and CGNAT addresses (including Tailscale's) with "Private network URLs are not allowed", so it can't post to other services on this server or the LAN. A `.local` name fails earlier, with "Internal server error": the container can't resolve mDNS names.
4. Webhooks are self-hosted HeyForm's only integration. The Google Sheets, Slack, Notion and other integrations in HeyForm's help center are part of its hosted service.
5. Workspace invitations are sent only by email, and the dashboard shows no invite link to copy, so collaboration needs SMTP. In-app sign-ups need SMTP too, for the verification code.
6. **Select a template** shows the category list with no templates in it: HeyForm's open-source server returns none, as the gallery belongs to its hosted service. **Import from JSON** on that screen always fails with "Failed to import form. Please check the JSON format.", because the web app calls an import function that the release doesn't contain, and nothing exports a form as JSON. **Duplicate** is the way to reuse a form.
7. Card payments run on Stripe Connect, and HeyForm links each form's Stripe account only through OAuth for Standard accounts: the account whose keys go into **Configure Stripe** must be a Connect platform with OAuth turned on. Stripe no longer recommends OAuth for new platforms, and a new account may not be offered it. HeyForm's OAuth link names no redirect URI, so Stripe returns to the first one in the platform's list. Linking an account that can't take charges yet fails with "Something went wrong, please try again." Stripe can confirm payments only when the primary URL is a public HTTPS address. Without the webhook, payments complete but submissions don't record a receipt.
8. SMTP servers must present a certificate the container trusts; a self-signed SMTP certificate is rejected.
9. Upload size is HeyForm's default (10 MB per file) and isn't configurable.
10. Outside requests HeyForm makes even with nothing configured: the server asks `api.github.com` for HeyForm's release list (the dashboard's "what's new"), the dashboard loads a flag-icon stylesheet from cdnjs.cloudflare.com, accounts created through the sign-up page get a Gravatar image URL, and every new form's first question comes with a photo from `images.unsplash.com`, which respondents' browsers load until it is removed or replaced.
11. The image picker's **Unsplash** tab finds nothing: HeyForm searches Unsplash only with an Unsplash access key (`UNSPLASH_CLIENT_ID`), which the package doesn't set, and HeyForm has no setting to hide the tab. Uploading an image works.

---

## Quick Reference for AI Consumers

```yaml
package_id: heyform
image: heyform/community-edition
architectures: [x86_64, aarch64]
subcontainers: [heyform, mongo, valkey, manage-account]
volumes:
  startos: (store.json, not mounted)
  uploads: /app/packages/server/static/upload
  db: /data/db
  valkey: /data
file_models:
  - store.json
startos_managed_env_vars:
  - APP_HOMEPAGE_URL
  - APP_DISABLE_REGISTRATION
  - ENABLE_GOOGLE_FONTS
  - SESSION_KEY
  - FORM_ENCRYPTION_KEY
  - MONGO_URI
  - REDIS_HOST
  - REDIS_PORT
  - TRUST_PROXY
  - NODE_EXTRA_CA_CERTS
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_FROM
  - SMTP_USER
  - SMTP_PASSWORD
  - SMTP_SECURE
  - SMTP_IGNORE_CERT
  - OPENAI_BASE_URL
  - OPENAI_API_KEY
  - OPENAI_GPT_MODEL
  - STRIPE_PUBLISHABLE_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_CONNECT_CLIENT_ID
  - STRIPE_WEBHOOK_SECRET_KEY
  - GOOGLE_RECAPTCHA_KEY
  - GOOGLE_RECAPTCHA_SECRET
  - AKISMET_KEY
dependencies: none
interfaces:
  ui: { type: ui, port: 9157 }
actions:
  - create-or-reset-account
  - toggle-signups
  - set-primary-url
  - manage-smtp
  - toggle-google-fonts
  - configure-ai
  - configure-stripe
  - configure-spam-protection
tasks:
  - { action: create-or-reset-account, severity: important }
  - { action: set-primary-url, severity: important }
health_checks:
  - heyform
```
