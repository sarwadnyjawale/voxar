"""
Patch voices_catalog.json to add preview_urls for existing preview files.
Run from project root: python patch_catalog.py
"""
import json
import os

CATALOG_PATH = "voices/voices_catalog.json"
PREVIEWS_DIR = "voices/previews"

with open(CATALOG_PATH, "r") as f:
    catalog = json.load(f)

patched = 0
missing = 0

for voice in catalog["voices"]:
    vid = voice["id"]
    preview_file = f"{vid}.wav"
    preview_path = os.path.join(PREVIEWS_DIR, preview_file)

    if os.path.exists(preview_path):
        voice["preview_urls"] = {"default": f"previews/{preview_file}"}
        patched += 1
        print(f"  OK  {vid}: previews/{preview_file}")
    else:
        missing += 1
        print(f"  MISS {vid}: {preview_path} not found")

with open(CATALOG_PATH, "w") as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

print(f"\nDone. Patched: {patched}, Missing: {missing}, Total: {len(catalog['voices'])}")
