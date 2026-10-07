#!/usr/bin/env python3
"""Build one visual-review contact sheet per numbered campaign folder."""

from __future__ import annotations

import argparse
import re
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


THUMB = (282, 502)
LABEL_HEIGHT = 76
GAP = 18
MARGIN = 24


def font(size: int) -> ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def short_name(path: Path) -> str:
    name = path.name
    if " - " in name:
        name = name.split(" - ", 1)[1]
    return re.split(r" - (?:AUTO|PRO|XG)_", name, maxsplit=1)[0].removesuffix(path.suffix)


def sheet_for(folder: Path, output: Path, columns: int) -> None:
    images = sorted(folder.glob("*.png"))
    if not images:
        return
    rows = (len(images) + columns - 1) // columns
    width = MARGIN * 2 + columns * THUMB[0] + (columns - 1) * GAP
    height = MARGIN * 2 + rows * (THUMB[1] + LABEL_HEIGHT) + max(0, rows - 1) * GAP
    sheet = Image.new("RGB", (width, height), "#191919")
    draw = ImageDraw.Draw(sheet)
    label_font = font(15)

    for index, path in enumerate(images):
        row, column = divmod(index, columns)
        x = MARGIN + column * (THUMB[0] + GAP)
        y = MARGIN + row * (THUMB[1] + LABEL_HEIGHT + GAP)
        with Image.open(path).convert("RGB") as image:
            thumb = ImageOps.fit(image, THUMB, method=Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x, y))
        wrapped = "\n".join(textwrap.wrap(short_name(path), width=30)[:3])
        draw.multiline_text((x, y + THUMB[1] + 8), wrapped, fill="#f5f5f5", font=label_font, spacing=3)

    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, quality=92)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    # The output directory is spelled both ways: positionally, and as --output,
    # which is how the skill documents the call. Accept either, never both.
    parser.add_argument("output", type=Path, nargs="?")
    parser.add_argument("--output", dest="output_flag", type=Path)
    parser.add_argument("--columns", type=int, default=5)
    args = parser.parse_args()
    if args.output and args.output_flag:
        parser.error("give the output directory once — positionally or as --output, not both")
    output = args.output_flag or args.output
    if output is None:
        parser.error("an output directory is required (positionally or as --output)")
    for folder in sorted(path for path in args.root.iterdir() if path.is_dir() and path.name.startswith("#")):
        label = " ".join(folder.name.split()[:2])
        sheet_for(folder, output / f"{label}-contact-sheet.jpg", args.columns)


if __name__ == "__main__":
    main()
