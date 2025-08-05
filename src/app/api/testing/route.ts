import { NextRequest, NextResponse } from 'next/server'
import { testingService } from '@/lib/services/evaluation/testingService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'runTestSuite':
        return await handleRunTestSuite(data)
      
      case 'runBenchmark':
        return await handleRunBenchmark(data)
      
      case 'generateQualityReport':
        return await handleGenerateQualityReport()
      
      case 'updateIssueStatus':
        return await handleUpdateIssueStatus(data)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Testing service error:', error)
    return NextResponse.json(
      { error: 'Failed to process testing request', details: error.message },
      { status: 500 }
    )
  }
}

async function handleRunTestSuite(data: any) {
  const { testSuiteId } = data

  if (!testSuiteId) {
    return NextResponse.json(
      { error: 'testSuiteId is required' },
      { status: 400 }
    )
  }

  const result = await testingService.runTestSuite(testSuiteId)

  return NextResponse.json({
    success: true,
    result,
    metadata: {
      testSuiteId,
      executionTime: result.executionTime,
      timestamp: result.timestamp
    }
  })
}

async function handleRunBenchmark(data: any) {
  const { category } = data

  if (!category) {
    return NextResponse.json(
      { error: 'category is required' },
      { status: 400 }
    )
  }

  const benchmarkResult = await testingService.runBenchmark(category)

  return NextResponse.json({
    success: true,
    benchmarkResult,
    metadata: {
      category,
      executionTime: Date.now()
    }
  })
}

async function handleGenerateQualityReport() {
  const qualityReport = await testingService.generateQualityReport()

  return NextResponse.json({
    success: true,
    qualityReport,
    metadata: {
      generatedAt: qualityReport.lastUpdated
    }
  })
}

async function handleUpdateIssueStatus(data: any) {
  const { issueId, status } = data

  if (!issueId || !status) {
    return NextResponse.json(
      { error: 'issueId and status are required' },
      { status: 400 }
    )
  }

  // In a real implementation, update the issue status
  // For now, we'll just acknowledge the request
  return NextResponse.json({
    success: true,
    message: `Issue ${issueId} status updated to ${status}`,
    details: { issueId, status }
  })
}

// GET endpoint for retrieving testing data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'testSuites':
        const testSuites = testingService.getTestSuites()
        return NextResponse.json({
          success: true,
          testSuites,
          metadata: {
            total: testSuites.length
          }
        })

      case 'evaluationResults':
        const testSuiteId = searchParams.get('testSuiteId')
        const evaluationResults = testingService.getEvaluationResults(testSuiteId || undefined)
        return NextResponse.json({
          success: true,
          evaluationResults,
          metadata: {
            total: evaluationResults.length,
            testSuiteId
          }
        })

      case 'issues':
        const filters: any = {}
        const severity = searchParams.get('severity')
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const testCaseId = searchParams.get('testCaseId')

        if (severity) filters.severity = severity
        if (type) filters.type = type
        if (status) filters.status = status
        if (testCaseId) filters.testCaseId = testCaseId

        const issues = testingService.getIssues(filters)
        return NextResponse.json({
          success: true,
          issues,
          metadata: {
            total: issues.length,
            filters
          }
        })

      case 'benchmarkResults':
        const category = searchParams.get('category')
        const benchmarkResults = testingService.getBenchmarkResults(category || undefined)
        return NextResponse.json({
          success: true,
          benchmarkResults,
          metadata: {
            total: benchmarkResults.length,
            category
          }
        })

      case 'qualityReport':
        const qualityReport = await testingService.generateQualityReport()
        return NextResponse.json({
          success: true,
          qualityReport,
          metadata: {
            generatedAt: qualityReport.lastUpdated
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('GET testing error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve testing data', details: error.message },
      { status: 500 }
    )
  }
}