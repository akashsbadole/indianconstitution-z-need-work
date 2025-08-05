'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  Brain, 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Eye,
  RefreshCw
} from 'lucide-react'

interface AnalysisStep {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  progress: number
  startTime?: Date
  endTime?: Date
  confidence?: number
  details?: string
}

interface AnalysisResult {
  id: string
  caseTitle: string
  overallConfidence: number
  biasScore: number
  precedentMatches: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'analyzing' | 'completed' | 'failed'
  steps: AnalysisStep[]
  timestamp: Date
  processingTime: number
}

interface RealTimeAnalysisDashboardProps {
  analysisId?: string
  autoRefresh?: boolean
  onAnalysisComplete?: (result: AnalysisResult) => void
}

export function RealTimeAnalysisDashboard({ 
  analysisId, 
  autoRefresh = true, 
  onAnalysisComplete 
}: RealTimeAnalysisDashboardProps) {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // Mock analysis steps
  const mockSteps: AnalysisStep[] = [
    {
      id: '1',
      name: 'Document Processing',
      status: 'pending',
      progress: 0
    },
    {
      id: '2',
      name: 'Bias Detection',
      status: 'pending',
      progress: 0
    },
    {
      id: '3',
      name: 'Precedent Matching',
      status: 'pending',
      progress: 0
    },
    {
      id: '4',
      name: 'Legal Reasoning',
      status: 'pending',
      progress: 0
    },
    {
      id: '5',
      name: 'Risk Assessment',
      status: 'pending',
      progress: 0
    },
    {
      id: '6',
      name: 'Final Analysis',
      status: 'pending',
      progress: 0
    }
  ]

  useEffect(() => {
    if (autoRefresh) {
      startLiveAnalysis()
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [autoRefresh])

  const startLiveAnalysis = () => {
    setIsLive(true)
    
    // Initialize new analysis
    const newAnalysis: AnalysisResult = {
      id: analysisId || `analysis-${Date.now()}`,
      caseTitle: 'Sample Legal Case',
      overallConfidence: 0,
      biasScore: 0,
      precedentMatches: 0,
      riskLevel: 'LOW',
      status: 'analyzing',
      steps: mockSteps,
      timestamp: new Date(),
      processingTime: 0
    }

    setCurrentAnalysis(newAnalysis)

    // Simulate real-time analysis progress
    let currentStep = 0
    const interval = setInterval(() => {
      setCurrentAnalysis(prev => {
        if (!prev) return prev

        const updatedSteps = [...prev.steps]
        let allCompleted = true
        let totalProgress = 0
        let totalConfidence = 0
        let confidenceCount = 0

        // Update current step
        if (currentStep < updatedSteps.length) {
          const step = updatedSteps[currentStep]
          if (step.status === 'pending') {
            step.status = 'in_progress'
            step.startTime = new Date()
          }

          // Progress current step
          if (step.status === 'in_progress') {
            step.progress = Math.min(100, step.progress + Math.random() * 20)
            
            if (step.progress >= 100) {
              step.status = 'completed'
              step.endTime = new Date()
              step.confidence = 0.7 + Math.random() * 0.3 // Random confidence 70-100%
              currentStep++
            }
          }
        }

        // Calculate overall metrics
        updatedSteps.forEach(step => {
          totalProgress += step.progress
          if (step.confidence) {
            totalConfidence += step.confidence
            confidenceCount++
          }
          if (step.status !== 'completed') {
            allCompleted = false
          }
        })

        const overallProgress = totalProgress / updatedSteps.length
        const overallConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0

        // Update analysis result
        const updatedAnalysis: AnalysisResult = {
          ...prev,
          overallConfidence: Math.round(overallConfidence * 100) / 100,
          biasScore: Math.max(0, Math.round((1 - overallConfidence) * 100) / 100),
          precedentMatches: Math.floor(Math.random() * 15) + 5,
          riskLevel: overallConfidence > 0.8 ? 'LOW' : overallConfidence > 0.6 ? 'MEDIUM' : 'HIGH',
          processingTime: Date.now() - prev.timestamp.getTime(),
          steps: updatedSteps
        }

        // Check if analysis is complete
        if (allCompleted) {
          updatedAnalysis.status = 'completed'
          clearInterval(interval)
          setIsLive(false)
          onAnalysisComplete?.(updatedAnalysis)
        }

        return updatedAnalysis
      })
    }, 800)

    setRefreshInterval(interval)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'in_progress':
        return 'text-blue-600 bg-blue-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-green-600 bg-green-50'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50'
      case 'HIGH':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-Time Analysis Dashboard
              </CardTitle>
              <CardDescription>
                Live monitoring of AI-powered legal analysis progress
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isLive ? 'default' : 'secondary'} className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {isLive ? 'LIVE' : 'OFFLINE'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={startLiveAnalysis}
                disabled={isLive}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Start Analysis
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {currentAnalysis && (
        <>
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Analysis Progress
                </span>
                <Badge variant="outline" className={getRiskColor(currentAnalysis.riskLevel)}>
                  {currentAnalysis.riskLevel} RISK
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((currentAnalysis.steps.reduce((sum, step) => sum + step.progress, 0) / currentAnalysis.steps.length))}%
                  </div>
                  <p className="text-xs text-muted-foreground">Overall Progress</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(currentAnalysis.overallConfidence * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Confidence Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentAnalysis.precedentMatches}
                  </div>
                  <p className="text-xs text-muted-foreground">Precedents Found</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(currentAnalysis.biasScore * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Bias Detected</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Analysis Progress</span>
                  <span>{formatTime(currentAnalysis.processingTime)}</span>
                </div>
                <Progress 
                  value={currentAnalysis.steps.reduce((sum, step) => sum + step.progress, 0) / currentAnalysis.steps.length} 
                  className="w-full" 
                />
              </div>

              {currentAnalysis.status === 'completed' && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    Analysis completed successfully! Overall confidence: {Math.round(currentAnalysis.overallConfidence * 100)}%
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Detailed Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Analysis Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {currentAnalysis.steps.map((step, index) => (
                    <Card key={step.id} className="border-l-4 border-l-transparent">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(step.status)}
                            <span className="font-medium">{step.name}</span>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(step.status)}`}>
                              {step.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          {step.confidence && (
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(step.confidence * 100)}% confidence
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(step.progress)}%</span>
                          </div>
                          <Progress value={step.progress} className="h-2" />
                        </div>

                        {step.startTime && (
                          <div className="text-xs text-muted-foreground">
                            Started: {step.startTime.toLocaleTimeString()}
                            {step.endTime && ` • Completed: ${step.endTime.toLocaleTimeString()}`}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Analysis Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analysis Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="confidence">Confidence</TabsTrigger>
                  <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Analysis Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Processing Time:</span>
                          <span>{formatTime(currentAnalysis.processingTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Steps Completed:</span>
                          <span>{currentAnalysis.steps.filter(s => s.status === 'completed').length}/{currentAnalysis.steps.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precedents Matched:</span>
                          <span>{currentAnalysis.precedentMatches}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bias Level:</span>
                          <span>{Math.round(currentAnalysis.biasScore * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Quality Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Data Quality:</span>
                          <span className="text-green-600">Excellent</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Analysis Depth:</span>
                          <span className="text-blue-600">Comprehensive</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Source Reliability:</span>
                          <span className="text-green-600">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Validation Score:</span>
                          <span className="text-blue-600">92%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="confidence" className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Confidence Breakdown</h4>
                    {currentAnalysis.steps
                      .filter(step => step.confidence)
                      .map((step) => (
                        <div key={step.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{step.name}</span>
                            <span className="font-medium">{Math.round((step.confidence || 0) * 100)}%</span>
                          </div>
                          <Progress value={(step.confidence || 0) * 100} className="h-2" />
                        </div>
                      ))}
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Confidence Factors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>High-quality source data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Comprehensive precedent coverage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Advanced bias detection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Structured legal reasoning</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="risk" className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Risk Assessment</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(currentAnalysis.riskLevel)}>
                        {currentAnalysis.riskLevel} RISK
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Overall risk level based on analysis confidence and bias detection
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Risk Factors</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span>Bias detection score: {Math.round(currentAnalysis.biasScore * 100)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span>Limited precedent matches in some areas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span>Complex legal issues identified</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Mitigation Strategies</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span>Manual review recommended</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span>Additional research suggested</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span>Expert consultation advised</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {!currentAnalysis && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Analysis</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Start a new analysis to see real-time progress and detailed metrics
            </p>
            <Button onClick={startLiveAnalysis}>
              <Brain className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}