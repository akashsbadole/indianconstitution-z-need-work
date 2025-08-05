import { NextRequest, NextResponse } from 'next/server'
import { constitutionService } from '@/lib/services/constitutionService'

interface ConstitutionSearchRequest {
  query: string
  category?: string
  articleNumber?: string
  limit?: number
  searchType?: 'EXACT' | 'SEMANTIC' | 'KEYWORD'
  page?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: ConstitutionSearchRequest = await request.json()
    const { 
      query, 
      category, 
      articleNumber, 
      limit = 10, 
      searchType = 'SEMANTIC',
      page = 1
    } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    
    // Perform the search
    const results = await constitutionService.searchConstitution(query, {
      category,
      articleNumber,
      limit: limit * page, // Get more results for pagination
      searchType
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedResults = results.slice(startIndex, startIndex + limit)

    // Get search statistics
    const stats = await constitutionService.getConstitutionStats()

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      results: paginatedResults,
      searchMetadata: {
        query,
        category,
        articleNumber,
        searchType,
        totalResults: results.length,
        page,
        limit,
        hasMore: results.length > startIndex + limit,
        processingTime
      },
      stats: {
        totalArticles: stats.totalArticles,
        categories: stats.categories
      }
    })

  } catch (error) {
    console.error('Constitution search error:', error)
    return NextResponse.json(
      { error: 'Failed to search Constitution', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint for simple Constitution searches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const articleNumber = searchParams.get('article')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter (q) is required' },
        { status: 400 }
      )
    }

    const requestBody: ConstitutionSearchRequest = {
      query,
      category: category || undefined,
      articleNumber: articleNumber || undefined,
      limit,
      page
    }

    const mockRequest = {
      json: async () => requestBody
    } as NextRequest

    return await POST(mockRequest)

  } catch (error) {
    console.error('GET Constitution search error:', error)
    return NextResponse.json(
      { error: 'Failed to search Constitution', details: error.message },
      { status: 500 }
    )
  }
}