#!/usr/bin/env python3
"""Run language manifests and reconcile the complete multilingual campaign."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from verify_campaign import verify


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("project_manifest", type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    project_path = args.project_manifest.resolve()
    project = json.loads(project_path.read_text(encoding="utf-8"))
    results: list[dict] = []
    global_hashes: dict[str, list[str]] = {}
    folders_actual = 0
    images_actual = 0

    for manifest_value in project["language_manifests"]:
        manifest_path = Path(manifest_value)
        if not manifest_path.is_absolute():
            manifest_path = project_path.parent / manifest_path
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        result = verify(manifest)
        result["manifest"] = str(manifest_path)
        results.append(result)
        folders_actual += len(manifest["batches"])
        images_actual += result["image_count"]
        for check in result["checks"]:
            if check.get("check") == "asset" and check.get("sha256"):
                global_hashes.setdefault(check["sha256"], []).append(check["file"])

    duplicate_groups = [paths for paths in global_hashes.values() if len(paths) > 1]
    expected_languages = int(project.get("languages_expected", len(results)))
    expected_folders = int(project.get("folders_expected", folders_actual))
    expected_images = int(project.get("images_expected", images_actual))
    passed = (
        len(results) == expected_languages
        and folders_actual == expected_folders
        and images_actual == expected_images
        and all(result["passed"] for result in results)
        and not duplicate_groups
    )
    payload = {
        "project": project.get("project", project_path.stem),
        "passed": passed,
        "languages_expected": expected_languages,
        "languages_actual": len(results),
        "folders_expected": expected_folders,
        "folders_actual": folders_actual,
        "images_expected": expected_images,
        "images_actual": images_actual,
        "global_unique_hashes": len(global_hashes),
        "global_duplicate_groups": duplicate_groups,
        "languages": results,
    }
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if args.report:
        args.report.write_text(text, encoding="utf-8")
    print(json.dumps({
        "passed": passed,
        "languages_actual": len(results),
        "folders_actual": folders_actual,
        "images_actual": images_actual,
        "global_unique_hashes": len(global_hashes),
        "duplicate_groups": len(duplicate_groups),
    }, ensure_ascii=False, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
