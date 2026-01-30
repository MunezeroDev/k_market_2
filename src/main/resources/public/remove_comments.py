import os
import re

def remove_java_js_comments(content):
    # Remove single-line comments (//)
    content = re.sub(r'//.*?$', '', content, flags=re.MULTILINE)
    # Remove multi-line comments (/* ... */)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    return content

def remove_css_comments(content):
    # Remove /* ... */ comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    return content

def remove_html_comments(content):
    # Remove <!-- ... --> comments
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    return content

def process_file(filepath):
    # Read the file
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Determine file type and remove comments
    if filepath.endswith('.java') or filepath.endswith('.js'):
        content = remove_java_js_comments(content)
    elif filepath.endswith('.css'):
        content = remove_css_comments(content)
    elif filepath.endswith('.html') or filepath.endswith('.htm'):
        content = remove_html_comments(content)
    else:
        return  # Skip unsupported files
    
    # Write back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Processed: {filepath}")

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.java', '.js', '.html', '.htm', '.css')):
                filepath = os.path.join(root, file)
                process_file(filepath)

if __name__ == "__main__":
    # Specify your directory path here
    directory_path = "."  # Current directory, or specify a path like "/path/to/your/code"
    
    print(f"Starting to process files in: {directory_path}")
    process_directory(directory_path)
    print("Done!")