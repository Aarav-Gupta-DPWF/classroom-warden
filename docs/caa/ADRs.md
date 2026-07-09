# CAA Architecture Decision Records

## ADR-001 — Sensing Modality and Hardware Floor

### Context
Teachers need spatial awareness of classroom activity without identifying individuals. Browser-accessible sensing is limited to microphone and camera. Direction-of-arrival (DOA) requires multiple spatially separated microphones presented as one multichannel device.

### Options
| Option | Description |
|--------|-------------|
| A | 4+ channel mic array → GCC-PHAT DOA → zone attribution (Mode A) |
| B | 1–2 channel mic → room-level envelope only (Mode B) |
| C | Vision-only zone attribution from camera |
| D | Single mic + ML “DOA” from mono spectrogram |

### Trade-offs
- **A**: Spatial signal is real when hardware cooperates; requires array hardware and OS driver exposing channels. Browser `channelCount` availability is **engineering assumption** — verify against current MDN for `MediaTrackSettings.channelCount`.
- **B**: Honest on laptops; loses spatial resolution; still useful as deviation-from-baseline room alert.
- **C**: Camera FOV and lens distortion make acoustic zones non-alignable with visual zones without calibration; vision alone cannot measure sound direction (**fact**).
- **D**: Mono DOA is not physically identifiable without array; produces plausible-looking false zones (**rejected as dishonest**).

### Decision
**GCC-PHAT** on ≥4 channels when available; **delay-and-sum beamforming** reserved for offline upload analysis where compute budget is higher. Live path uses GCC-PHAT for lower latency and simpler WASM port.

**Hardware floor**: Mode A requires ≥4 channels on one `getUserMedia` audio device. Mode B is mandatory fallback for `<4` channels.

### Consequences
- Schools deploying Mode A must procure and mount array hardware (e.g. ReSpeaker 4-Mic Array v2.0 or equivalent).
- Product messaging must never imply zone detection on a laptop mic.
- Support docs must include USB array setup and channel verification steps.

### Rejected — and why
| Rejected | Why | Would win if |
|----------|-----|--------------|
| Vision-only zones | Measures motion, not sound origin; violates teacher JTBD for “disengaged corner” heard while facing board | Teacher JTBD changed to “movement detection only” |
| Mono pseudo-DOA | Exceeds sensor capability; silent false confidence | **Never** — violates validation rule #2 |
| Server-side raw audio for live DOA | Violates zero-egress constraint | Regulatory posture changed to allow ephemeral server processing with DPA |

---

## ADR-002 — Vision Model Selection and Adapter Contract

### Context
Visual motion energy per zone supplements acoustic signal. Must not compute identity embeddings or persist facial geometry by default.

### Options
| Option | Description |
|--------|-------------|
| A | LANDMARK-FREE: person detector + optical-flow motion energy |
| B | LANDMARK-ASSISTED: adds mouth-aspect-ratio from landmarks (frame-only) |
| C | Full pose estimation (33+ keypoints) |
| D | Cloud vision API |

### Trade-offs
- **A**: BIPA-safer default; weaker talking vs fidgeting separation.
- **B**: Better separation; facial geometry computed → biometric processing risk in IL and possibly GDPR Art.9 contexts (**legal ambiguity**).
- **C**: More geometry than needed; higher egress risk if mis-implemented.
- **D**: Violates zero-egress live mode.

### Decision
**Adapter contract** (all vision backends must implement):

```typescript
interface VisionAdapter {
  readonly mode: 'landmark-free' | 'landmark-assisted';
  init(weightsUrl: string): Promise<void>;
  /** Returns person boxes + scalar motion energy per zone. No identity fields. */
  infer(frame: ImageBitmap, zones: ZoneGeometry[]): Promise<VisualZoneFrame>;
  dispose(): void;
}
```

