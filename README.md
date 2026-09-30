# QuestPass

**Be part of what’s next.** An interactive event passport, built as a fresh product for LaunchLab’s finalist demonstration.

Participants choose a handle, complete three short missions, and unlock a downloadable Builder Edition passport. No account, wallet, email, payment, or API key is required.

## Run

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4316/`. For a production deployment:

```sh
npm test
npm run build
```

Serve the generated `dist/` directory. This is a Vite/npm static project; no server routes or environment secrets are required. The lockfile pins the dependency tree. Google Fonts is an optional visual enhancement; system fonts remain available if its stylesheet cannot load.

## Working experience

1. **Create a passport:** handle and Builder/Explorer/Connector role.
2. **Signal:** vote for one of three clearly labelled product concepts.
3. **Remix:** allocate exactly 100 points between demos, connections, and recharging.
4. **Spark:** give honest interest and written feedback. Negative feedback earns the same stamp as positive feedback.
5. **Reveal:** collect all three stamps, then download a personalized SVG passport. Once hosted publicly, the share dialog generates a QR code for the event URL.

Progress and responses persist in this browser’s local storage. A reset control deletes them. Completed missions cannot inflate XP by being repeated. The app validates stored data before restoring it, respects reduced-motion preferences, and supports keyboard-operated native dialogs and forms.

## What is deliberately not claimed

- This standalone build stores responses **on the participant’s device**. It does not yet send them to an organizer or to LaunchLab.
- There is no shared audience dashboard, identity verification, Sybil protection, wallet connection, token distribution, NFT minting, or onchain proof.
- XP and stamps have no monetary value. A passport is a commemorative demo download, not admission or an onchain credential.
- The three startups in the Signal mission are concepts, not functioning services.
- Participant sessions in rehearsals are controlled tests, not customer traction.

## LaunchLab integration boundary

This is the source product that LaunchLab can inspect, instrument, and deploy. It intentionally does not arrive with a LaunchLab SDK already embedded. See [launchlab-brief.md](launchlab-brief.md) for the experiment brief and observable actions.

The app emits a `questpass:action` DOM CustomEvent with a fixed `detail.type` and no handle or feedback text:

```js
document.addEventListener('questpass:action', ({ detail }) => {
  // Instrument with an approved, consent-aware tracking adapter.
  console.log(detail.type);
});
```

Types: `pass_created`, `mission_opened`, `signal_completed`, `remix_completed`, `spark_completed`, and `passport_downloaded`. These notifications currently make no network requests. A deployment agent must explicitly add the approved consent-aware tracking and feedback connection; only then can the organizer receive results.

The exported passport includes the chosen handle and generated pass ID. Downloading or sharing it is the participant’s action. No handle is placed in the share URL.

## Verification

`npm test` covers corrupt storage, response validation, bounded allocations, immutable progression, repeat completion, and equal treatment of negative feedback. `npm run build` verifies the deployable bundle.
