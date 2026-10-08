# Privacy and data flow

The product website bundles fonts locally and stores language and display
preferences in the browser. Product and documentation pages contain no analytics
or advertising trackers. Hosting providers and servers receive ordinary
connection data, including IP addresses and browser information.

The backend-connected extension sends requested source URLs, an installation
identifier, API credentials and sometimes bounded public-player observations to
Katge. Media can be transferred to the backend for processing. This is different
from the earlier on-device extension; review the version you install.

The observation bridge does not read site cookies, session storage, private
messages, request headers or request bodies. Public fields and temporary media
URLs can still reveal content information. Do not publish raw observations,
credentials or signed download links.

The service processes identity, tenant, job and quota records. The consumer API
uses IP addresses for abuse prevention and rate limits. Enabled search deployments
also process queries, source records and results. Expiring result access does
not imply deletion of every operational record. Retention is deployment-specific.

For privacy questions and data requests, contact
[contact@katge.com](mailto:contact@katge.com). Do not send passwords, API keys or
private content in an initial report.
