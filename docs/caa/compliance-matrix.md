# Privacy & Compliance Control Matrix

**Disclaimer**: Legal conclusions below are engineering positions for product design, not legal advice. Where unsettled, flag for counsel.

| Control | Driver | Implementation | Residual risk | Owner |
|---------|--------|----------------|---------------|-------|
| No individual identification | FERPA-adjacent practice; product ethics | No face ID; no per-seat zones; no names in tuples; logs scrubbed | Teacher could still visually correlate zone + seating chart | Product |
| Zone tuple = education record? | FERPA (US) | **Unsettled — legal review required**. Position: anonymous aggregate zone activity is *not* an education record *if* no student ID link exists and retention ≤30d. **Assumption**: district agrees in DPA. Counter-argument: if combined with seating chart it becomes identifiable. Mitigate via coarse zones + training. | District interprets tuple as record | Legal + DPO |
| Under-13 on-device processing | COPPA | No account for students; processing is local; no persistent child PII. **Unsettled — legal review required** whether non-identifying sensor processing is "collection" when minors are in frame. Fact: camera sees minors; default landmark-free reduces biometric surface. | Classrooms with K-3 without parental notice | Legal |
| Biometric / special category | GDPR Art.9 | Landmark-free: designed outside "uniquely identifying" scope. Landmark-assisted: **may** constitute biometric processing — off by default; written consent artifact; DPIA required | EU school deployment blocked without DPIA | DPO |
| BIPA (Illinois) | 740 ILCS — **verify statute with counsel** | Landmark-free default avoids "scan of face geometry." Landmark-assisted requires written release before enable. No geometry to disk/network. | IL school enables landmark mode without release | Legal |
| DPIA | GDPR Art.35 | Required before minors in production; template in deployment kit | None if skipped | DPO |
| Zero egress live | Policy + COPPA/FERPA risk reduction | WASM workers; no frame upload; network partition safe | Malicious extension exfil — out of scope | Engineering |
| Consent artifact (upload) | FERPA; district policy | Upload disabled without `consentArtifactId` + expiry check | Forged consent client-side — server must validate | Engineering |
| Retention cap | Policy | Zone tuples ≤30d auto-purge; raw media deleted post-job | Backup systems may retain — infra policy needed | IT Admin |
| Covert operation prohibited | Ethical; BIPA notice | Always-on sensing indicator + kill switch | Teacher covers indicator — policy | Product |
| Right to dismiss | Human-in-the-loop | Dismiss stores anonymous tuning tuple only | None | Product |
| Accessibility | WCAG 2.2 AA | Zone label + glyph + position; not color alone | Motion sensitivity — respect `prefers-reduced-motion` | Design |

## DPO first objection (anticipated)
*"You are processing children's images in a classroom."*

**Response path**: Default landmark-free; on-device; no egress; no identity; coarse zones; visible indicator; kill switch; DPIA; district as controller; Prompt DNA as processor under DPA.
