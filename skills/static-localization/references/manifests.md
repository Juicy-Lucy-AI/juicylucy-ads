# Verification manifests

Two JSON manifests drive the deterministic verifiers in [`../scripts/`](../scripts/).
Both verifiers run through the provisioned Python entry point (`adspython`, installed
by the setup skill); absolute paths throughout, so a resumed session does not depend
on its working directory.

## Language manifest

One per language, consumed by `verify_campaign.py`. Template:
[`../templates/LANGUAGE_MANIFEST.json`](../templates/LANGUAGE_MANIFEST.json).

```json
{
  "language": "[Target language name]",
  "source_root": "/absolute/path/to/[source language folder]",
  "target_root": "/absolute/path/to/[target language folder]",
  "source_code": "[source code from languages.json]",
  "target_code": "[target code from languages.json]",
  "expected_suffix": "_[YYYY.MM.DD].png",
  "ocr_path": "/absolute/path/to/[target]/.qa/ocr.json",
  "batches": [
    {
      "source_folder": "[#NNNN LL - exact source folder name]",
      "target_folder": "[#NNNN LL - exact inherited folder name]",
      "expected_count": 0
    }
  ]
}
```

`ocr_path` is optional. Include every batch in order.

```bash
~/.juicylucy/bin/adspython <SKILL_DIR>/scripts/verify_campaign.py manifest.json \
  --report /absolute/path/to/final-qa-report.json
```

Exits nonzero if folder sets, counts, filename mappings, image integrity, RGB mode,
geometry, file size, or within-language hash uniqueness fail. The script implements
the asset gate whose authoritative values are the `juicylucy` skill's `evidence.json`.
OCR statistics are recorded but never treated as language correctness on their own.

## Project manifest

One per campaign, consumed by `verify_multilanguage_campaign.py`. Template:
[`../templates/CAMPAIGN_MANIFEST.json`](../templates/CAMPAIGN_MANIFEST.json).

```bash
~/.juicylucy/bin/adspython <SKILL_DIR>/scripts/verify_multilanguage_campaign.py project-manifest.json \
  --report /absolute/path/to/overall-final-qa-report.json
```

Reruns every language verifier, then checks global hash uniqueness, total languages,
folders, and final images.

**Fill the `*_expected` fields from the locked contract, never from the observed
filesystem** — the verifier defaults any omitted expectation to the observed value,
which silently disarms that check.
