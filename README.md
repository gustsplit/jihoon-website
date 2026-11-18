# Jihoon's Website

A simple, brick-themed personal website for Jihoon, built with plain HTML, CSS, and a little JavaScript.

## Structure

The layers are kept strictly separate:

- `frontend/`: the user interface only
  - `index.html`: page layout
  - `styles.css`: colors and brick styles
  - `app.js`: renders the homepage
  - `bricks.html`, `bricks.js`: My Favorite Bricks page
  - `brick-art.js`: draws brick pictures (one solid color per stud)
  - `game.html`, `game.js`: Stud Stacking Game screen and animations
- `backend/`: data and data logic only
  - `content.js`: the site's text, the favorite bricks list, and the stacking game rule
- `interface/`: the bridge between them
  - `api.js`: the front-end asks this layer for data; it never reads the back-end directly
- `index.html` (root): just sends visitors to `frontend/index.html`

## Colors

Red #D01012, yellow #FFCF00, blue #0055BF, green #00852B. Every stud is one solid color, never blended.

## Run it

Open `index.html` in a browser.

This is an unofficial fan-made design. LEGO® is a trademark of the LEGO Group, which does not sponsor or endorse this site.
