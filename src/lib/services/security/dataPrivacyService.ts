export interface SensitiveDataPattern {
  type: 'PERSONAL_NAME' | 'ADDRESS' | 'PHONE' | 'EMAIL' | 'AADHAR' | 'PAN' | 'FINANCIAL' | 'MEDICAL'
  pattern: RegExp
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  replacement: string
}

export interface AnonymizationResult {
  originalText: string
  anonymizedText: string
  detectedData: Array<{
    type: string
    value: string
    position: {
      start: number
      end: number
    }
    replacement: string
    severity: string
  }>
  anonymizationScore: number
}

export interface SecurityAudit {
  id: string
  timestamp: Date
  userId: string
  action: 'ACCESS' | 'CREATE' | 'UPDATE' | 'DELETE' | 'ANONYMIZE' | 'EXPORT'
  resourceType: 'CASE' | 'DOCUMENT' | 'ANALYSIS' | 'USER_DATA'
  resourceId: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success: boolean
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface AccessControl {
  userId: string
  resource: string
  permissions: ('READ' | 'WRITE' | 'DELETE' | 'SHARE' | 'ANONYMIZE')[]
  role: 'LAWYER' | 'JUDGE' | 'RESEARCHER' | 'ADMIN' | 'CLERK'
  grantedAt: Date
  grantedBy: string
  expiresAt?: Date
}

export class DataPrivacyService {
  private sensitivePatterns: SensitiveDataPattern[]
  private auditLogs: SecurityAudit[] = []
  private accessControls: Map<string, AccessControl[]> = new Map()

  constructor() {
    this.initializeSensitivePatterns()
  }

  private initializeSensitivePatterns(): void {
    this.sensitivePatterns = [
      {
        type: 'PERSONAL_NAME',
        pattern: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
        description: 'Personal names (simple pattern)',
        severity: 'MEDIUM',
        replacement: '[PERSON]'
      },
      {
        type: 'EMAIL',
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        description: 'Email addresses',
        severity: 'HIGH',
        replacement: '[EMAIL]'
      },
      {
        type: 'PHONE',
        pattern: /\b(?:\+91[-\s]?)?[789]\d{9}\b/g,
        description: 'Indian phone numbers',
        severity: 'HIGH',
        replacement: '[PHONE]'
      },
      {
        type: 'AADHAR',
        pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
        description: 'Aadhar card numbers',
        severity: 'HIGH',
        replacement: '[AADHAR]'
      },
      {
        type: 'PAN',
        pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
        description: 'PAN card numbers',
        severity: 'HIGH',
        replacement: '[PAN]'
      },
      {
        type: 'ADDRESS',
        pattern: /\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Society|Colony|Nagar|Vihar|Enclave)\b/gi,
        description: 'Street addresses',
        severity: 'MEDIUM',
        replacement: '[ADDRESS]'
      },
      {
        type: 'FINANCIAL',
        pattern: /\b(?:₹|Rs\.?|INR)\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b/g,
        description: 'Financial amounts in Indian Rupees',
        severity: 'MEDIUM',
        replacement: '[AMOUNT]'
      },
      {
        type: 'MEDICAL',
        pattern: /\b(?:diabetes|hypertension|cancer|depression|anxiety|HIV|AIDS|COVID|corona)\b/gi,
        description: 'Medical conditions',
        severity: 'HIGH',
        replacement: '[MEDICAL]'
      }
    ]
  }

  async anonymizeDocument(text: string, options: {
    includePatterns?: string[]
    excludePatterns?: string[]
    preserveContext?: boolean
  } = {}): Promise<AnonymizationResult> {
    const {
      includePatterns,
      excludePatterns = [],
      preserveContext = true
    } = options

    let anonymizedText = text
    const detectedData: AnonymizationResult['detectedData'] = []
    const patternsToUse = includePatterns 
      ? this.sensitivePatterns.filter(p => includePatterns.includes(p.type))
      : this.sensitivePatterns.filter(p => !excludePatterns.includes(p.type))

    // Sort patterns by severity (HIGH first) to handle overlapping matches
    patternsToUse.sort((a, b) => {
      const severityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })

    for (const pattern of patternsToUse) {
      let match
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags)
      
      while ((match = regex.exec(text)) !== null) {
        const replacement = preserveContext 
          ? this.generateContextualReplacement(match[0], pattern.type)
          : pattern.replacement

        detectedData.push({
          type: pattern.type,
          value: match[0],
          position: {
            start: match.index,
            end: match.index + match[0].length
          },
          replacement,
          severity: pattern.severity
        })

        // Replace in anonymized text (adjusting for previous replacements)
        const beforeText = anonymizedText.substring(0, match.index)
        const afterText = anonymizedText.substring(match.index + match[0].length)
        anonymizedText = beforeText + replacement + afterText
      }
    }

