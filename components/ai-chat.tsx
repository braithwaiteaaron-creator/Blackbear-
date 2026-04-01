'use client'

import { useState, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, ImagePlus, X } from 'lucide-react'

interface AIChatProps {
  endpoint: string
  title: string
  placeholder: string
  allowImages?: boolean
}

export function AIChat({ endpoint, title, placeholder, allowImages = false }: AIChatProps) {
  const [input, setInput] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: endpoint }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (imagePreview) {
      sendMessage({
        text: input,
        files: [{ type: 'image' as const, url: imagePreview }],
      })
      setImagePreview(null)
    } else {
      sendMessage({ text: input })
    }
    setInput('')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col h-[500px] bg-slate-900 rounded-lg border border-slate-700">
      <div className="p-4 border-b border-slate-700 bg-slate-800 rounded-t-lg">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bot className="text-emerald-500" />
          {title}
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-8">
            <Bot className="mx-auto mb-4 text-slate-600" size={48} />
            <p>{placeholder}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-emerald-600'
                      : 'bg-slate-700'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Bot size={16} className="text-emerald-400" />
                  )}
                </div>
                <div
                  className={`flex-1 p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-emerald-900/50 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {message.parts.map((part, index) => {
                    if (part.type === 'text') {
                      return (
                        <div key={index} className="whitespace-pre-wrap text-sm">
                          {part.text}
                        </div>
                      )
                    }
                    if (part.type === 'file' && 'url' in part) {
                      return (
                        <img
                          key={index}
                          src={part.url}
                          alt="Uploaded"
                          className="max-w-xs rounded-lg mt-2"
                        />
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-700">
                  <Bot size={16} className="text-emerald-400 animate-pulse" />
                </div>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {imagePreview && (
        <div className="px-4 py-2 bg-slate-800 border-t border-slate-700">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          {allowImages && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="border-slate-600 bg-slate-800 hover:bg-slate-700"
              >
                <ImagePlus size={18} className="text-slate-400" />
              </Button>
            </>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-h-[44px] max-h-32 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  )
}
