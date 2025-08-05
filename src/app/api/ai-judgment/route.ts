import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

interface AIJudgmentRequest {
  caseData: {
    title: string
    description: string
    facts: string
    legalIssues: string
    caseType: string
    priority: string
    plaintiffArguments?: string[]
    defendantArguments?: string[]
    evidence?: string[]
  }
  options?: {
    includePrecedentAnalysis: boolean
    includeBiasDetection: boolean
    includeRiskAssessment: boolean
    jurisdiction?: string
    courtType?: string
  }
}

interface JudgmentResult {
  caseSummary: {
    keyIssues: string[]
    caseComplexity: 'LOW' | 'MEDIUM' | 'HIGH'
    estimatedDuration: string
  }
  legalAnalysis: {
    applicableLaws: string[]
    constitutionalProvisions: string[]
    legalPrinciples: string[]
  }
  precedentAnalysis: {
    bindingPrecedents: Array<{
      caseName: string
      citation: string
      principle: string
      application: string
      weight: 'HIGH' | 'MEDIUM' | 'LOW'
    }>
    persuasivePrecedents: Array<{
      caseName: string
      citation: string
      principle: string
      application: string
      weight: 'HIGH' | 'MEDIUM' | 'LOW'
    }>
    precedentScore: number
  }
  biasAnalysis: {
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
  argumentsAnalysis: {
    plaintiffArguments: Array<{
      argument: string
      strength: 'WEAK' | 'MODERATE' | 'STRONG'
      legalBasis: string[]
      evidence: string[]
    }>
    defendantArguments: Array<{
      argument: string
      strength: 'WEAK' | 'MODERATE' | 'STRONG'
      legalBasis: string[]
      evidence: string[]
    }>
    overallAssessment: 'PLAINTIFF_FAVORED' | 'DEFENDANT_FAVORED' | 'BALANCED'
  }
  judgment: {
    decision: string
    reasoning: string
    conclusions: string[]
    orders: string[]
    confidenceScore: number
    liabilityDetermination: 'PLAINTIFF_LIABLE' | 'DEFENDANT_LIABLE' | 'SHARED_LIABILITY' | 'NO_LIABILITY'
    damages?: {
      awarded: boolean
      amount?: number
      reasoning: string
    }
    directions: string[]
  }
  riskAssessment: {
    appealProbability: number
    successFactors: string[]
    riskFactors: string[]
    recommendations: string[]
  }
  metadata: {
    processingTime: number
    modelUsed: string
    confidenceScore: number
    judgmentType: 'FINAL' | 'INTERIM' | 'PRELIMINARY'
    date: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AIJudgmentRequest = await request.json()
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
    const judgmentOptions = {
      includePrecedentAnalysis: true,
      includeBiasDetection: true,
      includeRiskAssessment: true,
      jurisdiction: 'India',
      courtType: 'District Court',
      ...options
    }

    const judgmentResult: Partial<JudgmentResult> = {
      metadata: {
        processingTime: 0,
        modelUsed: 'z-ai-gpt-4',
        confidenceScore: 0,
        judgmentType: 'FINAL',
        date: new Date().toISOString()
      }
    }

    // Step 1: Case Summary and Initial Analysis
    const caseSummaryPrompt = `You are an expert Indian judge analyzing a legal case. Provide a comprehensive case summary and analysis:

Case Title: ${caseData.title}
Case Type: ${caseData.caseType}
Facts: ${caseData.facts}
Legal Issues: ${caseData.legalIssues}
Description: ${caseData.description}
Plaintiff Arguments: ${caseData.plaintiffArguments?.join(', ') || 'Not provided'}
Defendant Arguments: ${caseData.defendantArguments?.join(', ') || 'Not provided'}

Provide your analysis in JSON format:
{
  "caseSummary": {
    "keyIssues": ["issue1", "issue2"],
    "caseComplexity": "MEDIUM",
    "estimatedDuration": "6-12 months"
  },
  "legalAnalysis": {
    "applicableLaws": ["Indian Penal Code Section 420", "Contract Act 1872"],
    "constitutionalProvisions": ["Article 14", "Article 21"],
    "legalPrinciples": ["Natural Justice", "Equity"]
  }
}`

    const caseSummaryResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert Indian judge providing comprehensive case analysis based on Indian legal principles and precedents.'
        },
        {
          role: 'user',
          content: caseSummaryPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })

    const caseSummaryContent = caseSummaryResponse.choices[0]?.message?.content
    if (caseSummaryContent) {
      try {
        const parsedSummary = JSON.parse(caseSummaryContent)
        Object.assign(judgmentResult, parsedSummary)
      } catch (e) {
        console.error('Failed to parse case summary:', e)
      }
    }

