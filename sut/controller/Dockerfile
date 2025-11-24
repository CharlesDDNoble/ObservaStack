FROM python:3.11-slim

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

COPY sut/controller/requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY sut/controller/main.py /app/main.py
COPY sut/controller/gunicorn.conf.py /app/gunicorn.conf.py
COPY sut/controller/startup.sh /app/startup.sh

# Make startup script executable and set permissions
RUN chmod +x /app/startup.sh && \
    chown -R appuser:appgroup /app

CMD ["/app/startup.sh"]