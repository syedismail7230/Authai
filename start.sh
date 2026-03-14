#!/bin/bash

echo "🚀 Starting AuthAI.pro..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please update .env with your credentials before running again."
    exit 1
fi

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "📦 Building and starting services..."
docker-compose up --build

echo "✅ AuthAI.pro is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 API: http://localhost:5000"
echo "🤖 AI Service: http://localhost:5001"
