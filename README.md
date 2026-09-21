# 🧰 ToolBox Hub

> **A modern, all-in-one web toolkit for everyday productivity, content, developer, image, PDF, SEO, security, and AI-assisted tasks.**

ToolBox Hub is a browser-based utility platform built with **React, TypeScript, Vite, Tailwind CSS, Express, and the Google Gemini API**. It brings a broad collection of practical tools into a single, consistent interface so users can complete common tasks without moving between multiple websites.

The project is designed as a scalable web application with reusable UI components, categorized tools, responsive layouts, client-side utilities, and optional server-side AI capabilities.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-orange)](#project-status)

---

## ✨ Overview

ToolBox Hub is built around a simple idea:

**Put useful everyday digital tools in one fast, organized, and easy-to-use workspace.**

The application combines lightweight browser utilities with more advanced features such as AI-assisted text processing and image-generation workflows.

### What the platform provides

- 🧮 Calculators and converters
- ✍️ Writing, grammar, and text utilities
- 🤖 AI-assisted content tools
- 🖼️ Image creation and optimization tools
- 📄 PDF conversion utilities
- 🔍 SEO utilities
- 🔐 Security and password tools
- 📱 QR code generation and scanning
- 👨‍💻 Developer utilities
- ⭐ Favorites and theme support
- 📰 Built-in blog and informational pages

---

## 🎯 Problem Statement

Everyday digital tasks often require users to visit many specialized websites:

- one site for a calculator,
- another for image compression,
- another for PDF conversion,
- another for SEO tasks,
- and separate tools for writing or developer utilities.

This creates unnecessary context switching and inconsistent user experiences.

**ToolBox Hub addresses this fragmentation by bringing frequently used utilities together inside one unified platform.**

---

## 💡 Solution

ToolBox Hub provides a categorized, reusable tool ecosystem with a shared interface and consistent navigation.

Instead of building every utility as an isolated application, the project uses a common architecture around:

**Categories → Tools → Shared UI Components → Specialized Tool Logic**

This makes the platform easier to expand as new tools are added.

---

## 🧩 Tool Categories

### 🧮 Calculator
- Age Calculator
- BMI Calculator
- Compound Interest Calculator
- Discount Calculator
- EMI Calculator
- Loan Calculator
- Percentage Calculator
- Scientific Calculator

### 🔄 Converter
- Unit Converter
- Color Converter

### 👨‍💻 Developer
- JSON Formatter
- JSON Validator
- Password Generator
- Developer utilities

### ✍️ Grammar & Writing
- AI Detector
- AI Humanizer
- Grammar Checker
- HTML Text Cleaner
- Plagiarism Checker
- Plain Text Converter
- Sentence Rewriter
- Spell Checker

### 🖼️ Image
- Fiverr Gig Image Generator
- YouTube Thumbnail Generator
- Image Color Picker
- Image Compressor
- Image Cropper
- Image Resizer
- Image to Excel Converter
- JPG to PNG Converter
- Social Media Resizer
- WebP to JPG Converter
- WebP to PNG Converter

### 📄 PDF
- JPG to PDF Converter
- PDF to Excel Converter
- PDF to Word Converter

### 🔳 QR
- QR Code Generator
- QR Code Scanner

### 🔐 Security
- Hash Generator
- Password Strength Checker
- Random String Generator

### 🔎 SEO
- Keyword Density Checker
- Meta Tag Generator
- Robots.txt Generator
- SERP Preview
- URL Slug Generator

### 📝 Text
- Character Counter
- Reading Time Calculator
- Text Case Converter
- Word Counter

> The tool catalog is maintained as application data, allowing the platform to evolve as additional utilities are introduced.

---

## 🤖 AI Capabilities

ToolBox Hub includes server-side AI integration using the **Google Gemini API**.

The current backend exposes AI endpoints for:

- AI-assisted text humanization
- AI-content detection analysis
- Health/API status checks

The application also contains dedicated UI workflows for AI-focused tools such as the **AI Humanizer**, **AI Detector**, **Fiverr Gig Image Generator**, and **YouTube Thumbnail Generator**.

### AI architecture

```text
User Input
   ↓
React Frontend
   ↓
Express API
   ↓
Google Gemini API
   ↓
Processed Result
   ↓
Frontend Result / Editor
```

If a Gemini API key is unavailable or an upstream request fails, the current server includes fallback processing for selected text features.

> **Important:** AI-generated or AI-detection outputs should be treated as probabilistic assistance rather than guarantees of authorship, accuracy, platform approval, or performance.

---

## 🏗️ Architecture

ToolBox Hub follows a modular frontend architecture designed for reuse and extension.

```text
ToolBox Hub
│
├── React Application
│   ├── Pages
│   ├── Shared Components
│   ├── Context Providers
│   ├── Tool Catalog
│   └── Individual Tool Modules
│
├── Express Server
│   ├── API Health
│   ├── AI Humanization Endpoint
│   ├── AI Detection Endpoint
│   └── Static Production Serving
│
└── External Services
    └── Google Gemini API (optional)
```

### Architectural principles

- Modular tool-based architecture
- Reusable shared components
- Centralized tool/category data
- Responsive UI
- Type-safe development with TypeScript
- Server-side handling for AI API credentials
- Separation between frontend presentation and backend AI processing

---

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Motion
- Lucide React

### Backend
- Node.js
- Express
- TypeScript / TSX
- esbuild

### AI
- Google Gemini API
- `@google/genai`

### Document & File Processing
- jsPDF
- docx
- pdfjs-dist
- xlsx
- Tesseract.js
- QRCode libraries

### Developer Tooling
- Bun lockfile support
- TypeScript compiler
- Vite build pipeline
- Environment-variable configuration with dotenv

---

## 📁 Project Structure

```text
toolbox-hub/
│
├── components/
│   ├── ads/
│   ├── common/
│   ├── layout/
│   └── tools/
│
├── config/
│   ├── ads.config.ts
│   └── site.config.ts
│
├── context/
│   ├── FavoritesContext.tsx
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
│
├── data/
│   ├── blog.ts
│   ├── categories.ts
│   └── tools.ts
│
├── pages/
│   ├── Blog/
│   ├── Categories/
│   ├── Home/
│   ├── Tools/
│   └── Trust/
│
├── tools/
│   ├── calculator/
│   ├── converter/
│   ├── developer/
│   ├── grammar/
│   ├── image/
│   ├── pdf/
│   ├── qr/
│   ├── security/
│   ├── seo/
│   └── text/
│
├── lib/
├── types/
├── utils/
├── App.tsx
├── main.tsx
├── index.html
├── index.css
├── server.ts
├── vite.config.ts
├── tsconfig.json
├── metadata.json
├── package.json
└── .env.example
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js installed
- npm, Bun, or another compatible package manager
- A Google Gemini API key if you want to use the server-side AI features

### 1. Clone the repository

```bash
git clone https://github.com/Asem758/toolbox-hub.git
cd toolbox-hub
```

### 2. Install dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example`.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Never commit real secrets to GitHub.

### 4. Start the development server

```bash
npm run dev
```

The application starts through the Express + Vite development setup.

### 5. Create a production build

```bash
npm run build
```

### 6. Start the production server

```bash
npm start
```

---

## 🔒 Security & Privacy

Security is especially important because the application supports server-side AI integrations.

The repository includes an `.env.example` file for configuration without exposing secret values.

### Recommended practices

- Keep API keys on the server.
- Never hard-code secrets in React components.
- Do not commit `.env` files containing real credentials.
- Validate and limit incoming request payloads.
- Review third-party API and privacy policies before production deployment.
- Avoid sending sensitive user information to external AI services unless the user has appropriate notice and consent.

The current server also limits JSON/form payload sizes and performs basic input validation for AI endpoints.

---

## 🎨 User Experience

ToolBox Hub is designed around a consistent experience across tools.

### Shared UX patterns

- Responsive layouts
- Reusable tool headers
- Breadcrumb navigation
- Toast notifications
- Theme context
- Favorites
- Global tool search
- Consistent controls and cards
- Dedicated tool pages
- Blog and trust-information pages

The goal is to make each individual utility feel familiar even though the underlying functionality differs.

---

## 📸 Screenshots

Add project screenshots here to showcase the live interface.

Suggested screenshot set:

1. Homepage
2. Tool directory / All Tools
3. Category page
4. AI Humanizer
5. AI Detector
6. YouTube Thumbnail Generator
7. Fiverr Gig Image Generator
8. Developer tools
9. SEO tools
10. Mobile responsive view

Example Markdown:

```md
![ToolBox Hub Homepage](./assets/screenshots/homepage.png)
```

---

## 📈 Performance & Scalability

The project is structured so additional tools can be added without rebuilding the entire application architecture.

New functionality can generally be introduced through:

1. A dedicated tool component
2. Tool metadata
3. Category registration
4. Shared UI components
5. Optional server/API integration

This approach supports continued expansion while maintaining consistency across the platform.

---

## 🧪 Quality & Reliability

The project includes:

- TypeScript type checking
- Modular components
- Centralized configuration
- API error handling
- Loading and fallback states for AI functionality
- Responsive UI patterns
- Dedicated privacy, terms, disclaimer, about, and contact pages

For production deployment, additional automated testing, CI checks, observability, and security hardening are recommended.

---

## 🔭 Future Roadmap

Potential future improvements include:

- User accounts and personalized tool history
- Cloud-based preferences
- More AI-powered tools
- Saved projects and templates
- Advanced image editing
- More document conversion capabilities
- Automated testing and CI/CD
- Usage analytics with privacy controls
- Internationalization / multi-language support
- PWA support
- More granular API rate limiting
- Admin/content management capabilities

---

## 📚 Use Cases

ToolBox Hub can support a wide range of users:

**Students** — calculations, writing utilities, PDF tools, QR tools, and study-related workflows.

**Creators** — thumbnail generation, image optimization, text tools, and social-media resizing.

**Freelancers** — Fiverr Gig image generation, SEO tools, document utilities, productivity utilities, and business support tools.

**Developers** — JSON formatting, validation, password generation, and related developer utilities.

**Digital Marketers** — SEO utilities, content tools, metadata generation, and social-media asset preparation.

**Everyday Users** — calculators, converters, image tools, QR tools, and file utilities.

---

## 🌐 Project Philosophy

ToolBox Hub is built around three principles:

### Simplicity
Useful tools should be easy to discover and operate.

### Utility
Every feature should solve a practical, repeatable task.

### Extensibility
The architecture should make it straightforward to introduce new tools without creating unnecessary complexity.

---

## 👨‍💻 Author

**Ashrafur Rahman**

GitHub: [@Asem758](https://github.com/Asem758)

---

## 📄 Project Status

**Status:** Active Development

ToolBox Hub is an evolving project. Features, AI integrations, tool implementations, and UI components may continue to change as the platform grows.

---

## ⚠️ Disclaimer

ToolBox Hub provides general-purpose digital utilities and AI-assisted features.

Results may vary depending on the input, browser environment, third-party APIs, and underlying algorithms. AI-generated or AI-detection results should not be treated as absolute or guaranteed outcomes.

Users are responsible for reviewing outputs before relying on them for important decisions or publishing them to third-party platforms.

---

## ⭐ Support the Project

If you find ToolBox Hub useful, consider giving the repository a ⭐ on GitHub and sharing it with others who may benefit from the tools.

---

## 📜 License

No explicit open-source license is currently declared in this repository. Please contact the project owner before redistributing or commercially reusing the code.