    // Step 2: Precedent Analysis
    if (judgmentOptions.includePrecedentAnalysis) {
      const precedentPrompt = `As an expert Indian legal researcher, analyze relevant precedents for this case:

Case: ${caseData.title}
Type: ${caseData.caseType}
Issues: ${caseData.legalIssues}
Facts: ${caseData.facts}
Jurisdiction: ${judgmentOptions.jurisdiction}

Consider key Indian Supreme Court and High Court judgments. Provide precedent analysis in JSON format:
{
  "precedentAnalysis": {
    "bindingPrecedents": [
      {
        "caseName": "Kesavananda Bharati v. State of Kerala",
        "citation": "AIR 1973 SC 1461",
        "principle": "Basic Structure Doctrine",
        "application": "Applies to constitutional challenges",
        "weight": "HIGH"
      }
    ],
    "persuasivePrecedents": [
      {
        "caseName": "Maneka Gandhi v. Union of India",
        "citation": "AIR 1978 SC 597",
        "principle": "Expanded interpretation of personal liberty",
        "application": "Supports due process requirements",
        "weight": "MEDIUM"
      }
    ],
    "precedentScore": 0.85
  }
}`

      const precedentResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert Indian legal researcher specializing in Supreme Court and High Court precedents.'
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
          const parsedPrecedent = JSON.parse(precedentContent)
          Object.assign(judgmentResult, parsedPrecedent)
        } catch (e) {
          console.error('Failed to parse precedent analysis:', e)
        }
      }
    }

    // Step 3: Bias Detection
    if (judgmentOptions.includeBiasDetection) {
      const biasPrompt = `Analyze this case for potential biases that might affect judicial decision-making:

Case Facts: ${caseData.facts}
Legal Issues: ${caseData.legalIssues}
Plaintiff Arguments: ${caseData.plaintiffArguments?.join(', ') || 'Not provided'}
Defendant Arguments: ${caseData.defendantArguments?.join(', ') || 'Not provided'}

Provide bias analysis in JSON format:
{
  "biasAnalysis": {
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
  }
}`

      const biasResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an AI specialized in detecting bias in legal documents and judicial proceedings.'
          },
          {
            role: 'user',
            content: biasPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 600
      })

      const biasContent = biasResponse.choices[0]?.message?.content
      if (biasContent) {
        try {
          const parsedBias = JSON.parse(biasContent)
          Object.assign(judgmentResult, parsedBias)
        } catch (e) {
          console.error('Failed to parse bias analysis:', e)
        }
      }
    }

    // Step 4: Arguments Analysis
    const argumentsPrompt = `Analyze the strength and legal basis of arguments presented by both parties:

Case: ${caseData.title}
Plaintiff Arguments: ${caseData.plaintiffArguments?.join('; ') || 'Not provided'}
Defendant Arguments: ${caseData.defendantArguments?.join('; ') || 'Not provided'}
Evidence: ${caseData.evidence?.join(', ') || 'Not provided'}

Provide arguments analysis in JSON format:
{
  "argumentsAnalysis": {
    "plaintiffArguments": [
      {
        "argument": "Summary of plaintiff argument",
        "strength": "STRONG",
        "legalBasis": ["Contract Act 1872", "Evidence Act"],
        "evidence": ["Document A", "Witness testimony"]
      }
    ],
    "defendantArguments": [
      {
        "argument": "Summary of defendant argument",
        "strength": "MODERATE",
        "legalBasis": ["Limitation Act"],
        "evidence": ["Document B"]
      }
    ],
    "overallAssessment": "PLAINTIFF_FAVORED"
  }
}`

    const argumentsResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert Indian judge analyzing legal arguments and evidence.'
        },
        {
          role: 'user',
          content: argumentsPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })

    const argumentsContent = argumentsResponse.choices[0]?.message?.content
    if (argumentsContent) {
      try {
        const parsedArguments = JSON.parse(argumentsContent)
        Object.assign(judgmentResult, parsedArguments)
      } catch (e) {
        console.error('Failed to parse arguments analysis:', e)
      }
    }

    // Step 5: Judgment Generation
    const judgmentPrompt = `As an Indian judge, deliver a comprehensive judgment based on the following case:

Case Title: ${caseData.title}
Case Type: ${caseData.caseType}
Facts: ${caseData.facts}
Legal Issues: ${caseData.legalIssues}
Court Type: ${judgmentOptions.courtType}
Jurisdiction: ${judgmentOptions.jurisdiction}

Consider all applicable Indian laws, constitutional provisions, and relevant precedents. Provide judgment in JSON format:
{
  "judgment": {
    "decision": "Detailed decision explaining the outcome",
    "reasoning": "Step-by-step legal reasoning based on Indian law",
    "conclusions": ["Conclusion 1", "Conclusion 2"],
    "orders": ["Order 1", "Order 2"],
    "confidenceScore": 0.85,
    "liabilityDetermination": "PLAINTIFF_LIABLE",
    "damages": {
      "awarded": true,
      "amount": 500000,
      "reasoning": "Compensation for losses suffered"
    },
    "directions": ["Direction 1", "Direction 2"]
  }
}`

    const judgmentResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an experienced Indian judge delivering judgments based on Indian legal principles, constitutional values, and established precedents. Your judgments must be fair, impartial, and grounded in law.`
        },
        {
          role: 'user',
          content: judgmentPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    const judgmentContent = judgmentResponse.choices[0]?.message?.content
    if (judgmentContent) {
      try {
        const parsedJudgment = JSON.parse(judgmentContent)
        Object.assign(judgmentResult, parsedJudgment)
      } catch (e) {
        console.error('Failed to parse judgment:', e)
      }
    }

    // Step 6: Risk Assessment
    if (judgmentOptions.includeRiskAssessment) {
      const riskPrompt = `Conduct a comprehensive risk assessment for this judgment:

