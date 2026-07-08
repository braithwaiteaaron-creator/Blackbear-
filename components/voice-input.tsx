'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'
import { toast } from 'sonner'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  className?: string
}

export function VoiceInput({ onTranscript, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check support on client side only to avoid hydration mismatch
    const supported = typeof window !== 'undefined' && 
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    setIsSupported(supported)
    
    if (!supported) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied')
      } else if (event.error !== 'aborted') {
        toast.error('Voice input error')
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (!isSupported) {
      toast.error('Voice input not supported in this browser')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
        toast.success('Listening... Speak now')
      } catch (error) {
        toast.error('Could not start voice input')
      }
    }
  }

  // Don't render if speech not supported (checked after hydration)
  if (!isSupported) {
    return null
  }

  return (
    <Button
      type="button"
      variant={isListening ? 'destructive' : 'outline'}
      size="icon"
      onClick={toggleListening}
      className={`shrink-0 ${isListening ? 'animate-pulse' : ''} ${className || ''}`}
      title={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isListening ? (
        <MicOff className="size-4" />
      ) : (
        <Mic className="size-4" />
      )}
    </Button>
  )
}
