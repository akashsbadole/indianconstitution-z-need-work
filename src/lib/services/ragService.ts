import { db } from '@/lib/db'

export interface LegalDocument {
  id: string
  title: string
  content: string
  type: 'JUDGMENT' | 'LAW' | 'PRECEDENT' | 'LEGAL_PRINCIPLE' | 'CONSTITUTIONAL_PROVISION'
  category: string
  source?: string
  metadata?: Record<string, any>
  embedding?: number[]
}

export interface SearchResult {
  document: LegalDocument
  similarityScore: number
  relevantExcerpt: string
  relevanceExplanation: string
}

export interface RAGQueryOptions {
  maxResults?: number
  similarityThreshold?: number
  documentTypes?: string[]
  categories?: string[]
  includeExcerpts?: boolean
  useHybridSearch?: boolean
}

export interface RAGResult {
  query: string
  results: SearchResult[]
  augmentedPrompt: string
  metadata: {
    totalDocumentsSearched: number
    retrievalTime: number
    averageSimilarity: number
    searchStrategy: 'VECTOR' | 'HYBRID' | 'KEYWORD'
  }
}

export class RAGService {
  private embeddingDimension: number = 1536 // Standard for text embeddings
  private initialized: boolean = false

  constructor() {
    this.initialized = false
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Check if we need to create any initial embeddings
      const existingDocuments = await db.legalKnowledge.count()
      
      if (existingDocuments === 0) {
        await this.seedInitialKnowledgeBase()
      }

      this.initialized = true
      console.log('RAG service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize RAG service:', error)
      throw new Error('RAG service initialization failed')
    }
  }

  private async seedInitialKnowledgeBase(): Promise<void> {
    const initialDocuments: Omit<LegalDocument, 'id' | 'embedding'>[] = [
      {
        title: 'Article 14 - Right to Equality',
        content: 'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.',
        type: 'CONSTITUTIONAL_PROVISION',
        category: 'Fundamental Rights',
        source: 'Constitution of India',
        metadata: { articleNumber: '14', enforceable: true }
      },
      {
        title: 'Article 21 - Right to Life and Personal Liberty',
        content: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.',
        type: 'CONSTITUTIONAL_PROVISION',
        category: 'Fundamental Rights',
        source: 'Constitution of India',
        metadata: { articleNumber: '21', enforceable: true }
      },
      {
        title: 'Principle of Natural Justice',
        content: 'The principles of natural justice include audi alteram partem (hear the other side) and nemo judex in causa sua (no one should be a judge in their own cause). These principles ensure fair decision-making.',
        type: 'LEGAL_PRINCIPLE',
        category: 'Administrative Law',
        metadata: { keyComponents: ['fair hearing', 'impartial adjudication'] }
      },
      {
        title: 'Res Judicata Principle',
        content: 'Res judicata prevents the same parties from relitigating the same claims once a final judgment has been reached. This promotes judicial efficiency and finality.',
        type: 'LEGAL_PRINCIPLE',
        category: 'Civil Procedure',
        metadata: { latinTerm: 'res judicata', purpose: 'prevents multiplicity of suits' }
      },
      {
        title: 'Doctrine of Precedent',
        content: 'The doctrine of precedent, or stare decisis, ensures that courts follow the rulings of higher courts in the same jurisdiction. This creates consistency and predictability in the legal system.',
        type: 'LEGAL_PRINCIPLE',
        category: 'Jurisprudence',
        metadata: { latinTerm: 'stare decisis', appliesTo: 'hierarchical court system' }
      }
    ]

    for (const doc of initialDocuments) {
      const embedding = await this.generateEmbedding(doc.content)
      
      await db.legalKnowledge.create({
        data: {
          title: doc.title,
          content: doc.content,
          type: doc.type,
          category: doc.category,
          source: doc.source,
          embedding: JSON.stringify(embedding),
          tags: JSON.stringify([doc.category, doc.type])
        }
      })
    }

    console.log(`Seeded ${initialDocuments.length} initial documents to knowledge base`)
  }

  async addDocument(document: Omit<LegalDocument, 'id' | 'embedding'>): Promise<string> {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      const embedding = await this.generateEmbedding(document.content)

      const newDocument = await db.legalKnowledge.create({
        data: {
          title: document.title,
          content: document.content,
          type: document.type,
          category: document.category,
          source: document.source,
          embedding: JSON.stringify(embedding),
          tags: JSON.stringify([document.category, document.type])
        }
      })

      return newDocument.id
    } catch (error) {
      console.error('Failed to add document to knowledge base:', error)
      throw new Error('Failed to add document to knowledge base')
    }
  }

  async query(query: string, options: RAGQueryOptions = {}): Promise<RAGResult> {
    if (!this.initialized) {
      await this.initialize()
    }

    const startTime = Date.now()
    const defaultOptions: RAGQueryOptions = {
      maxResults: 5,
      similarityThreshold: 0.7,
      includeExcerpts: true,
      useHybridSearch: true,
      ...options
    }

    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query)

      // Retrieve relevant documents
      const searchResults = await this.retrieveDocuments(queryEmbedding, query, defaultOptions)

      // Generate augmented prompt
      const augmentedPrompt = await this.generateAugmentedPrompt(query, searchResults, defaultOptions)

      const retrievalTime = Date.now() - startTime
      const averageSimilarity = searchResults.length > 0 ? 
        searchResults.reduce((sum, result) => sum + result.similarityScore, 0) / searchResults.length : 0

      return {
        query,
        results: searchResults,
        augmentedPrompt,
        metadata: {
          totalDocumentsSearched: await db.legalKnowledge.count(),
          retrievalTime,
          averageSimilarity: Math.round(averageSimilarity * 100) / 100,
          searchStrategy: defaultOptions.useHybridSearch ? 'HYBRID' : 'VECTOR'
        }
      }
    } catch (error) {
      console.error('RAG query failed:', error)
      throw new Error('Failed to perform RAG query')
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // In a real implementation, this would use a proper embedding model
    // For now, we'll simulate embeddings using a simple hash-based approach
    // This is a placeholder - in production, use OpenAI embeddings, Sentence Transformers, etc.
    
    const words = text.toLowerCase().split(/\s+/)
    const embedding: number[] = []
    
    // Create a simple hash-based embedding
    for (let i = 0; i < this.embeddingDimension; i++) {
      const wordIndex = i % words.length
      const hash = this.simpleHash(words[wordIndex] + i.toString())
      embedding.push((hash % 10000) / 10000) // Normalize to 0-1
    }

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / magnitude)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private async retrieveDocuments(
    queryEmbedding: number[], 
    query: string, 
    options: RAGQueryOptions
  ): Promise<SearchResult[]> {
    const allDocuments = await db.legalKnowledge.findMany({
      where: {
        ...(options.documentTypes && options.documentTypes.length > 0 ? {
          type: { in: options.documentTypes }
        } : {}),
        ...(options.categories && options.categories.length > 0 ? {
          category: { in: options.categories }
        } : {})
      }
    })

    const results: SearchResult[] = []

    for (const doc of allDocuments) {
      if (!doc.embedding) continue

      try {
        const docEmbedding = JSON.parse(doc.embedding) as number[]
        const similarityScore = this.calculateCosineSimilarity(queryEmbedding, docEmbedding)

        if (similarityScore >= (options.similarityThreshold || 0.7)) {
          // Find relevant excerpt
          const relevantExcerpt = options.includeExcerpts ? 
            this.findRelevantExcerpt(query, doc.content) : ''

          // Generate relevance explanation
          const relevanceExplanation = this.generateRelevanceExplanation(
            query, 
            doc.content, 
            similarityScore
          )

          results.push({
            document: {
              id: doc.id,
              title: doc.title,
              content: doc.content,
              type: doc.type as any,
              category: doc.category,
              source: doc.source || undefined,
              embedding: docEmbedding
            },
            similarityScore: Math.round(similarityScore * 100) / 100,
            relevantExcerpt,
            relevanceExplanation
          })
        }
      } catch (error) {
        console.error('Error processing document:', doc.id, error)
      }
    }

    // Sort by similarity score and limit results
    results.sort((a, b) => b.similarityScore - a.similarityScore)
    return results.slice(0, options.maxResults)
  }

  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0

    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      magnitudeA += vecA[i] * vecA[i]
      magnitudeB += vecB[i] * vecB[i]
    }

    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)

    if (magnitudeA === 0 || magnitudeB === 0) return 0

    return dotProduct / (magnitudeA * magnitudeB)
  }

  private findRelevantExcerpt(query: string, content: string): string {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)

    let bestExcerpt = ''
    let bestScore = 0

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase()
      let score = 0

      for (const word of queryWords) {
        if (sentenceLower.includes(word)) {
          score += 1
        }
      }

      if (score > bestScore) {
        bestScore = score
        bestExcerpt = sentence.trim()
      }
    }

    return bestExcerpt || content.substring(0, 200) + '...'
  }

  private generateRelevanceExplanation(query: string, content: string, similarityScore: number): string {
    const queryWords = query.toLowerCase().split(/\s+/)
    const contentLower = content.toLowerCase()
    
    const matchingTerms = queryWords.filter(word => 
      word.length > 3 && contentLower.includes(word)
    )

    if (matchingTerms.length === 0) {
      return 'Document retrieved based on semantic similarity to query.'
    }

    const relevanceLevel = similarityScore > 0.9 ? 'Very High' :
                          similarityScore > 0.8 ? 'High' :
                          similarityScore > 0.7 ? 'Moderate' : 'Low'

    return `${relevanceLevel} relevance based on matching terms: ${matchingTerms.join(', ')}. Semantic similarity score: ${Math.round(similarityScore * 100)}%.`
  }

  private async generateAugmentedPrompt(
    query: string, 
    results: SearchResult[], 
    options: RAGQueryOptions
  ): Promise<string> {
    let augmentedPrompt = `Query: ${query}\n\nRelevant Legal Knowledge:\n\n`

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      augmentedPrompt += `[Document ${i + 1}]\n`
      augmentedPrompt += `Title: ${result.document.title}\n`
      augmentedPrompt += `Type: ${result.document.type}\n`
      augmentedPrompt += `Category: ${result.document.category}\n`
      
      if (result.relevantExcerpt) {
        augmentedPrompt += `Relevant Excerpt: ${result.relevantExcerpt}\n`
      } else {
        augmentedPrompt += `Content: ${result.document.content.substring(0, 300)}...\n`
      }
      
      augmentedPrompt += `Similarity Score: ${result.similarityScore}\n`
      augmentedPrompt += `Relevance: ${result.relevanceExplanation}\n\n`
    }

    augmentedPrompt += `\nInstructions:\n`
    augmentedPrompt += `1. Use the provided legal knowledge to answer the query accurately\n`
    augmentedPrompt += `2. Cite specific documents when referencing legal principles\n`
    augmentedPrompt += `3. Consider the similarity scores when weighing information\n`
    augmentedPrompt += `4. Provide a comprehensive and well-reasoned response\n`

    return augmentedPrompt
  }

  async searchByKeyword(keyword: string, limit: number = 10): Promise<SearchResult[]> {
    if (!this.initialized) {
      await this.initialize()
    }

    const documents = await db.legalKnowledge.findMany({
      where: {
        OR: [
          {
            title: {
              contains: keyword,
              mode: 'insensitive'
            }
          },
          {
            content: {
              contains: keyword,
              mode: 'insensitive'
            }
          },
          {
            category: {
              contains: keyword,
              mode: 'insensitive'
            }
          }
        ]
      },
      take: limit
    })

    return documents.map(doc => ({
      document: {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        type: doc.type as any,
        category: doc.category,
        source: doc.source || undefined,
        embedding: doc.embedding ? JSON.parse(doc.embedding) : undefined
      },
      similarityScore: 1.0, // Perfect match for keyword search
      relevantExcerpt: this.findRelevantExcerpt(keyword, doc.content),
      relevanceExplanation: `Exact keyword match for "${keyword}"`
    }))
  }

  async getKnowledgeBaseStats(): Promise<{
    totalDocuments: number
    documentsByType: Record<string, number>
    documentsByCategory: Record<string, number>
    averageDocumentLength: number
  }> {
    const documents = await db.legalKnowledge.findMany()

    const documentsByType: Record<string, number> = {}
    const documentsByCategory: Record<string, number> = {}
    let totalLength = 0

    documents.forEach(doc => {
      documentsByType[doc.type] = (documentsByType[doc.type] || 0) + 1
      documentsByCategory[doc.category] = (documentsByCategory[doc.category] || 0) + 1
      totalLength += doc.content.length
    })

    return {
      totalDocuments: documents.length,
      documentsByType,
      documentsByCategory,
      averageDocumentLength: documents.length > 0 ? Math.round(totalLength / documents.length) : 0
    }
  }
}

// Singleton instance
export const ragService = new RAGService()