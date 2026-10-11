"""Prepare local portfolio video assets with FFmpeg; no production server required."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Video file, preferably a source with no prior compression")
    parser.add_argument("--project", help="Project ID to update in data.js after preparing assets")
    parser.add_argument("--start", type=float, default=0, help="Preview start time in seconds")
    parser.add_argument("--seconds", type=float, default=8, help="Preview length (maximum 10 seconds)")
    parser.add_argument("--ffmpeg", default="ffmpeg", help="FFmpeg executable path")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    source = args.source.resolve()
    if not source.is_file():
        parser.error("The source video does not exist.")
    if args.start < 0 or not 0 < args.seconds <= 10:
        parser.error("Use a non-negative start time and a preview length between 0 and 10 seconds.")
    executable = shutil.which(args.ffmpeg)
    if not executable:
        parser.error("Install FFmpeg locally or pass its executable with --ffmpeg.")
    media_dir = root / "assets" / "media"
    if not media_dir.is_dir():
        parser.error("The portfolio assets/media folder is missing.")

    data_path = root / "data.js"
    text = data_path.read_text(encoding="utf-8")
    decoder = json.JSONDecoder()
    data = {}
    for key in ["PROFILE", "THEME", "PROJECTS"]:
        match = re.search(r"const\s+" + key + r"\s*=\s*", text)
        if not match:
            parser.error(f"Could not read {key} from data.js.")
        data[key], _ = decoder.raw_decode(text[match.end():])
    project = None
    if args.project:
        project = next((item for item in data["PROJECTS"] if item["id"] == args.project), None)
        if project is None:
            parser.error("The requested project ID was not found.")
    base = re.sub(r"[^a-z0-9]+", "-", args.project or source.stem.lower()).strip("-")

    def run(*command):
        subprocess.run([executable, "-hide_banner", "-loglevel", "error", "-nostdin", "-y", *map(str, command)], check=True)

    def publish(path, suffix):
        digest = hashlib.sha256(path.read_bytes()).hexdigest()[:12]
        output = media_dir / f"{base}-{suffix}-{digest}{path.suffix}"
        if not output.exists():
            shutil.copyfile(path, output)
        return output.relative_to(root).as_posix(), output.stat().st_size

    with tempfile.TemporaryDirectory(prefix="portfolio-video-", dir=media_dir) as temporary:
        work = Path(temporary)
        full, preview, poster = work / "gameplay.mp4", work / "preview.mp4", work / "poster.jpg"
        run("-i", source, "-map", "0:v:0", "-map", "0:a?", "-vf", "scale=w='min(1920,iw)':h=-2",
            "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", full)
        run("-ss", args.start, "-i", source, "-t", args.seconds, "-an",
            "-vf", "scale=w='min(960,iw)':h=-2,fps=24", "-c:v", "libx264", "-preset", "medium",
            "-crf", "28", "-maxrate", "1400k", "-bufsize", "2800k", "-pix_fmt", "yuv420p", "-movflags", "+faststart", preview)
        if not preview.is_file() or preview.stat().st_size < 1024:
            parser.error("The preview is empty. Choose a start time inside the video.")
        if preview.stat().st_size > 3 * 1048576:
            parser.error("The preview exceeded 3 MB. Use a shorter clip.")
        run("-ss", args.start, "-i", source, "-frames:v", "1", "-vf", "scale=w='min(960,iw)':h=-2", "-q:v", "3", poster)
        full_path, full_size = publish(full, "gameplay")
        preview_path, preview_size = publish(preview, "preview")
        poster_path, _ = publish(poster, "poster")

    if project is not None:
        gallery = project.setdefault("media", [])
        selected_id = project.get("cardPreview", {}).get("mediaId")
        item = next((entry for entry in gallery if entry.get("type") == "video" and (
            entry.get("mediaId") == selected_id if selected_id else Path(root / entry.get("src", "")).resolve() == source
        )), None)
        if item is None:
            item = {"type": "video", "mediaId": f"{base}-gameplay", "label2": "Gameplay", "featured": not any(entry.get("featured") for entry in gallery)}
            gallery.append(item)
        item.update(src=full_path, poster=poster_path, bytes=full_size)
        item.pop("_file", None)
        project["cardPreview"] = {"enabled": True, "video": {"type": "video", "src": preview_path, "poster": poster_path, "bytes": preview_size}}
        project["mediaVersion"] = (project.get("mediaVersion") or 0) + 1
        new_text = "/* Portfolio data — local video assets prepared with scripts/optimize-video.py. */\n\n"
        new_text += "\n".join(f"const {key} = {json.dumps(data[key], ensure_ascii=False, indent=2)};\n" for key in data)
        data_path.write_text(new_text, encoding="utf-8")

    for label, path, size in [("Full video", full_path, full_size), ("Hover preview", preview_path, preview_size)]:
        print(f"{label}: {path} ({size / 1048576:.2f} MB)")
    print(f"Poster: {poster_path}")
    if project is not None:
        print(f"Updated {args.project} in data.js. Reload the admin before making further edits.")


if __name__ == "__main__":
    main()
