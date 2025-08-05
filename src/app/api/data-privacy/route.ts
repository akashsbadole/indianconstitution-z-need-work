import { NextRequest, NextResponse } from 'next/server'
import { dataPrivacyService } from '@/lib/services/security/dataPrivacyService'

interface AnonymizeRequest {
  text: string
  options?: {
    includePatterns?: string[]
    excludePatterns?: string[]
    preserveContext?: boolean
  }
}

interface AccessControlRequest {
  userId: string
  resource: string
  permissions: string[]
  role: string
  expiresAt?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'anonymize':
        return await handleAnonymize(data as AnonymizeRequest)
      
      case 'grantAccess':
        return await handleGrantAccess(data as AccessControlRequest)
      
      case 'revokeAccess':
        return await handleRevokeAccess(data)
      
      case 'checkPermissions':
        return await handleCheckPermissions(data)
      
      case 'encrypt':
        return await handleEncrypt(data)
      
      case 'decrypt':
        return await handleDecrypt(data)
      
      case 'privacyReport':
        return await handlePrivacyReport(data)
      
      case 'complianceCheck':
        return await handleComplianceCheck()
      
      case 'cleanup':
        return await handleCleanup(data)
      
      case 'auditLogs':
        return await handleAuditLogs(data)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Data privacy service error:', error)
    return NextResponse.json(
      { error: 'Failed to process data privacy request', details: error.message },
      { status: 500 }
    )
  }
}

async function handleAnonymize(data: AnonymizeRequest) {
  const { text, options = {} } = data

  if (!text) {
    return NextResponse.json(
      { error: 'Text is required for anonymization' },
      { status: 400 }
    )
  }

  const result = await dataPrivacyService.anonymizeDocument(text, options)

  return NextResponse.json({
    success: true,
    result,
    metadata: {
      originalLength: text.length,
      anonymizedLength: result.anonymizedText.length,
      detectedItems: result.detectedData.length,
      processingTime: Date.now()
    }
  })
}

async function handleGrantAccess(data: AccessControlRequest) {
  const { userId, resource, permissions, role, expiresAt } = data

  if (!userId || !resource || !permissions || !role) {
    return NextResponse.json(
      { error: 'userId, resource, permissions, and role are required' },
      { status: 400 }
    )
  }

  await dataPrivacyService.grantAccess({
    userId,
    resource,
    permissions: permissions as any,
    role: role as any,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined
  })

  return NextResponse.json({
    success: true,
    message: 'Access granted successfully',
    details: {
      userId,
      resource,
      permissions,
      role,
      expiresAt
    }
  })
}

async function handleRevokeAccess(data: any) {
  const { userId, resource } = data

  if (!userId || !resource) {
    return NextResponse.json(
      { error: 'userId and resource are required' },
      { status: 400 }
    )
  }

  await dataPrivacyService.revokeAccess(userId, resource)

  return NextResponse.json({
    success: true,
    message: 'Access revoked successfully',
    details: { userId, resource }
  })
}

async function handleCheckPermissions(data: any) {
  const { userId, resource, permission } = data

  if (!userId || !resource || !permission) {
    return NextResponse.json(
      { error: 'userId, resource, and permission are required' },
      { status: 400 }
    )
  }

  const hasPermission = await dataPrivacyService.checkPermissions(userId, resource, permission)

  return NextResponse.json({
    success: true,
    hasPermission,
    details: { userId, resource, permission }
  })
}

async function handleEncrypt(data: any) {
  const { text, encryptionKey } = data

  if (!text || !encryptionKey) {
    return NextResponse.json(
      { error: 'text and encryptionKey are required' },
      { status: 400 }
    )
  }

  const encrypted = await dataPrivacyService.encryptSensitiveData(text, encryptionKey)

  return NextResponse.json({
    success: true,
    encrypted,
    metadata: {
      originalLength: text.length,
      encryptedLength: encrypted.length
    }
  })
}

async function handleDecrypt(data: any) {
  const { encryptedData, encryptionKey } = data

  if (!encryptedData || !encryptionKey) {
    return NextResponse.json(
      { error: 'encryptedData and encryptionKey are required' },
      { status: 400 }
    )
  }

  const decrypted = await dataPrivacyService.decryptSensitiveData(encryptedData, encryptionKey)

  return NextResponse.json({
    success: true,
    decrypted,
    metadata: {
      encryptedLength: encryptedData.length,
      decryptedLength: decrypted.length
    }
  })
}

async function handlePrivacyReport(data: any) {
  const { documentId } = data

  if (!documentId) {
    return NextResponse.json(
      { error: 'documentId is required' },
      { status: 400 }
    )
  }

  const report = await dataPrivacyService.generatePrivacyReport(documentId)

  return NextResponse.json({
    success: true,
    report
  })
}

async function handleComplianceCheck() {
  const compliance = await dataPrivacyService.validateCompliance()

  return NextResponse.json({
    success: true,
    compliance
  })
}

async function handleCleanup(data: any) {
  const { retentionDays = 90 } = data

  const result = await dataPrivacyService.dataRetentionCleanup(retentionDays)

  return NextResponse.json({
    success: true,
    result
  })
}

async function handleAuditLogs(data: any) {
  const filters = data.filters || {}
  
  // Convert date strings to Date objects
  if (filters.startDate) {
    filters.startDate = new Date(filters.startDate)
  }
  if (filters.endDate) {
    filters.endDate = new Date(filters.endDate)
  }

  const auditLogs = await dataPrivacyService.getAuditLogs(filters)

  return NextResponse.json({
    success: true,
    auditLogs,
    metadata: {
      totalLogs: auditLogs.length,
      filters
    }
  })
}

// GET endpoint for quick anonymization
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const text = searchParams.get('text')

    if (action === 'anonymize' && text) {
      const result = await dataPrivacyService.anonymizeDocument(text)
      
      return NextResponse.json({
        success: true,
        result
      })
    }

    if (action === 'compliance') {
      const compliance = await dataPrivacyService.validateCompliance()
      
      return NextResponse.json({
        success: true,
        compliance
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('GET data privacy error:', error)
    return NextResponse.json(
      { error: 'Failed to process data privacy request', details: error.message },
      { status: 500 }
    )
  }
}