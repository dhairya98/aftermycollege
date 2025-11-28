# Internationalization (i18n) Implementation Plan

## Overview
This plan outlines how to add multi-language support to your Astro learning platform, covering both UI components and course content.

---

## Phase 1: Setup & Configuration

### 1.1 Choose i18n Solution
**Recommended: Astro's Built-in i18n + astro-i18next**

**Why:**
- Astro has built-in i18n routing support
- `astro-i18next` provides React component support
- Works well with content collections
- Good TypeScript support

**Alternative:** Custom solution with content collections (more control, more work)

### 1.2 Install Dependencies
```bash
npm install astro-i18next i18next react-i18next
npm install -D @types/i18next
```

### 1.3 Configure Supported Languages
**Initial languages:**
- `en` - English (default)
- `es` - Spanish
- `fr` - French
- `hi` - Hindi (optional, based on your audience)

**File structure:**
```
src/
  locales/
    en/
      common.json
      navigation.json
      courses.json
    es/
      common.json
      navigation.json
      courses.json
    fr/
      common.json
      navigation.json
      courses.json
```

---

## Phase 2: URL Structure

### 2.1 Routing Strategy
**Option A: Subdirectory (Recommended)**
```
/en/courses/python
/es/cursos/python
/fr/cours/python
```

**Option B: Subdomain**
```
en.aftermycollege.com
es.aftermycollege.com
```

**Option C: Query parameter** (Not recommended for SEO)
```
/courses/python?lang=es
```

### 2.2 Astro Config Update
```javascript
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "fr"],
    routing: {
      prefixDefaultLocale: false, // /courses instead of /en/courses
    }
  },
  // ... rest of config
});
```

### 2.3 Update Page Structure
```
src/pages/
  [lang]/
    courses/
      [courseSlug]/
        [chapterSlug].astro
        index.astro
      index.astro
    index.astro
  404.astro
```

---

## Phase 3: Content Collections

### 3.1 Update Content Schema
```typescript
// src/content/config.ts
const coursesCollection = defineCollection({
  loader: glob({
    pattern: '**/index.mdx',
    base: './src/content/courses'
  }),
  schema: z.object({
    title: z.record(z.string()), // { en: "Python", es: "Python", fr: "Python" }
    description: z.record(z.string()).optional(),
    image: z.string().optional(),
    order: z.number().optional(),
    // OR keep single language and use separate files:
    // title: z.string(),
  }),
});
```

### 3.2 Content File Organization

**Option A: Single file with translations**
```mdx
---
title:
  en: "Python Programming"
  es: "Programación en Python"
  fr: "Programmation Python"
description:
  en: "Master Python..."
  es: "Domina Python..."
---
```

**Option B: Separate files per language** (Recommended for large content)
```
src/content/courses/
  python/
    index.en.mdx
    index.es.mdx
    index.fr.mdx
    chapter-1-introduction.en.mdx
    chapter-1-introduction.es.mdx
    chapter-1-introduction.fr.mdx
```

**Option C: Language folders**
```
src/content/courses/
  en/
    python/
      index.mdx
  es/
    python/
      index.mdx
```

### 3.3 Update Collection Loaders
```typescript
// For Option B
const coursesCollection = defineCollection({
  loader: glob({
    pattern: `**/index.${lang}.mdx`, // Dynamic based on locale
    base: './src/content/courses'
  }),
  // ...
});
```

---

## Phase 4: UI Translation

### 4.1 Create Translation Files

**src/locales/en/common.json**
```json
{
  "nav": {
    "explore": "Explore",
    "login": "Log in",
    "signup": "Sign up"
  },
  "home": {
    "title": "Learn anything. Build everything.",
    "subtitle": "aftermycollege brings bite-sized lessons...",
    "exploreCourses": "Explore courses",
    "howItWorks": "How it works"
  },
  "courses": {
    "allCourses": "All Courses",
    "chapters": "Chapters",
    "startLearning": "Start Learning",
    "readyToStart": "Ready to start learning?",
    "beginChapter1": "Begin with Chapter 1"
  },
  "chapter": {
    "previous": "Previous",
    "next": "Next",
    "backToCourse": "Back to Course",
    "courseComplete": "Course Complete!",
    "onThisPage": "On This Page"
  }
}
```

### 4.2 Setup i18next

**src/utils/i18n.ts**
```typescript
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import fr from '../locales/fr/common.json';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
```

### 4.3 Update React Components

**Header.react.jsx**
```jsx
import { useTranslation } from 'react-i18next';

export default function Header({ siteTitle, menuItems }) {
  const { t } = useTranslation();
  
  return (
    <header>
      <button>{t('nav.explore')}</button>
      <a href="#">{t('nav.login')}</a>
      <a href="#">{t('nav.signup')}</a>
    </header>
  );
}
```

### 4.4 Update Astro Components

**For Astro files, use i18next directly:**
```astro
---
import i18next from '../utils/i18n';
const lang = Astro.params.lang || 'en';
i18next.changeLanguage(lang);
---

<h1>{i18next.t('home.title')}</h1>
```

---

## Phase 5: Language Detection & Switching

### 5.1 Language Switcher Component

