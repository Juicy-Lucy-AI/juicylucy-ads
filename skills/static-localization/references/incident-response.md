# Incident response

| Symptom | Interpretation | Required response |
|---|---|---|
| Concurrency-limit / "too many concurrent requests" after adding a lane | Account request concurrency, not necessarily token exhaustion | Preserve checkpoints, pause the newest generation lane, return to the last stable count, continue QA on healthy lanes, report the rollback. |
| 429/503/circuit-open with no image | No-output service failure | Record separately; do not consume a content attempt. Retry after the service recovers. |
| Agent stream disconnects | Transport failure; files may still be complete | Reconcile the filesystem, hashes, and QA evidence before reassigning work. |
| Tracker count differs from folders | Tracker lag | Trust direct numbered-folder counts and exact basename mapping; update the tracker. |
| Uploader shows fewer ads while running | In-flight import or scoped job | Wait for completion, then compare language/ad-set/basename totals to the manifest. Never redefine the filesystem total from a mid-flight count. |
| OCR returns `nilError` or no lines | OCR engine unavailable/unsupported | Preserve raw evidence; full-resolution plus contact-sheet semantic review. |
| OCR misreads accents or non-Latin glyphs | Recognition lead, not proof | Compare the visible image to the locked copy. Do not auto-reject low-confidence output. |
| Long image render completes normally | Active rendering | Active wall time, not idle or retry. |
| More lanes throttle while fewer remain stable | Capacity ceiling discovered | Keep the stable lane count; add only one monitored lane after a stable batch if needed. |
| App restart recommended during production | Interruption risk | Defer restart when instructed; finish and checkpoint production first. |
| Cloud files present but cannot decode | Placeholder / incomplete sync | Open every final file during QA; do not hand off until all decode. |

Update `PROJECT_STATE.md` after every incident: timestamp, affected lane, last
accepted file, attempts consumed, next exact asset, and the recovery action.
