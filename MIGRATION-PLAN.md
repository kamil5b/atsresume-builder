# Next.js to Astro + React Migration Plan

## Project Overview

| Aspect | Current (Next.js) | Target (Astro + React) |
|--------|-------------------|------------------------|
| Framework | Next.js 15.5.9 | Astro 4.x |
| UI Library | React 18.2.0 | React 18.2.0 (via integration) |
| Styling | Tailwind CSS 3.2.4 | Tailwind CSS (native integration) |
| Build Output | Standalone server | Static HTML (GitHub Pages) |
| Deployment | Vercel / Docker | GitHub Pages |
| Package Manager | Yarn | pnpm |

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
│   │   └── components/
│   │       └── LoadUnload.jsx  # Current load/save to file
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

## New Features to Implement

### Feature 1: Save on Cache (localStorage)

Save resume data to browser's localStorage for persistence across sessions.

#### Implementation:

**File: `src/components/utility/cacheUtils.js`**
```js
const CACHE_KEY = 'atsresume_data';

export const saveToCache = (resumeData) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(resumeData));
    return true;
  } catch (error) {
    console.error('Failed to save to cache:', error);
    return false;
  }
};

export const loadFromCache = () => {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from cache:', error);
    return null;
  }
};

export const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
};
```

**File: `src/components/builder.jsx` (modified)**
```jsx
import { useState, useEffect } from "react";
import DefaultResumeData from "../components/utility/DefaultResumeData";
import { saveToCache, loadFromCache } from "../components/utility/cacheUtils";

export default function Builder() {
  // Load from cache on mount, fallback to default
  const [resumeData, setResumeData] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadFromCache() || DefaultResumeData;
    }
    return DefaultResumeData;
  });

  // Auto-save to cache when data changes
  useEffect(() => {
    saveToCache(resumeData);
  }, [resumeData]);

  // ... rest of component
}
```

---

### Feature 2: Clear All Button

Clear all resume data and reset to empty state.

#### Implementation:

**File: `src/components/form/components/ActionButtons.jsx`**
```jsx
import React, { useContext } from "react";
import { ResumeContext } from "../../builder";
import { clearCache } from "../../utility/cacheUtils";
import { FaTrash, FaUndo, FaSave } from "react-icons/fa";

const ActionButtons = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all resume data?')) {
      setResumeData({
        name: "",
        position: "",
        contactInformation: "",
        email: "",
        address: "",
        profilePicture: "",
        socialMedia: [],
        summary: "",
        education: [],
        workExperience: [],
        projects: [],
        skills: [],
        languages: [],
        certifications: [],
      });
      clearCache();
    }
  };

  const handleDefaultTemplate = () => {
    if (window.confirm('Reset to default template? Current data will be lost.')) {
      setResumeData(DefaultResumeData);
    }
  };

  const handleSaveToCache = () => {
    saveToCache(resumeData);
    alert('Resume saved to browser cache!');
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4 justify-center">
      <button
        onClick={handleSaveToCache}
        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        <FaSave /> Save
      </button>
      <button
        onClick={handleClearAll}
        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        <FaTrash /> Clear All
      </button>
      <button
        onClick={handleDefaultTemplate}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <FaUndo /> Default Template
      </button>
    </div>
  );
};

export default ActionButtons;
```

---

### Feature 3: Default Template Button

Reset resume data to the default template (DefaultResumeData).

Already implemented in ActionButtons.jsx above.

---

### Updated LoadUnload Component

**File: `src/components/form/components/LoadUnload.jsx` (modified)**
```jsx
import { FaCloudUploadAlt, FaCloudDownloadAlt } from "react-icons/fa";
import React, { useContext } from "react";
import { ResumeContext } from "../../builder";

const LoadUnload = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  // load backup resume data from file
  const handleLoad = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const resumeData = JSON.parse(event.target.result);
      setResumeData(resumeData);
    };
    reader.readAsText(file);
  };

  // download resume data to file
  const handleDownload = (data, filename, event) => {
    event.preventDefault();
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="flex flex-wrap gap-4 mb-2 justify-center">
      <div className="inline-flex flex-row items-center gap-2">
        <h2 className="text-[1.2rem] text-white">Import</h2>
        <label className="p-2 text-white bg-fuchsia-700 rounded cursor-pointer">
          <FaCloudUploadAlt className="text-[1.2rem] text-white" />
          <input
            aria-label="Load Data"
            type="file"
            className="hidden"
            onChange={handleLoad}
            accept=".json"
          />
        </label>
      </div>
      <div className="inline-flex flex-row items-center gap-2">
        <h2 className="text-[1.2rem] text-white">Export</h2>
        <button
          aria-label="Save Data"
          className="p-2 text-white bg-fuchsia-700 rounded"
          onClick={(event) =>
            handleDownload(
              resumeData,
              resumeData.name + " by ATSResume.json",
              event
            )
          }
        >
          <FaCloudDownloadAlt className="text-[1.2rem] text-white" />
        </button>
      </div>
    </div>
  );
};

export default LoadUnload;
```

