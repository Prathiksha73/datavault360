import markdown
from weasyprint import HTML, CSS as WeasyCSS
import os

# Configuration
INPUT_FILE = '/Users/viditparashar/.gemini/antigravity/brain/ea2fe458-8463-4349-b2ea-a7ad3f18f71f/technical_documentation.md'
OUTPUT_FILE = '/Users/viditparashar/.gemini/antigravity/brain/ea2fe458-8463-4349-b2ea-a7ad3f18f71f/technical_documentation.pdf'

# CSS for better styling
STYLE = """
    @page {
        margin: 2cm;
    }
    body {
        font-family: Helvetica, sans-serif;
        font-size: 10pt;
        line-height: 1.5;
        color: #333;
    }
    h1 {
        font-size: 24pt;
        color: #1a56db; /* Indigo-600 */
        margin-bottom: 20px;
        border-bottom: 2px solid #ddd;
        padding-bottom: 10px;
    }
    h2 {
        font-size: 18pt;
        color: #333;
        margin-top: 25px;
        margin-bottom: 15px;
        background-color: #f3f4f6;
        padding: 5px 10px;
        border-radius: 5px;
    }
    h3 {
        font-size: 14pt;
        margin-top: 20px;
        color: #4b5563; /* Gray-600 */
        border-bottom: 1px solid #eee;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        margin-bottom: 20px;
        font-size: 9pt;
    }
    th, td {
        border: 1px solid #e5e7eb;
        padding: 8px 12px;
        text-align: left;
        vertical-align: top;
    }
    th {
        background-color: #eff6ff; /* Blue-50 */
        font-weight: bold;
        color: #1e40af; /* Blue-800 */
    }
    td {
        background-color: #fff;
    }
    tr:nth-child(even) td {
        background-color: #f9fafb; /* Gray-50 */
    }
    code {
        font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
        background-color: #f3f4f6;
        padding: 2px 4px;
        border-radius: 4px;
        font-size: 9pt;
        color: #c2410c; /* Orange-700 */
    }
    pre {
        background-color: #1f2937; /* Gray-800 */
        color: #f3f4f6;
        padding: 15px;
        border-radius: 8px;
        white-space: pre-wrap;
        font-family: Menlo, monospace;
        font-size: 8pt;
    }
"""

def convert_to_pdf():
    print("Reading Markdown...")
    with open(INPUT_FILE, 'r') as f:
        md_text = f.read()

    print("Converting to HTML...")
    html_content = markdown.markdown(md_text, extensions=['tables', 'fenced_code'])

    print("Generating PDF...")
    HTML(string=html_content).write_pdf(OUTPUT_FILE, stylesheets=[WeasyCSS(string=STYLE)])
    
    print(f"Successfully generated PDF at: {OUTPUT_FILE}")

if __name__ == "__main__":
    convert_to_pdf()
