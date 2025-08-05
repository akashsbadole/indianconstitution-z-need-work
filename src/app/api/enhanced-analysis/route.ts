import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

interface EnhancedAnalysisRequest {
  caseData: {
    title: string
    description: string
    facts: string
    legalIssues: string
    caseType: string
    priority: string
  }
  options?: {
    includePrecedentSearch: boolean
    includeBiasDetection: boolean
    includeLegalReasoning: boolean
    includeRiskAssessment: boolean
    maxPrecedents?: number
    jurisdiction?: string
  }
}

interface AnalysisResult {
  caseSummary: {
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
    precedentsByCategory: Record<string, number>
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
    recommendations: string[]
  }
  legalReasoning?: {
    issueAnalysis: Array<{
      issue: string
      applicableLaws: string[]
      strength: 'WEAK' | 'MODERATE' | 'STRONG'
    }>
    reasoningChain: Array<{
      step: number
      premise: string
      analysis: string
      conclusion: string
    }>
    outcomePrediction: {
      likelyOutcome: string
      confidence: number
      keyFactors: string[]
    }
  }
  riskAssessment?: {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH'
    riskFactors: Array<{
      factor: string
      impact: 'LOW' | 'MEDIUM' | 'HIGH'
      likelihood: 'LOW' | 'MEDIUM' | 'HIGH'
      mitigation: string
    }>
    successProbability: number
    recommendedActions: string[]
  }
  metadata: {
    processingTime: number
    modelUsed: string
    analysisDepth: 'STANDARD' | 'COMPREHENSIVE'
    confidenceScore: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EnhancedAnalysisRequest = await request.json()
    const { caseData, options = {} } = body

    if (!caseData.title || !caseData.facts) {
      return NextResponse.json(
        { error: 'Case title and facts are required' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    const zai = await ZAI.create()

    // Set default options
    const analysisOptions = {
      includePrecedentSearch: true,
      includeBiasDetection: true,
      includeLegalReasoning: true,
      includeRiskAssessment: true,
      maxPrecedents: 10,
      jurisdiction: 'India',
      ...options
    }

    const analysisResult: Partial<AnalysisResult> = {
      metadata: {
        processingTime: 0,
        modelUsed: 'z-ai-gpt-4',
        analysisDepth: 'COMPREHENSIVE',
        confidenceScore: 0
      }
    }

    // Step 1: Case Summary and Initial Analysis
    const caseSummaryPrompt = `You are an expert legal analyst. Analyze the following case and provide a comprehensive summary:

Case Title: ${caseData.title}
Case Type: ${caseData.caseType}
Facts: ${caseData.facts}
Legal Issues: ${caseData.legalIssues}
Description: ${caseData.description}

Provide your analysis in JSON format:
{
  "keyIssues": ["issue1", "issue2"],
  "caseStrength": 0.7,
  "complexity": "MEDIUM",
  "estimatedDuration": "6-12 months"
}`

    const caseSummaryResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert legal analyst providing concise case assessments.'
        },
        {
          role: 'user',
          content: caseSummaryPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })

    const caseSummaryContent = caseSummaryResponse.choices[0]?.message?.content
    if (caseSummaryContent) {
      try {
        analysisResult.caseSummary = JSON.parse(caseSummaryContent)
      } catch (e) {
        console.error('Failed to parse case summary:', e)
      }
    }

    // Step 2: Precedent Analysis (if enabled)
    if (analysisOptions.includePrecedentSearch) {
      const precedentPrompt = `You are a legal research expert. Search for and analyze relevant precedents for this case:

Case Details:
- Title: ${caseData.title}
- Type: ${caseData.caseType}
- Issues: ${caseData.legalIssues}
- Facts: ${caseData.facts}

Find the most relevant precedents and provide analysis in JSON format:
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
  ],
  "precedentsByCategory": {
    "Constitutional": 2,
    "Statutory": 4,
    "Case Law": 2
  }
}`

      const precedentResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert legal researcher specializing in precedent analysis.'
          },
          {
            role: 'user',
            content: precedentPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const precedentContent = precedentResponse.choices[0]?.message?.content
      if (precedentContent) {
        try {
          analysisResult.precedentAnalysis = JSON.parse(precedentContent)
        } catch (e) {
          console.error('Failed to parse precedent analysis:', e)
        }
      }
    }

    // Step 3: Bias Detection (if enabled)
    if (analysisOptions.includeBiasDetection) {
      const biasPrompt = `Analyze the following case text for potential biases:

Case Facts: ${caseData.facts}
Legal Issues: ${caseData.legalIssues}

Provide bias analysis in JSON format:
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
  ],
  "recommendations": ["Use neutral language", "Focus on facts"]
}`

      const biasResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an AI specialized in detecting bias in legal documents.'
          },
          {
            role: 'user',
            content: biasPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      })

      const biasContent = biasResponse.choices[0]?.message?.content
      if (biasContent) {
        try {
          analysisResult.biasAnalysis = JSON.parse(biasContent)
        } catch (e) {
          console.error('Failed to parse bias analysis:', e)
        }
      }
    }

