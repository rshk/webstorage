#!/bin/bash
cd "$( dirname "$BASH_SOURCE" )"
exec python3 -m http.server 5001 --bind 127.0.0.1
