# Quick Start: i18n Implementation

## Minimal Setup (Get Started in 30 minutes)

### 1. Install Dependencies

```bash
npm install astro-i18next i18next react-i18next
```

### 2. Create Translation Files

**src/locales/en/common.json**

```json
{
	"nav": {
		"explore": "Explore"
		// "login": "Log in",
		// "signup": "Sign up"
	},
	"home": {
		"title": "Learn anything. Build everything.",
		"exploreCourses": "Explore courses"
	}
}
```

**src/locales/es/common.json**

```json
{
	"nav": {
		"explore": "Explorar",
		"login": "Iniciar sesión",
		"signup": "Registrarse"
	},
	"home": {
		"title": "Aprende cualquier cosa. Construye todo.",
		"exploreCourses": "Explorar cursos"
	}
}
```

### 3. Update astro.config.mjs

```javascript
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";

export default defineConfig({
	i18n: {
		defaultLocale: "en",
		locales: ["en", "es"],
		routing: {
			prefixDefaultLocale: false, // /courses instead of /en/courses
		},
	},
	integrations: [
		react(),
		tailwind(),
		mdx({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeMathjax],
		}),
	],
});
```

### 4. Create i18n Utility

**src/utils/i18n.ts**

```typescript
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en/common.json";
import es from "../locales/es/common.json";

i18next.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		es: { translation: es },
	},
	lng: "en",
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
});

export default i18next;
```

### 5. Update Header Component

**src/components/Header.react.jsx**

```jsx
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function Header({ siteTitle = "", menuItems = [] }) {
	const { t, i18n } = useTranslation();

	// Initialize i18n on mount
	useEffect(() => {
		// Detect language from URL or browser
		const lang =
			window.location.pathname.split("/")[1] ||
			navigator.language.split("-")[0] ||
			"en";
		if (["en", "es"].includes(lang)) {
			i18n.changeLanguage(lang);
		}
	}, [i18n]);

	// ... rest of component
	return (
		<header>
			<button>{t("nav.explore")}</button>
			<a href="#">{t("nav.login")}</a>
			<a href="#">{t("nav.signup")}</a>
		</header>
	);
}
```

### 6. Update Navbar to Pass Language

**src/components/Navbar.astro**

```astro
---
import Header from "../components/Header.react.jsx";
import { getCollection } from "astro:content";

const lang = Astro.params.lang || 'en';
const allCourses = await getCollection("courses");
const courses = allCourses.sort(
  (a, b) => (a.data.order || 999) - (b.data.order || 999),
);

const menuItems = courses.map((course) => ({
  label: course.data.title,
  href: `/${lang}/courses/${course.id}`,
}));

const siteTitle = "After My College";
---

<Header client:load siteTitle={siteTitle} menuItems={menuItems as any} />
```

### 7. Create Language Switcher

**src/components/LanguageSwitcher.tsx**

```tsx
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
	const { i18n } = useTranslation();

	const languages = [
		{ code: "en", name: "English", flag: "🇺🇸" },
		{ code: "es", name: "Español", flag: "🇪🇸" },
	];

	const switchLanguage = (lang: string) => {
		i18n.changeLanguage(lang);
		const currentPath = window.location.pathname;
		const newPath = currentPath.replace(/^\/(en|es)/, `/${lang}`);
		window.location.href = newPath || `/${lang}`;
	};

	return (
		<select
			value={i18n.language}
			onChange={(e) => switchLanguage(e.target.value)}
			className="px-3 py-1 rounded border"
		>
			{languages.map((lang) => (
				<option key={lang.code} value={lang.code}>
					{lang.flag} {lang.name}
				</option>
			))}
		</select>
	);
}
```

### 8. Add to Layout

**src/layouts/Layout.astro**

```astro
---
import "../styles/global.css";
import Navbar from "../components/Navbar.astro";
import Footer from "../components/Footer.astro";
import LanguageSwitcher from "../components/LanguageSwitcher";
const lang = Astro.params.lang || 'en';
---

<!doctype html>
<html lang={lang}>
  <!-- ... -->
  <body>
    <div class="min-h-screen flex flex-col">
      <Navbar />
      <div class="absolute top-4 right-4">
        <LanguageSwitcher client:only="react" />
      </div>
      <!-- ... -->
    </div>
  </body>
</html>
```

---

## Testing

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:4321/en` (English)
3. Visit: `http://localhost:4321/es` (Spanish)
4. Test language switcher

---

## Next Steps

1. Translate more UI elements
2. Add content translation (courses, chapters)
3. Update all page routes to include `[lang]` parameter
4. Add SEO metadata per language