    // Step 4: Legal Reasoning (if enabled)
    if (analysisOptions.includeLegalReasoning) {
      const reasoningPrompt = `Provide comprehensive legal reasoning for this case:

Case: ${caseData.title}
Type: ${caseData.caseType}
Facts: ${caseData.facts}
Issues: ${caseData.legalIssues}

Provide legal reasoning in JSON format:
{
  "issueAnalysis": [
    {
      "issue": "Legal issue description",
      "applicableLaws": ["Law1", "Law2"],
      "strength": "STRONG"
    }
  ],
  "reasoningChain": [
    {
      "step": 1,
      "premise": "Legal premise",
      "analysis": "Analysis",
      "conclusion": "Step conclusion"
    }
  ],
  "outcomePrediction": {
    "likelyOutcome": "Description of likely outcome",
    "confidence": 0.8,
    "keyFactors": ["Factor1", "Factor2"]
  }
}`

      const reasoningResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert legal reasoning AI providing structured analysis.'
          },
          {
            role: 'user',
            content: reasoningPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })

      const reasoningContent = reasoningResponse.choices[0]?.message?.content
      if (reasoningContent) {
        try {
          analysisResult.legalReasoning = JSON.parse(reasoningContent)
        } catch (e) {
          console.error('Failed to parse legal reasoning:', e)
        }
      }
    }

    // Step 5: Risk Assessment (if enabled)
    if (analysisOptions.includeRiskAssessment) {
      const riskPrompt = `Conduct a comprehensive risk assessment for this legal case:

Case: ${caseData.title}
Type: ${caseData.caseType}
Facts: ${caseData.facts}
Issues: ${caseData.legalIssues}

Provide risk assessment in JSON format:
{
  "overallRisk": "MEDIUM",
  "riskFactors": [
    {
      "factor": "Risk factor description",
      "impact": "MEDIUM",
      "likelihood": "HIGH",
      "mitigation": "Mitigation strategy"
    }
  ],
  "successProbability": 0.65,
  "recommendedActions": ["Action1", "Action2"]
}`

      const riskResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a legal risk assessment expert providing detailed risk analysis.'
          },
          {
            role: 'user',
            content: riskPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })

      const riskContent = riskResponse.choices[0]?.message?.content
      if (riskContent) {
        try {
          analysisResult.riskAssessment = JSON.parse(riskContent)
        } catch (e) {
          console.error('Failed to parse risk assessment:', e)
        }
      }
    }

    // Calculate overall confidence score
    const confidenceComponents = [
      analysisResult.caseSummary?.caseStrength || 0.5,
      analysisResult.precedentAnalysis ? 0.8 : 0.5,
      analysisResult.biasAnalysis ? (1 - (analysisResult.biasAnalysis.overallBiasScore || 0)) : 0.7,
      analysisResult.legalReasoning?.outcomePrediction?.confidence || 0.6,
      analysisResult.riskAssessment ? (analysisResult.riskAssessment.successProbability || 0.6) : 0.5
    ]
    
    const overallConfidence = confidenceComponents.reduce((sum, score) => sum + score, 0) / confidenceComponents.length

    // Update metadata
    analysisResult.metadata = {
      processingTime: Date.now() - startTime,
      modelUsed: 'z-ai-gpt-4',
      analysisDepth: 'COMPREHENSIVE',
      confidenceScore: Math.round(overallConfidence * 100) / 100
    }

    // Store in database
    try {
      const newCase = await db.legalCase.create({
        data: {
          caseNumber: `CASE-${Date.now()}`,
          title: caseData.title,
          description: caseData.description,
          facts: caseData.facts,
          legalIssues: caseData.legalIssues,
          caseType: caseData.caseType,
          priority: parseInt(caseData.priority),
          status: 'ANALYZED',
          courtId: 'default-court-id'
        }
      })

      await db.caseAnalysis.create({
        data: {
          caseId: newCase.id,
          userId: 'default-user-id',
          analysisType: 'ENHANCED_ANALYSIS',
          result: JSON.stringify(analysisResult),
          confidence: overallConfidence,
          processingTime: analysisResult.metadata.processingTime,
          modelUsed: 'z-ai-gpt-4'
        }
      })
    } catch (dbError) {
      console.error('Database storage error:', dbError)
      // Continue even if database storage fails
    }

    return NextResponse.json({
      success: true,
      analysisResult,
      caseId: newCase?.id,
      metadata: analysisResult.metadata
    })

  } catch (error) {
    console.error('Enhanced analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to perform enhanced analysis', details: error.message },
      { status: 500 }
    )
  }
}