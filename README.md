# Crimson Eclipse — Interactive Graphic Novel

A responsive, static comic-story website inspired by cinematic scroll-based graphic novels. It uses HTML, CSS, inline SVG artwork, and vanilla JavaScript—no build step or framework required.

## Run it
1. Extract the ZIP.
2. Open `index.html` in a modern browser.
3. For local hosting, you can use VS Code Live Server or any static file server. It also works on GitHub Pages.

## Features
- Responsive mobile and desktop layouts
- Original comic-style SVG illustrations included directly in the HTML
- Scroll progress bar and reveal-on-scroll effects
- Ambient sound toggle (browser Web Audio API; only starts after tapping)
- High-contrast toggle
- Interactive chapter ending
- Reduced-motion accessibility support

## Publish with GitHub Pages
1. Create a public GitHub repository named `crimson-eclipse`.
2. Upload `index.html`, `styles.css`, `script.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then Save.
6. Wait for GitHub Pages to provide the website URL.

## Customize
- Story text and panels: edit `index.html`.
- Colors, typography, layout, and animations: edit `styles.css`.
- Interactions: edit `script.js`.

The story and artwork in this starter are original demo content, not a copy of the referenced website.


## Add and manage story content
- Open `editor.html` on the same hosted website to add extra chapters, story text, illustration URLs, and source/reference links.
- The editor saves changes in the current browser's local storage. On a deployed GitHub Pages site, the editor and story page share the same origin, so newly added chapters appear on the story page in that browser.
- Use **Export JSON** to back up the added content. **Import JSON** restores a previous export.
- Browser storage is local to that browser/device. To make new content visible to all visitors, export the JSON and commit the content to the project or ask for a data-file-backed publishing workflow. External source links are references; they do not scrape or copy external pages automatically.
