#!/usr/bin/env python3
"""Verify one localized static-ad campaign from a JSON manifest."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def verify(manifest: dict) -> dict:
    source_root = Path(manifest["source_root"])
    target_root = Path(manifest["target_root"])
    source_code = manifest["source_code"]
    target_code = manifest["target_code"]
    expected_suffix = manifest.get("expected_suffix", ".png")
    batches = manifest["batches"]
    checks: list[dict] = []
    images: list[Path] = []

    expected_folders = {batch["target_folder"] for batch in batches}
    actual_folders = {
        path.name for path in target_root.iterdir()
        if path.is_dir() and path.name.startswith("#")
    }
    checks.append({
        "check": "campaign_folder_set",
        "passed": actual_folders == expected_folders,
        "missing": sorted(expected_folders - actual_folders),
        "unexpected": sorted(actual_folders - expected_folders),
    })

    for batch in batches:
        source = source_root / batch["source_folder"]
        target = target_root / batch["target_folder"]
        expected_count = int(batch["expected_count"])
        source_files = sorted(source.glob(f"{source_code} - *.png"))
        target_files = sorted(target.glob(f"{target_code} - *.png")) if target.exists() else []
        images.extend(target_files)
        expected_names = {
            path.name.replace(f"{source_code} - ", f"{target_code} - ", 1)
            for path in source_files
        }
        actual_names = {path.name for path in target_files}
        issues: list[str] = []
        if len(source_files) != expected_count:
            issues.append(f"source count {len(source_files)} != {expected_count}")
        if len(target_files) != expected_count:
            issues.append(f"target count {len(target_files)} != {expected_count}")
        if expected_names != actual_names:
            issues.append("source-to-target basename mapping mismatch")
        checks.append({
            "check": "batch",
            "source": batch["source_folder"],
            "target": batch["target_folder"],
            "expected_count": expected_count,
            "actual_count": len(target_files),
            "passed": not issues,
            "issues": issues,
            "missing": sorted(expected_names - actual_names),
            "unexpected": sorted(actual_names - expected_names),
        })

    hashes: dict[str, list[str]] = {}
    widths: list[int] = []
    heights: list[int] = []
    for path in images:
        issues: list[str] = []
        width = height = 0
        mode = ""
        if not path.name.startswith(f"{target_code} - "):
            issues.append("invalid target-language prefix")
        if not path.name.endswith(expected_suffix):
            issues.append("invalid filename suffix")
        if path.stat().st_size <= 50_000:
            issues.append("file size <= 50,000 bytes")
        try:
            with Image.open(path) as image:
                image.verify()
            with Image.open(path) as image:
                width, height = image.size
                mode = image.mode
        except Exception as exc:
            issues.append(f"PNG decode failed: {exc}")
        if mode != "RGB":
            issues.append(f"mode {mode} != RGB")
        if width < 900 or height < 1500:
            issues.append(f"resolution {width}x{height} below minimum")
        if height and not (0.53 <= width / height <= 0.59):
            issues.append(f"aspect ratio {width / height:.4f} outside tolerance")
        if width and height:
            widths.append(width)
            heights.append(height)
        sha = digest(path)
        hashes.setdefault(sha, []).append(str(path))
        checks.append({
            "check": "asset",
            "file": str(path),
            "passed": not issues,
            "issues": issues,
            "width": width,
            "height": height,
            "mode": mode,
            "bytes": path.stat().st_size,
            "sha256": sha,
        })

    duplicate_groups = [paths for paths in hashes.values() if len(paths) > 1]
    checks.append({"check": "duplicate_hashes", "passed": not duplicate_groups, "groups": duplicate_groups})
    expected_total = sum(int(batch["expected_count"]) for batch in batches)
    checks.append({"check": "total_count", "passed": len(images) == expected_total, "expected": expected_total, "actual": len(images)})

    ocr = {"attempted": False, "files": 0, "errors": 0, "recognized_lines": 0, "zero_line_files": 0}
    if manifest.get("ocr_path"):
        ocr_path = Path(manifest["ocr_path"])
        ocr["attempted"] = ocr_path.exists()
        if ocr_path.exists():
            data = json.loads(ocr_path.read_text(encoding="utf-8"))
            ocr.update({
                "files": len(data),
                "errors": sum(item.get("error") is not None for item in data),
                "recognized_lines": sum(len(item.get("lines", [])) for item in data),
                "zero_line_files": sum(not item.get("lines") for item in data),
            })

    failures = [check for check in checks if not check["passed"]]
    return {
        "language": manifest.get("language", target_root.name),
        "source_code": source_code,
        "target_code": target_code,
        "passed": not failures,
        "failure_count": len(failures),
        "image_count": len(images),
        "unique_hashes": len(hashes),
        "dimension_range": {
            "min_width": min(widths, default=0),
            "max_width": max(widths, default=0),
            "min_height": min(heights, default=0),
            "max_height": max(heights, default=0),
        },
        "ocr": ocr,
        "checks": checks,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    report = verify(manifest)
    payload = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.report:
        args.report.write_text(payload, encoding="utf-8")
    print(json.dumps({key: report[key] for key in ("language", "passed", "failure_count", "image_count", "unique_hashes", "dimension_range", "ocr")}, ensure_ascii=False, indent=2))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
