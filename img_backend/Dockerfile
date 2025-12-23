FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run collectstatic to prepare static files for WhiteNoise
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Use gunicorn as production server
CMD ["gunicorn", "-c", "gunicorn.conf.py", "img_backend.wsgi:application"]
