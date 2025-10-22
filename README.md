# GhostChat Embed

> Open-source, Tailwind/shadcn-styled, Shadow DOM-isolated chat bubble built atop Vercel **ai-elements** chatbot, distributed as a single ESM bundle via jsDelivr.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/ghost-chat-embed.svg)](https://www.npmjs.com/package/ghost-chat-embed)

## ✨ Features

- 🎨 **Modern UI** - Tailwind CSS + shadcn/ui components
- 👻 **Shadow DOM Isolation** - Zero CSS conflicts with your site
- 📡 **SSE Streaming** - Real-time AI responses via Server-Sent Events
- 🌍 **i18n Ready** - Multi-language support with RTL
- ♿ **Accessible** - ARIA labels, keyboard navigation, reduced motion support
- 📱 **Responsive** - Works seamlessly on desktop and mobile
- 🎯 **Draggable** - Moveable chat bubble
- ⚙️ **Highly Configurable** - Theme, features, and behavior customization
- 📦 **Tiny Bundle** - ≤120KB minified + gzipped
- 🔒 **Secure** - Domain allowlist, DOMPurify sanitization, CSP-friendly

## 🚀 Quick Start

### Installation

Add GhostChat to your website with a simple script tag:

```html
<script type="module">
  import GhostChat from "https://cdn.jsdelivr.net/npm/ghost-chat-embed/dist/web.js";

  GhostChat.init({
    apiHost: "https://your-api-host.com",
  });
</script>
```

That's it! A chat bubble will appear in the bottom-right corner of your page.

### Full Configuration Example

```html
<script type="module">
  import GhostChat from "https://cdn.jsdelivr.net/npm/ghost-chat-embed/dist/web.js";

  GhostChat.init({
    // Required: Your chat API endpoint
    apiHost: "https://your-api-host.com",

    // Optional: Session management
    chatId: "user-session-123",
    conversationId: "conv-abc",

    // Optional: User identification
    user: {
      id: "user-456",
      email: "user@example.com",
    },

    // Optional: Theme customization
    theme: {
      accentColor: "#3B81F6",
      button: {
        right: 20,
        bottom: 20,
        size: 56,
        dragAndDrop: true,
        autoWindowOpen: {
          autoOpen: false,
          openDelay: 1000,
          autoOpenOnMobile: false,
        },
      },
      tooltip: {
        show: true,
        message: "Hi there! 👋",
      },
      window: {
        title: "Chat Assistant",
        height: 640,
        width: 400,
        darkMode: false,
        showTitle: true,
      },
    },

    // Optional: Feature toggles
    features: {
      includePromptToolbar: false,
      includeModelSelection: false,
      includeFileUpload: false,
      includeSuggestions: true,
    },

    // Optional: Internationalization
    i18n: {
      locale: "en",
      strings: {
        welcome: "Welcome! How can I help?",
        placeholder: "Type your message...",
        send: "Send",
        close: "Close",
      },
    },

    // Optional: Security
    domainAllowlist: ["example.com", "app.example.com"],

    // Optional: Telemetry
    telemetry: {
      enabled: true,
      endpoint: "https://your-telemetry-endpoint.com",
    },
  });
</script>
```

## 📖 API Reference

### `GhostChat.init(config)`

Initialize the chat widget with the provided configuration.

#### Config Options

| Option            | Type       | Required | Description                         |
| ----------------- | ---------- | -------- | ----------------------------------- |
| `apiHost`         | `string`   | Yes      | Base URL to your chat API           |
| `chatId`          | `string`   | No       | Session identifier                  |
| `conversationId`  | `string`   | No       | Conversation restore ID             |
| `user`            | `object`   | No       | User identification (`id`, `email`) |
| `theme`           | `object`   | No       | Theme customization                 |
| `features`        | `object`   | No       | Feature toggles                     |
| `i18n`            | `object`   | No       | Internationalization settings       |
| `domainAllowlist` | `string[]` | No       | Allowed embedding domains           |
| `telemetry`       | `object`   | No       | Telemetry configuration             |

See [SPEC/PRD.md](SPEC/PRD.md) for complete type definitions.

## 🔌 Backend API Contract

Your API must implement an SSE endpoint that accepts GET requests:

```
GET {apiHost}/chat?message=...&chatId=...&conversationId=...
```

### Response Format (SSE)

```
event: token
data: {"text": "Hello"}

event: token
data: {"text": " world"}

event: status
data: {"loading": false}

event: done
data: {"usage": {"promptTokens": 10, "completionTokens": 20}, "messageId": "msg-123"}
```

See `examples/dev-server.js` for a working example server.

## 🛠️ Development

### Prerequisites

- **Node.js 20+** (required for pnpm 9+ and modern build tools)
- **pnpm 9+** (package manager)

> ⚠️ **Important**: This project requires Node.js 20 or higher. If you encounter build errors with older Node versions, please upgrade your Node.js installation. You can use [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node versions.

### Setup

```bash
# Clone the repository
git clone https://github.com/rscheiwe/ghost-chat-embed.git
cd ghost-chat-embed

# Install dependencies
pnpm install

# Build CSS (one-time setup)
pnpm build:css

# Start development with automatic CSS rebuilding
pnpm dev:full

# In another terminal, start the API server
pnpm dev:api
```

Visit `http://localhost:5173` to see the demo.

### Build

```bash
# Build production bundle
pnpm build:all

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Lint and format
pnpm lint
pnpm format
```

### Testing Webpack Build (Script Injection)

Test the CDN-style script injection locally before deploying to jsDelivr:

```bash
# Build CSS first
pnpm build:css

# Start webpack dev server (serves bundle.js on port 8082)
pnpm dev:webpack

# In another terminal, start the API server (port 3000)
pnpm dev:api

# Open test-inject.html in your browser
open test-inject.html
```

The webpack dev server serves `bundle.js` with CORS headers at `http://localhost:8082/bundle.js`, allowing you to test script injection as it would work with jsDelivr.

**Build for production:**

```bash
# Build webpack production bundle
pnpm build:webpack

# Output: dist-webpack/bundle.js
```

## 📁 Project Structure

```
ghost-chat-embed/
├── src/
│   ├── index.ts              # Main entry point
│   ├── init.ts               # Initialization & Shadow DOM setup
│   ├── types.ts              # TypeScript types
│   ├── config.ts             # Zod validation
│   ├── sse.ts                # SSE client
│   ├── i18n.ts               # Internationalization
│   ├── telemetry.ts          # Telemetry tracking
│   ├── ui/                   # UI components
│   │   ├── root.ts           # Root controller
│   │   ├── bubble.ts         # Chat bubble
│   │   ├── window.ts         # Chat window
│   │   ├── messages.ts       # Message rendering
│   │   └── input.ts          # Input area
│   ├── utils/                # Utilities
│   │   ├── sanitize.ts       # HTML sanitization
│   │   └── dom.ts            # DOM helpers
│   └── styles/               # Styles
│       └── tailwind.css      # Tailwind CSS
├── examples/                 # Examples
│   ├── index.html            # Demo page
│   └── dev-server.js         # Dev API server
├── SPEC/                     # Specifications
│   └── PRD.md                # Product requirements
├── dist/                     # Build output
└── package.json
```

## 🎨 Theming

GhostChat uses Tailwind CSS with shadcn/ui design tokens. Customize via the `theme` config:

```javascript
theme: {
  accentColor: "#3B81F6",  // Primary color
  button: {
    size: 56,              // Button size (40-64px)
    right: 20,             // Position from right
    bottom: 20             // Position from bottom
  },
  window: {
    width: 400,            // Window width (min 320px)
    height: 640,           // Window height (min 420px)
    darkMode: true         // Enable dark mode
  }
}
```

## 🌍 Internationalization

Support multiple languages and RTL:

```javascript
i18n: {
  locale: "ar",  // Arabic (RTL)
  strings: {
    welcome: "مرحبا! كيف يمكنني مساعدتك؟",
    placeholder: "اكتب رسالتك...",
    send: "إرسال"
  }
}
```

RTL is automatically enabled for: Arabic (`ar`), Farsi (`fa`), Hebrew (`he`), Urdu (`ur`).

## 🔒 Security

- **Domain Allowlist**: Restrict embedding to specific domains
- **HTML Sanitization**: DOMPurify prevents XSS attacks
- **CSP-Friendly**: No inline scripts or `eval()`
- **Shadow DOM**: Complete isolation from parent page

## 📊 Telemetry

Track usage with OpenTelemetry-compatible events:

```javascript
telemetry: {
  enabled: true,
  endpoint: "https://your-endpoint.com"
}
```

Events: `gc.open`, `gc.close`, `gc.send`, `gc.receive`, `gc.error`

## TODO

[ ] Update webpack config for more graceful handling

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## 📄 License

MIT © [Your Name](https://github.com/rscheiwe)

## 🙏 Acknowledgments

- Built with [Vercel AI SDK](https://sdk.vercel.ai/)
- Styled with [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)
- Inspired by [Flowise](https://flowiseai.com/)

---

**[Documentation](https://docs.example.com)** • **[Demo](https://demo.example.com)** • **[Issues](https://github.com/rscheiwe/ghost-chat-embed/issues)**
