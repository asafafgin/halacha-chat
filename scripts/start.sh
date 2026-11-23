#!/bin/sh
# הפעלת השרת. אם עדיין אין עותק מקומי של הספרייה, בונים אותו קודם (כחצי דקה עד דקה).
set -e
if [ ! -f "${HALACHA_LIBRARY_DB:-data/library.db}" ]; then
  echo "בונה את העותק המקומי של הספרייה…"
  npm run library:build
fi
exec node --disable-warning=ExperimentalWarning .output/server/index.mjs
