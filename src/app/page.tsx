'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Search, 
  Scale, 
  Brain, 
  Shield, 
  Clock, 
  TrendingUp,
  Users,
  Gavel,
  BookOpen
} from 'lucide-react'
import { PrecedentBrowser } from '@/components/precedent-browser/PrecedentBrowser'
import { SimilarityVisualization } from '@/components/precedent-browser/SimilarityVisualization'
import { RealTimeAnalysisDashboard } from '@/components/dashboard/RealTimeAnalysisDashboard'
import { ConfidenceScoreVisualization } from '@/components/dashboard/ConfidenceScoreVisualization'
import { ConstitutionSearch } from '@/components/constitution-search/ConstitutionSearch'

export default function Home() {
  const [caseData, setCaseData] = useState({
    title: '',
    description: '',
    facts: '',
    legalIssues: '',
    caseType: '',
    priority: '1'
  })
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [precedentSearchQuery, setPrecedentSearchQuery] = useState('')
  const [constitutionSearchQuery, setConstitutionSearchQuery] = useState('')
  const [selectedPrecedentForSimilarity, setSelectedPrecedentForSimilarity] = useState<any>(null)
  const [showAnalysisDashboard, setShowAnalysisDashboard] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  // Mock data for similarity visualization
  const mockSimilarPrecedents = [
    {
      id: '2',
      title: 'Maneka Gandhi v. Union of India',
      citation: 'AIR 1978 SC 597',
      similarity: 0.85,
      category: 'Constitutional Law',
      year: 1978
    },
    {
      id: '3',
      title: 'Vishakha v. State of Rajasthan',
      citation: 'AIR 1997 SC 3011',
      similarity: 0.72,
      category: 'Labor Law',
      year: 1997
    },
    {
      id: '4',
      title: 'Shreya Singhal v. Union of India',
      citation: 'AIR 2015 SC 1523',
      similarity: 0.68,
      category: 'Cyber Law',
      year: 2015
    },
    {
      id: '5',
      title: 'Naz Foundation v. Government of NCT of Delhi',
      citation: '160 (2009) DLT 277',
      similarity: 0.61,
      category: 'Human Rights',
      year: 2009
    }
  ]

  const handleInputChange = (field: string, value: string) => {
    setCaseData(prev => ({ ...prev, [field]: value }))
  }

  const handleQuickAction = async (analysisType: string) => {
    if (!caseData.facts) {
      alert('Please enter case facts first before running analysis')
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 15
        })
      }, 150)

      const response = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseData: {
            ...caseData,
            type: caseData.caseType
          },
          analysisType: analysisType.toUpperCase()
        })
      })

      clearInterval(progressInterval)
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      
      setAnalysisProgress(100)
      
      console.log(`${analysisType} analysis result:`, result.analysisResult)
      
      setTimeout(() => {
        alert(`${analysisType} analysis completed successfully!`)
        setIsAnalyzing(false)
        setAnalysisProgress(0)
      }, 1000)

    } catch (error) {
      console.error('Analysis error:', error)
      alert(`Failed to perform ${analysisType} analysis. Please try again.`)
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const handlePrecedentSearch = async () => {
    if (!precedentSearchQuery.trim()) {
      alert('Please enter a search query')
      return
    }

    try {
      const response = await fetch('/api/search-precedents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: precedentSearchQuery,
          caseType: caseData.caseType,
          limit: 10,
          searchType: 'SEMANTIC'
        })
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const result = await response.json()
      console.log('Precedent search results:', result.precedents)
      
      alert(`Found ${result.precedents.length} relevant precedents!`)

    } catch (error) {
      console.error('Precedent search error:', error)
      alert('Failed to search precedents. Please try again.')
    }
  }

  const handlePrecedentSelect = (precedent: any) => {
    console.log('Selected precedent:', precedent)
    setSelectedPrecedentForSimilarity(precedent)
  }

  const handleSimilarityPrecedentSelect = (precedent: any) => {
    console.log('Selected similar precedent:', precedent)
    alert(`Selected: ${precedent.title}`)
  }

  const handleSubmitCase = async () => {
    if (!caseData.title || !caseData.facts) {
      alert('Please fill in the required fields')
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseData: {
            ...caseData,
            type: caseData.caseType
          },
          analysisType: 'COMPREHENSIVE'
        })
      })

      clearInterval(progressInterval)
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      
      setAnalysisProgress(100)
      
      // Store the analysis result for display
      console.log('Analysis result:', result.analysisResult)
      
      // Show success message
      setTimeout(() => {
        alert('Case analysis completed successfully!')
        setIsAnalyzing(false)
        setAnalysisProgress(0)
        
        // Reset form
        setCaseData({
          title: '',
          description: '',
          facts: '',
          legalIssues: '',
          caseType: '',
          priority: '1'
        })
      }, 1000)

    } catch (error) {
      console.error('Analysis error:', error)
      alert('Failed to analyze case. Please try again.')
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const recentCases = [
    { id: 1, title: 'Property Dispute Case', type: 'Civil', status: 'Analyzed', date: '2024-01-15' },
    { id: 2, title: 'Contract Breach', type: 'Commercial', status: 'Pending', date: '2024-01-14' },
    { id: 3, title: 'Criminal Appeal', type: 'Criminal', status: 'Under Review', date: '2024-01-13' },
  ]

  const analysisStats = {
    totalCases: 156,
    analyzedToday: 12,
    avgConfidence: 87,
    biasDetected: 3
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Gavel className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Judicial System</h1>
                <p className="text-sm text-muted-foreground">Intelligent Legal Analysis Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Beta</Badge>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="new-case">New Case</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="precedents">Precedents</TabsTrigger>
            <TabsTrigger value="constitution">Constitution</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysisStats.totalCases}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Analyzed Today</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysisStats.analyzedToday}</div>
                  <p className="text-xs text-muted-foreground">+3 from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysisStats.avgConfidence}%</div>
                  <p className="text-xs text-muted-foreground">+2% improvement</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bias Detected</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysisStats.biasDetected}</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Cases</CardTitle>
                  <CardDescription>Latest cases submitted for analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCases.map((case_item) => (
                      <div key={case_item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{case_item.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{case_item.type}</Badge>
                            <Badge 
                              variant={case_item.status === 'Analyzed' ? 'default' : 
                                      case_item.status === 'Pending' ? 'outline' : 'secondary'}
                            >
                              {case_item.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{case_item.date}</p>
                          <Button variant="ghost" size="sm">
                            <Search className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common analysis tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleQuickAction('precedent_analysis')}
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    Precedent Analysis
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleQuickAction('legal_reasoning')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Legal Reasoning
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleQuickAction('bias_detection')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Bias Detection
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handlePrecedentSearch}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Law Research
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Case Tab */}
          <TabsContent value="new-case" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit New Case for Analysis</CardTitle>
                <CardDescription>
                  Enter case details to begin AI-powered legal analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Case Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter case title"
                      value={caseData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="caseType">Case Type</Label>
                    <Select value={caseData.caseType} onValueChange={(value) => handleInputChange('caseType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select case type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="civil">Civil</SelectItem>
                        <SelectItem value="criminal">Criminal</SelectItem>
                        <SelectItem value="constitutional">Constitutional</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="property">Property</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Case Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the case"
                    value={caseData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facts">Case Facts *</Label>
                  <Textarea
                    id="facts"
                    placeholder="Detailed facts of the case"
                    value={caseData.facts}
                    onChange={(e) => handleInputChange('facts', e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalIssues">Legal Issues</Label>
                  <Textarea
                    id="legalIssues"
                    placeholder="Specific legal issues to be addressed"
                    value={caseData.legalIssues}
                    onChange={(e) => handleInputChange('legalIssues', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={caseData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Low Priority</SelectItem>
                      <SelectItem value="2">Medium Priority</SelectItem>
                      <SelectItem value="3">High Priority</SelectItem>
                      <SelectItem value="4">Urgent</SelectItem>
                      <SelectItem value="5">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <Label>Analysis Progress</Label>
                    <Progress value={analysisProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      {analysisProgress < 100 ? 'Analyzing case...' : 'Analysis complete!'}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" disabled={isAnalyzing}>
                    Save Draft
                  </Button>
                  <Button onClick={handleSubmitCase} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {!showAnalysisDashboard ? (
              <Card>
                <CardHeader>
                  <CardTitle>Case Analysis Results</CardTitle>
                  <CardDescription>
                    View detailed analysis results and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>
                      Submit a case first to view analysis results. The AI will provide precedent matching, 
                      bias detection, legal reasoning, and confidence scores.
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => setShowAnalysisDashboard(true)}>
                      <Brain className="w-4 h-4 mr-2" />
                      View Sample Analysis Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <RealTimeAnalysisDashboard 
                  onAnalysisComplete={(result) => {
                    setAnalysisResults(result)
                    console.log('Analysis completed:', result)
                  }}
                />
                
                {analysisResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Confidence Score Analysis</CardTitle>
                      <CardDescription>
                        Detailed breakdown of confidence scores and quality metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ConfidenceScoreVisualization 
                        data={{
                          overall: analysisResults.overallConfidence,
                          breakdown: {
                            precedentAnalysis: 0.85,
                            biasDetection: 1 - analysisResults.biasScore,
                            legalReasoning: 0.88,
                            riskAssessment: 0.82,
                            dataQuality: 0.90
                          },
                          historical: [
                            { date: '2024-01-15', score: 0.75 },
                            { date: '2024-01-16', score: 0.78 },
                            { date: '2024-01-17', score: 0.82 },
                            { date: '2024-01-18', score: 0.85 },
                            { date: '2024-01-19', score: analysisResults.overallConfidence }
                          ],
                          factors: [
                            {
                              name: 'Precedent Coverage',
                              impact: 'positive',
                              weight: 0.15,
                              description: 'Comprehensive precedent database coverage'
                            },
                            {
                              name: 'Data Quality',
                              impact: 'positive',
                              weight: 0.12,
                              description: 'High-quality input data and sources'
                            },
                            {
                              name: 'Bias Detection',
                              impact: analysisResults.biasScore > 0.3 ? 'negative' : 'positive',
                              weight: analysisResults.biasScore > 0.3 ? -0.08 : 0.05,
                              description: `Bias score: ${Math.round(analysisResults.biasScore * 100)}%`
                            },
                            {
                              name: 'Legal Reasoning',
                              impact: 'positive',
                              weight: 0.18,
                              description: 'Structured and logical legal reasoning'
                            }
                          ]
                        }}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Precedents Tab */}
          <TabsContent value="precedents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal Precedents Database</CardTitle>
                <CardDescription>
                  Browse and search through legal precedents and case law with similarity visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <Input 
                      placeholder="Search precedents..." 
                      className="flex-1" 
                      value={precedentSearchQuery}
                      onChange={(e) => setPrecedentSearchQuery(e.target.value)}
                    />
                    <Button onClick={handlePrecedentSearch}>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  
                  <PrecedentBrowser 
                    onPrecedentSelect={handlePrecedentSelect}
                    showSimilarity={true}
                    maxHeight="500px"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Similarity Visualization */}
            {selectedPrecedentForSimilarity && (
              <Card>
                <CardHeader>
                  <CardTitle>Similarity Analysis</CardTitle>
                  <CardDescription>
                    Visual analysis of precedents similar to "{selectedPrecedentForSimilarity.title}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SimilarityVisualization
                    basePrecedent={selectedPrecedentForSimilarity}
                    similarPrecedents={mockSimilarPrecedents}
                    onPrecedentSelect={handleSimilarityPrecedentSelect}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Constitution Tab */}
          <TabsContent value="constitution" className="space-y-6">
            <ConstitutionSearch 
              onArticleSelect={(article) => {
                console.log('Selected Constitution article:', article)
                // You can integrate this with case analysis
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}