#!/bin/bash

# ARGS
VERSION_TYPE=$1 # patch, minor, major

# Get the current version from the Chart.yaml file
current_version=$(grep -oP 'version:\s*\K[0-9]+\.[0-9]+\.[0-9]+' helm/Chart.yaml | tr -d '[:space:]')

# Increment the version number
if [ "$VERSION_TYPE" == "patch" ]; then
  new_version=$(echo $current_version | awk -F. -v OFS=. '{$NF++; print}')
elif [ "$VERSION_TYPE" == "minor" ]; then
  new_version=$(echo $current_version | awk -F. -v OFS=. '{$2++; $3=0; print}')
elif [ "$VERSION_TYPE" == "major" ]; then
  new_version=$(echo $current_version | awk -F. -v OFS=. '{$1++; $2=0; $3=0; print}')
fi

# Output the new version
echo "$new_version"