# Conversion backend operations

The application runs as the isolated `bookconv-conversion` systemd service.
Service credentials stay in the server environment file and must never be
copied into reports, deployment commands or Git.

## PDF font prerequisite

On the existing Ubuntu server, install the distribution's CJK fonts before
accepting multilingual PDF conversions:

```sh
sudo apt-get install --no-install-recommends fonts-noto-cjk
sudo fc-cache -f
sudo -u bookconv-backend fc-match ':lang=zh-cn'
```

On 2026-11-01, missing CJK fonts produced a successful PDF response with blank
Chinese text. Installing the fonts restored Chinese in the rendered sample.
Verify rendered pages as well as extracted text; normalize extracted text with
Unicode NFKC when checking compatibility ideographs or Arabic presentation forms.
Do not treat HTTP 200 as proof of complete content or identical layout.

## Deploying a parser change

Run `node conversion-backend/test/mock-run.js` locally first. Its copy-only
converter tests the HTTP contract and UTF-8 filename handling; it does not test
Calibre output quality. Back up the deployed source, check the replacement as an
ES module (`.mjs` outside the package directory), confirm no conversion is active,
then install it with the service owner and restart only this service. Verify
local and public health, a real conversion, and the decoded download filename.

Keep the backup for rollback. Do not restart unrelated services, print the
environment file or stop production conversions to test failover.

## Retention

R2 lifecycle rules own remote object expiry: `uploads/` expires after one day,
and `conversion-cache/` after 30 days. The separate default rule aborts incomplete
multipart uploads after seven days. These are policies, not proof that every
historical object was physically deleted. Provider cleanup is asynchronous.
`storageStrategy.cleanupExpired()` only sweeps local results; it must not apply
the local 24-hour policy across the remote bucket.
