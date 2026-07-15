# ⚡ React + Vite + TypeScript Boilerplate

A clean and scalable frontend starter built with React, Vite, and TypeScript.

---

## 🚀 Features

- ⚛️ React
- ⚡ Vite (fast dev & build)
- 🟦 TypeScript
- 📁 Scalable folder structure
- 🔗 Path aliases (`@/`)
- 🎯 Ready for component-based architecture

---

## 📦 Installation

```bash
npm install
```

---

## 🧪 Development

```bash
npm run dev
```

---

## 🏗️ Build

```bash
npm run build
```

---

## 👀 Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
src/
  assets/
  components/
    atoms/
    molecules/
    organisms/
    templates/
    pages/
  App.css
  App.tsx
  index.css
  main.tsx
```

---

## 🔗 Path Aliases

Use clean imports like:

```ts
import Button from '@/components/atoms/Button';
```

Configured in:

- `tsconfig.app.json`
- `vite.config.ts`

---

## 🧹 Clean Setup

This boilerplate is intentionally minimal:

- No unnecessary dependencies
- No framework lock-in
- Easy to extend

---

## 📌 Notes

- Uses modern ES modules
- Optimized for developer experience
- Works great with Storybook, testing libraries, and UI frameworks

## 🔐 Backend Auth Integration

Set your API base URL in a `.env` file before running the app:

```bash
VITE_API_URL=http://localhost:3000
```

The auth pages call these endpoints by default:

- `POST /auth/register`
- `POST /auth/login`

Each endpoint should return a JSON session payload shaped like:

```json
{
  "access_token": "jwt-or-session-token",
  "user": {
    "id": "1",
    "name": "Antonia Rivera",
    "email": "you@example.com"
  }
}
```
