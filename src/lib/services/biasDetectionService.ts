export interface BiasDetectionResult {
  overallBiasScore: number
  neutralityScore: number
  detectedBiases: Array<BiasInstance>
  languageAnalysis: LanguageAnalysis
  contextualAnalysis: ContextualAnalysis
  recommendations: string[]
  confidenceScore: number
  mitigationSuggestions: MitigationSuggestion[]
}

export interface BiasInstance {
  type: BiasType
  severity: number
  context: string
  explanation: string
  suggestion: string
  position?: {
    start: number
    end: number
  }
}

export interface LanguageAnalysis {
  emotionalLanguage: boolean
  subjectiveTerms: string[]
  stereotypicalLanguage: boolean
  loadedTerms: string[]
  formalLanguageScore: number
  objectivityScore: number
}

export interface ContextualAnalysis {
  powerDynamics: 'NEUTRAL' | 'IMBALANCED' | 'EQUITABLE'
  culturalSensitivity: 'LOW' | 'MODERATE' | 'HIGH'
  inclusiveLanguage: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT'
  representationScore: number
}

export interface MitigationSuggestion {
  type: BiasType
  originalText: string
  suggestedText: string
  reasoning: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

export type BiasType = 
  | 'GENDER'
  | 'RELIGION' 
  | 'CASTE'
  | 'ECONOMIC'
  | 'REGIONAL'
  | 'AGE'
  | 'POLITICAL'
  | 'DISABILITY'
  | 'RACIAL'
  | 'SEXUAL_ORIENTATION'

export interface BiasPattern {
  type: BiasType
  keywords: string[]
  patterns: RegExp[]
  severity: number
  context: string
}

export class BiasDetectionService {
  private biasPatterns: BiasPattern[]
  private mitigationStrategies: Map<BiasType, string[]>

  constructor() {
    this.initializeBiasPatterns()
    this.initializeMitigationStrategies()
  }

  private initializeBiasPatterns(): void {
    this.biasPatterns = [
      {
        type: 'GENDER',
        keywords: ['he', 'she', 'male', 'female', 'man', 'woman', 'gentlemen', 'ladies'],
        patterns: [
          /\b(he|she)\b/gi,
          /\b(male|female)\b/gi,
          /\b(man|woman)\b/gi,
          /\b(boys|girls)\b/gi
        ],
        severity: 0.3,
        context: 'Gender-specific language that may exclude non-binary individuals'
      },
      {
        type: 'RELIGION',
        keywords: ['muslim', 'hindu', 'christian', 'sikh', 'buddhist', 'jain', 'parsi', 'religious'],
        patterns: [
          /\b(muslim|hindu|christian|sikh|buddhist|jain|parsi)\b/gi,
          /\b(religious|spiritual|faith)\b/gi
        ],
        severity: 0.4,
        context: 'Religious references that may indicate bias'
      },
      {
        type: 'CASTE',
        keywords: ['brahmin', 'kshatriya', 'vaishya', 'shudra', 'dalit', 'scheduled caste', 'scheduled tribe'],
        patterns: [
          /\b(brahmin|kshatriya|vaishya|shudra|dalit)\b/gi,
          /\b(scheduled caste|scheduled tribe|obc)\b/gi
        ],
        severity: 0.5,
        context: 'Caste-based references that indicate discrimination'
      },
      {
        type: 'ECONOMIC',
        keywords: ['poor', 'rich', 'wealthy', 'impoverished', 'privileged', 'underprivileged'],
        patterns: [
          /\b(poor|rich|wealthy|impoverished)\b/gi,
          /\b(privileged|underprivileged|disadvantaged)\b/gi
        ],
        severity: 0.3,
        context: 'Economic status assumptions'
      },
      {
        type: 'REGIONAL',
        keywords: ['north indian', 'south indian', 'east indian', 'west indian', 'bihari', 'madrasi'],
        patterns: [
          /\b(north|south|east|west)\s+indian\b/gi,
          /\b(bihari|madrasi|punjabi|gujarati|marathi)\b/gi
        ],
        severity: 0.3,
        context: 'Regional stereotypes'
      },
      {
        type: 'AGE',
        keywords: ['young', 'old', 'elderly', 'youth', 'aged', 'senior'],
        patterns: [
          /\b(young|old|elderly|youth|aged|senior)\b/gi
        ],
        severity: 0.2,
        context: 'Age-based assumptions'
      },
      {
        type: 'POLITICAL',
        keywords: ['bjp', 'congress', 'leftist', 'rightist', 'liberal', 'conservative'],
        patterns: [
          /\b(bjp|congress|leftist|rightist)\b/gi,
          /\b(liberal|conservative|moderate)\b/gi
        ],
        severity: 0.4,
        context: 'Political affiliation references'
      }
    ]
  }

