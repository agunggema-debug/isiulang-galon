"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { quickReplies, getBotResponse } from "@/lib/chatbot-responses";

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "👋 Halo! Selamat datang di **AquaGas Premium**.\n\nAda yang bisa saya bantu? Silakan pilih pertanyaan di bawah ini atau ketik pertanyaan Anda!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botText = getBotResponse(text);
      const botMessage: Message = { role: "bot", text: botText };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleQuickReply = (text: string) => {
    handleSend(text);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-3.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95",
          isOpen
            ? "bg-red-500 hover:bg-red-600 rotate-90"
            : "bg-[#0F4C81] hover:bg-[#0a3d6b]"
        )}
        aria-label={isOpen ? "Tutup chat" : "Buka chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-linear-to-r from-[#0F4C81] to-[#1a6bb0] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm">AquaBot</h3>
                <p className="text-xs text-white/80">Asisten Virtual AquaGas</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-white/80">Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-2.5",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-full shrink-0",
                    msg.role === "user"
                      ? "bg-[#0F4C81]"
                      : "bg-gray-200"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-[#0F4C81]" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                    msg.role === "user"
                      ? "bg-[#0F4C81] text-white rounded-tr-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-full bg-gray-200">
                  <Bot className="h-4 w-4 text-[#0F4C81]" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick replies (show after bot messages) */}
            {messages.length > 0 && messages[messages.length - 1].role === "bot" && !isTyping && (
              <div className="pt-2 space-y-1.5">
                <p className="text-xs text-gray-400 text-center">Pilih pertanyaan:</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs bg-white border border-gray-200 hover:border-[#0F4C81] hover:text-[#0F4C81] text-gray-600 px-3 py-1.5 rounded-full transition-colors duration-200 shadow-sm hover:shadow"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent placeholder:text-gray-400"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-200",
                  input.trim() && !isTyping
                    ? "bg-[#0F4C81] text-white hover:bg-[#0a3d6b] shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
                aria-label="Kirim pesan"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}