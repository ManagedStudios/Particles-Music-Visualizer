#!/bin/bash

# Directory to scan
DIRECTORY="/Users/dibbo/IdeaProjects/Interactive-Particles-Music-Visualizer/src/audio_files"  # Replace with the path to your folder

# Output file
OUTPUT_FILE="$DIRECTORY/mapped_filenames.txt"

# Empty the output file if it exists, or create it
> "$OUTPUT_FILE"

# Iterate over each file in the directory
for FILE in "$DIRECTORY"/*; do
    # Get the base name of the file
    FILE_NAME=$(basename "$FILE")

    FILE_NAME_SANITIZED=$(echo "$FILE_NAME" | sed 's/[^[:alnum:]]/_/g')
    
    # Map the file name to the desired format
    H=" $FILE_NAME_SANITIZED "
    MAPPED_STRING="static $FILE_NAME_SANITIZED = \`./src/audio_files/$FILE_NAME\`"
    
    
    
    # Append the mapped string to the output file
    echo "$MAPPED_STRING" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

echo "Mapping completed. Mapped file names saved to $OUTPUT_FILE."
