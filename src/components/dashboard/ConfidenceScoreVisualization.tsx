'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Shield, 
  Zap,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

interface ConfidenceScoreData {
  overall: number
  breakdown: {
    precedentAnalysis: number
    biasDetection: number
    legalReasoning: number
    riskAssessment: number
    dataQuality: number
  }
  historical: Array<{
    date: string
    score: number
  }>
  factors: Array<{
    name: string
    impact: 'positive' | 'negative' | 'neutral'
    weight: number
    description: string
  }>
}

interface ConfidenceScoreVisualizationProps {
  data: ConfidenceScoreData
  showHistorical?: boolean
  showFactors?: boolean
}

export function ConfidenceScoreVisualization({ 
  data, 
  showHistorical = true, 
  showFactors = true 
}: ConfidenceScoreVisualizationProps) {
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceBgColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500'
    if (score >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.9) return 'Excellent'
    if (score >= 0.8) return 'High'
    if (score >= 0.6) return 'Moderate'
    return 'Low'
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  // Calculate trend from historical data
  const trend = useMemo(() => {
    if (data.historical.length < 2) return 'stable'
    const recent = data.historical.slice(-2)
    const diff = recent[1].score - recent[0].score
    if (diff > 0.05) return 'up'
    if (diff < -0.05) return 'down'
    return 'stable'
  }, [data.historical])

  // Calculate average score
  const averageScore = useMemo(() => {
    return Object.values(data.breakdown).reduce((sum, score) => sum + score, 0) / Object.values(data.breakdown).length
  }, [data.breakdown])

  // Sort factors by impact
  const sortedFactors = useMemo(() => {
    return [...data.factors].sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
  }, [data.factors])

  return (
    <div className="space-y-4">
      {/* Overall Confidence Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Overall Confidence Score
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(trend)}
              <Badge variant="outline" className={getConfidenceColor(data.overall)}>
                {getConfidenceLevel(data.overall)}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getConfidenceColor(data.overall)}`}>
              {Math.round(data.overall * 100)}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Overall confidence in analysis results
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Confidence Level</span>
              <span>{Math.round(data.overall * 100)}%</span>
            </div>
            <Progress value={data.overall * 100} className="h-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(data.breakdown.precedentAnalysis * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Precedents</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((1 - data.breakdown.biasDetection) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Neutrality</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(data.breakdown.legalReasoning * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Reasoning</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(data.breakdown.riskAssessment * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Risk Analysis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Confidence Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="components" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="factors">Influencing Factors</TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="space-y-4">
              <div className="space-y-3">
                {Object.entries(data.breakdown).map(([key, score]) => {
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                  const isNeutral = key === 'biasDetection'
                  const displayScore = isNeutral ? (1 - score) : score
                  const displayLabel = isNeutral ? 'Neutrality Score' : label

                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{displayLabel}</span>
                        <span className={`font-medium ${getConfidenceColor(displayScore)}`}>
                          {Math.round(displayScore * 100)}%
                        </span>
                      </div>
                      <Progress value={displayScore * 100} className="h-2" />
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Weighted Average</span>
                  <span className={getConfidenceColor(averageScore)}>
                    {Math.round(averageScore * 100)}%
                  </span>
                </div>
                <Progress value={averageScore * 100} className="h-3 mt-1" />
              </div>
            </TabsContent>

            <TabsContent value="factors" className="space-y-4">
              <div className="space-y-3">
                {sortedFactors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{factor.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={factor.impact === 'positive' ? 'default' : factor.impact === 'negative' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {factor.impact}
                        </Badge>
                        <span className="text-sm font-medium">
                          {factor.weight > 0 ? '+' : ''}{Math.round(factor.weight * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {factor.description}
                    </p>
                    <Progress 
                      value={Math.abs(factor.weight) * 100} 
                      className="h-1"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Historical Trend */}
      {showHistorical && data.historical.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Historical Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trend Analysis</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(trend)}
                  <span className="text-sm text-muted-foreground">
                    {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {data.historical.slice(-7).map((point, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{new Date(point.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getConfidenceBgColor(point.score)}`}
                          style={{ width: `${point.score * 100}%` }}
                        />
                      </div>
                      <span className={`font-medium ${getConfidenceColor(point.score)} w-12 text-right`}>
                        {Math.round(point.score * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {Math.round(Math.max(...data.historical.map(h => h.score)) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Highest</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(averageScore * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Average</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">
                      {Math.round(Math.min(...data.historical.map(h => h.score)) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Lowest</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Quality Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Strengths</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>High-quality source data</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Comprehensive precedent coverage</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Advanced bias detection algorithms</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Structured legal reasoning framework</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Areas for Improvement</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Expand precedent database</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Enhance regional law coverage</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Improve real-time processing speed</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Add multilingual support</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}