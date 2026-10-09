# Browser extension

The 1.1.0 client provides source selection, preview, time-range inputs and browser
file saving. Source inspection, processing decisions and extraction remain on the
Katge service. The client has no local media-engine fallback and requires a
compatible backend.

Requests include a source URL, an installation identity and an API credential.
Some providers require bounded observations of public-player fields. A service
plan can require generic media transport and upload before the private worker
produces the result.

## Release status

Version 1.1.0 is an unpublished candidate. The earlier 1.0.0 website ZIPs are
withdrawn from the development website. Existing store listings must be checked
by version; they do not establish availability of the backend-connected client.

No download URL is provided here until the service, package hashes, browser
behavior and release review are accepted. Chromium, Firefox and Opera are build
targets; a build target is not a store approval or live compatibility guarantee.

The 9 October 2026 invalid-request protocol probe received HTTP 404 from the
production session, inspection, planning and observation-spec routes. This is
a publication blocker. Authenticated live flows and browser acceptance still
need to pass after the compatible deployment is available.

## Installation after publication

For a reviewed Chromium ZIP, extract it and use Load unpacked in the browser's
extension manager. Select the folder containing `manifest.json`, not the ZIP.
Firefox packages use a separate manifest and store review.

Start playback on a supported public media page if no source is detected. Choose
the source and format, check duration, then select a valid start/end interval.
Source access, platform changes and the installed version affect availability.
Public, non-DRM media only.

Report the version, browser, platform and stable error code. Do not attach API
credentials, temporary download URLs or raw player observations to public issues.
