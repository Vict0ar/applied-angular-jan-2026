#!/bin/bash

# Get list of directories in src/app/areas excluding 'shared'
areas_dir="src/app/areas"
areas=()

# Read directories into array (compatible with Git Bash on Windows)
for dir in "$areas_dir"/*/ ; do
    if [ -d "$dir" ]; then
        basename=$(basename "$dir")
        if [ "$basename" != "shared" ]; then
            areas+=("$basename")
        fi
    fi
done

# Sort the areas array
IFS=$'\n' areas=($(sort <<<"${areas[*]}"))
unset IFS

# Check if any areas were found
if [ ${#areas[@]} -eq 0 ]; then
    echo "No areas found in $areas_dir (excluding 'shared')"
    exit 1
fi

# Display menu of areas (compatible replacement for select)
echo "Select an area:"
for i in "${!areas[@]}"; do
    echo "$((i+1))) ${areas[$i]}"
done

# Get user selection
while true; do
    read -p "Enter selection (1-${#areas[@]}): " selection
    if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le "${#areas[@]}" ]; then
        area="${areas[$((selection-1))]}"
        echo "Selected area: $area"
        break
    else
        echo "Invalid selection. Please try again."
    fi
done

# Ask for feature name
read -p "Enter the name of the feature: " feature_name

# Validate feature name is not empty
if [ -z "$feature_name" ]; then
    echo "Feature name cannot be empty"
    exit 1
fi

# Set up paths
template_dir=".templates/landing-feature"
output_dir="src/app/areas/$area"
feature_dir="$output_dir/feature-${feature_name}"

# Check if feature directory already exists
if [ -d "$feature_dir" ]; then
    echo "Error: Feature directory $feature_dir already exists"
    exit 1
fi

echo "Creating feature: $feature_name in $output_dir"

# Discover and process all template files
echo "Discovering template files..."
template_files=$(find "$template_dir" -type f)

if [ -z "$template_files" ]; then
    echo "Error: No template files found in $template_dir"
    exit 1
fi

echo "Processing template files..."

# Process each template file
while IFS= read -r template_file; do
    # Calculate relative path from template directory
    relative_path="${template_file#$template_dir/}"
    
    # Replace {{name}} with feature_name in the path
    output_path="$feature_dir/${relative_path//\{\{name\}\}/$feature_name}"
    
    # Create parent directory if needed
    output_parent=$(dirname "$output_path")
    mkdir -p "$output_parent"
    
    # Process file content and write to output
    sed -e "s/{{name}}/$feature_name/g" -e "s/{{ name }}/$feature_name/g" "$template_file" > "$output_path"
    echo "Created: $output_path"
done <<< "$template_files"

# Add route to app.routes.ts
echo "Adding route to app.routes.ts..."
app_routes_file="src/app/app.routes.ts"

# Construct the route entry
# Convert feature_name to camelCase for the export name (e.g., my-feature -> myFeature)
camel_case_name=$(echo "$feature_name" | sed -r 's/(^|-)([a-z])/\U\2/g' | sed 's/^./\l&/')
route_export_name="${camel_case_name}FeatureRoutes"

# Build the new route entry
new_route="  {
    path: '$feature_name',
    loadChildren: () =>
      import('./areas/$area/feature-${feature_name}/${feature_name}-landing/${feature_name}.routes').then((r) => r.$route_export_name),
  },"

# Find the line number of the wildcard route and insert before it
wildcard_line=$(grep -n "path: '\*\*'" "$app_routes_file" | cut -d: -f1)

if [ -z "$wildcard_line" ]; then
    echo "Warning: Could not find wildcard route in $app_routes_file"
    echo "Please manually add the route to app.routes.ts"
else
    # We need to find the opening brace of the wildcard route object
    # Work backwards from the wildcard_line to find the nearest '{'
    insert_line=$wildcard_line
    while [ $insert_line -gt 1 ]; do
        line_content=$(sed -n "${insert_line}p" "$app_routes_file")
        if [[ "$line_content" =~ ^[[:space:]]*\{[[:space:]]*$ ]]; then
            break
        fi
        insert_line=$((insert_line - 1))
    done
    
    # Insert before the opening brace
    insert_line=$((insert_line - 1))
    
    # Create a temporary file with the new route inserted
    head -n "$insert_line" "$app_routes_file" > "$app_routes_file.tmp"
    echo "$new_route" >> "$app_routes_file.tmp"
    tail -n +$((insert_line + 1)) "$app_routes_file" >> "$app_routes_file.tmp"
    
    # Replace the original file
    mv "$app_routes_file.tmp" "$app_routes_file"
    
    echo "Route added to $app_routes_file"
fi

echo ""
echo "Feature '$feature_name' scaffolded successfully in $feature_dir"
