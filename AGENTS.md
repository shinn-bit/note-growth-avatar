<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Handling Notes

- This repository contains Japanese text and uses UTF-8. When reading files from PowerShell, explicitly use UTF-8, for example `Get-Content -Raw -Encoding UTF8 <path>`, so Japanese UI copy and documentation are not misread as mojibake.
- Git for this project is managed from this `frontend/` directory. Run Git commands here unless a task explicitly targets files outside the frontend repository.
