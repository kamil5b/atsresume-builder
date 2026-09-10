# Next.js to Astro + React Migration Plan

## Project Overview

| Aspect | Current (Next.js) | Target (Astro + React) |
|--------|-------------------|------------------------|
| Framework | Next.js 15.5.9 | Astro 4.x |
| UI Library | React 18.2.0 | React 18.2.0 (via integration) |
| Styling | Tailwind CSS 3.2.4 | Tailwind CSS (native integration) |
| Build Output | Standalone server | Static HTML (GitHub Pages) |
| Deployment | Vercel / Docker | GitHub Pages |

---

## Current Architecture Analysis

### File Structure
```
src/
├── app/
│   ├── layout.js          # Root layout (Next.js App Router)
│   └── page.jsx           # Main page
├── components/
│   ├── builder.jsx        # Main builder component (uses next/dynamic)
│   ├── FormCloseOpenBtn.jsx
│   ├── hero/Hero.jsx      # Landing page (uses next/link, next/image)
│   ├── meta/Meta.js       # SEO (uses next/head)
│   ├── preview/           # Resume preview components
│   ├── form/              # Resume form components
│   └── utility/           # Helpers (WinPrint, DefaultResumeData, DateRange)
├── hooks/
│   └── useKeyboardShortcut.jsx
└── styles/
    └── globals.css        # Tailwind + custom styles
```

### Next.js-Specific Code to Migrate

| File | Next.js Feature | Astro Equivalent |
|------|-----------------|------------------|
| `builder.jsx` | `next/dynamic` (lazy load Print) | `client:load` or `client:visible` |
| `Meta.js` | `next/head` | `<head>` / Astro Head component |
| `Preview.jsx` | `next/dynamic` (DragDropContext) | `client:load` |
| `Hero.jsx` | `next/link` | `<a>` or Astro `<Link>` |
| `Hero.jsx` | `next/image` | Astro `<Image>` |
| `layout.js` | App Router layout | Astro layout |

### Dependencies

| Package | Version | Migration Notes |
|---------|---------|-----------------|
| next | 15.5.9 | Remove |
| react | 18.2.0 | Keep (via @astrojs/react) |
| react-dom | 18.2.0 | Keep |
| react-beautiful-dnd | ^13.1.1 | Keep, add `client:load` |
| react-icons | ^5.2.1 | Keep |
| react-highlight-menu | ^2.0.2 | Keep |
| tailwindcss | ^3.2.4 | Keep (Astro has native support) |
| typescript | 5.0.4 | Optional (can convert to .astro) |

---

## Migration Steps

### Phase 1: Project Setup

#### Step 1.1: Initialize Astro Project
```bash
# Create new Astro project (in new directory or replace current)
npm create astro@latest atsresume-astro

# Select: Empty (we'll migrate manually)
# TypeScript: No (matching current JS codebase)
```

#### Step 1.2: Install Integrations
```bash
npx astro add react tailwind
```

This installs:
- `@astrojs/react` - React integration
- `@astrojs/tailwind` - Tailwind integration
- `react` and `react-dom` (peer dependencies)

#### Step 1.3: Install Additional Dependencies
```bash
npm install react-beautiful-dnd react-icons react-highlight-menu
npm install -D @types/react-beautiful-dnd  # Optional TypeScript types
```

---

### Phase 2: Configuration Files

#### Step 2.1: Create `astro.config.mjs`
```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://username.github.io',  // Your GitHub Pages URL
  base: '/atsresume-builder',          // Repo name
  output: 'static',                     // Default, explicit for clarity
  integrations: [
    react(),
    tailwind(),
  ],
});
```

#### Step 2.2: Update `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### Step 2.3: Create `tsconfig.json` (optional)
```json
{
  "extends": "astro/tsconfigs/strict"
}
```

---

### Phase 3: Directory Restructure