  private initializeMitigationStrategies(): void {
    this.mitigationStrategies = new Map([
      ['GENDER', [
        'Use gender-neutral language (they/them/their)',
        'Avoid gender-specific job titles',
        'Focus on qualifications rather than gender',
        'Use inclusive terms like "person" or "individual"'
      ]],
      ['RELIGION', [
        'Avoid religious references unless legally relevant',
        'Focus on secular legal principles',
        'Do not assume religious affiliation',
        'Use neutral terms for religious practices'
      ]],
      ['CASTE', [
        'Avoid all caste references',
        'Focus on constitutional principles of equality',
        'Do not make assumptions based on caste',
        'Use terminology that promotes social harmony'
      ]],
      ['ECONOMIC', [
        'Avoid assumptions about economic status',
        'Focus on facts rather than economic labels',
        'Use neutral terms for financial situations',
        'Avoid stereotyping based on wealth'
      ]],
      ['REGIONAL', [
        'Avoid regional stereotypes',
        'Focus on individual merits',
        'Do not make assumptions based on origin',
        'Use inclusive geographical references'
      ]],
      ['AGE', [
        'Avoid age-based assumptions',
        'Focus on capabilities rather than age',
        'Use neutral terms for different age groups',
        'Avoid age-related stereotypes'
      ]],
      ['POLITICAL', [
        'Avoid political references unless legally relevant',
        'Focus on legal principles rather than politics',
        'Maintain political neutrality',
        'Use objective political terminology'
      ]]
    ])
  }

  async detectBias(text: string, context: string = ''): Promise<BiasDetectionResult> {
    const detectedBiases: BiasInstance[] = []
    const subjectiveTerms: string[] = []
    const loadedTerms: string[] = []

    // Analyze each bias pattern
    for (const pattern of this.biasPatterns) {
      const matches = this.findPatternMatches(text, pattern)
      
      for (const match of matches) {
        detectedBiases.push({
          type: pattern.type,
          severity: pattern.severity,
          context: match.context,
          explanation: this.generateExplanation(pattern.type, match.context),
          suggestion: this.generateSuggestion(pattern.type, match.context),
          position: match.position
        })
      }
    }

    // Analyze language characteristics
    const languageAnalysis = this.analyzeLanguage(text, subjectiveTerms, loadedTerms)

    // Analyze contextual factors
    const contextualAnalysis = this.analyzeContext(text, context, detectedBiases)

    // Generate recommendations
    const recommendations = this.generateRecommendations(detectedBiases, languageAnalysis, contextualAnalysis)

    // Generate mitigation suggestions
    const mitigationSuggestions = this.generateMitigationSuggestions(text, detectedBiases)

    // Calculate scores
    const overallBiasScore = this.calculateOverallBiasScore(detectedBiases)
    const neutralityScore = 1 - overallBiasScore
    const confidenceScore = this.calculateConfidenceScore(detectedBiases, text.length)

    return {
      overallBiasScore,
      neutralityScore,
      detectedBiases,
      languageAnalysis,
      contextualAnalysis,
      recommendations,
      confidenceScore,
      mitigationSuggestions
    }
  }

  private findPatternMatches(text: string, pattern: BiasPattern): Array<{
    context: string
    position: { start: number; end: number }
  }> {
    const matches: Array<{ context: string; position: { start: number; end: number } }> = []

    // Check keyword matches
    for (const keyword of pattern.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      let match
      
      while ((match = regex.exec(text)) !== null) {
        const start = Math.max(0, match.index - 50)
        const end = Math.min(text.length, match.index + match[0].length + 50)
        const context = text.substring(start, end)
        
        matches.push({
          context,
          position: { start: match.index, end: match.index + match[0].length }
        })
      }
    }

    // Check pattern matches
    for (const patternRegex of pattern.patterns) {
      let match
      
      while ((match = patternRegex.exec(text)) !== null) {
        const start = Math.max(0, match.index - 50)
        const end = Math.min(text.length, match.index + match[0].length + 50)
        const context = text.substring(start, end)
        
        matches.push({
          context,
          position: { start: match.index, end: match.index + match[0].length }
        })
      }
    }

    return matches
  }

