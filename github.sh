#! /usr/bin/bash

# This script is used to pull the changes to the github repository

# Change the directory to the repository
cd /var/www/brints-estate-backend/

# Pull the changes from the repository
git pull origin main --ff-only