# CAA Test Plan

## Device matrix

| Device class | Mic channels | Expected mode | Browsers to verify |
|--------------|--------------|---------------|-------------------|
| Laptop (2020+) | 1–2 | B | Chrome, Safari, Firefox |
| ReSpeaker 4-Mic USB | 4+ | A | Chrome, Edge |
| iPad | 1 | B | Safari iOS |
| Embedded iframe | any | Error/warn if blocked | Chrome |

**Note**: Verify Safari MediaRecorder and iOS autoplay against current caniuse/MDN before sign-off.

## Acceptance criteria (Given/When/Then)

### AC-001 Spatial detection (Mode A)
- **Given** a device with a 4-channel mic array calibrated
- **When** sound originates from back-left for 3 consecutive fusion windows
- **Then** back-left zone surfaces with confidence ≥0.6
- **And** no student identity appears in output or logs

### AC-002 Laptop honesty (Mode B)
- **Given** a laptop with single built-in microphone
- **When** the module initializes
- **Then** Mode B activates with plain-language explanation
- **And** no zone map is displayed

### AC-003 Permission denied messaging
- **Given** user denied camera permission
- **When** they retry capture
- **Then** message names browser-specific settings path
- **And** message is not generic "Camera error"

### AC-004 Cleanup on unmount
- **Given** component unmounts mid-recording
- **When** 1 second elapses
- **Then** all `MediaStreamTrack` are `readyState === 'ended'`
- **And** camera indicator LED is off

### AC-005 Landmark consent gate
- **Given** LANDMARK-ASSISTED selected without consent artifact
- **When** module initializes
- **Then** start refused with consent requirement explained

### AC-006 Offline live mode
- **Given** network partition during live teaching
- **When** teacher uses module
- **Then** live fusion continues without degradation

### AC-007 Low confidence silence
- **Given** zone confidence 0.45
- **When** fusion emits tuple
- **Then** UI shows nothing for that zone
- **And** debug log contains tuning event

### AC-008 MimeType negotiation
- **Given** Safari without WebM MediaRecorder support
- **When** recording starts
- **Then** recorder uses first `isTypeSupported` candidate
- **And** no hardcoded mimeType in code path

### AC-009 getUserMedia errors
- **Given** each of NotAllowed, NotFound, NotReadable, Overconstrained, Security, Abort
- **When** error thrown
- **Then** distinct user-facing message per taxonomy table

### AC-010 Kill switch
- **Given** live sensing active
- **When** teacher taps kill switch
- **Then** all tracks stop within 500ms
- **And** UI shows Empty state

## Non-functional (measure before release)

- Fusion e2e p95 ≤500ms — **profile required**
- Vision ≥5fps sustained on reference 2020 laptop — **profile required**
- Model cold start ≤3s — **profile required**
