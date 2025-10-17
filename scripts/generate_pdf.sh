#!/bin/bash

echo "Generating PDF documentation..."

pandoc ../docs/documentation.md \
    -o ../docs/SwachhtaDashboard_Documentation.pdf \
    --from markdown \
    --template eisvogel \
    --toc \
    --number-sections \
    -V papersize=a4 \
    -V titlepage=true \
    -V toc-own-page=true \
    -V linkcolor=blue \
    -V geometry:margin=2.5cm

echo "PDF generation complete!"
