#!/bin/bash
# Sync publisherssp_data.json between project root and public directory

ROOT_JSON="$(dirname "$0")/../publisherssp_data.json"
PUBLIC_JSON="$(dirname "$0")/public/publisherssp_data.json"

# Always copy from public to root
cp "$PUBLIC_JSON" "$ROOT_JSON"
echo "Copied $PUBLIC_JSON to $ROOT_JSON"
