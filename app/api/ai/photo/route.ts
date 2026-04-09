import { generateText } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { prompt, imageUrl } = await req.json()

  const systemPrompt = `You are a Tree Health Analysis AI for Black Bear Tree Care.

When analyzing tree photos or descriptions, provide:
1. Tree species identification (if visible)
2. Health assessment (healthy, stressed, diseased, dead)
3. Identified issues (disease, pest damage, structural problems)
4. Recommended actions
5. Urgency level (routine, soon, urgent, emergency)
6. Estimated cost range for recommended work

Be thorough but practical. Focus on actionable recommendations.`

  try {
    const messages: { role: 'user'; content: string | { type: string; text?: string; image?: string }[] }[] = []
    
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'image', image: imageUrl },
          { type: 'text', text: prompt || 'Analyze this tree and provide a health assessment with recommendations.' }
        ]
      })
    } else {
      messages.push({
        role: 'user',
        content: prompt
      })
    }

    const result = await generateText({
      model: 'anthropic/claude-sonnet-4',
      system: systemPrompt,
      messages: messages,
    })

    return Response.json({ 
      message: result.text,
      success: true 
    })
  } catch (error) {
    console.error('AI Photo Analysis Error:', error)
    return Response.json({ 
      message: 'Unable to analyze. Please describe the tree or issue you need help with.',
      success: false 
    }, { status: 500 })
  }
}
