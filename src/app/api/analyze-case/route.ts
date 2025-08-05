import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { constitutionService } from '@/lib/services/constitutionService'

interface AnalysisRequest {
  caseData: {
    title: string
    description: string
    facts: string
    legalIssues: string
    caseType: string
    priority: string
  }
  analysisType: 'PRECEDENT_ANALYSIS' | 'BIAS_DETECTION' | 'LEGAL_REASONING' | 'COMPREHENSIVE'
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()
    const { caseData, analysisType } = body

    if (!caseData.title || !caseData.facts) {
      return NextResponse.json(
        { error: 'Case title and facts are required' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    
    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Search for relevant Constitution articles based on case facts
    let constitutionArticles: any[] = []
    try {
      constitutionArticles = await constitutionService.searchConstitution(caseData.facts, {
        searchType: 'SEMANTIC',
        limit: 5
      })
    } catch (error) {
      console.error('Error searching Constitution:', error)
    }

    let systemPrompt = ''
    let userPrompt = ''
    let analysisResult: any = {}

    switch (analysisType) {
      case 'PRECEDENT_ANALYSIS':
        systemPrompt = `You are an expert legal AI assistant specializing in Indian law. Your task is to analyze the given case facts and identify relevant legal precedents, principles, and potential case law that could apply.

Provide your analysis in the following JSON format:
{
  "keyLegalIssues": ["issue1", "issue2"],
  "relevantPrecedents": [
    {
      "caseName": "Case name",
      "citation": "Citation",
      "principle": "Legal principle established",
      "relevance": "How it applies to current case",
      "similarityScore": 0.85
    }
  ],
  "legalPrinciples": ["principle1", "principle2"],
  "potentialArguments": {
    "plaintiff": ["argument1", "argument2"],
    "defendant": ["argument1", "argument2"]
  },
  "confidenceScore": 0.85,
  "recommendations": ["recommendation1", "recommendation2"]
}`
        
        userPrompt = `Please analyze the following case for precedent matching:

Case Title: ${caseData.title}
Case Type: ${caseData.type}
Case Facts: ${caseData.facts}
Legal Issues: ${caseData.legalIssues}
Description: ${caseData.description}

Please identify relevant precedents, legal principles, and provide a comprehensive analysis.`
        break

      case 'BIAS_DETECTION':
        systemPrompt = `You are an AI assistant specialized in detecting potential biases in legal documents and case narratives. Your task is to analyze the provided case facts and identify any potential biases related to gender, religion, caste, economic status, regional background, age, or political affiliation.

Provide your analysis in the following JSON format:
{
  "biasDetection": {
    "overallBiasScore": 0.15,
    "detectedBiases": [
      {
        "type": "GENDER",
        "severity": 0.3,
        "context": "Specific text where bias was detected",
        "explanation": "Why this indicates potential bias",
        "suggestion": "How to rephrase more neutrally"
      }
    ]
  },
  "languageAnalysis": {
    "emotionalLanguage": false,
    "subjectiveTerms": ["term1", "term2"],
    "stereotypicalLanguage": false
  },
  "neutralityScore": 0.85,
  "recommendations": ["recommendation1", "recommendation2"]
}`
        
        userPrompt = `Please analyze the following case for potential biases:

Case Title: ${caseData.title}
Case Facts: ${caseData.facts}
Legal Issues: ${caseData.legalIssues}

Focus on detecting any language or content that might indicate unconscious bias, stereotyping, or prejudicial framing.`
        break

      case 'LEGAL_REASONING':
        systemPrompt = `You are an expert legal reasoning AI assistant. Your task is to analyze the given case facts and provide a structured legal reasoning analysis, including issue identification, rule application, and logical conclusion building.

Provide your analysis in the following JSON format:
{
  "issueIdentification": {
    "primaryIssues": ["issue1", "issue2"],
    "secondaryIssues": ["issue1", "issue2"],
    "factualDisputes": ["dispute1", "dispute2"]
  },
  "legalReasoning": {
    "applicableLaws": ["law1", "law2"],
    "legalTests": ["test1", "test2"],
    "reasoningChain": [
      {
        "step": 1,
        "premise": "Legal premise",
        "analysis": "Analysis of how premise applies",
        "conclusion": "Step conclusion"
      }
    ]
  },
  "outcomePrediction": {
    "likelyOutcome": "description",
    "confidence": 0.75,
    "keyFactors": ["factor1", "factor2"],
    "alternativeScenarios": ["scenario1", "scenario2"]
  },
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}`
        
        userPrompt = `Please provide a comprehensive legal reasoning analysis for the following case:

Case Title: ${caseData.title}
Case Type: ${caseData.type}
Case Facts: ${caseData.facts}
Legal Issues: ${caseData.legalIssues}

Please identify issues, apply relevant legal principles, and provide structured reasoning.`
        break

      case 'COMPREHENSIVE':
        systemPrompt = `You are a comprehensive legal AI assistant providing complete analysis of legal cases. Your task is to provide precedent analysis, bias detection, constitutional analysis, and legal reasoning in a single comprehensive report.

${constitutionArticles.length > 0 ? `RELEVANT CONSTITUTION ARTICLES:
${constitutionArticles.map(article => `
Article ${article.articleNumber}: ${article.title}
Relevance: ${Math.round(article.relevanceScore * 100)}%
Key Content: ${article.content.substring(0, 200)}...
`).join('\n')}` : 'No specific Constitution articles were identified for this case.'}

Provide your analysis in the following JSON format:
{
  "constitutionalAnalysis": {
    "relevantArticles": [
      {
        "articleNumber": "14",
        "title": "Equality before law",
        "relevanceScore": 0.9,
        "application": "How this constitutional provision applies to the case",
        "keyPrinciples": ["principle1", "principle2"]
      }
    ],
    "constitutionalIssues": ["issue1", "issue2"],
    "fundamentalRightsImplicated": ["right1", "right2"]
  },
  "precedentAnalysis": {
    "keyLegalIssues": ["issue1", "issue2"],
    "relevantPrecedents": [
      {
        "caseName": "Case name",
        "citation": "Citation",
        "principle": "Legal principle",
        "relevance": "Application to current case",
        "similarityScore": 0.85
      }
    ],
    "legalPrinciples": ["principle1", "principle2"]
  },
  "biasDetection": {
    "overallBiasScore": 0.15,
    "detectedBiases": [
      {
        "type": "GENDER",
        "severity": 0.3,
        "context": "Context description",
        "suggestion": "Neutral alternative"
      }
    ],
    "neutralityScore": 0.85
  },
  "legalReasoning": {
    "issueIdentification": ["issue1", "issue2"],
    "applicableLaws": ["law1", "law2"],
    "reasoningChain": [
      {
        "step": 1,
        "premise": "Premise",
        "analysis": "Analysis",
        "conclusion": "Conclusion"
      }
    ],
    "outcomePrediction": {
      "likelyOutcome": "Outcome description",
      "confidence": 0.75
    }
  },
  "overallAssessment": {
    "caseStrength": 0.7,
    "riskFactors": ["risk1", "risk2"],
    "recommendations": ["recommendation1", "recommendation2"],
    "nextSteps": ["step1", "step2"]
  },
  "confidenceScore": 0.8
}`
        
        userPrompt = `Please provide a comprehensive legal analysis of the following case, including constitutional analysis, precedent matching, bias detection, and legal reasoning:

Case Title: ${caseData.title}
Case Type: ${caseData.type}
Case Facts: ${caseData.facts}
Legal Issues: ${caseData.legalIssues}
Description: ${caseData.description}

${constitutionArticles.length > 0 ? `Constitutional Context: ${constitutionArticles.length} relevant Constitution articles have been identified and should be considered in your analysis.` : ''}

Please provide a complete analysis covering all aspects of the case with special attention to constitutional implications.`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid analysis type' },
          { status: 400 }
        )
    }

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
      temperature: 0.3, // Lower temperature for more consistent legal analysis
      max_tokens: 2000
    })

