"use client"

import {Id, Doc} from "@/convex/_generated/dataModel"
import React, { useEffect, useRef, useState } from "react"
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { Content } from "next/font/google";
import { ChatRequestBody } from "@/lib/types";

interface ChatInterfaceProps {
    chatId: Id<"chats">,
    initialMessage: Doc<"messages">[];
}


function ChatInterface({chatId, initialMessage}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessage)
    const [input, setInput] = useState("")
    const [streamedResponse, setStreamedResponse] = useState("")
    const [currentTool, setCurrentTool] = useState<{
        name: string,
        input: unknown
    } | null>(null)
    const [isLoading, setIsLoading] = useState(false);
    const messageEndRef= useRef<HTMLDivElement>(null)

    useEffect(()=> {
        messageEndRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages, streamedResponse])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const trimmedInput = input.trim()

        if(!trimmedInput || isLoading) return;

        //Reset UI state for new message
        setInput("")
        setStreamedResponse("")
        setCurrentTool(null)
        setIsLoading(true)

            // Add user's message immediately for better UX
    const optimisticUserMessage: Doc<"messages"> = {
        _id: `temp_${Date.now()}`,
        chatId,
        content: trimmedInput,
        role: "user",
        createdAt: Date.now(),
      } as Doc<"messages">;
  
      setMessages((prev) => [...prev, optimisticUserMessage]);

      let fullResponse = ""

      try{
        const requestBody:ChatRequestBody = {
            messages:  messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
            newMessage: trimmedInput,
            chatId,
        }

        const response =  await fetch("/api/chat/stream", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) throw new Error(await response.text());
        if (!response.body) throw new Error("No response body available");
    }catch(error) {

    }
}
  return (
    <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
        <section className="flex-1">
            <div>
                {messages.map((message) => (
                    <div key={message._id}>{message.content}</div>
                ))}

            <div ref={messageEndRef} />
            </div>    
        </section> 

        {/* footer */}
        <footer className="border-t bg-white p-4">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
            <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI Agent..."
              className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-gray-50 placeholder:text-gray-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-1.5 rounded-xl h-9 w-9 p-0 flex items-center justify-center transition-all ${
                input.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <ArrowRight />
            </Button>
          </div>
            </form>
        </footer>
    </main>
)
}

export default ChatInterface