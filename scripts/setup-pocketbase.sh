#!/bin/bash

# Create pocketbase directory
mkdir -p pocketbase/{data,migrations,hooks}

# Download PocketBase
cd pocketbase
echo "Downloading PocketBase..."

# Detect architecture
ARCH=$(uname -m)
case $ARCH in
    x86_64)
        ARCH="amd64"
        ;;
    arm64|aarch64)
        ARCH="arm64"
        ;;
    armv7l)
        ARCH="armv7"
        ;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

# Download the latest PocketBase release
POCKETBASE_VERSION="0.23.5"
POCKETBASE_URL="https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_${ARCH}.zip"

curl -L -o pocketbase.zip "$POCKETBASE_URL"
unzip pocketbase.zip
rm pocketbase.zip

# Make executable
chmod +x pocketbase

echo "PocketBase downloaded successfully!"
echo "To start PocketBase, run: ./pocketbase/pocketbase serve"
echo "Admin UI will be available at: http://localhost:8090/_/"