    const processingTime = Date.now() - startTime
    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      throw new Error('No response from AI model')
    }

    // Parse the JSON response
    try {
      analysisResult = JSON.parse(responseContent)
    } catch (parseError) {
      // If JSON parsing fails, return the raw content
      analysisResult = {
        rawAnalysis: responseContent,
        note: 'AI response was not in valid JSON format'
      }
    }

    // Store the analysis in the database
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
        courtId: 'default-court-id' // This should be dynamically assigned
      }
    })

    await db.caseAnalysis.create({
      data: {
        caseId: newCase.id,
        userId: 'default-user-id', // This should come from authentication
        analysisType: analysisType,
        result: JSON.stringify(analysisResult),
        confidence: analysisResult.confidenceScore || 0.7,
        processingTime: processingTime,
        modelUsed: 'z-ai-gpt-4'
      }
    })

    return NextResponse.json({
      success: true,
      analysisResult,
      constitutionArticles: constitutionArticles.map(article => ({
        articleNumber: article.articleNumber,
        title: article.title,
        relevanceScore: article.relevanceScore,
        content: article.content.substring(0, 300) + '...',
        category: article.category
      })),
      processingTime,
      caseId: newCase.id,
      modelUsed: 'z-ai-gpt-4'
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze case', details: error.message },
      { status: 500 }
    )
  }
}