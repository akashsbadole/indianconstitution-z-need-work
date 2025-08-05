import ZAI from 'z-ai-web-dev-sdk'

export interface LegalAnalysisOptions {
  includePrecedentSearch?: boolean
  includeBiasDetection?: boolean
  includeLegalReasoning?: boolean
  includeRiskAssessment?: boolean
  maxPrecedents?: number
  jurisdiction?: string
  temperature?: number
}

export interface CaseData {
  title: string
  description: string
  facts: string
  legalIssues: string
  caseType: string
  priority: string
}

export interface AnalysisResult {
  caseSummary?: {
    keyIssues: string[]
    caseStrength: number
    complexity: 'LOW' | 'MEDIUM' | 'HIGH'
    estimatedDuration: string
  }
  precedentAnalysis?: {
    totalPrecedents: number
    bindingPrecedents: number
    persuasivePrecedents: number
    topPrecedents: Array<{
      caseName: string
      citation: string
      relevance: number
      keyPrinciple: string
      application: string
    }>
  }
  biasAnalysis?: {
    overallBiasScore: number
    neutralityScore: number
    detectedBiases: Array<{
      type: string
      severity: number
      context: string
      suggestion: string
    }>
  }
  legalReasoning?: {
    issueAnalysis: Array<{
      issue: string
      applicableLaws: string[]
      strength: 'WEAK' | 'MODERATE' | 'STRONG'
    }>
    outcomePrediction: {
      likelyOutcome: string
      confidence: number
      keyFactors: string[]
    }
  }
  riskAssessment?: {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH'
    successProbability: number
    riskFactors: Array<{
      factor: string
      impact: 'LOW' | 'MEDIUM' | 'HIGH'
      likelihood: 'LOW' | 'MEDIUM' | 'HIGH'
      mitigation: string
    }>
  }
  metadata: {
    processingTime: number
    modelUsed: string
    confidenceScore: number
  }
}

export class LegalAnalysisService {
  private zai: any

  constructor() {
    this.zai = null
  }

  async initialize(): Promise<void> {
    try {
      this.zai = await ZAI.create()
    } catch (error) {
      console.error('Failed to initialize ZAI:', error)
      throw new Error('Failed to initialize AI service')
    }
  }

  async analyzeCase(caseData: CaseData, options: LegalAnalysisOptions = {}): Promise<AnalysisResult> {
    if (!this.zai) {
      await this.initialize()
    }

    const startTime = Date.now()
    const analysisResult: Partial<AnalysisResult> = {
      metadata: {
        processingTime: 0,
        modelUsed: 'z-ai-gpt-4',
        confidenceScore: 0
      }
    }

    const defaultOptions: LegalAnalysisOptions = {
      includePrecedentSearch: true,
      includeBiasDetection: true,
      includeLegalReasoning: true,
      includeRiskAssessment: false,
      maxPrecedents: 8,
      jurisdiction: 'India',
      temperature: 0.3,
      ...options
    }

    try {
      // Execute analyses in parallel for better performance
      const analyses = await Promise.allSettled([
        defaultOptions.includePrecedentSearch ? this.performPrecedentAnalysis(caseData, defaultOptions) : Promise.resolve(null),
        defaultOptions.includeBiasDetection ? this.performBiasAnalysis(caseData) : Promise.resolve(null),
        defaultOptions.includeLegalReasoning ? this.performLegalReasoning(caseData) : Promise.resolve(null),
        defaultOptions.includeRiskAssessment ? this.performRiskAssessment(caseData) : Promise.resolve(null),
        this.performCaseSummary(caseData)
      ])

      // Process results
      const [precedentResult, biasResult, reasoningResult, riskResult, summaryResult] = analyses

      if (summaryResult.status === 'fulfilled' && summaryResult.value) {
        analysisResult.caseSummary = summaryResult.value
      }

      if (precedentResult.status === 'fulfilled' && precedentResult.value) {
        analysisResult.precedentAnalysis = precedentResult.value
      }

      if (biasResult.status === 'fulfilled' && biasResult.value) {
        analysisResult.biasAnalysis = biasResult.value
      }

      if (reasoningResult.status === 'fulfilled' && reasoningResult.value) {
        analysisResult.legalReasoning = reasoningResult.value
      }

      if (riskResult.status === 'fulfilled' && riskResult.value) {
        analysisResult.riskAssessment = riskResult.value
      }

      // Calculate overall confidence score
      analysisResult.metadata.confidenceScore = this.calculateConfidenceScore(analysisResult)
      analysisResult.metadata.processingTime = Date.now() - startTime

      return analysisResult as AnalysisResult

    } catch (error) {
      console.error('Error during case analysis:', error)
      throw new Error('Failed to complete case analysis')
    }
  }

