FROM python:3.11-slim

WORKDIR /app

COPY sut/container-stats-exporter/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sut/container-stats-exporter/main.py .

CMD ["python", "main.py"]
