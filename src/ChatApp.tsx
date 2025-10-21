"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { GlobeIcon } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PortalProvider } from "@/lib/portal-context";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Suggestions, type Suggestion } from "@/components/ai-elements/suggestions";
import { WelcomeMessage } from "@/components/ai-elements/welcome-message";
import type { GhostChatConfig } from "./types";

const models = [
  { name: "GPT 4o", value: "openai/gpt-4o" },
  { name: "Deepseek R1", value: "deepseek/deepseek-r1" },
];

const defaultSuggestions: Suggestion[] = [
  { text: "What can you help me with?", prompt: "What can you help me with?" },
  { text: "Tell me about your features", prompt: "Tell me about your features" },
  { text: "How do I get started?", prompt: "How do I get started?" },
];

export default function ChatApp({
  config,
  portalContainer,
}: {
  config: GhostChatConfig;
  portalContainer?: HTMLElement | null;
}) {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0]?.value ?? "");
  const [webSearch, setWebSearch] = useState(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${config.apiHost}/chat`,
        headers: {
          "Custom-Header": "value",
          "Content-Type": "application/json",
        },
      }),
    [config.apiHost]
  );

  const { messages, sendMessage, status } = useChat({ transport });

  // --- scrolling refs
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    // smooth scroll to the very bottom
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const handleSubmit = (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (message.text?.trim()) {
      sendMessage({ text: message.text }, { body: { model, webSearch } });
      setInput("");
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    sendMessage({ text: prompt }, { body: { model, webSearch } });
  };

  return (
    <PortalProvider container={portalContainer ?? null}>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Scrollable message area */}
        <div className="flex-1 overflow-y-auto px-4" style={{ overscrollBehavior: 'contain' }}>
          <Conversation>
            <ConversationContent>
              {messages.length === 0 && (
                <>
                  <WelcomeMessage
                    message="Hi! I'm your AI assistant. How can I help you today?"
                    emoji="👋"
                  />
                  <Suggestions
                    suggestions={defaultSuggestions}
                    onSuggestionClick={handleSuggestionClick}
                  />
                </>
              )}
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === "assistant" && (
                    <Sources>
                      {message.parts.map((part, i) => {
                        if (part.type === "source-url") {
                          return (
                            <SourcesContent key={`${message.id}-${i}`}>
                              <Source href={part.url} title={part.url} />
                            </SourcesContent>
                          );
                        }
                        return null;
                      })}
                    </Sources>
                  )}
                  <Message from={message.role}>
                    <MessageContent>
                      {message.parts.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <Response key={`${message.id}-${i}`}>
                                {part.text}
                              </Response>
                            );
                          case "reasoning":
                            return (
                              <Reasoning
                                key={`${message.id}-${i}`}
                                className="w-full"
                                isStreaming={status === "streaming"}
                              >
                                <ReasoningTrigger />
                                <ReasoningContent>{part.text}</ReasoningContent>
                              </Reasoning>
                            );
                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                  </Message>
                </div>
              ))}
              {status === "submitted" && <Loader />}
            </ConversationContent>
          </Conversation>
          <div ref={bottomRef} />
        </div>

        {/* Fixed input area */}
        <div className="bottom-0 left-0 w-full bg-background border-t">
          <div className="p-4">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
              />
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputButton
                    onClick={() => setWebSearch(!webSearch)}
                    variant={webSearch ? "default" : "ghost"}
                  >
                    <GlobeIcon size={16} />
                    <span>Search</span>
                  </PromptInputButton>

                  <SimpleSelect onValueChange={setModel} value={model}>
                    {models.map((m) => (
                      <SimpleSelectItem key={m.value} value={m.value}>
                        {m.name}
                      </SimpleSelectItem>
                    ))}
                  </SimpleSelect>
                </PromptInputTools>
                <PromptInputSubmit disabled={!input} status={status} />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>
      </div>
    </PortalProvider>
  );
}
