# Sugar Cascade Saga: Match-3 Puzzle Game

A production-quality Match-3 puzzle game with 100 levels, original confectionery themes, real match-3 cascades, special combinations, responsive HTML5 Canvas rendering, Web Audio procedural sound synthesis, and a Spring Boot backend.

---

## 1. System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **Styling**: Tailwind CSS with custom responsive game canvas scaling
- **Game Engine**: Pure TypeScript match-3 engine, 100% decoupled from React UI
  - `BoardManager`: Grid initialization, spawner assignment, obstacle generation, no-match seeding
  - `MatchDetector`: 3-in-a-row, 4-in-a-row (Striped), 5-in-a-line (Color Bomb), T/L-shapes (Wrapped)
  - `SwapValidator`: Orthogonal swap checks, special combo detection, potential moves scanner, deadlock auto-shuffle
  - `SpecialCandyEngine`: Striped laser beams, Wrapped 3x3/5x5 explosions, Color Bomb wipes, multi-special combos
  - `GravityEngine`: Column-by-column falling, top spawner refilling, bottom ingredient collection
  - `CascadeEngine`: Multi-step cascade reactions, chocolate spread rules, objective tracking
  - `ScoreCalculator`: Base score, combo multiplier scaling (x1.5, x2, x3...), 1-3 star thresholds
  - `BoosterManager`: Lollipop Hammer, Free Switch, Color Bomb, Striped Brush, Shuffle, Extra Moves
  - `SoundEngine`: Zero-dependency Web Audio API procedural synthesis (tones, whooshes, blasts, fanfares, BGM)
  - `ParticleEngine`: 2D particle simulation for bursts, beams, rings, and stars
- **State Management**: Zustand stores with automated persistence (`userStore`, `gameStore`, `soundStore`)

### Backend Architecture
- **Framework**: Spring Boot 3.4 with Java 25
- **Security**: Spring Security with stateless JWT Bearer authentication and BCrypt password encryption
- **Data Persistence**: Spring Data JPA with PostgreSQL support and H2 in-memory default mode
- **API Documentation**: Springdoc OpenAPI / Swagger UI 3
- **Caching & Leaderboards**: Redis configuration and JPA repositories

---

## 2. Core Gameplay Mechanics

- **Grid**: 8x8 game board with configurable layouts and obstacles.
- **Candy Types**:
  - Red Strawberry Heart
  - Blue Blueberry Drop
  - Green Lime Clover
  - Yellow Lemon Star
  - Orange Sunburst
  - Purple Grape Cluster
- **Special Candies**:
  - **Striped Candy**: Match 4 in a line. Clears an entire row or column with laser beams.
  - **Wrapped Candy**: Match 5 in an L or T shape. Explodes in a 3x3 blast.
  - **Color Bomb**: Match 5 in a straight line. Obliterates all candies of the chosen color.
- **Special Candy Combos**:
  - `Striped + Striped`: Cross laser clearing entire row and column.
  - `Wrapped + Wrapped`: Giant 5x5 blast.
  - `Striped + Wrapped`: 3-row by 3-column mega cross blast.
  - `Color Bomb + Striped`: Transforms all matching candies into striped candies and detonates them all.
  - `Color Bomb + Wrapped`: Transforms all matching candies into wrapped candies and detonates them all.
  - `Color Bomb + Color Bomb`: Clears all 64 tiles on the board.
- **Obstacles & Blockers**:
  - **Jelly**: Single and double layers underneath candies that must be matched on top to clear.
  - **Frosting**: 1-hit, 2-hit, and 3-hit blocker cookies damaged by adjacent matches.
  - **Chocolate**: Spreads to an adjacent tile if no chocolate is destroyed during a turn.
  - **Ingredients**: Cherries and Hazelnuts that must be brought down to the bottom row.
- **100 Levels Progression**:
  - Levels 1–5: Tutorial & target score
  - Levels 6–25: Single and double Jelly clearing
  - Levels 26–50: Multi-layer Frosting blockers & irregular boards
  - Levels 51–70: Chocolate expansion challenges
  - Levels 71–85: Ingredient collection
  - Levels 86–92: Timed challenges
  - Levels 93–100: Grandmaster multi-objective puzzles

---

## 3. Boosters & Lives System

- **Boosters**:
  - `Lollipop Hammer`: Smashes any single candy, frosting layer, or chocolate tile.
  - `Free Switch`: Swaps any two candies without requiring an adjacent match.
  - `Color Bomb`: Spawns a Rainbow Color Bomb on the board.
  - `Striped Brush`: Paints any chosen candy into a Striped Candy.
  - `Shuffle Booster`: Reshuffles all normal candies on the board.
  - `Extra Moves`: Adds +5 moves to the active level.
  - `Extra Time`: Adds +15 seconds to timed challenges.
- **Lives & Rewards**:
  - 5 maximum lives.
  - 1 life regenerated every 30 minutes.
  - Daily login bonus: +250 coins and +2 lives.
  - In-game Booster Shop to purchase boosters using earned coins.
  - Google AdMob rewarded ad simulation (+1 Life, +5 Moves, or +150 Coins).

---

## 4. REST API Documentation

When the backend is running, Swagger UI is available at:
`http://localhost:8080/swagger-ui/index.html`

### Endpoints
- **Auth**:
  - `POST /api/auth/register`: Create a new account
  - `POST /api/auth/login`: Log in and receive JWT token
  - `GET /api/auth/profile`: Get authenticated user profile
- **Levels**:
  - `GET /api/levels`: Fetch all 100 level definitions
  - `GET /api/levels/{id}`: Fetch single level config
- **Game Progress**:
  - `POST /api/game/complete`: Submit level completion (score, stars, unlocked level)
  - `POST /api/game/restart`: Record failure / consume life
  - `GET /api/game/stats`: Fetch player stats, high scores, and boosters
- **Rewards**:
  - `POST /api/rewards/daily`: Claim daily login coins and lives
  - `POST /api/rewards/admob`: Claim rewarded ad bonus
  - `GET /api/rewards/lives/sync`: Sync life regeneration based on time elapsed
- **Leaderboards**:
  - `GET /api/leaderboard/global`: Fetch top global rankings
  - `GET /api/leaderboard/weekly`: Fetch weekly competition leaderboard
  - `POST /api/leaderboard/friends/send-life`: Send life to a friend

---

## 5. Getting Started & Running Locally

### Prerequisites
- Node.js 18+ and npm
- Java 21+ or Java 25
- Maven 3.9+

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on [http://localhost:8080](http://localhost:8080).

### Run with Docker Compose
```bash
docker compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8080](http://localhost:8080)
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

---

## 6. Running Tests

### Frontend Unit Tests (Vitest)
```bash
cd frontend
npm run test
```
Runs 20 automated tests covering:
- Horizontal & vertical match-3, match-4, match-5 detection
- T/L-shape Wrapped Candy generation
- Adjacent swap validation and deadlock auto-shuffling
- Gravity column-by-column falling and top spawning
- Special candy combinations (Striped+Striped, Wrapped+Wrapped, ColorBomb+Striped, ColorBomb+ColorBomb)
- Combo multipliers and 3-star scoring

### Backend Tests (Maven)
```bash
cd backend
mvn clean test
```
Runs Spring Boot context verification and game service tests.
