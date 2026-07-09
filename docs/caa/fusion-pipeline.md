# Audio-Visual Fusion Pipeline Specification

## Inputs (per processing window W, default 200ms)

| Signal | Mode A | Mode B |
|--------|--------|--------|
| `audio_delta[z]` | DOA energy in zone z minus EWMA baseline | Room RMS minus room baseline (no z) |
| `motion_energy[z]` | Optical-flow scalar in zone z | Same if camera on; else 0 |
| `persistence[z]` | Consecutive windows above threshold | N/A in Mode B |

## Rolling baseline
- **Method**: EWMA per zone (Mode A) or global (Mode B).
- **Window**: ≥60s effective memory — α chosen so half-life ≈ 30s (**tunable**).
- **Purpose**: Detect deviation, not absolute loudness.

## Persistence
- Zone must exceed activity threshold for **N consecutive windows** (default N=3 → 600ms at 200ms windows).
- Single transient (dropped book) resets counter.

## Fusion function

```
raw[z] = w_a * norm(audio_delta[z]) + w_v * norm(motion_energy[z])
activity[z] = sigmoid(raw[z])  // clamp to 0.0–1.0
```

Default weights: `w_a = 0.55`, `w_v = 0.45` (Mode A). Mode B: `w_a` applies to room channel only; **no zone output**.

## Confidence

```
confidence[z] = min(
  channel_quality,      // 1.0 if ≥4ch; 0.0 forces Mode B
  doa_peak_ratio[z],    // ratio of peak GCC correlation to median
  vision_coverage[z],    // fraction of zone with person boxes detected
  calibration_freshness  // decays if calibration >90 days
)
```

**Gate**: If `confidence[z] < 0.6` → **do not surface** zone z. Log `{zone_id, confidence, ts}` at `debug` level for tuning — **no student-linked fields**.

## Output tuple

```typescript
interface ZoneActivityTuple {
  zone_id: 'front-left' | 'front-right' | 'back-left' | 'back-right';
  activity: number;   // 0.0–1.0
  confidence: number; // 0.0–1.0
  ts: number;         // DOMHighResTimeStamp
}
```

## Mode B output

```typescript
interface RoomLevelTuple {
  room_activity: number;
  confidence: number;
  ts: number;
  mode: 'B';
}
```

No `zone_id` field. UI shows room-level meter only.

## Dismissal signal

Teacher dismiss → store anonymous `{zone_id, dismissed_at, activity_at_dismiss}` for false-positive tuning. **Not** an incident record.

## Landmark-assisted adjustment

When consented: `talking_prior[z]` from mouth-aspect-ratio variance modulates `w_v` vs `w_a`. Landmarks never leave `infer()` scope.
