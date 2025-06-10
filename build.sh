#!/bin/bash

# Render Build Script for HubTransfer

echo "🚀 Starting HubTransfer build process..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

# Initialize database if needed
echo "🗄️ Setting up database..."
npm run init-db

echo "✅ Build completed successfully!"
echo "🌟 HubTransfer is ready to deploy!"
