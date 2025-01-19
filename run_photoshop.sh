#!/bin/bash
PHOTOSHOP="/Applications/Adobe Photoshop 2024/Adobe Photoshop 2024.app/Contents/MacOS/Adobe Photoshop 2024"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
JSX_SCRIPT="$SCRIPT_DIR/Finished.jsx"
"$PHOTOSHOP" -r "$JSX_SCRIPT"