#### New Structure:
```
src/
├── layouts/
│   └── Layout.astro           # Replaces app/layout.js
├── pages/
│   └── index.astro            # Replaces app/page.jsx
│   └── builder.astro          # Builder page (optional separate route)
├── components/
│   ├── Builder.jsx            # Main React component (no changes needed)
│   ├── FormCloseOpenBtn.jsx   # No changes needed
│   ├── Hero.astro             # Convert from JSX to Astro component
│   ├── Meta.astro             # Convert from next/head to Astro
│   ├── preview/               # All preview components (no changes)
│   ├── form/                  # All form components (no changes)
│   └── utility/               # All utility components (no changes)
├── hooks/
│   └── useKeyboardShortcut.jsx # No changes needed
└── styles/
    └── globals.css            # Rename to global.css, update imports
```

---

### Phase 4: Component Migration

#### Step 4.1: Layout Component
**File: `src/layouts/Layout.astro`**
```astro
---
interface Props {
  title: string;
  description?: string;
  keywords?: string;
}

const { title, description, keywords } = Astro.props;
const homepage = "https://username.github.io/atsresume-builder";
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <link rel="icon" href="/atsresume-builder/assets/favicon.ico" />
  <title>{title}</title>
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={homepage} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={`${homepage}/assets/logo.png`} />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  
  <!-- Structured Data -->
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    url: homepage,
    logo: `${homepage}/assets/logo.png`,
    description: description,
    name: "ATSResume"
  })} />
</head>
<body>
  <slot />
</body>
</html>

<style is:global>
  @import '../styles/globals.css';
</style>
```

#### Step 4.2: Main Page
**File: `src/pages/index.astro`**
```astro
---
import Layout from '../layouts/Layout.astro';
import Builder from '../components/Builder.jsx';
---

<Layout 
  title="ATSResume | Get hired with an ATS-optimized resume"
  description="ATSResume is a cutting-edge resume builder..."
  keywords="ATS-friendly, Resume optimization..."
>
  <Builder client:load />
</Layout>
```

#### Step 4.3: Meta Component Conversion
**File: `src/components/Meta.astro`** (or inline in Layout)
- Remove `next/head` import
- Use Astro's `<head>` directly in layout
- Move meta tags to Layout component

#### Step 4.4: Dynamic Imports
**Before (Next.js):**
```jsx
import dynamic from "next/dynamic";
const Print = dynamic(() => import("./utility/WinPrint"), { ssr: false });
```

**After (Astro):**
```jsx
// In Builder.jsx - just import normally
import WinPrint from "./utility/WinPrint";
// Astro handles client-only rendering with client:load
```

Or use Astro's client directive for more control:
```astro
<Builder client:visible />
```

#### Step 4.5: Hero Component (if needed)
**Before:**
```jsx
import Link from "next/link";
import Image from "next/image";
```

**After:**
```astro
---
import { Image } from 'astro:assets';
import logo from '../assets/resume-example.jpg';
---
<a href="/">
  <Image src={logo} alt="logo" width={50} height={50} />
</a>
<a href="/builder">Builder</a>
```

---

### Phase 5: Remove Next.js Artifacts

#### Files to Delete:
- `next.config.js`
- `src/app/` directory (replaced by `src/pages/`)
- `.next/` directory (if exists)
- `Dockerfile` and `docker-compose.yaml` (optional, for GitHub Pages)

#### Files to Update:
- `package.json` - Remove Next.js scripts, add Astro scripts
- `.gitignore` - Update for Astro

---

### Phase 6: Update package.json

```json
{
  "name": "atsresume",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/react": "^3.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "astro": "^4.0.0",
    "react": "^18.2.0",
    "react-beautiful-dnd": "^13.1.1",
    "react-dom": "^18.2.0",
    "react-highlight-menu": "^2.0.2",
    "react-icons": "^5.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "autoprefixer": "^10.4.13",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.2.4",
    "typescript": "^5.0.4"
  }
}
```

