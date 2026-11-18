# Jihoon's Arcade

Four games copied from Jihoon's Mini Roblox project, made to run on static GitHub Pages (no server).
They open from the "Arcade Departures" board on the homepage (Gates A1 to A4).

| Gate | Game | Screen (frontend) | Logic / data (backend) | Glue (interface) |
|---|---|---|---|---|
| A1 | Chess vs computer | `frontend/arcade/chess/` | `backend/arcade/chess/` (engine + in-browser AI) | `interface/arcade/chess/chessApi.js` |
| A2 | UNO vs 3 computer players | `frontend/arcade/uno/` | `backend/arcade/uno/gameInfo.js` | `interface/arcade/uno/` |
| A3 | Pet Simulator | `frontend/arcade/pets/` | `backend/arcade/pets/gameInfo.js` | `interface/arcade/pets/launch.js` |
| A4 | Work at a Pizza Place | `frontend/arcade/pizza/` | `backend/arcade/pizza/gameInfo.js` | `interface/arcade/pizza/launch.js` |

Shared pieces: `frontend/arcade/shared/` (game engine, sounds, styles), `backend/arcade/shared/` (guest player, game settings, play stats),
`interface/arcade/shared/launchGame.js` (starts a game and wires "Back to Airport").
The board itself: data in `backend/content.js` (`getArcade`), passed through `interface/api.js` (`loadArcade`), drawn by `frontend/arcade/arcade-board.js`.

Not included (they need a server): UNO online rooms and the Stockfish chess engine. Chess uses the built-in computer player instead.
