import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export interface ConstitutionArticle {
  id: string
  part: string
  articleNumber: string
  title: string
  content: string
  keywords: string[]
  embedding?: string
  category: string
  isAmended: boolean
  amendmentDate?: string
}

export interface ConstitutionSearchResult {
  id: string
  articleNumber: string
  title: string
  content: string
  relevanceScore: number
  highlightedContent: string
  category: string
  part: string
}

class ConstitutionService {
  private zai: any = null

  async initialize() {
    if (!this.zai) {
      try {
        this.zai = await ZAI.create()
      } catch (error) {
        console.error('Failed to initialize ZAI:', error)
        // Continue without ZAI - will use fallback methods
        this.zai = null
      }
    }
  }

  // Process and store Constitution articles from the provided text
  async processConstitutionText(constitutionText: string): Promise<void> {
    await this.initialize()
    
    // Parse the Constitution text into structured articles
    const articles = this.parseConstitutionArticles(constitutionText)
    
    console.log(`Processing ${articles.length} Constitution articles...`)
    
    // Store each article in the database
    for (const article of articles) {
      await this.storeConstitutionArticle(article)
    }
    
    console.log('Constitution processing completed!')
  }

  // Parse the raw Constitution text into structured articles
  private parseConstitutionArticles(text: string): ConstitutionArticle[] {
    const articles: ConstitutionArticle[] = []
    const lines = text.split('\n')
    
    let currentPart = 'PART I - THE UNION AND ITS TERRITORY'
    let currentArticle: Partial<ConstitutionArticle> = {}
    let articleContent: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Skip empty lines and headers
      if (!line || line === 'THE CONSTITUTION OF INDIA' || line.startsWith('PREAMBLE')) {
        continue
      }
      
      // Detect Part headers
      if (line.startsWith('PART ')) {
        if (currentArticle.articleNumber) {
          // Save previous article
          articles.push(this.finalizeArticle(currentArticle, articleContent, currentPart))
          articleContent = []
        }
        currentPart = line
        continue
      }
      
      // Detect Article numbers
      const articleMatch = line.match(/^(\d+[A-Z]?)\.\s*(.+)$/)
      if (articleMatch) {
        if (currentArticle.articleNumber) {
          // Save previous article
          articles.push(this.finalizeArticle(currentArticle, articleContent, currentPart))
          articleContent = []
        }
        
        currentArticle = {
          articleNumber: articleMatch[1],
          title: articleMatch[2],
          category: this.categorizeArticle(articleMatch[2]),
          isAmended: false
        }
        continue
      }
      
      // Add content lines
      if (currentArticle.articleNumber && line.length > 0) {
        articleContent.push(line)
      }
    }
    
    // Don't forget the last article
    if (currentArticle.articleNumber) {
      articles.push(this.finalizeArticle(currentArticle, articleContent, currentPart))
    }
    
