# StudyMart React Starter

Responsive StudyMart homepage built with React, Vite, React Router, and Tailwind CSS v4.

## Run locally

1. Install Node.js if it is not already installed.
2. Open this folder in VS Code.
3. Run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite.

## Assets

Static UI images belong in `src/assets/` or `public/assets/`.

- If images are in `public/assets/`, reference them as `/assets/hero-banner.jpg`.
- If images are in `src/assets/`, import them in the component, for example:
  `import heroBanner from "../assets/hero-banner.jpg";`
  then use `<img src={heroBanner} alt="..." />`.

Product images uploaded by users should eventually go into Supabase Storage. Store their path or URL in the products table rather than placing user uploads in this repository.

## Current scope

- Responsive homepage
- Reusable Navbar, Footer, MarketplaceCard, ProductCard, and AssetPlaceholder components
- React Router routes for the homepage and placeholder destination pages
- Static demo products

Authentication, Context API, Supabase, checkout, and real search results are not connected yet.