  private analyzeLanguage(text: string, subjectiveTerms: string[], loadedTerms: string[]): LanguageAnalysis {
    const emotionalWords = ['angry', 'outraged', 'shocking', 'appalling', 'disgusting', 'horrifying']
    const subjectiveWords = ['obviously', 'clearly', 'undoubtedly', 'absolutely', 'completely']
    const stereotypicalPhrases = ['all men are', 'women always', 'they always', 'never fails to']

    const hasEmotionalLanguage = emotionalWords.some(word => 
      text.toLowerCase().includes(word)
    )

    const hasStereotypicalLanguage = stereotypicalPhrases.some(phrase => 
      text.toLowerCase().includes(phrase)
    )

    // Extract subjective terms
    subjectiveWords.forEach(word => {
      if (text.toLowerCase().includes(word)) {
        subjectiveTerms.push(word)
      }
    })

    // Calculate formal language score (inverse of emotional and subjective language)
    const informalIndicators = [...emotionalWords, ...subjectiveWords].filter(word => 
      text.toLowerCase().includes(word)
    ).length
    
    const formalLanguageScore = Math.max(0, 1 - (informalIndicators / text.split(' ').length) * 10)

    // Calculate objectivity score
    const objectivityScore = Math.max(0, 1 - (hasEmotionalLanguage ? 0.3 : 0) - (hasStereotypicalLanguage ? 0.4 : 0))

    return {
      emotionalLanguage: hasEmotionalLanguage,
      subjectiveTerms,
      stereotypicalLanguage: hasStereotypicalLanguage,
      loadedTerms,
      formalLanguageScore: Math.round(formalLanguageScore * 100) / 100,
      objectivityScore: Math.round(objectivityScore * 100) / 100
    }
  }

  private analyzeContext(text: string, context: string, biases: BiasInstance[]): ContextualAnalysis {
    // Simple heuristic-based context analysis
    const powerDynamicsKeywords = ['authority', 'subordinate', 'superior', 'inferior', 'power', 'control']
    const inclusiveKeywords = ['all', 'every', 'each', 'regardless', 'without discrimination']
    exclusiveKeywords = ['only', 'except', 'excluding', 'limited to']

    const hasPowerImbalance = powerDynamicsKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    )

    const inclusiveCount = inclusiveKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length

    const exclusiveCount = exclusiveKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length

    const representationScore = Math.max(0, Math.min(1, (inclusiveCount - exclusiveCount + biases.length) / 10))

    return {
      powerDynamics: hasPowerImbalance ? 'IMBALANCED' : 'NEUTRAL',
      culturalSensitivity: representationScore > 0.7 ? 'HIGH' : representationScore > 0.4 ? 'MODERATE' : 'LOW',
      inclusiveLanguage: representationScore > 0.8 ? 'EXCELLENT' : 
                       representationScore > 0.6 ? 'GOOD' :
                       representationScore > 0.4 ? 'FAIR' : 'POOR',
      representationScore: Math.round(representationScore * 100) / 100
    }
  }

  private generateExplanation(type: BiasType, context: string): string {
    const explanations = {
      GENDER: 'Gender-specific language may exclude non-binary individuals or reinforce gender stereotypes.',
      RELIGION: 'Religious references may indicate bias or favoritism towards certain religious groups.',
      CASTE: 'Caste-based language promotes discrimination and violates constitutional principles of equality.',
      ECONOMIC: 'Economic assumptions may stereotype individuals based on their financial status.',
      REGIONAL: 'Regional stereotypes can promote discrimination and prejudice.',
      AGE: 'Age-based assumptions may lead to discrimination and overlook individual capabilities.',
      POLITICAL: 'Political references may indicate bias and compromise neutrality.'
    }

    return explanations[type] || 'Potential bias detected in the text.'
  }

  private generateSuggestion(type: BiasType, context: string): string {
    const strategies = this.mitigationStrategies.get(type) || []
    return strategies[0] || 'Use more neutral and inclusive language.'
  }

  private generateRecommendations(
    biases: BiasInstance[], 
    languageAnalysis: LanguageAnalysis, 
    contextualAnalysis: ContextualAnalysis
  ): string[] {
    const recommendations: string[] = []

    if (biases.length > 0) {
      recommendations.push('Review and revise language to remove biased terms and assumptions.')
    }

    if (languageAnalysis.emotionalLanguage) {
      recommendations.push('Use more objective and factual language instead of emotional terms.')
    }

    if (languageAnalysis.stereotypicalLanguage) {
      recommendations.push('Avoid stereotypical phrases and generalizations.')
    }

    if (contextualAnalysis.inclusiveLanguage === 'POOR' || contextualAnalysis.inclusiveLanguage === 'FAIR') {
      recommendations.push('Use more inclusive language that represents all individuals fairly.')
    }

    if (contextualAnalysis.powerDynamics === 'IMBALANCED') {
      recommendations.push('Review power dynamics and ensure equitable treatment of all parties.')
    }

    recommendations.push('Consider having the text reviewed by diverse perspectives.')

    return recommendations
  }

