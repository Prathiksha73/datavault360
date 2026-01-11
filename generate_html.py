import markdown
import os

# Configuration
INPUT_FILE = '/Users/viditparashar/.gemini/antigravity/brain/ea2fe458-8463-4349-b2ea-a7ad3f18f71f/technical_documentation.md'
OUTPUT_FILE = '/Users/viditparashar/.gemini/antigravity/brain/ea2fe458-8463-4349-b2ea-a7ad3f18f71f/technical_documentation.html'

# CSS for better styling (Print-friendly)
CSS = """
<style>
    body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        background: #fff;
    }
    h1 {
        font-size: 28pt;
        color: #1a56db;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 20px;
        margin-bottom: 30px;
    }
    h2 {
        font-size: 20pt;
        color: #1f2937;
        margin-top: 40px;
        margin-bottom: 20px;
        background-color: #f3f4f6;
        padding: 10px 15px;
        border-radius: 8px;
    }
    h3 {
        font-size: 16pt;
        color: #4b5563;
        margin-top: 30px;
        margin-bottom: 15px;
        border-bottom: 1px solid #e5e7eb;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 10pt;
    }
    th, td {
        border: 1px solid #e5e7eb;
        padding: 12px 15px;
        text-align: left;
        vertical-align: top;
    }
    th {
        background-color: #eff6ff;
        color: #1e40af;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 9pt;
        letter-spacing: 0.05em;
    }
    tr:nth-child(even) td {
        background-color: #f9fafb;
    }
    code {
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        background-color: #f3f4f6;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
        color: #c2410c;
    }
    pre {
        background-color: #1f2937;
        color: #f9fafb;
        padding: 20px;
        border-radius: 8px;
        overflow-x: auto;
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        font-size: 9pt;
    }
    p {
        margin-bottom: 15px;
        text-align: justify;
    }
    ul, ol {
        padding-left: 20px;
        margin-bottom: 15px;
    }
    li {
        margin-bottom: 5px;
    }
    
    @media print {
        body {
            max-width: 100%;
            padding: 20px;
        }
        h2 {
            page-break-before: always;
            background-color: transparent;
            border-bottom: 2px solid #333;
            padding: 0;
        }
        h2:first-of-type {
            page-break-before: avoid;
        }
        pre {
            white-space: pre-wrap;
            border: 1px solid #ccc;
        }
    }
</style>
"""

def generate_html():
    print("Reading Markdown...")
    with open(INPUT_FILE, 'r') as f:
        md_text = f.read()

    print("Converting to HTML...")
    html_content = markdown.markdown(md_text, extensions=['tables', 'fenced_code'])

    print("Adding Styles...")
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Technical Documentation</title>
        {CSS}
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    print(f"Writing HTML to: {OUTPUT_FILE}")
    with open(OUTPUT_FILE, "w") as f:
        f.write(full_html)
    
    print("Done!")

if __name__ == "__main__":
    generate_html()