---

### Phase 7: GitHub Pages Deployment

#### Step 7.1: GitHub Actions Workflow
**File: `.github/workflows/deploy.yml`**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build with Astro
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Step 7.2: Enable GitHub Pages
1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. Branch: `main` (or your default branch)

---

## Migration Checklist

### Pre-Migration
- [ ] Backup current codebase
- [ ] Create new branch for migration
- [ ] Document any custom configurations

### Phase 1: Setup
- [ ] Initialize Astro project
- [ ] Install React integration
- [ ] Install Tailwind integration
- [ ] Install additional dependencies

### Phase 2: Configuration
- [ ] Create `astro.config.mjs`
- [ ] Update `tailwind.config.js`
- [ ] Create `tsconfig.json` (optional)

### Phase 3: Restructure
- [ ] Create `src/layouts/` directory
- [ ] Create `src/pages/` directory
- [ ] Move components to new structure

### Phase 4: Migrate Components
- [ ] Convert `layout.js` → `Layout.astro`
- [ ] Convert `page.jsx` → `index.astro`
- [ ] Convert `Meta.js` → inline in Layout
- [ ] Update `builder.jsx` (remove next/dynamic)
- [ ] Update `Preview.jsx` (remove next/dynamic)
- [ ] Convert `Hero.jsx` → `Hero.astro` (if using)

### Phase 5: Cleanup
- [ ] Delete `next.config.js`
- [ ] Delete `src/app/` directory
- [ ] Delete `Dockerfile` and `docker-compose.yaml`
- [ ] Update `.gitignore`

### Phase 6: Testing
- [ ] Run `npm run dev` locally
- [ ] Test all form inputs
- [ ] Test drag-and-drop functionality
- [ ] Test print functionality
- [ ] Test responsive design
- [ ] Verify static build works

### Phase 7: Deploy
- [ ] Create GitHub Actions workflow
- [ ] Push to main branch
- [ ] Verify deployment
- [ ] Test live site

---

## Potential Challenges & Solutions

### 1. react-beautiful-dnd SSR Issues
**Challenge:** react-beautiful-dnd doesn't work with SSR
**Solution:** Use `client:load` directive in Astro
```astro
<Preview client:load />
```

### 2. Client-Side State Management
**Challenge:** React Context needs to be client-side only
**Solution:** Astro automatically handles this with `client:*` directives

### 3. Print Functionality
**Challenge:** `window.print()` is client-side only
**Solution:** Already handled by `client:load` directive

### 4. File Upload (Profile Picture)
**Challenge:** FileReader API is browser-only
**Solution:** Component is already client-side with `"use client"` equivalent

### 5. Image Optimization
**Challenge:** Next.js Image component has different API
**Solution:** Use Astro Image or standard `<img>` tags

---

## Rollback Plan

If migration fails:
1. Keep original Next.js codebase on separate branch
2. Use `git checkout` to revert
3. Consider fixing GitHub Pages with Next.js static export instead

---

## Timeline Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Setup | 30 min | Initialize project, install deps |
| Configuration | 30 min | Astro config, Tailwind |
| Restructure | 1 hour | Move files, update imports |
| Component Migration | 2-3 hours | Main work, test each component |
| Testing | 1-2 hours | Full testing cycle |
| Deployment | 30 min | GitHub Actions setup |
| **Total** | **5-7 hours** | Depends on issues encountered |

---

## Alternative: Keep Next.js + Static Export

If migration seems too complex, you can deploy to GitHub Pages with minimal changes:

```js
// next.config.js
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
}
```

This requires only changing 2 lines in `next.config.js`.

---

## Resources

- [Astro Documentation](https://docs.astro.build/)
- [Astro React Integration](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Astro GitHub Pages Guide](https://docs.astro.build/en/guides/deploy/github/)
- [Tailwind in Astro](https://docs.astro.build/en/guides/integrations-guide/tailwind/)
