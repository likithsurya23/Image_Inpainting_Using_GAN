# Docker Deployment Guide

This guide explains how to run the Image Inpainting Application using Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

## Directory Structure

- `img_backend/`: Django Backend
- `img_frontend/`: React Frontend (Vite)
- `docker-compose.yml`: Orchestration file

## Quick Start

1. Open a terminal in the project root directory.
2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
3. Wait for the build to complete. The first time may take a few minutes to install dependencies.

## Accessing the Application

- **Frontend**: Open [http://localhost](http://localhost) in your browser.
- **Backend API**: Accessible at [http://localhost:8000](http://localhost:8000).

## Configuration Details

### Ports
- **Frontend**: Exposed on port 80.
- **Backend**: Exposed on port 8000.

### Persistence
The following files/directories are mounted from your host machine to persist data:
- `img_backend/db.sqlite3`: The SQLite database.
- `img_backend/media`: Uploaded images and inpainting results.
- `img_backend/models`: Generator weights.

### Environment Variables
The `docker-compose.yml` sets necessary environment variables for production:
- `DEBUG=False`
- `CORS_ALLOWED_ORIGINS=http://localhost`
- `VITE_API_BASE_URL=http://localhost` (baked into frontend build)

## Troubleshooting

- **Backend not starting**: Check if port 8000 is already in use.
- **Frontend not connecting**: Ensure the backend container is running and healthy. You can check logs with:
  ```bash
  docker-compose logs -f
  ```
