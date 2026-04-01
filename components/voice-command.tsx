"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface VoiceCommandProps {
  onCommand?: (command: string, address?: string) => void
}

type SupportedCommand = "quote" | "damage" | "route" | "weather" | "follow-up" | "route-plan"

interface ParsedCommand {
  type: SupportedCommand
  address?: string
  rawText: string
}

export function VoiceCommand({ onCommand }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [showPanel, setShowPanel] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onstart = () => {
          setIsListening(true)
          setShowPanel(true)
        }

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              handleCommand(transcript)
            } else {
              interimTranscript += transcript
            }
          }
          setTranscript(interimTranscript || transcript)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          toast.error(`Voice error: ${event.error}`)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  const parseCommand = (text: string): ParsedCommand | null => {
    const lowerText = text.toLowerCase()

    // New job/quote
    if (lowerText.includes("job") || lowerText.includes("quote")) {
      const addressMatch = text.match(/at\s+(.+?)(?:\s+|\.|$)/i)
      return {
        type: "quote",
        address: addressMatch?.[1],
        rawText: text,
      }
    }

    // Spot damage
    if (lowerText.includes("damage") || lowerText.includes("spotted")) {
      const addressMatch = text.match(/at\s+(.+?)(?:\s+|\.|$)/i)
      return {
        type: "damage",
        address: addressMatch?.[1],
        rawText: text,
      }
    }

    // Check route
    if (lowerText.includes("route") && lowerText.includes("today")) {
      return { type: "route", rawText: text }
    }

    // Plan route
    if (lowerText.includes("plan") && lowerText.includes("route")) {
      return { type: "route-plan", rawText: text }
    }

    // Weather
    if (lowerText.includes("weather") || lowerText.includes("storm")) {
      return { type: "weather", rawText: text }
    }

    // Follow-up
    if (lowerText.includes("follow") || lowerText.includes("contact")) {
      return { type: "follow-up", rawText: text }
    }

    return null
  }

  const handleCommand = (text: string) => {
    const command = parseCommand(text)
    if (command) {
      setTranscript(`✓ ${command.rawText}`)
      onCommand?.(command.type, command.address)
      
      // Show success feedback
      switch (command.type) {
        case "quote":
          toast.success(`New quote at ${command.address || "to be determined"}`)
          break
        case "damage":
          toast.success(`Damage logged at ${command.address || "to be determined"}`)
          break
        case "route":
          toast.success("Checking today's route...")
          break
        case "weather":
          toast.success("Checking weather conditions...")
          break
        default:
          toast.success("Command processed")
      }

      setTimeout(() => {
        setShowPanel(false)
        setTranscript("")
      }, 2000)
    } else {
      setTranscript("❌ Command not recognized. Try: 'New job at [address]'")
      setTimeout(() => {
        setTranscript("")
      }, 2000)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Voice recognition not available in your browser")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setTranscript("")
      recognitionRef.current.start()
    }
  }

  return (
    <>
      {/* Voice Panel */}
      {showPanel && (
        <div className="fixed inset-x-0 bottom-24 mx-4 lg:mx-auto lg:max-w-xl z-40">
          <div className="rounded-lg border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                {isListening ? (
                  <>
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Listening...
                  </>
                ) : (
                  "Voice Command"
                )}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-lg bg-secondary p-3 min-h-[60px]">
              {transcript ? (
                <p className="text-sm">{transcript}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Try: "Hey Bear Hub, new job at 123 Main Street"
                </p>
              )}
            </div>
            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Common Commands:</p>
              <p>"New job at [address]" - Create quote</p>
              <p>"I spotted damage at [address]" - Log damage</p>
              <p>"What's my route today?" - Check route</p>
              <p>"Check the weather" - View conditions</p>
            </div>
          </div>
        </div>
      )}

      {/* Voice Button - Large for easy mobile tap */}
      <div className="fixed bottom-6 right-4 z-50">
        <Button
          size="lg"
          onClick={toggleListening}
          className={cn(
            "h-16 w-16 rounded-full shadow-xl transition-all active:scale-95",
            isListening
              ? "bg-destructive hover:bg-destructive/90 animate-pulse"
              : "bg-primary hover:bg-primary/90"
          )}
          title="Click to start voice command or say 'Hey Bear Hub'"
        >
          {isListening ? (
            <MicOff className="h-7 w-7 text-destructive-foreground" />
          ) : (
            <Mic className="h-7 w-7 text-primary-foreground" />
          )}
        </Button>
        {!showPanel && (
          <span className="absolute -top-9 right-0 whitespace-nowrap text-xs font-medium text-muted-foreground bg-card px-2 py-1 rounded shadow">
            Hey Bear Hub
          </span>
        )}
      </div>
    </>
  )
}