  private async performCaseSummary(caseData: CaseData) {
    const prompt = `Analyze this legal case and provide a concise summary:

Title: ${caseData.title}
Type: ${caseData.caseType}
Facts: ${caseData.facts}
Issues: ${caseData.legalIssues}

Respond in JSON format:
{
  "keyIssues": ["issue1", "issue2"],
  "caseStrength": 0.7,
  "complexity": "MEDIUM",
  "estimatedDuration": "6-12 months"
}`

    const response = await this.zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert legal analyst providing concise case assessments.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 400
    })

    return this.parseJSONResponse(response.choices[0]?.message?.content)
  }

  private async performPrecedentAnalysis(caseData: CaseData, options: LegalAnalysisOptions) {
    const prompt = `Find relevant legal precedents for this case:

Title: ${caseData.title}
Type: ${caseData.caseType}
Issues: ${caseData.legalIssues}
Facts: ${caseData.facts}
Jurisdiction: ${options.jurisdiction}
Max Precedents: ${options.maxPrecedents}

Respond in JSON format:
{
  "totalPrecedents": 8,
  "bindingPrecedents": 3,
  "persuasivePrecedents": 5,
  "topPrecedents": [
    {
      "caseName": "Case Name",
      "citation": "Citation",
      "relevance": 0.9,
      "keyPrinciple": "Key legal principle",
      "application": "How it applies to this case"
    }
  ]
}`

    const response = await this.zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert legal researcher specializing in precedent analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })

    return this.parseJSONResponse(response.choices[0]?.message?.content)
  }

  private async performBiasAnalysis(caseData: CaseData) {
    const prompt = `Analyze this case text for potential biases:

Facts: ${caseData.facts}
Issues: ${caseData.legalIssues}

Respond in JSON format:
{
  "overallBiasScore": 0.15,
  "neutralityScore": 0.85,
  "detectedBiases": [
    {
      "type": "GENDER",
      "severity": 0.3,
      "context": "Context where bias was detected",
      "suggestion": "Neutral alternative"
    }
  ]
}`

    const response = await this.zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI specialized in detecting bias in legal documents.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 600
    })

    return this.parseJSONResponse(response.choices[0]?.message?.content)
  }

  private async performLegalReasoning(caseData: CaseData) {
    const prompt = `Provide legal reasoning for this case:

Title: ${caseData.title}
Type: ${caseData.caseType}
Facts: ${caseData.facts}
Issues: ${caseData.legalIssues}

Respond in JSON format:
{
  "issueAnalysis": [
    {
      "issue": "Legal issue description",
      "applicableLaws": ["Law1", "Law2"],
      "strength": "STRONG"
    }
  ],
  "outcomePrediction": {
    "likelyOutcome": "Description of likely outcome",
    "confidence": 0.8,
    "keyFactors": ["Factor1", "Factor2"]
  }
}`

    const response = await this.zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert legal reasoning AI providing structured analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })

    return this.parseJSONResponse(response.choices[0]?.message?.content)
  }

  private async performRiskAssessment(caseData: CaseData) {
    const prompt = `Conduct risk assessment for this legal case:

Title: ${caseData.title}
Type: ${caseData.caseType}
Facts: ${caseData.facts}
Issues: ${caseData.legalIssues}

Respond in JSON format:
{
  "overallRisk": "MEDIUM",
  "successProbability": 0.65,
  "riskFactors": [
    {
      "factor": "Risk factor description",
      "impact": "MEDIUM",
      "likelihood": "HIGH",
      "mitigation": "Mitigation strategy"
    }
  ]
}`

    const response = await this.zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a legal risk assessment expert.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 600
    })

    return this.parseJSONResponse(response.choices[0]?.message?.content)
  }

  private parseJSONResponse(content: string | undefined): any {
    if (!content) return null
    
    try {
      return JSON.parse(content)
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      return null
    }
  }

  private calculateConfidenceScore(result: Partial<AnalysisResult>): number {
    const scores = [
      result.caseSummary?.caseStrength || 0.5,
      result.precedentAnalysis ? 0.8 : 0.5,
      result.biasAnalysis ? (1 - (result.biasAnalysis.overallBiasScore || 0)) : 0.7,
      result.legalReasoning?.outcomePrediction?.confidence || 0.6,
      result.riskAssessment ? (result.riskAssessment.successProbability || 0.6) : 0.5
    ].filter(score => score !== null)

    if (scores.length === 0) return 0.5
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    return Math.round(average * 100) / 100
  }

  async searchPrecedents(query: string, options: {
    caseType?: string
    jurisdiction?: string
    limit?: number
  } = {}): Promise<any[]> {
    if (!this.zai) {
      await this.initialize()
    }

    const prompt = `Search for legal precedents matching this query:

Query: ${query}
Case Type: ${options.caseType || 'Any'}
Jurisdiction: ${options.jurisdiction || 'India'}
Limit: ${options.limit || 10}

Respond in JSON format with an array of precedents:
[
  {
    "caseName": "Case Name",
    "citation": "Citation",
    "court": "Court Name",
    "date": "2020-01-01",
    "keyPrinciples": ["principle1", "principle2"],
    "summary": "Case summary",
    "relevanceScore": 0.85,
    "isBinding": true
  }
]`

    const response = await this.zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert legal researcher providing precise precedent search results.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    })

    return this.parseJSONResponse(response.choices[0]?.message?.content) || []
  }

  async detectBias(text: string, context: string = ''): Promise<any> {
    if (!this.zai) {
      await this.initialize()
    }

    const prompt = `Detect bias in this legal text:

Text: "${text}"
Context: ${context}

Respond in JSON format:
{
  "overallBiasScore": 0.15,
  "neutralityScore": 0.85,
  "detectedBiases": [
    {
      "type": "GENDER",
      "severity": 0.3,
      "context": "Context where bias was detected",
      "suggestion": "Neutral alternative"
    }
  ]
}`

    const response = await this.zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI specialized in detecting bias in legal documents.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 600
    })

    return this.parseJSONResponse(response.choices[0]?.message?.content)
  }
}

// Singleton instance
export const legalAnalysisService = new LegalAnalysisService()