Case: ${caseData.title}
Judgment: ${judgmentResult.judgment?.decision || 'Pending'}

Provide risk assessment in JSON format:
{
  "riskAssessment": {
    "appealProbability": 0.3,
    "successFactors": ["Strong legal basis", "Clear evidence"],
    "riskFactors": ["Potential appeal on procedural grounds"],
    "recommendations": ["Strengthen reasoning", "Address potential counter-arguments"]
  }
}`

      const riskResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a legal risk assessment expert evaluating judgment outcomes and appeal probabilities.'
          },
          {
            role: 'user',
            content: riskPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      })

      const riskContent = riskResponse.choices[0]?.message?.content
      if (riskContent) {
        try {
          const parsedRisk = JSON.parse(riskContent)
          Object.assign(judgmentResult, parsedRisk)
        } catch (e) {
          console.error('Failed to parse risk assessment:', e)
        }
      }
    }

    // Calculate overall confidence score
    const confidenceComponents = [
      judgmentResult.precedentAnalysis?.precedentScore || 0.7,
      judgmentResult.biasAnalysis ? (1 - (judgmentResult.biasAnalysis.overallBiasScore || 0)) : 0.8,
      judgmentResult.judgment?.confidenceScore || 0.7,
      judgmentResult.argumentsAnalysis?.overallAssessment === 'BALANCED' ? 0.8 : 0.6
    ]
    
    const overallConfidence = confidenceComponents.reduce((sum, score) => sum + score, 0) / confidenceComponents.length

    // Update metadata
    judgmentResult.metadata = {
      processingTime: Date.now() - startTime,
      modelUsed: 'z-ai-gpt-4',
      confidenceScore: Math.round(overallConfidence * 100) / 100,
      judgmentType: 'FINAL',
      date: new Date().toISOString()
    }

    // Store in database
    try {
      const newCase = await db.legalCase.create({
        data: {
          caseNumber: `JUDGMENT-${Date.now()}`,
          title: caseData.title,
          description: caseData.description,
          facts: caseData.facts,
          legalIssues: caseData.legalIssues,
          caseType: caseData.caseType,
          priority: parseInt(caseData.priority),
          status: 'CLOSED',
          courtId: 'default-court-id'
        }
      })

      // Create judgment record
      const newJudgment = await db.judgment.create({
        data: {
          caseId: newCase.id,
          judgeId: 'default-judge-id',
          courtId: 'default-court-id',
          judgmentType: 'FINAL',
          summary: judgmentResult.judgment?.decision || 'AI-generated judgment',
          fullText: JSON.stringify(judgmentResult),
          decision: judgmentResult.judgment?.liabilityDetermination || 'PENDING',
          reasoning: judgmentResult.judgment?.reasoning || 'AI-generated reasoning',
          dateDelivered: new Date(),
          isPublished: false,
          confidence: overallConfidence,
          biasScore: judgmentResult.biasAnalysis?.overallBiasScore || 0
        }
      })

      await db.caseAnalysis.create({
        data: {
          caseId: newCase.id,
          userId: 'default-user-id',
          analysisType: 'AI_JUDGMENT',
          result: JSON.stringify(judgmentResult),
          confidence: overallConfidence,
          processingTime: judgmentResult.metadata.processingTime,
          modelUsed: 'z-ai-gpt-4'
        }
      })

      return NextResponse.json({
        success: true,
        judgmentResult,
        caseId: newCase.id,
        judgmentId: newJudgment.id,
        metadata: judgmentResult.metadata
      })

    } catch (dbError) {
      console.error('Database storage error:', dbError)
      // Return judgment even if database storage fails
      return NextResponse.json({
        success: true,
        judgmentResult,
        metadata: judgmentResult.metadata,
        warning: 'Judgment generated but database storage failed'
      })
    }

  } catch (error) {
    console.error('AI judgment error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI judgment', details: error.message },
      { status: 500 }
    )
  }
}