---

## Migration Steps

### Phase 1: Project Setup

#### Step 1.1: Initialize Astro Project
```bash
# Create new Astro project
pnpm create astro@latest atsresume-astro

# Select: Empty (we'll migrate manually)
# TypeScript: No (matching current JS codebase)
```

#### Step 1.2: Install Integrations
```bash
pnpm astro add react tailwind
```

This installs:
- `@astrojs/react` - React integration
- `@astrojs/tailwind` - Tailwind integration
- `react` and `react-dom` (peer dependencies)

#### Step 1.3: Install Additional Dependencies
```bash
pnpm add react-beautiful-dnd react-icons react-highlight-menu
pnpm add -D @types/react-beautiful-dnd  # Optional TypeScript types
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
│   ├── Builder.jsx            # Main React component
│   ├── FormCloseOpenBtn.jsx   # No changes needed
│   ├── ActionButtons.jsx      # NEW: Save/Clear/Default buttons
│   ├── Hero.astro             # Convert from JSX to Astro component
│   ├── Meta.astro             # Convert from next/head to Astro
│   ├── preview/               # All preview components (no changes)
│   ├── form/                  # All form components (no changes)
│   │   └── components/
│   │       ├── LoadUnload.jsx # Updated: Import/Export labels
│   │       └── ActionButtons.jsx  # NEW: Action buttons
│   └── utility/               # All utility components
│       ├── cacheUtils.js      # NEW: localStorage utilities
│       ├── DefaultResumeData.jsx  # No changes
│       ├── WinPrint.js        # No changes
│       └── DateRange.jsx      # No changes
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
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build with Astro
        run: pnpm run build
      
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
- [ ] Initialize Astro project with pnpm
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
- [ ] Update `builder.jsx` (remove next/dynamic, add cache support)
- [ ] Update `Preview.jsx` (remove next/dynamic)
- [ ] Convert `Hero.jsx` → `Hero.astro` (if using)

### Phase 5: New Features
- [ ] Create `cacheUtils.js` for localStorage
- [ ] Create `ActionButtons.jsx` with Save/Clear/Default
- [ ] Update `builder.jsx` to auto-save to cache
- [ ] Update `LoadUnload.jsx` with new labels
- [ ] Integrate ActionButtons in Form component

### Phase 6: Cleanup
- [ ] Delete `next.config.js`
- [ ] Delete `src/app/` directory
- [ ] Delete `Dockerfile` and `docker-compose.yaml`
- [ ] Update `.gitignore`

### Phase 7: Testing
- [ ] Run `pnpm dev` locally
- [ ] Test all form inputs
- [ ] Test drag-and-drop functionality
- [ ] Test print functionality
- [ ] Test responsive design
- [ ] Test Save button (check localStorage)
- [ ] Test Clear All button
- [ ] Test Default Template button
- [ ] Test cache persistence (refresh page)
- [ ] Verify static build works

### Phase 8: Deploy
- [ ] Create GitHub Actions workflow with pnpm
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

### 5. localStorage SSR Issues
**Challenge:** localStorage is browser-only, not available during SSR
**Solution:** Check `typeof window !== 'undefined'` before accessing localStorage

### 6. Image Optimization
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
| Setup | 30 min | Initialize project, install deps with pnpm |
| Configuration | 30 min | Astro config, Tailwind |
| Restructure | 1 hour | Move files, update imports |
| Component Migration | 2-3 hours | Main work, test each component |
| New Features | 1-2 hours | Cache, Clear, Default buttons |
| Testing | 1-2 hours | Full testing cycle including new features |
| Deployment | 30 min | GitHub Actions with pnpm |
| **Total** | **6-9 hours** | Depends on issues encountered |

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
- [pnpm Documentation](https://pnpm.io/)
