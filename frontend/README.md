Frontend folder structure (created)

- src/
  - features/ # feature modules (pages, domain-specific logic)
  - components/ # reusable UI components
  - assets/
    - images/ # bitmap images
    - icons/ # svg or icon files
    - styles/ # global CSS or SCSS
  - services/ # API interaction services
  - utils/ # utility functions

Notes:

- Place real assets under `src/assets/...` and import them from components.
- Use `VITE_API_BASE_URL` from `.env` to point to backend during development.
