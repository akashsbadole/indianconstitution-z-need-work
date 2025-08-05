import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface BiasDetectionRequest {
  text: string
  context?: string
  analysisType?: 'LEGAL_DOCUMENT' | 'CASE_FACTS' | 'JUDGMENT' | 'GENERAL'
}

export async function POST(request: NextRequest) {
  try {
    const body: BiasDetectionRequest = await request.json()
    const { text, context = '', analysisType = 'GENERAL' } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required for bias detection' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    
    // Initialize ZAI SDK
    const zai = await ZAI.create()

    const systemPrompt = `You are an advanced AI assistant specialized in detecting and analyzing potential biases in legal texts. Your task is to carefully analyze the provided text and identify any biases related to:

1. Gender bias (assumptions about gender roles, sexist language)
2. Religious bias (favoring or discriminating against specific religions)
3. Caste bias (caste-based discrimination or assumptions)
4. Economic bias (class-based assumptions or discrimination)
5. Regional bias (favoring or discriminating based on geographic origin)
6. Age bias (age-based assumptions or discrimination)
7. Political bias (political affiliation bias)

For each detected bias, provide:
- The type of bias
- Severity level (0.0 to 1.0)
- Exact context where bias appears
- Explanation of why it's biased
- Suggested neutral alternative

Provide your analysis in the following JSON format:
{
  "overallBiasScore": 0.25,
  "neutralityScore": 0.75,
  "detectedBiases": [
    {
      "type": "GENDER",
      "severity": 0.4,
      "context": "The male driver was careless...",
      "explanation": "Assumes driver's gender without evidence",
      "suggestion": "The driver was careless..."
    }
  ],
  "languageAnalysis": {
    "emotionalLanguage": false,
    "subjectiveTerms": ["careless", "reckless"],
    "stereotypicalLanguage": true,
    "loadedTerms": []
  },
  "contextualAnalysis": {
    "powerDynamics": "neutral",
    "culturalSensitivity": "moderate",
    "inclusiveLanguage": "needs_improvement"
  },
  "recommendations": [
    "Use gender-neutral language",
    "Avoid making assumptions about parties involved",
    "Focus on factual statements rather than subjective descriptions"
  ],
  "confidenceScore": 0.8
}`

    const userPrompt = `Please analyze the following text for potential biases:

Analysis Type: ${analysisType}
Context: ${context}
Text to analyze: "${text}"

Please provide a comprehensive bias detection analysis following the specified JSON format.`

    // Make the AI API call
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.2, // Very low temperature for consistent bias detection
      max_tokens: 1500
    })

    const processingTime = Date.now() - startTime
    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      throw new Error('No response from AI model')
    }

    // Parse the JSON response
    let biasResult
    try {
      biasResult = JSON.parse(responseContent)
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the raw content
      biasResult = {
        rawAnalysis: responseContent,
        overallBiasScore: 0.5,
        neutralityScore: 0.5,
        detectedBiases: [],
        recommendations: ['Please review the raw analysis for bias detection results'],
        confidenceScore: 0.6,
        note: 'AI response was not in valid JSON format'
      }
    }

    return NextResponse.json({
      success: true,
      biasResult,
      processingTime,
      modelUsed: 'z-ai-gpt-4',
      textLength: text.length,
      analysisType
    })

  } catch (error) {
    console.error('Bias detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect bias', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint for batch bias detection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const text = searchParams.get('text')
    const context = searchParams.get('context') || ''
    const analysisType = searchParams.get('analysisType') || 'GENERAL'

    if (!text) {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      )
    }

    // Reuse the POST logic by creating a request body
    const requestBody: BiasDetectionRequest = {
      text,
      context,
      analysisType: analysisType as any
    }

    // Create a mock request object to reuse POST logic
    const mockRequest = {
      json: async () => requestBody
    } as NextRequest

    // Call the POST handler
    return await POST(mockRequest)

  } catch (error) {
    console.error('Batch bias detection error:', error)
    return NextResponse.json(
      { error: 'Failed to perform batch bias detection', details: error.message },
      { status: 500 }
    )
  }
}