# LaunchLab experiment brief: QuestPass

## Product and audience

An event passport for builders and curious attendees. A finalist can invite judges to try a real product and demonstrate that LaunchLab turns the resulting activity into evidence a founder can act on.

## Question to test

Will participants complete three small missions for a personalized keepsake, and what would make them use this at another event?

## Demo sequence

1. Give LaunchLab this repository and the hypothesis above.
2. Inspect the framework and show a concrete plan for approval.
3. Add consent-aware action tracking and an explicit feedback submission.
4. Build and deploy the reviewed version to an approved hosting account.
5. Open the public event link or scan its QR code. Complete one controlled participant journey.
6. Retrieve observed activity and feedback from LaunchLab; distinguish rehearsal data from any actual attendee sessions.
7. Return the deployment URL, pinned version, counts and bounded conclusions through the OKX task.

Steps 1–7 describe the intended combined test. Building this source alone does not verify that test, an OKX payment, or hosting.

## Events to measure

| Action | Meaning | Example question |
| --- | --- | --- |
| `pass_created` | A participant submitted the handle/role form | Did people start? |
| `signal_completed` | A valid concept vote was saved | Did the first mission engage them? |
| `remix_completed` | Exactly 100 points were allocated | Did the interactive mission retain them? |
| `spark_completed` | A valid local interest response and comment were saved | Did they finish the feedback step? |
| `passport_downloaded` | The download action was requested | Did they want the keepsake? |

Downloads are browser actions, not evidence that a file was subsequently opened or shared. A session is not a verified unique person. A saved local feedback response is not a received backend submission. The integration must count successful network submission separately and must report failures clearly.

## Feedback connection

Connect the Spark mission to LaunchLab’s supported feedback contract after consent/disclosure and configuration. Preserve `intent` and `comment`; do not silently invent missing required answers. Keep handles, roles, free text and allocation choices out of generic action telemetry. If any of those fields are added to the research contract, disclose them to the participant and validate them on the server.

## Reporting guardrails

- Separate internal tests from organic participant sessions.
- Report action counts and session counts separately. Repeated actions are not new people.
- Do not present concept preferences as paid demand or token volume.
- Do not use XP to imply verified identity, eligibility, or financial rewards.
- Do not claim product-market fit or broad demand from a small finale sample.

## Plausible next product step

Organizers could pay per event for a hosted mission board and an evidence report. X Layer could later support an optional sponsor-funded reward pool with explicit claim rules and abuse controls. Neither paid rewards nor this organizer workflow are implemented in this prototype. The immediate OKX relevance is LaunchLab’s paid service delivering this new product experiment.
