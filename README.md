# forward.webhook.life.li

Forwards requests from a given SendGrid webhook to your localhost URLs without touching sendgrid.

- Incoming webhooks are sent in sendgrid and should be set in the format of `https://forward-webhook-life-li.preview.life.li/api/forward?key=<UseCase>`
- If you want the use-case to forward it to a specific URL then make an env variable with that use case (e.g. `TECHNICAL_PARTNER_SUPPORT`) and add a comma seperated list of webhooks.
- When sendgrid gets an email `https://forward-webhook-life-li.preview.life.li/api/forward?key=TECHNICAL_PARTNER_SUPPORT` it forwards it to webhooks listed in env on vercel `TECHNICAL_PARTNER_SUPPORT` and `SHARED_FORWARD_URL`.
