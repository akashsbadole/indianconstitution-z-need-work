import { NextRequest, NextResponse } from 'next/server'
import { biasDetectionService } from '@/lib/services/biasDetectionService'

interface AdvancedBiasDetectionRequest {
  text: string
  context?: string
  documentType?: 'LEGAL_CASE' | 'JUDGMENT' | 'PLEADING' | 'CONTRACT' | 'GENERAL'
  includeMitigation?: boolean
  sensitivityLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
}

export async function POST(request: NextRequest) {
  try {
    const body: AdvancedBiasDetectionRequest = await request.json()
    const { 
      text, 
      context = '', 
      documentType = 'GENERAL',
      includeMitigation = true,
      sensitivityLevel = 'MEDIUM'
    } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required for bias detection' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Perform bias detection
    const biasResult = await biasDetectionService.detectBias(text, context)

    // Apply sensitivity level filtering
    let filteredBiases = biasResult.detectedBiases
    if (sensitivityLevel === 'LOW') {
      filteredBiases = filteredBiases.filter(bias => bias.severity > 0.4)
    } else if (sensitivityLevel === 'HIGH') {
      filteredBiases = filteredBiases.filter(bias => bias.severity > 0.1)
    }

    // Update the result with filtered biases
    const filteredResult = {
      ...biasResult,
      detectedBiases: filteredBiases,
      overallBiasScore: filteredBiases.length > 0 ? 
        filteredBiases.reduce((sum, bias) => sum + bias.severity, 0) / filteredBiases.length : 0,
      neutralityScore: filteredBiases.length > 0 ? 
        1 - (filteredBiases.reduce((sum, bias) => sum + bias.severity, 0) / filteredBiases.length) : 1
    }

    // Generate document-specific recommendations
    const documentSpecificRecommendations = generateDocumentSpecificRecommendations(
      documentType, 
      filteredResult
    )

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      biasResult: {
        ...filteredResult,
        recommendations: [
          ...filteredResult.recommendations,
          ...documentSpecificRecommendations
        ]
      },
      metadata: {
        processingTime,
        documentType,
        sensitivityLevel,
        originalBiasCount: biasResult.detectedBiases.length,
        filteredBiasCount: filteredBiases.length,
        includeMitigation,
        textLength: text.length,
        analysisTimestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Advanced bias detection error:', error)
    return NextResponse.json(
      { error: 'Failed to perform advanced bias detection', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint for quick bias checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const text = searchParams.get('text')
    const context = searchParams.get('context') || ''
    const documentType = searchParams.get('documentType') || 'GENERAL'
    const sensitivityLevel = searchParams.get('sensitivityLevel') || 'MEDIUM'

    if (!text) {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      )
    }

    const requestBody: AdvancedBiasDetectionRequest = {
      text,
      context,
      documentType: documentType as any,
      sensitivityLevel: sensitivityLevel as any
    }

    const mockRequest = {
      json: async () => requestBody
    } as NextRequest

    return await POST(mockRequest)

  } catch (error) {
    console.error('GET advanced bias detection error:', error)
    return NextResponse.json(
      { error: 'Failed to perform quick bias detection', details: error.message },
      { status: 500 }
    )
  }
}

function generateDocumentSpecificRecommendations(
  documentType: string, 
  biasResult: any
): string[] {
  const recommendations: string[] = []

  switch (documentType) {
    case 'LEGAL_CASE':
      recommendations.push(
        'Ensure case descriptions focus on facts rather than personal characteristics',
        'Avoid assumptions about parties based on demographic factors',
        'Use neutral language when describing alleged actions or behaviors'
      )
      break

    case 'JUDGMENT':
      recommendations.push(
        'Maintain judicial neutrality in all language choices',
        'Avoid any language that might indicate personal bias',
        'Ensure equal treatment of all parties in the judgment narrative'
      )
      break

    case 'PLEADING':
      recommendations.push(
        'Focus on legal arguments rather than personal characteristics',
        'Avoid inflammatory or emotionally charged language',
        'Use professional and respectful terminology throughout'
      )
      break

    case 'CONTRACT':
      recommendations.push(
        'Use inclusive language that applies to all parties equally',
        'Avoid gender-specific pronouns and terminology',
        'Ensure terms are defined neutrally without bias'
      )
      break

    default:
      recommendations.push(
        'Review document for any potentially biased language',
        'Consider the impact of word choices on different readers',
        'Strive for inclusive and respectful communication'
      )
  }

  // Add specific recommendations based on detected bias types
  const detectedTypes = new Set(biasResult.detectedBiases.map((b: any) => b.type))
  
  if (detectedTypes.has('GENDER')) {
    recommendations.push('Review and replace gender-specific language with gender-neutral alternatives')
  }
  
  if (detectedTypes.has('RELIGION') || detectedTypes.has('CASTE')) {
    recommendations.push('Remove all references to religion or caste unless legally relevant')
  }
  
  if (detectedTypes.has('ECONOMIC')) {
    recommendations.push('Avoid assumptions about economic status and focus on factual circumstances')
  }
  
  if (detectedTypes.has('REGIONAL')) {
    recommendations.push('Remove regional stereotypes and focus on individual merits')
  }

  return recommendations
}