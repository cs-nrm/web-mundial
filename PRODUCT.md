# PRODUCT.md — La Fiesta del Fútbol

## What is this?

Fan platform for NRM Comunicaciones' radio stations during the World Cup. Users follow news, enter promotions, and build a personalized avatar (sticker-card format) tied to their favorite station.

## Who uses it?

Radio listeners in Mexico — ages 18–45, mobile-first, casual sports fans. They're on their phone, they want fast and fun, not complex.

## Register

brand — the design IS part of the experience. This is a fan platform, not a tool. Emotion and identity matter as much as function.

## Goals

1. Get users to register and fill their profile (lazy — only when entering a promo)
2. Let users build and save a personal avatar (the main engagement mechanic)
3. Surface news and promos from 4 radio stations

## Key surfaces

- `/` — Home: news sliders from multiple stations + banners
- `/perfil/avatar` — Avatar builder (the crown jewel feature)
- `/perfil/datos` — Profile form (required before promos)
- `/perfil` — User profile page

## Tech

- Astro 5 SSR + TypeScript + Tailwind + SASS
- Supabase (auth + DB)
- No React — vanilla JS in `<script>` tags
- Fonts: Syne (display), Inter (body) — but avatar page uses League Spartan + Open Sans

## Brand

- Lime `#c5e513` — primary accent
- Black `#0a0a0a` — main background
- Station colors: Beat `#f97316`, Oye `#3b82f6`, Stereocien `#8b5cf6`, Sabrosita `#ec4899`
- Mood: bold, energetic, futbolero — like a stadium sticker album

## Avatar builder specifics

- Avatar is a layered card (600×900px canvas), rendered in z-order from manifest
- Categories: fondo, cuerpo-jersey, cabello, cejas, ojos, lentes, boca, bigote, barba, gorra, marco
- Each station has exclusive marco + fondo; jerseys are mostly universal
- Result saved as PNG to `/public/avatars/<userId>.png` + config JSON to Supabase
- The card is a "sticker" — tall portrait format, like a Panini album card
