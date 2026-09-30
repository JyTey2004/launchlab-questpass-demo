# Local verification — 30 September 2026

This records a controlled development rehearsal, not customer traction or a completed LaunchLab/OKX delivery.

## Passed

- `npm test`: six state-validation and progression tests passed.
- `npm run build`: production Vite build passed; output is `dist/`.
- Desktop browser: created `Finals Explorer`, selected Explorer, voted for Splitwave, allocated a 45/30/25 mix, saved a “Maybe” interest response with a clearly labelled rehearsal comment, and unlocked all three stamps at 450 XP.
- Invalid allocation: 45/35/25 was rejected, with the visible instruction to allocate exactly 100 points.
- Persistence: a fresh browser tab restored all three completed missions and 450 XP.
- Download: browser produced `questpass-42bc32f8.svg`; the resulting file parsed as valid 900 × 1200 SVG and contained the rehearsal handle.
- Responsive review: desktop at the browser’s default 1280 × 720 viewport and mobile at 390 × 844. Passport modal and share dialog remained usable on mobile. The temporary viewport override was reset.
- Keyboard focus: replacing dialog content focuses its new heading; native form and dialog controls remain available.
- Local sharing: the dialog explains that a local preview cannot be scanned from another device. Public QR generation remains to be checked after hosting.
- Reset: the controlled rehearsal pass was removed through the app; the user-facing preview starts with a fresh pass.
- No browser console errors were returned for the final preview tab.

## Evidence

Screenshots are saved outside the deployable project at `../output/launchlab-questpass-demo-20260930/` (`desktop.png`, `mobile.png`, `passport.png`). The live local preview is `http://127.0.0.1:4316/` while its development server is running.

## Still to verify

- Publish/pin the source and run LaunchLab framework inspection, instrumentation review, and the approved hosted deployment.
- Connect Spark feedback to backend receipt, including success/error reporting and idempotency.
- Confirm consent-aware event/session counts and separation of controlled tests from organic participation.
- Complete the fresh OKX request → provider response → deployment → feedback → report delivery test, with its own service and spending approvals.
- Test the public event QR code and outside-device access before inviting attendees.
