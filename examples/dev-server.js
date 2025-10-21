/**
 * Simple development server for testing SSE streaming
 * Simulates an AI chat API with Server-Sent Events
 */

import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

// Configure CORS to allow all origins during development
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Custom-Header"],
  })
);
app.use(express.json());

/**
 * SSE chat endpoint
 * Simulates streaming AI responses
 */
app.post("/chat", (req, res) => {
  console.log("[Chat] Full request body:", JSON.stringify(req.body, null, 2));

  // keepalive
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);

  // —— Data Stream v1 (note: text/plain, not text/event-stream) ——
  res.status(200);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("x-vercel-ai-data-stream", "v1");
  // @ts-ignore
  res.flushHeaders?.();

  const messages = req.body?.messages ?? [];
  const last = messages[messages.length - 1];
  const textPart = last?.parts?.find((p) => p?.type === "text");
  const userText = textPart?.text ?? "";
  console.log(`[Chat] Received message: ${userText}`);

  const id = `msg_${Date.now()}`;
  const tokens = getResponse(userText); // array of token strings

  let closed = false;
  req.on("close", () => {
    closed = true;
    // clearInterval(streamTimer);
    // clearInterval(heartbeat);
    console.log("[Chat] Client disconnected");
  });

  // heartbeat (some proxies close idle streams)
  // const heartbeat = setInterval(() => {
  //   if (!closed) res.write(`: ping\n\n`);
  // }, 20000);

  // stream tokens as Data Stream v1 (async to allow flushing)
  let i = 0;
  const streamNext = () => {
    if (closed || i >= tokens.length) {
      // Send done event
      if (!closed) {
        res.write(`event: done\n`);
        res.write(`data: {"id":"${id}"}\n\n`);
        res.end();
      }
      return;
    }

    const delta = tokens[i++];
    const payload = {
      id,
      role: "assistant",
      content: [{ type: "text-delta", text: delta }],
    };
    res.write(`event: message\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    console.log(`[Chat] Streaming token: ${delta}`);

    setImmediate(streamNext);
  };

  streamNext();
});

/**
 * Generate response based on user message
 */
function getResponse(message) {
  const msg = (message || "").toLowerCase();

  if (msg.includes("hello") || msg.includes("hi")) {
    return splitIntoTokens(
      "Hello! 👋 I'm GhostChat, your AI assistant. How can I help you today?"
    );
  }

  if (msg.includes("help")) {
    return splitIntoTokens(
      "I can help you with various tasks! Try asking me about:\n\n" +
        "- **Code examples** - I can write code in multiple languages\n" +
        "- **Explanations** - I can explain concepts clearly\n" +
        "- **Problem solving** - I can help think through challenges\n" +
        "- **General questions** - Ask me anything!\n\n" +
        "What would you like to know?"
    );
  }

  if (msg.includes("code") || msg.includes("example")) {
    return splitIntoTokens(
      "Sure! Here's a simple example:\n\n" +
        "```javascript\n" +
        "function greet(name) {\n" +
        "  return `Hello, ${name}!`;\n" +
        "}\n\n" +
        "console.log(greet('World'));\n" +
        "```\n\n" +
        "This function takes a name and returns a greeting. Would you like to see more examples?"
    );
  }

  if (msg.includes("features") || msg.includes("what can you do")) {
    return splitIntoTokens(
      "I'm powered by GhostChat Embed, which includes:\n\n" +
        "✨ **Shadow DOM isolation** - No CSS conflicts\n" +
        "🎨 **Tailwind + shadcn styling** - Beautiful, modern UI\n" +
        "📡 **SSE streaming** - Real-time responses\n" +
        "🌍 **i18n support** - Multiple languages & RTL\n" +
        "♿ **Accessibility** - ARIA labels, keyboard navigation\n" +
        "📱 **Responsive** - Works great on mobile\n\n" +
        "Is there something specific you'd like to know?"
    );
  }

  // Default response
  return splitIntoTokens(
    `I understand you're asking about "${message}". ` +
      "This is a demo server with simulated responses. " +
      "In a real implementation, this would connect to an AI model like GPT-4, Claude, or an open-source LLM. " +
      "\n\nTry asking me about 'help', 'code', or 'features' for specific examples!"
  );
}

/**
 * Split text into tokens for streaming
 */
function splitIntoTokens(text) {
  // Split by words and punctuation
  return text.split(/(\s+|```[\s\S]*?```|[.,!?;:\n])/g).filter(Boolean);
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Dev API server running on http://localhost:${PORT}`);
  console.log(`   Chat endpoint: http://localhost:${PORT}/chat\n`);
});
