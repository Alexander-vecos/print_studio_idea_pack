# PrintStudio IdeaPack

A secure PWA for managing design files and resources with Firebase backend.

## 🚀 Features

- **Secure Authentication**: Key-based access for users, phone verification for admins
- **File Management**: Upload, preview, and organize files (PDF, SVG, JPG, PNG, and more)
- **Base64 Storage**: Files stored in Firestore as Base64 Data URLs (no Firebase Storage needed)
- **Responsive Design**: Works on mobile, tablet, and desktop with adaptive navigation
- **Safe Area Support**: Proper handling of notches and safe areas on mobile devices
- **PWA Ready**: Installable on home screen with offline support
- **Gesture Support**: Double-tap to toggle navigation, swipe to close modals

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Firebase project with Firestore enabled
- Firebase Authentication (anonymous sign-in and Custom Tokens support)

## 🔧 Setup

### 1. Install Dependencies

```bash
cd nexus-polygraf
npm install
```

### 2. Configure Firebase

Copy `.env.example` to `.env.local` and fill in your Firebase credentials

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