    // Calculate anonymization score
    const sensitiveCharCount = detectedData.reduce((sum, data) => sum + (data.position.end - data.position.start), 0)
    const anonymizationScore = text.length > 0 ? Math.min(1, sensitiveCharCount / text.length) : 0

    const result: AnonymizationResult = {
      originalText: text,
      anonymizedText,
      detectedData,
      anonymizationScore: Math.round(anonymizationScore * 100) / 100
    }

    // Log the anonymization action
    await this.logSecurityAudit({
      action: 'ANONYMIZE',
      resourceType: 'DOCUMENT',
      resourceId: 'unknown',
      details: {
        textLength: text.length,
        detectedItems: detectedData.length,
        anonymizationScore: result.anonymizationScore,
        patternsUsed: patternsToUse.map(p => p.type)
      },
      success: true,
      riskLevel: this.calculateRiskLevel(result)
    })

    return result
  }

  private generateContextualReplacement(original: string, type: string): string {
    const contextMap: Record<string, string> = {
      'PERSONAL_NAME': this.getRandomName(),
      'EMAIL': `user${Math.floor(Math.random() * 1000)}@example.com`,
      'PHONE': `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      'AADHAR': `${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
      'PAN': `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(Math.random() * 10)}`,
      'ADDRESS': `${Math.floor(Math.random() * 999) + 1} Main Street`,
      'FINANCIAL': `₹${Math.floor(Math.random() * 100000)}`,
      'MEDICAL': '[MEDICAL_CONDITION]'
    }

    return contextMap[type] || `[${type}]`
  }

  private getRandomName(): string {
    const firstNames = ['Rahul', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anjali', 'Rajesh', 'Meena']
    const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Gupta', 'Kumar', 'Devi']
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
  }

  private calculateRiskLevel(result: AnonymizationResult): 'LOW' | 'MEDIUM' | 'HIGH' {
    const highSeverityItems = result.detectedData.filter(d => d.severity === 'HIGH').length
    const mediumSeverityItems = result.detectedData.filter(d => d.severity === 'MEDIUM').length

    if (highSeverityItems > 2 || result.anonymizationScore > 0.3) {
      return 'HIGH'
    } else if (highSeverityItems > 0 || mediumSeverityItems > 3 || result.anonymizationScore > 0.1) {
      return 'MEDIUM'
    } else {
      return 'LOW'
    }
  }

  async checkPermissions(userId: string, resource: string, permission: string): Promise<boolean> {
    const userAccessControls = this.accessControls.get(userId) || []
    
    return userAccessControls.some(control => 
      control.resource === resource && 
      control.permissions.includes(permission as any) &&
      (!control.expiresAt || control.expiresAt > new Date())
    )
  }

  async grantAccess(accessControl: Omit<AccessControl, 'grantedAt'>): Promise<void> {
    const fullAccessControl: AccessControl = {
      ...accessControl,
      grantedAt: new Date()
    }

    if (!this.accessControls.has(accessControl.userId)) {
      this.accessControls.set(accessControl.userId, [])
    }

    this.accessControls.get(accessControl.userId)!.push(fullAccessControl)

    await this.logSecurityAudit({
      action: 'CREATE',
      resourceType: 'USER_DATA',
      resourceId: accessControl.userId,
      details: {
        targetResource: accessControl.resource,
        permissions: accessControl.permissions,
        role: accessControl.role,
        expiresAt: accessControl.expiresAt
      },
      success: true,
      riskLevel: 'MEDIUM'
    })
  }

  async revokeAccess(userId: string, resource: string): Promise<void> {
    const userAccessControls = this.accessControls.get(userId) || []
    const initialLength = userAccessControls.length
    
    const filteredControls = userAccessControls.filter(control => control.resource !== resource)
    
    if (filteredControls.length < initialLength) {
      this.accessControls.set(userId, filteredControls)
      
      await this.logSecurityAudit({
        action: 'DELETE',
        resourceType: 'USER_DATA',
        resourceId: userId,
        details: {
          targetResource: resource,
          accessRevoked: true
        },
        success: true,
        riskLevel: 'LOW'
      })
    }
  }

  async encryptSensitiveData(data: string, encryptionKey: string): Promise<string> {
    // In a real implementation, use proper encryption like AES-256
    // This is a simple placeholder implementation
    const encoded = btoa(data)
    const encrypted = encoded.split('').map((char, index) => 
      String.fromCharCode(char.charCodeAt(0) ^ encryptionKey.charCodeAt(index % encryptionKey.length))
    ).join('')
    
    return btoa(encrypted)
  }

  async decryptSensitiveData(encryptedData: string, encryptionKey: string): Promise<string> {
    // In a real implementation, use proper decryption
    const decoded = atob(encryptedData)
    const decrypted = decoded.split('').map((char, index) => 
      String.fromCharCode(char.charCodeAt(0) ^ encryptionKey.charCodeAt(index % encryptionKey.length))
    ).join('')
    
    return atob(decrypted)
  }

  async logSecurityAudit(audit: Omit<SecurityAudit, 'id' | 'timestamp'>): Promise<void> {
    const fullAudit: SecurityAudit = {
      ...audit,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    this.auditLogs.push(fullAudit)

    // Keep only last 1000 audit logs in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000)
    }

    console.log('Security Audit:', fullAudit)
  }

  async getAuditLogs(filters?: {
    userId?: string
    action?: string
    resourceType?: string
    startDate?: Date
    endDate?: Date
    riskLevel?: string
  }): Promise<SecurityAudit[]> {
    let filteredLogs = [...this.auditLogs]

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action)
      }
      if (filters.resourceType) {
        filteredLogs = filteredLogs.filter(log => log.resourceType === filters.resourceType)
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!)
      }
      if (filters.riskLevel) {
        filteredLogs = filteredLogs.filter(log => log.riskLevel === filters.riskLevel)
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  async generatePrivacyReport(documentId: string): Promise<{
    documentId: string
    scanTimestamp: Date
    sensitiveDataFound: number
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    dataTypes: Record<string, number>
    recommendations: string[]
    complianceScore: number
  }> {
    // Mock implementation - in real scenario, this would scan the actual document
    const mockDataTypes = {
      'PERSONAL_NAME': 2,
      'EMAIL': 1,
      'PHONE': 1,
      'ADDRESS': 1
    }

    const totalItems = Object.values(mockDataTypes).reduce((sum, count) => sum + count, 0)
    const riskLevel = totalItems > 3 ? 'HIGH' : totalItems > 1 ? 'MEDIUM' : 'LOW'
    
    const complianceScore = Math.max(0, 100 - (totalItems * 15))

    const recommendations = [
      'Anonymize personal identifiers before sharing',
      'Implement role-based access control',
      'Encrypt sensitive data at rest',
      'Regular security audits recommended'
    ]

    return {
      documentId,
      scanTimestamp: new Date(),
      sensitiveDataFound: totalItems,
      riskLevel,
      dataTypes: mockDataTypes,
      recommendations,
      complianceScore
    }
  }

  async dataRetentionCleanup(retentionDays: number = 90): Promise<{
    cleanedItems: number
    cleanedSize: number
    errors: string[]
  }> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const oldLogs = this.auditLogs.filter(log => log.timestamp < cutoffDate)
    const cleanedItems = oldLogs.length
    
    // Remove old audit logs
    this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffDate)

    // Clean up expired access controls
    let expiredControls = 0
    for (const [userId, controls] of this.accessControls.entries()) {
      const validControls = controls.filter(control => 
        !control.expiresAt || control.expiresAt > cutoffDate
      )
      
      expiredControls += controls.length - validControls.length
      
      if (validControls.length === 0) {
        this.accessControls.delete(userId)
      } else {
        this.accessControls.set(userId, validControls)
      }
    }

    return {
      cleanedItems: cleanedItems + expiredControls,
      cleanedSize: cleanedItems * 1024, // Estimated size
      errors: []
    }
  }

  async validateCompliance(): Promise<{
    overallScore: number
    categories: {
      dataProtection: number
      accessControl: number
      auditTrail: number
      retentionPolicy: number
    }
    issues: Array<{
      category: string
      severity: 'LOW' | 'MEDIUM' | 'HIGH'
      description: string
      recommendation: string
    }>
    lastAssessment: Date
  }> {
    // Mock compliance validation
    const categories = {
      dataProtection: 85,
      accessControl: 92,
      auditTrail: 78,
      retentionPolicy: 88
    }

    const overallScore = Object.values(categories).reduce((sum, score) => sum + score, 0) / Object.values(categories).length

    const issues = [
      {
        category: 'Audit Trail',
        severity: 'MEDIUM' as const,
        description: 'Some audit logs may be incomplete',
        recommendation: 'Implement comprehensive audit logging for all data access'
      },
      {
        category: 'Data Protection',
        severity: 'LOW' as const,
        description: 'Data encryption could be enhanced',
        recommendation: 'Upgrade to AES-256 encryption for sensitive data'
      }
    ]

    return {
      overallScore: Math.round(overallScore),
      categories,
      issues,
      lastAssessment: new Date()
    }
  }
}

// Singleton instance
export const dataPrivacyService = new DataPrivacyService()