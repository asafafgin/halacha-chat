# הלכה בצ׳אט: שרת Node עם עותק מקומי של הספרייה.
# את data/ כדאי לחבר לדיסק קבוע (volume), כדי שהספרייה לא תורד מחדש בכל הפעלה.
FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV PORT=3000 HALACHA_LIBRARY_DB=/app/data/library.db
EXPOSE 3000
CMD ["sh", "scripts/start.sh"]
