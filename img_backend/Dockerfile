FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (required for OpenCV / ML)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files for WhiteNoise
RUN python manage.py collectstatic --noinput

# Expose Render port
EXPOSE 8000

# Run Django with Gunicorn (Render compatible)
CMD ["gunicorn", "img_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "1", "--timeout", "120"]
