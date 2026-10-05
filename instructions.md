# HeyForm

## Documentation

- [HeyForm features](https://docs.heyform.net/features/*) — the help center's guides to logic, hidden fields, sharing, embedding and submissions
- [HeyForm quickstart](https://docs.heyform.net/quickstart/*) — creating, renaming and deleting forms
- [HeyForm webhooks](https://docs.heyform.net/integrations/webhook/*) — sending each submission to another service

## What you get on StartOS

One web address serves both your HeyForm dashboard, where you build forms and read responses, and the form pages the people you send them to fill in. Responses, uploaded files and settings stay on your server and are part of its backups. Public sign-up starts switched off: you create accounts from StartOS.

## Getting set up

1. Run **Create or Reset Account**. Enter your email address and name, then copy the password it shows you.
2. Open the **Web UI** at its `.local` address and sign in. HeyForm asks you to create your first workspace.
3. To send forms to people outside your home network, add a public domain to the **Web UI** interface, then run **Set Primary URL** and choose it. Do this before you build forms with images or file-upload fields: their links keep the address they were made with.
4. Optionally run **Configure SMTP**, so HeyForm can email you new responses and send workspace invitations.

## Using HeyForm

### Signing in

Sign in at HeyForm's primary URL, which starts as your server's `.local` address. At any other address of the **Web UI**, HeyForm accepts your password and then shows the login page again. People filling in your forms can use any of its addresses.

### Adding people

- To give someone their own login, run **Create or Reset Account** with their email address and send them the password it shows.
- To have them work on your forms, use **Invite members** on your workspace's **Members** page in HeyForm. The invitation is an email with a link to join, so it needs SMTP. People without an account can sign up from that link even while sign-ups are disabled.
- **Enable Sign-ups** lets anyone who can reach HeyForm create an account. HeyForm emails each new account a code to confirm its address, so set up SMTP first.

If someone forgets their password, run **Create or Reset Account** with their email address. It gives the account a new password and needs no email setup.

### Actions

- **Create or Reset Account** — make a new account, or give an existing one a new password.
- **Enable Sign-ups** / **Disable Sign-ups** — open or close the sign-up page.
- **Set Primary URL** — choose the address HeyForm works at and puts in share links.
- **Configure SMTP** — let HeyForm send email: sign-up codes, invitations, password resets, new-response notifications.
- **Enable Google Fonts** / **Disable Google Fonts** — show forms in the font their theme names, or in each visitor's own system fonts. While enabled, every visitor's browser loads the font from Google.
- **Configure AI**, **Configure Stripe**, **Configure Spam Protection** — the integrations below.

### AI form builder

**Configure AI** turns on HeyForm's **Create with AI** and form translation. Point it at OpenAI with an API key, or at an AI service on this server: copy that service's HTTPS address, add `/v1`, and leave the key empty. The model you name must be able to answer in JSON.

### Card payments with Stripe

Stripe has to reach HeyForm to confirm each payment, so this needs a public domain as the primary URL.

1. In your Stripe dashboard, under **Settings → Connect → Onboarding options → OAuth**, turn on OAuth for Standard accounts and add the redirect URI that **Configure Stripe** lists in its description.
2. Under **Developers → Webhooks**, add an endpoint with the webhook URL from the same description, listening to `payment_intent.succeeded` on connected accounts. Copy its signing secret.
3. Run **Configure Stripe**, choose **Enabled** and paste your keys, the Connect client ID and the signing secret.
4. In HeyForm, add a payment field to a form and connect your Stripe account from the form editor.

[HeyForm's Stripe guide](https://docs.heyform.net/open-source/configuration/stripe) has the same Stripe steps; the keys go into **Configure Stripe** rather than the environment variables it mentions.

### Spam protection

**Configure Spam Protection** takes Google reCAPTCHA v3 keys, made for your primary URL's domain, and an Akismet API key. Each form then switches them on under **Settings → Protection** in HeyForm: **Google reCaptcha** checks visitors before accepting their answers, and **Akismet** files likely spam under a separate Spam tab.

## Limitations

- A Raspberry Pi 4 cannot run HeyForm: its database needs a newer processor.
- Webhooks can only reach public internet addresses. HeyForm refuses to send them to addresses on your local network, including other services on this server.
- Webhooks are the only integration self-hosted HeyForm offers. The Google Sheets, Slack and other integrations in HeyForm's help center belong to its hosted service.
- **Select a template** has no templates in it, and **Import from JSON** always fails: self-hosted HeyForm has neither. To reuse a form, use **Duplicate**.
- Every new form starts with a photo from Unsplash on its first question. Your respondents' browsers load it from Unsplash until you remove or replace it.
- The **Unsplash** tab in the image picker always shows "No results found": it needs an Unsplash developer key, which this package doesn't use. Upload your own image instead.
