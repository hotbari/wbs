#!/bin/bash
# design-only-guard.sh
# Blocks backend file edits when design-trend-modernizer agent is active.
# Exit 2 = block the tool call with an error message.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# No file_path means it's a Bash command or similar — allow it
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Block backend file extensions
case "$FILE_PATH" in
  *.py|*.go|*.java|*.rb|*.php|*.sql|*.rs|*.c|*.cpp|*.h|*.env|*.env.*)
    echo "🚫 Blocked: design-trend-modernizer cannot edit backend file: $FILE_PATH" >&2
    exit 2
    ;;
  Dockerfile|docker-compose.yml|docker-compose.yaml)
    echo "🚫 Blocked: design-trend-modernizer cannot edit infrastructure file: $FILE_PATH" >&2
    exit 2
    ;;
  next.config.js|next.config.ts|next.config.mjs|vite.config.*|webpack.config.*)
    echo "🚫 Blocked: design-trend-modernizer cannot edit build config file: $FILE_PATH" >&2
    exit 2
    ;;
esac

# Block backend path patterns (but allow /components/ inside any of these if present)
if echo "$FILE_PATH" | grep -qE '/(api|server|backend|db|migrations|routes)/' && \
   ! echo "$FILE_PATH" | grep -qE '/components/'; then
  echo "🚫 Blocked: design-trend-modernizer cannot edit backend path: $FILE_PATH" >&2
  exit 2
fi

exit 0
