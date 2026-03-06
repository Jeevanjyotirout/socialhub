FROM python:3.11-slim

# System deps (ffmpeg required by yt-dlp)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    python -m spacy download en_core_web_sm

COPY . .

RUN mkdir -p downloads

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
