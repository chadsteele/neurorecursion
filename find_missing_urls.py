#!/usr/bin/env python3
import subprocess
import json

# Get URLs from Conditions.js
conditions = subprocess.run(
    ["grep", "-o", 'ngo_url: "[^"]*"', "src/data/Conditions.js"],
    capture_output=True, text=True
).stdout.strip().split('\n')
conditions_urls = set(line.split('"')[1] for line in conditions if line)

# Get URLs from NGOs.js
ngos = subprocess.run(
    ["grep", "-o", 'href: "[^"]*"', "src/data/NGOs.js"],
    capture_output=True, text=True
).stdout.strip().split('\n')
ngos_urls = set(line.split('"')[1] for line in ngos if line)

# Find missing
missing = sorted(conditions_urls - ngos_urls)

print("URLs in Conditions.js but NOT in NGOs.js:")
print("=" * 70)
print(f"Total missing: {len(missing)}\n")
for url in missing:
    print(url)
