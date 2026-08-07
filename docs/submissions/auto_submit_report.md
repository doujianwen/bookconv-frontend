# Auto-Submit Feasibility Report

## Auto-Submit Candidates (1)

| Site | URL | Method | Fields | CSRF |
|------|-----|--------|--------|------|
| TechAsoft | https://www.techasoft.com/submit | GET | lead_url, contact_fname, contact_email, contact_message | No |

## Manual Only (7)

| Site | URL | Reason |
|------|-----|--------|
| PRLog | https://www.prlog.org/ | JS-rendered form, no API |
| SubmitSaaS | https://submitsaas.com/ | No form, link-based |
| SubmitCube | https://www.submitcube.com/ | No form, link-based |
| GetLeadWave | https://getleadwave.io/ | No form, link-based |
| SaaSPedia | https://saaspedia.io/ | Contact forms only |
| BacklinkCRM | https://backlinkcrm.io/ | Contact forms only |
| LinkDr | https://linkdr.com/ | Needs investigation |

## Blocked (1)

| Site | URL | Status | Note |
|------|-----|--------|------|
| StartupStash | https://startupstash.com/ | 403 | CDN-protected, needs browser automation |

## PRLog API Test Results

All API endpoints return 301 redirects:
- /api/1/ -> /news/tag/api-1/
- /api/1/submit -> /news/tag/api-1-submit/
- No public submission API exists.

## Conclusion

Only TechAsoft can be auto-submitted (contact form). All others require manual submission or browser automation.