  private generateMitigationSuggestions(text: string, biases: BiasInstance[]): MitigationSuggestion[] {
    const suggestions: MitigationSuggestion[] = []

    for (const bias of biases) {
      const strategies = this.mitigationStrategies.get(bias.type) || []
      
      suggestions.push({
        type: bias.type,
        originalText: bias.context,
        suggestedText: this.generateNeutralAlternative(bias.type, bias.context),
        reasoning: this.generateExplanation(bias.type, bias.context),
        priority: bias.severity > 0.4 ? 'HIGH' : bias.severity > 0.2 ? 'MEDIUM' : 'LOW'
      })
    }

    return suggestions
  }

  private generateNeutralAlternative(type: BiasType, context: string): string {
    const alternatives = {
      GENDER: {
        'he': 'they',
        'she': 'they',
        'man': 'person',
        'woman': 'person',
        'male': 'individual',
        'female': 'individual'
      },
      ECONOMIC: {
        'poor': 'person with limited financial resources',
        'rich': 'person with significant financial resources',
        'wealthy': 'financially well-established person'
      },
      AGE: {
        'young': 'person',
        'old': 'person',
        'elderly': 'senior person'
      }
    }

    // Simple replacement logic
    let alternative = context
    const typeAlternatives = alternatives[type] || {}
    
    for (const [original, replacement] of Object.entries(typeAlternatives)) {
      const regex = new RegExp(`\\b${original}\\b`, 'gi')
      alternative = alternative.replace(regex, replacement)
    }

    return alternative
  }

  private calculateOverallBiasScore(biases: BiasInstance[]): number {
    if (biases.length === 0) return 0

    const totalSeverity = biases.reduce((sum, bias) => sum + bias.severity, 0)
    const maxPossibleSeverity = biases.length * 0.5 // Max severity per bias is 0.5
    
    return Math.min(1, totalSeverity / maxPossibleSeverity)
  }

  private calculateConfidenceScore(biases: BiasInstance[], textLength: number): number {
    if (textLength === 0) return 0

    // Confidence increases with more detected patterns and longer text
    const patternConfidence = Math.min(1, biases.length / 5)
    const lengthConfidence = Math.min(1, textLength / 1000)
    
    return Math.round((patternConfidence * 0.7 + lengthConfidence * 0.3) * 100) / 100
  }

  async getBiasReport(analyses: BiasDetectionResult[]): Promise<{
    summary: {
      totalAnalyses: number
      averageBiasScore: number
      highRiskCases: number
      mostCommonBiasType: BiasType
    }
    trends: Array<{
      biasType: BiasType
      frequency: number
      averageSeverity: number
    }>
    recommendations: string[]
  }> {
    const totalAnalyses = analyses.length
    const averageBiasScore = analyses.reduce((sum, analysis) => sum + analysis.overallBiasScore, 0) / totalAnalyses
    const highRiskCases = analyses.filter(analysis => analysis.overallBiasScore > 0.5).length

    // Calculate most common bias type
    const biasFrequency = new Map<BiasType, number>()
    const biasSeverity = new Map<BiasType, number[]>()

    analyses.forEach(analysis => {
      analysis.detectedBiases.forEach(bias => {
        biasFrequency.set(bias.type, (biasFrequency.get(bias.type) || 0) + 1)
        if (!biasSeverity.has(bias.type)) {
          biasSeverity.set(bias.type, [])
        }
        biasSeverity.get(bias.type)!.push(bias.severity)
      })
    })

    const mostCommonBiasType = Array.from(biasFrequency.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'GENDER'

    const trends = Array.from(biasFrequency.entries()).map(([biasType, frequency]) => ({
      biasType,
      frequency,
      averageSeverity: biasSeverity.get(biasType)!.reduce((sum, severity) => sum + severity, 0) / biasSeverity.get(biasType)!.length
    }))

    const recommendations = [
      'Implement regular bias detection training for legal professionals',
      'Establish bias review protocols for important documents',
      'Use inclusive language guidelines in all legal communications',
      'Consider using automated bias detection tools for document review'
    ]

    return {
      summary: {
        totalAnalyses,
        averageBiasScore: Math.round(averageBiasScore * 100) / 100,
        highRiskCases,
        mostCommonBiasType
      },
      trends,
      recommendations
    }
  }
}

// Singleton instance
export const biasDetectionService = new BiasDetectionService()