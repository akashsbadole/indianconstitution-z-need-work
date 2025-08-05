import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

interface PrecedentSearchRequest {
  query: string
  caseType?: string
  jurisdiction?: string
  dateRange?: {
    start?: string
    end?: string
  }
  limit?: number
  searchType?: 'SIMILARITY' | 'KEYWORD' | 'SEMANTIC'
}

export async function POST(request: NextRequest) {
  try {
    const body: PrecedentSearchRequest = await request.json()
    const { 
      query, 
      caseType, 
      jurisdiction, 
      dateRange, 
      limit = 10, 
      searchType = 'SEMANTIC' 
    } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    
    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // First, try to find precedents in the database
    const dbPrecedents = await db.precedent.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query
            }
          },
          {
            summary: {
              contains: query
            }
          },
          ...(caseType ? [{
            caseType: {
              equals: caseType
            }
          }] : [])
        ]
      },
      take: limit
    })

    let aiPrecedents: any[] = []
    
    // Skip AI search for now to avoid timeout issues
    // TODO: Re-enable AI search when ZAI service is stable
    if (false && (searchType === 'SEMANTIC' || dbPrecedents.length < 3)) {
      try {
        const systemPrompt = `You are an expert legal research assistant specializing in Indian case law. Your task is to search for and identify relevant legal precedents based on the provided query.

For each relevant precedent you identify, provide:
- Case name and citation
- Court and date
- Key legal principles established
- Brief summary of the case
- Relevance score (0.0 to 1.0) based on similarity to the query
- How the precedent applies to the current situation

Provide your response in the following JSON format:
{
  "searchResults": [
    {
      "caseName": "Case name",
      "citation": "AIR 2020 SC 1234",
      "court": "Supreme Court of India",
      "date": "2020-03-15",
      "keyPrinciples": ["principle1", "principle2"],
      "summary": "Brief case summary",
      "relevanceScore": 0.85,
      "application": "How this precedent applies",
      "isBinding": true
    }
  ],
  "searchSummary": "Summary of search approach and key findings",
  "totalFound": 5,
  "confidenceScore": 0.8
}`

        const userPrompt = `Please search for relevant legal precedents based on the following query:

Search Query: "${query}"
Case Type: ${caseType || 'Any'}
Jurisdiction: ${jurisdiction || 'Any Indian Court'}
Date Range: ${dateRange ? `${dateRange.start} to ${dateRange.end}` : 'Any date'}
Search Type: ${searchType}

Please find the most relevant precedents and provide detailed information about each one, including relevance scores and application to the query.`

        // Make the AI API call with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
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
          max_tokens: 2000
        })
        
        clearTimeout(timeoutId)

        const responseContent = completion.choices[0]?.message?.content

        if (responseContent) {
          try {
            const aiResult = JSON.parse(responseContent)
            aiPrecedents = aiResult.searchResults || []
          } catch (parseError) {
            console.error('Failed to parse AI precedent search results:', parseError)
          }
        }
      } catch (aiError) {
        console.error('AI service error, proceeding with database results only:', aiError)
        // Continue with database results only
      }
    }

    // Combine and deduplicate results
    const allPrecedents = [
      ...dbPrecedents.map(p => ({
        caseName: p.title,
        citation: p.citation,
        court: p.court,
        date: p.date.toISOString().split('T')[0],
        keyPrinciples: p.keyPoints ? JSON.parse(p.keyPoints) : [],
        summary: p.summary,
        relevanceScore: 0.7, // Default score for DB results
        application: 'Database match',
        isBinding: p.isBinding,
        source: 'database'
      })),
      ...aiPrecedents.map(p => ({
        ...p,
        source: 'ai_generated'
      }))
    ]

    // Remove duplicates based on citation
    const uniquePrecedents = allPrecedents.filter((precedent, index, self) =>
      index === self.findIndex(p => p.citation === precedent.citation)
    )

    // Sort by relevance score
    uniquePrecedents.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Limit results
    const finalResults = uniquePrecedents.slice(0, limit)

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      precedents: finalResults,
      searchMetadata: {
        query,
        caseType,
        jurisdiction,
        dateRange,
        searchType,
        databaseResults: dbPrecedents.length,
        aiResults: aiPrecedents.length,
        totalResults: finalResults.length,
        processingTime
      },
      modelUsed: 'z-ai-gpt-4'
    })

  } catch (error) {
    console.error('Precedent search error:', error)
    return NextResponse.json(
      { error: 'Failed to search precedents', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint for simple precedent searches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const caseType = searchParams.get('caseType')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter (q) is required' },
        { status: 400 }
      )
    }

    const requestBody: PrecedentSearchRequest = {
      query,
      caseType: caseType || undefined,
      limit
    }

    const mockRequest = {
      json: async () => requestBody
    } as NextRequest

    return await POST(mockRequest)

  } catch (error) {
    console.error('GET precedent search error:', error)
    return NextResponse.json(
      { error: 'Failed to search precedents', details: error.message },
      { status: 500 }
    )
  }
}