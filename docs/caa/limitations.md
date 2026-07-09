# Known Limitations & Failure Modes

## Hardware
- **Laptop mic (Mode B)**: No spatial awareness. Banner must remain visible. Do not infer zones.
- **4-ch array not exposed as multichannel**: Some drivers present stereo only → Mode B despite physical mics.
- **Camera rear-blind**: Back zones have lower vision coverage → lower confidence; may never surface.

## Browser (verify against current MDN/caniuse)
- `MediaTrackSettings.channelCount` may be missing → fallback assumes 1 channel.
- `navigator.permissions.query({name:'camera'})` — Chromium-oriented; Safari may not support name `'camera'`.
- iOS: background tab may throttle workers → fusion lag.
- Firefox: WebGPU availability varies.

## Acoustic
- GCC-PHAT degrades with reverberant rooms and HVAC noise.
- DOA resolves bearing, not distance — zones are angular bins, not physical distance.
- Concurrent speech in multiple zones merges energy.

## Vision
- Landmark-free cannot reliably separate talking vs silent fidgeting.
- Low light increases false motion from noise.
- Person detector may miss partially occluded students → lower confidence (correct behavior: stay silent).

## Fusion
- Persistence delay (N windows) trades responsiveness for false positives.
- Teacher dismissal bias may over-suppress valid zones if not rebalanced in tuning.

## Compliance
- Teacher + seating chart = re-identification risk outside software control — mitigated by training, not code alone.
- Landmark-assisted mode: legal review required per jurisdiction.

## Failure modes

| Failure | System behavior |
|---------|-----------------|
| Array unplugged mid-session | Detect channel drop → downgrade to Mode B + notify |
| Camera lost | Audio-only fusion; vision weight zeroed; confidence likely drops |
| Worker OOM | Error state; tracks stopped; no partial zone guess |
| Upload mid-flight disconnect | Resume from last chunk checkpoint |
| Consent expired | Upload blocked; live unaffected |
