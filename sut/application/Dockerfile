FROM python:3.11-slim

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

COPY sut/application/requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY sut/application/main.py /app/main.py
COPY sut/application/gunicorn.conf.py /app/gunicorn.conf.py
COPY sut/application/startup.sh /app/startup.sh
COPY sut/application/app /app/app
COPY sut/application/config /app/config

# Make startup script executable and set permissions
RUN chmod +x /app/startup.sh && \
    chown -R appuser:appgroup /app

CMD ["/app/startup.sh"]