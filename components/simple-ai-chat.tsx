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
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput }),
      })

      // Check if streaming response
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('text/plain') && response.body) {
        // Handle streaming response
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''
        
        // Add empty assistant message that we'll update
        setMessages(prev => [...prev, { role: 'assistant', content: '' }])
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          fullContent += chunk
          
          // Update the last message with accumulated content
          setMessages(prev => {
            const newMessages = [...prev]
            newMessages[newMessages.length - 1] = { role: 'assistant', content: fullContent }
            return newMessages
          })
        }
      } else {
        // Handle JSON response
        const data = await response.json()
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: data.message || data.text || 'Unable to process request' 
        }
        setMessages(prev => [...prev, assistantMessage])
      }
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
    <div className="flex flex-col h-[400px] sm:h-[500px]">
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center gap-2 sm:gap-3 px-4">
            <div className="size-10 sm:size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="size-5 sm:size-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1 text-sm sm:text-base">{title}</p>
              <p className="text-xs sm:text-sm">{placeholder}</p>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`size-7 sm:size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-muted-foreground'
            }`}>
              {msg.role === 'user' ? <User className="size-3 sm:size-4" /> : <Bot className="size-3 sm:size-4" />}
            </div>
            <div
              className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-secondary text-foreground rounded-tl-sm'
              }`}
            >
              <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
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
      <div className="border-t border-border p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
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
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none min-h-[40px] sm:min-h-[44px] max-h-[100px] sm:max-h-[120px] text-sm"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
