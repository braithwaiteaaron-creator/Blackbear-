'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function SimpleAIChat({ 
  endpoint, 
  title, 
  placeholder = 'Ask me anything...',
}: { 
  endpoint: string
  title: string
  placeholder?: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      })

      const data = await response.json()
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.message || data.text || 'Unable to process request' 
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center gap-3">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="size-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">{title}</p>
              <p className="text-sm">{placeholder}</p>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-muted-foreground'
            }`}>
              {msg.role === 'user' ? <User className="size-4" /> : <Bot className="size-4" />}
            </div>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-secondary text-foreground rounded-tl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="size-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <Bot className="size-4 text-muted-foreground" />
            </div>
            <div className="bg-secondary text-foreground px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 w-11 flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
