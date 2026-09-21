# SPM Industries Website

A lightweight, responsive static website for SPM Industries and its technology, entrepreneurship and social-impact ecosystem in Batticaloa.

## Run locally

Open `index.html` in a browser, or use a local static server such as VS Code Live Server.

## Structure

```
index.html          Main page and content
css/style.css       Design system, responsive layout and animations
js/script.js        Mobile navigation and scroll reveals
assets/images/      Replaceable future imagery
assets/icons/       Reserved for future icon assets
assets/logos/       Reserved for logo files
IMAGE-GUIDE.md      Required image specifications
```

## Updating the site

- **Images:** Add the supplied files to `assets/images/`, then replace the relevant `.placeholder` block in `index.html` with an `<img>` tag using `loading="lazy"` (except the hero).
- **Colours:** Edit the CSS variables at the top of `css/style.css`.
- **Text:** All site content is clearly grouped in semantic sections in `index.html`.
- **Deployment:** Upload the complete folder to any static host, such as Netlify, GitHub Pages, Cloudflare Pages or a conventional web host.

## Technologies

HTML5, CSS3 and vanilla JavaScript. Google Fonts are loaded for Manrope and Space Grotesk; no frameworks or heavy dependencies are used.
