# PDF Generation Instructions

## Prerequisites

1. Install Pandoc:
   - Windows: Download from https://pandoc.org/installing.html
   - Linux: `sudo apt-get install pandoc`
   - Mac: `brew install pandoc`

2. Install LaTeX (needed for PDF generation):
   - Windows: Install MiKTeX from https://miktex.org/download
   - Linux: `sudo apt-get install texlive-full`
   - Mac: Install MacTeX from https://www.tug.org/mactex/

3. Install the Eisvogel template:
   ```bash
   wget https://raw.githubusercontent.com/Wandmalfarbe/pandoc-latex-template/master/eisvogel.tex
   mkdir -p ~/.pandoc/templates
   mv eisvogel.tex ~/.pandoc/templates/eisvogel.latex
   ```

## Generating the PDF

1. Open a terminal in the project root directory
2. Run the generation script:
   - Windows: `scripts\generate_pdf.bat`
   - Linux/Mac: `./scripts/generate_pdf.sh`

The PDF will be generated in the `docs` folder as `SwachhtaDashboard_Documentation.pdf`

## Troubleshooting

If you encounter any errors:

1. Ensure all prerequisites are installed
2. Check that paths in the script match your system
3. Try running pandoc manually:
   ```bash
   pandoc docs/documentation.md -o docs/SwachhtaDashboard_Documentation.pdf --from markdown --template eisvogel
   ```
