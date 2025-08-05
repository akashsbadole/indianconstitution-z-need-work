import { NextRequest, NextResponse } from 'next/server'
import { ragService } from '@/lib/services/ragService'
import ZAI from 'z-ai-web-dev-sdk'

interface RAGQueryRequest {
  query: string
  options?: {
    maxResults?: number
    similarityThreshold?: number
    documentTypes?: string[]
    categories?: string[]
    includeExcerpts?: boolean
    useHybridSearch?: boolean
  }
  generateResponse?: boolean
  context?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RAGQueryRequest = await request.json()
    const { 
      query, 
      options = {},
      generateResponse = false,
      context = ''
    } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Initialize RAG service if needed
    await ragService.initialize()

    // Perform RAG query
    const ragResult = await ragService.query(query, options)

    let aiResponse = null
    let responseTime = 0

    // Generate AI response using augmented prompt if requested
    if (generateResponse) {
      const aiStartTime = Date.now()
      
      try {
        const zai = await ZAI.create()
        
        const systemPrompt = `You are an expert legal AI assistant with access to a comprehensive legal knowledge base. Use the provided legal knowledge to answer the query accurately and comprehensively.

Guidelines:
1. Base your response primarily on the provided legal documents
2. Cite specific documents when referencing legal principles
3. Consider the relevance scores and similarity scores when weighing information
4. Provide well-reasoned, accurate legal analysis
5. If the provided information is insufficient, acknowledge the limitations
6. Maintain professional and objective legal language
7. Structure your response clearly with appropriate legal reasoning`

        const userPrompt = `${ragResult.augmentedPrompt}

Additional Context: ${context}

Please provide a comprehensive legal response to the query based on the provided knowledge and context.`

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
          temperature: 0.3,
          max_tokens: 1500
        })

        aiResponse = completion.choices[0]?.message?.content
        responseTime = Date.now() - aiStartTime

      } catch (error) {
        console.error('AI response generation failed:', error)
        aiResponse = 'Failed to generate AI response. Please review the retrieved documents manually.'
      }
    }

    const totalTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      query,
      ragResult,
      aiResponse: generateResponse ? {
        content: aiResponse,
        generationTime: responseTime,
        modelUsed: 'z-ai-gpt-4'
      } : null,
      metadata: {
        totalProcessingTime: totalTime,
        generateResponse,
        retrievedDocuments: ragResult.results.length,
        averageSimilarity: ragResult.metadata.averageSimilarity,
        knowledgeBaseStats: await ragService.getKnowledgeBaseStats()
      }
    })

  } catch (error) {
    console.error('RAG query error:', error)
    return NextResponse.json(
      { error: 'Failed to perform RAG query', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint for simple RAG queries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const generateResponse = searchParams.get('generate') === 'true'
    const maxResults = parseInt(searchParams.get('limit') || '5')
    const context = searchParams.get('context') || ''

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter (q) is required' },
        { status: 400 }
      )
    }

    const requestBody: RAGQueryRequest = {
      query,
      options: { maxResults },
      generateResponse,
      context
    }

    const mockRequest = {
      json: async () => requestBody
    } as NextRequest

    return await POST(mockRequest)

  } catch (error) {
    console.error('GET RAG query error:', error)
    return NextResponse.json(
      { error: 'Failed to perform RAG query', details: error.message },
      { status: 500 }
    )
  }
}