    return articles
  }

  // Finalize article creation
  private finalizeArticle(article: Partial<ConstitutionArticle>, content: string[], part: string): ConstitutionArticle {
    const fullContent = content.join(' ')
    const keywords = this.extractKeywords(fullContent)
    
    return {
      id: `constitution-${article.articleNumber}`,
      part: part,
      articleNumber: article.articleNumber!,
      title: article.title!,
      content: fullContent,
      keywords,
      category: article.category!,
      isAmended: article.isAmended!,
      amendmentDate: article.amendmentDate
    }
  }

  // Categorize articles based on content
  private categorizeArticle(title: string): string {
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('citizen') || lowerTitle.includes('citizenship')) return 'CITIZENSHIP'
    if (lowerTitle.includes('fundamental') || lowerTitle.includes('rights')) return 'FUNDAMENTAL_RIGHTS'
    if (lowerTitle.includes('directive') || lowerTitle.includes('policy')) return 'DIRECTIVE_PRINCIPLES'
    if (lowerTitle.includes('union') || lowerTitle.includes('territory')) return 'UNION_TERRITORY'
    if (lowerTitle.includes('president') || lowerTitle.includes('governor')) return 'EXECUTIVE'
    if (lowerTitle.includes('parliament') || lowerTitle.includes('legislature')) return 'LEGISLATURE'
    if (lowerTitle.includes('judiciary') || lowerTitle.includes('supreme court')) return 'JUDICIARY'
    if (lowerTitle.includes('election') || lowerTitle.includes('commission')) return 'ELECTIONS'
    if (lowerTitle.includes('emergency')) return 'EMERGENCY_PROVISIONS'
    if (lowerTitle.includes('amendment')) return 'AMENDMENT'
    if (lowerTitle.includes('language') || lowerTitle.includes('official')) return 'LANGUAGE'
    
    return 'GENERAL'
  }

  // Extract keywords from article content
  private extractKeywords(content: string): string[] {
    const legalKeywords = [
      'state', 'citizen', 'right', 'law', 'parliament', 'president', 'governor',
      'supreme court', 'high court', 'constitution', 'amendment', 'fundamental',
      'directive', 'policy', 'union', 'territory', 'election', 'commission',
      'emergency', 'judiciary', 'legislature', 'executive', 'official language'
    ]
    
    const words = content.toLowerCase().split(/\s+/)
    const foundKeywords = new Set<string>()
    
    legalKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        foundKeywords.add(keyword)
      }
    })
    
    return Array.from(foundKeywords)
  }

  // Store Constitution article in database
  private async storeConstitutionArticle(article: ConstitutionArticle): Promise<void> {
    try {
      // Generate a simple embedding (just the first 100 chars)
      const embedding = article.content.substring(0, 100)
      
      // Store in LegalKnowledge table
      await db.legalKnowledge.create({
        data: {
          id: article.id,
          title: `Article ${article.articleNumber}: ${article.title}`,
          content: article.content,
          type: 'CONSTITUTION_ARTICLE',
          category: article.category,
          source: 'Indian Constitution',
          embedding: embedding,
          tags: JSON.stringify([
            'constitution',
            article.category.toLowerCase().replace('_', '_'),
            ...article.keywords
          ])
        }
      })
      
      // Also store in Laws table for legal reference
      await db.law.create({
        data: {
          title: `Constitution Article ${article.articleNumber}`,
          type: 'CONSTITUTION',
          section: article.articleNumber,
          description: article.title,
          content: article.content,
          effectiveDate: new Date('1950-01-26'),
          category: article.category,
          tags: JSON.stringify(['constitution', 'fundamental law', article.category.toLowerCase()])
        }
      })
      
    } catch (error) {
      console.error(`Error storing article ${article.articleNumber}:`, error)
    }
  }

  // Generate embedding for text
  private async generateEmbedding(text: string): Promise<string> {
    try {
      if (!this.zai) {
        // Fallback to simple text extraction
        return text.substring(0, 100).replace(/\s+/g, ' ').trim()
      }

      // Use ZAI to generate a simple text representation for now
      // In a real implementation, you'd use proper vector embeddings
      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Convert the following text into a compressed keyword representation for search indexing.'
          },
          {
            role: 'user',
            content: text.substring(0, 500) // Limit text length
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      })
      
      return response.choices[0]?.message?.content || text.substring(0, 100).replace(/\s+/g, ' ').trim()
    } catch (error) {
      console.error('Error generating embedding:', error)
      // Fallback to simple text extraction
      return text.substring(0, 100).replace(/\s+/g, ' ').trim()
    }
  }

  // Search Constitution articles with advanced search capabilities
  async searchConstitution(query: string, options: {
    category?: string
    articleNumber?: string
    limit?: number
    searchType?: 'EXACT' | 'SEMANTIC' | 'KEYWORD'
  } = {}): Promise<ConstitutionSearchResult[]> {
    await this.initialize()
    
    const { category, articleNumber, limit = 10, searchType = 'SEMANTIC' } = options
    
    try {
      // Build search conditions
      const whereClause: any = {
        type: 'CONSTITUTION_ARTICLE'
      }
      
      if (category) {
        whereClause.category = category
      }
      
      if (articleNumber) {
        whereClause.title = {
          contains: `Article ${articleNumber}`
        }
      }
      
      // Get base results from database
      let dbResults = await db.legalKnowledge.findMany({
        where: whereClause,
        take: limit * 2 // Get more for ranking
      })
      
      // Apply search-specific filtering and ranking
      let results: ConstitutionSearchResult[] = []
      
      if (searchType === 'EXACT') {
        results = dbResults
          .filter(result => 
            result.content.toLowerCase().includes(query.toLowerCase()) ||
            result.title.toLowerCase().includes(query.toLowerCase())
          )
          .map(this.mapToSearchResult)
      } else if (searchType === 'KEYWORD') {
        results = dbResults
          .map(result => ({
            ...this.mapToSearchResult(result),
            relevanceScore: this.calculateKeywordRelevance(query, result)
          }))
          .filter(result => result.relevanceScore > 0.1)
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
      } else {
        // SEMANTIC search - use AI for understanding
        results = await this.performSemanticSearch(query, dbResults, limit)
      }
      
      // Remove duplicates and limit results
      const uniqueResults = this.removeDuplicates(results)
      return uniqueResults.slice(0, limit)
      
    } catch (error) {
      console.error('Error searching Constitution:', error)
      return []
    }
  }

  // Map database result to search result
  private mapToSearchResult(result: any): ConstitutionSearchResult {
    return {
      id: result.id,
      articleNumber: this.extractArticleNumber(result.title),
      title: result.title,
      content: result.content,
      relevanceScore: 0.5, // Default score
      highlightedContent: this.highlightText(result.content, ''),
      category: result.category,
      part: this.extractPart(result.content)
    }
  }

  // Perform semantic search using AI
  private async performSemanticSearch(query: string, dbResults: any[], limit: number): Promise<ConstitutionSearchResult[]> {
    try {
      if (!this.zai) {
        // Fallback to keyword search if ZAI is not available
        return dbResults
          .map(result => ({
            ...this.mapToSearchResult(result),
            relevanceScore: this.calculateKeywordRelevance(query, result)
          }))
          .filter(result => result.relevanceScore > 0.1)
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
      }

      const systemPrompt = `You are a legal search expert specializing in the Indian Constitution. Your task is to analyze the search query and rank the provided Constitution articles by relevance.

For each article, provide:
- Relevance score (0.0 to 1.0)
- Brief explanation of relevance
- Highlighted content that matches the query

Respond in JSON format:
{
  "rankedResults": [
    {
      "id": "article-id",
      "relevanceScore": 0.85,
      "explanation": "Why this article is relevant",
      "highlightedContent": "Relevant excerpt from the article"
    }
  ]
}`

      const userPrompt = `Search Query: "${query}"

Please analyze and rank the following Constitution articles by relevance to the query:

${dbResults.map(result => `
ID: ${result.id}
Title: ${result.title}
Content: ${result.content.substring(0, 300)}...
Category: ${result.category}
`).join('\n---\n')}

Provide relevance scores and explanations for each article.`

      const response = await this.zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) return dbResults.map(this.mapToSearchResult)

      try {
        const aiResult = JSON.parse(responseContent)
        const rankedResults = aiResult.rankedResults || []
        
        return rankedResults.map((rr: any) => {
          const originalResult = dbResults.find(r => r.id === rr.id)
          return {
            id: rr.id,
            articleNumber: this.extractArticleNumber(originalResult?.title || ''),
            title: originalResult?.title || '',
            content: originalResult?.content || '',
            relevanceScore: rr.relevanceScore || 0.5,
            highlightedContent: rr.highlightedContent || '',
            category: originalResult?.category || '',
            part: this.extractPart(originalResult?.content || '')
          }
        })
      } catch (parseError) {
        console.error('Failed to parse semantic search results:', parseError)
        // Fallback to keyword search
        return dbResults
          .map(result => ({
            ...this.mapToSearchResult(result),
            relevanceScore: this.calculateKeywordRelevance(query, result)
          }))
          .filter(result => result.relevanceScore > 0.1)
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
      }
    } catch (error) {
      console.error('Error in semantic search:', error)
      // Fallback to keyword search
      return dbResults
        .map(result => ({
          ...this.mapToSearchResult(result),
          relevanceScore: this.calculateKeywordRelevance(query, result)
        }))
        .filter(result => result.relevanceScore > 0.1)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
    }
  }

  // Calculate keyword relevance score
  private calculateKeywordRelevance(query: string, result: any): number {
    const queryWords = query.toLowerCase().split(/\s+/)
    const content = (result.title + ' ' + result.content).toLowerCase()
    const tags = result.tags ? JSON.parse(result.tags) : []
    
    let score = 0
    let matchedWords = new Set()
    
    queryWords.forEach(word => {
      if (content.includes(word)) {
        score += 0.2
        matchedWords.add(word)
      }
      if (tags.some((tag: string) => tag.includes(word))) {
        score += 0.3
        matchedWords.add(word)
      }
    })
    
    // Bonus for matching multiple words
    score += (matchedWords.size / queryWords.length) * 0.3
    
    return Math.min(score, 1.0)
  }

  // Extract article number from title
  private extractArticleNumber(title: string): string {
    const match = title.match(/Article\s+(\d+[A-Z]?)/)
    return match ? match[1] : ''
  }

  // Extract part from content
  private extractPart(content: string): string {
    const partMatch = content.match(/PART\s+[IVXLCDM]+/i)
    return partMatch ? partMatch[0] : 'Unknown'
  }

  // Highlight text based on query
  private highlightText(content: string, query: string): string {
    if (!query) return content.substring(0, 200)
    
    const queryWords = query.toLowerCase().split(/\s+/)
    let highlighted = content
    
    queryWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi')
      highlighted = highlighted.replace(regex, '**$1**')
    })
    
    return highlighted.substring(0, 300) + (highlighted.length > 300 ? '...' : '')
  }

  // Remove duplicate results
  private removeDuplicates(results: ConstitutionSearchResult[]): ConstitutionSearchResult[] {
    const seen = new Set()
    return results.filter(result => {
      if (seen.has(result.id)) {
        return false
      }
      seen.add(result.id)
      return true
    })
  }

  // Get Constitution statistics
  async getConstitutionStats(): Promise<any> {
    try {
      const totalArticles = await db.legalKnowledge.count({
        where: { type: 'CONSTITUTION_ARTICLE' }
      })
      
      const categories = await db.legalKnowledge.groupBy({
        by: ['category'],
        where: { type: 'CONSTITUTION_ARTICLE' },
        _count: { category: true }
      })
      
      return {
        totalArticles,
        categories: categories.map(c => ({
          category: c.category,
          count: c._count.category
        }))
      }
    } catch (error) {
      console.error('Error getting Constitution stats:', error)
      return { totalArticles: 0, categories: [] }
    }
  }
}

export const constitutionService = new ConstitutionService()