**Default model class**: small person detector (e.g. BlazePose-free alternative: **MobileNet-SSD person class** or **YOLO-nano person-only head**) + Lucas-Kanade sparse optical flow on box interiors. **Engineering assumption**: a ≤30MB INT8 WASM model exists meeting ≥5 fps on 2020 laptop — **must be measured on target hardware before release**; do not ship invented benchmark numbers.

Landmark-assisted backend is a **separate adapter** gated by consent artifact.

### Consequences
- Two adapter implementations to test and maintain.
- Landmark adapter must zero buffers after each frame (`infer` return must not include landmark coordinates).

### Rejected — and why
| Rejected | Why | Would win if |
|----------|-----|--------------|
| Cloud vision | Egress + latency + minor data handling | Enterprise on-prem vision appliance with DPA |
| Full pose | Excess biometric surface | Product pivoted to PE/gym motion analysis |
| Face recognition | Identifies individuals | **Never** |

---

## ADR-003 — Where Inference Runs

### Context
Live mode: zero egress. Latency ≤500ms p95. Schools may have intermittent network.

### Options
| Option | Description |
|--------|-------------|
| A | Browser-only (WASM/WebGPU) |
| B | Edge appliance in classroom |
| C | Server real-time stream |
| D | Hybrid: browser vision + server audio |

### Trade-offs
- **A**: Offline-capable; bounded by teacher laptop GPU/CPU; model size ≤30MB.
- **B**: Better arrays + compute; deployment burden on school IT.
- **C/D**: Violate zero-egress unless encrypted ephemeral streams — not in scope.

### Decision
**All live inference in-browser**: GCC-PHAT in WASM worker; vision adapter in WebWorker with WebGPU when available, WASM fallback. Fusion in main thread or shared worker.

**Upload/retrospective path**: optional server-side batch analysis after consent; raw media deleted on job completion.

### Consequences
- Performance floor tied to teacher device; device matrix testing required.
- No model updates without app deploy or explicit model CDN fetch (model fetch is not live frame egress — weights only).

### Rejected — and why
| Rejected | Why | Would win if |
|----------|-----|--------------|
| Server live stream | Raw AV egress | Law changed / district mandates central processing with air-gapped appliance |
| Phone-as-edge | Second device complexity | Dedicated edge box bundled with array |
| Native app only | Spec requires web first | Mobile phase prioritised and web deprecated |

---

## ADR-004 — Zone Granularity and Calibration Method

### Context
Zones must be coarse enough that a teacher cannot trivially punish one student. Must align acoustic DOA bins with visual regions.

### Options
| Option | Description |
|--------|-------------|
| A | Fixed 4 quadrants (FR, FL, BR, BL) |
| B | 6–8 narrow slices |
| C | Per-seat zones |
| D | Teacher-drawn polygons (arbitrary count) |

### Trade-offs
- **A**: ~4–8 students per zone in typical layout; punishment requires effort; aligns with 4-mic array resolution limits.
- **B**: Better resolution but approaches identifiable clusters in small classes.
- **C**: Unacceptable identification risk.
- **D**: Flexible but IT burden; risk of over-granularity.

### Decision
**Default 4 quadrants** relative to camera pose. **Calibration**: 10-second wizard — teacher stands in each quadrant while prompted; system records DOA histogram peak + visual motion centroid. Stored as anonymous calibration profile (angles + zone bounds only, no images).

Admin may reduce to **2 halves** (front/back) for small rooms via config. Cannot increase above 4 without security review.

### Consequences
- Camera placement guide required in deployment docs.
- Rear zones have lower confidence when camera is front-mounted (**known limitation**).

### Rejected — and why
| Rejected | Why | Would win if |
|----------|-----|--------------|
| Per-seat | Single-student attribution | **Never** for K-12 live mode |
| 8+ zones | Array resolution insufficient + punishment risk | Ceiling-mounted 8-ch array + university lecture hall use case with explicit policy |
| No calibration | Higher false zone assignment | Pilot data shows <70% teacher trust without calibration — **engineering assumption, measure in pilot** |
