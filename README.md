# 🔵 Dinamo Batumi U15 — Squad Hub

A full-stack statistics platform for the Dinamo Batumi U15 team. Built with Next.js 14, MongoDB, and deployed on Vercel.

---

## Stack

- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS
- **Charts**: Recharts
- **Database**: MongoDB (via Mongoose)
- **Deploy**: Vercel

---

## Features

### 🏠 Home Dashboard
- Header with live overview stats (Win Rate, Goals, Form Index, Lost Points)
- **Team Stats Grid** — W/D/L donut chart, goal difference, position, lost points
- **Match Readiness Score** — Prediction engine (MRS = Training×40% + Mentality×30% + Form×20% + Rating×10%)
- **Rating Chart** — Avg team rating per game, season average line
- **Player Ranking Table** — Sorted by composite score (Goals×3 + Assists×2 + MVP×5 + AvgRating×2)
  - Columns: Name, #, GP, MIN, G, A, MVP, Avg Rating, Consistency Score

### 🔐 Admin Panel (`/admin`)
- Password protected (hardcoded)
- **Squad tab** — View all players, add/delete
- **Log Match tab** — Add match result + per-player stats (minutes, goals, assists, rating, MVP, cards)
- **Condition tab** — Update Training Condition and Mentality Score sliders for MRS prediction

---

## Setup

### 1. Clone & Install

```bash
git clone <your-repo>
cd dinamo-batumi
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

```env
MONGODB_URI=mongodb+srv://...
ADMIN_PASSWORD=your_password
NEXT_PUBLIC_ADMIN_PASSWORD=your_password
```

> ⚠️ Both `ADMIN_PASSWORD` and `NEXT_PUBLIC_ADMIN_PASSWORD` should be the same value.

### 3. Player Images

Place player images in:
```
/public/assets/players/
```

Name them matching the `avatarKey` field (set when creating a player):
```
player_7.png     ← avatarKey = "player_7"
player_10.png    ← avatarKey = "player_10"
default.png      ← fallback if image not found
```

Images can be any size; they render in a 64×64px circle with `object-cover`.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
4. Deploy ✓

---

## Stats Formulas

| Metric | Formula |
|--------|---------|
| **Avg Rating** | Sum of ratings / games played |
| **Consistency Score** | `100 - (std_dev × 20)` — lower deviation = higher score |
| **Form Index** | Last 5 results: W=3, D=1, L=0 → as % of max (15) |
| **Squad Depth Score** | Unique goal/assist contributors / 18 squad size × 100 |
| **Match Readiness Score** | Training×40 + Mentality×30 + Form%×20 + AvgRating/10×10 |
| **Player Score** (ranking) | Goals×3 + Assists×2 + MVP×5 + AvgRating×2 |
| **Lost Points** | Draws×1 + Losses×3 |

---

## Admin Workflow

1. Go to `/admin` → enter password
2. **Squad tab**: Create players (name, surname, jersey #, position, avatarKey)
3. After each match → **Log Match tab**:
   - Enter date, opponent, score, venue
   - Set pre-match training condition and mentality (0–100%)
   - Add players who participated: minutes, goals, assists, rating (1–10), MVP, cards
4. Before the next game → **Condition tab**: update training/mentality sliders

All player stats (GP, MIN, G, A, MVP, cards, ratings) update automatically when a match is saved.