**src/components/LanguageSwitcher.tsx**
```tsx
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom'; // or Astro's routing

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];
  
  const switchLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    // Update URL
    const newPath = window.location.pathname.replace(
      `/${currentLang}/`,
      `/${lang}/`
    );
    window.location.href = newPath;
  };
  
  return (
    <select onChange={(e) => switchLanguage(e.target.value)}>
      {languages.map(lang => (
        <option key={lang.code} value={lang.code} selected={currentLang === lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### 5.2 Browser Language Detection

**src/utils/detectLanguage.ts**
```typescript
export function detectLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0];
  const supportedLangs = ['en', 'es', 'fr'];
  
  return supportedLangs.includes(browserLang) ? browserLang : 'en';
}
```

### 5.3 Middleware for Language Detection

**src/middleware.ts**
```typescript
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const url = context.url;
  const pathname = url.pathname;
  
  // Check if language is in URL
  const langMatch = pathname.match(/^\/(en|es|fr)/);
  
  if (!langMatch) {
    // Redirect to default language
    const detectedLang = detectLanguage();
    return context.redirect(`/${detectedLang}${pathname}`);
  }
  
  return next();
});
```

---

## Phase 6: Content Translation Workflow

### 6.1 Translation Management

**Option A: Manual Translation**
- Create translation files manually
- Use translation services (Google Translate, DeepL) for initial pass
- Have native speakers review

**Option B: Translation Service Integration**
- Use services like Crowdin, Lokalise, or Transifex
- Export/import JSON files
- Maintain translation keys

**Option C: AI-Assisted Translation**
- Use GPT/Claude API for initial translations
- Review and refine manually
- Store in JSON files

### 6.2 Content Collection Helpers

**src/utils/getLocalizedContent.ts**
```typescript
import { getCollection } from 'astro:content';

export async function getLocalizedCourse(courseId: string, lang: string) {
  const courses = await getCollection('courses');
  const course = courses.find(c => c.id === courseId);
  
  if (!course) return null;
  
  return {
    ...course,
    data: {
      ...course.data,
      title: course.data.title[lang] || course.data.title.en,
      description: course.data.description?.[lang] || course.data.description?.en,
    }
  };
}
```

---

## Phase 7: SEO & Metadata

### 7.1 Language-Specific Metadata

**src/utils/getMetadata.ts**
```typescript
export function getMetadata(lang: string, page: string) {
  const metadata = {
    en: {
      title: "After My College - Learn Anything",
      description: "Learn programming, math, and more..."
    },
    es: {
      title: "After My College - Aprende Cualquier Cosa",
      description: "Aprende programación, matemáticas y más..."
    },
    // ...
  };
  
  return metadata[lang] || metadata.en;
}
```

### 7.2 hreflang Tags

**Layout.astro**
```astro
---
const lang = Astro.params.lang || 'en';
const alternateLangs = ['en', 'es', 'fr'].filter(l => l !== lang);
---

<head>
  <html lang={lang}>
  {alternateLangs.map(altLang => (
    <link rel="alternate" hreflang={altLang} href={`/${altLang}${currentPath}`} />
  ))}
</head>
```

---

## Phase 8: Implementation Steps

### Step 1: Setup (Week 1)
- [ ] Install dependencies
- [ ] Configure Astro i18n routing
- [ ] Create locale folder structure
- [ ] Setup i18next configuration

### Step 2: UI Translation (Week 1-2)
- [ ] Translate navigation components
- [ ] Translate common UI elements
- [ ] Add language switcher
- [ ] Test language switching

### Step 3: Content Structure (Week 2)
- [ ] Update content collection schemas
- [ ] Decide on content organization (Option A/B/C)
- [ ] Create translation helper functions
- [ ] Update page components to use translations

### Step 4: Content Translation (Week 3-4)
- [ ] Translate course metadata (titles, descriptions)
- [ ] Translate course content (chapters)
- [ ] Set up translation workflow
- [ ] Quality check translations

### Step 5: Testing & Refinement (Week 4)
- [ ] Test all routes in all languages
- [ ] Fix broken links
- [ ] SEO audit
- [ ] Performance testing

---

## Phase 9: Advanced Features

### 9.1 RTL Support (if needed)
```css
[dir="rtl"] {
  /* RTL styles */
}
```

### 9.2 Date/Number Formatting
```typescript
import { format } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';

const locales = { en: enUS, es, fr };
format(new Date(), 'PP', { locale: locales[lang] });
```

### 9.3 Pluralization
```json
{
  "chapters": {
    "one": "{{count}} chapter",
    "other": "{{count}} chapters"
  }
}
```

---

## Phase 10: Maintenance

### 10.1 Translation Status Tracking
- Keep track of which content is translated
- Mark missing translations
- Prioritize high-traffic content

### 10.2 Update Workflow
- When adding new content, create translation tasks
- Review process for translations
- Version control for translation files

---

## Recommended Approach Summary

1. **Start Simple**: Begin with UI translations (nav, buttons, common text)
2. **Content Strategy**: Use Option B (separate files per language) for maintainability
3. **URL Structure**: Use subdirectory approach (`/en/`, `/es/`)
4. **Translation**: Start with 2-3 languages, expand gradually
5. **Tools**: Use `astro-i18next` for React components, Astro's built-in i18n for routing

---

## Estimated Timeline
- **Phase 1-2**: 1 week (Setup + UI)
- **Phase 3-4**: 2 weeks (Content structure + Translation)
- **Phase 5-7**: 1 week (Language switching + SEO)
- **Total**: ~4 weeks for full implementation

---

## Next Steps
1. Review and approve this plan
2. Choose content organization strategy
3. Select initial languages to support
4. Begin with Phase 1 implementation

