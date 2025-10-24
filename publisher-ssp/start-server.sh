#!/bin/bash

echo "Starting Laravel Sail development server..."
bash vendor/bin/sail up -d

echo ""
echo "Laravel application is now running!"
echo "Access your application at: http://localhost"
echo ""
echo "To stop the server, run: bash vendor/bin/sail down"