#!/bin/sh

# Xcode Cloud post-clone script for FeelingPrepper.
#
# FeelingPrepper is a Capacitor app: the native iOS project loads web assets
# that are produced by the Vite build and copied in by `cap sync`. Those
# generated assets (frontend/ios/App/App/public, capacitor.config.json) are NOT
# committed to git, so Xcode Cloud must regenerate them after cloning the repo,
# before the Xcode build runs.

set -e

echo "===> Installing Node"
brew install node

echo "===> Building web app"
cd "$CI_PRIMARY_REPOSITORY_PATH/frontend"
npm ci
npm run build

echo "===> Syncing Capacitor (iOS)"
npx cap sync ios

echo "===> ci_post_clone complete"
