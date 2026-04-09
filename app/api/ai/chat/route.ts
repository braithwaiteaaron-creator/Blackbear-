import { streamText } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { prompt, context } = await req.json()

  const systemPrompt = `You are Bear Hub Pro AI Assistant, a helpful assistant for Black Bear Tree Care, a professional tree care business in Texas.

Your expertise includes:
- Tree removal, trimming, and pruning best practices
- Stump grinding techniques
- Emergency storm damage response
- Tree health assessment and disease identification
- Equipment recommendations and safety protocols
- Crew scheduling and job planning
- Cost estimation and pricing guidance

Current context: ${context || 'General tree care assistance'}

Always be professional, helpful, and safety-conscious. Provide practical advice for running a tree care business.`

  const result = streamText({
    model: 'anthropic/claude-sonnet-4',
    system: systemPrompt,
    prompt: prompt,
    abortSignal: req.signal,
  })

  // Return streaming response
  const stream = (await result).textStream
  
  // Convert to readable stream for response
  const encoder = new TextEncoder()
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk))
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
