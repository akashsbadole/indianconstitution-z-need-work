'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Scale, 
  Calendar, 
  Gavel, 
  Eye,
  TrendingUp,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react'

interface Precedent {
  id: string
  title: string
  citation: string
  court: string
  date: string
  summary: string
  keyPrinciples: string[]
  caseType: string
  relevanceScore?: number
  similarityScore?: number
  isBinding: boolean
  category: string
  tags: string[]
}

interface PrecedentBrowserProps {
  onPrecedentSelect?: (precedent: Precedent) => void
  showSimilarity?: boolean
  maxHeight?: string
}

export function PrecedentBrowser({ 
  onPrecedentSelect, 
  showSimilarity = false, 
  maxHeight = '600px' 
}: PrecedentBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPrecedent, setSelectedPrecedent] = useState<Precedent | null>(null)
  const [precedents, setPrecedents] = useState<Precedent[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    caseType: '',
    court: '',
    category: '',
    sortBy: 'relevance',
    sortOrder: 'desc'
  })

  // Mock data for demonstration
  const mockPrecedents: Precedent[] = [
    {
      id: '1',
      title: 'Kesavananda Bharati v. State of Kerala',
      citation: 'AIR 1973 SC 1461',
      court: 'Supreme Court of India',
      date: '1973-04-24',
      summary: 'Landmark case that established the Basic Structure doctrine of the Indian Constitution.',
      keyPrinciples: ['Basic Structure Doctrine', 'Constitutional Amendment', 'Fundamental Rights'],
      caseType: 'Constitutional',
      relevanceScore: 0.95,
      similarityScore: 0.92,
      isBinding: true,
      category: 'Constitutional Law',
      tags: ['fundamental rights', 'constitutional amendment', 'basic structure']
    },
    {
      id: '2',
      title: 'Maneka Gandhi v. Union of India',
      citation: 'AIR 1978 SC 597',
      court: 'Supreme Court of India',
      date: '1978-01-25',
      summary: 'Expanded the interpretation of personal liberty under Article 21 and established the procedure established by law test.',
      keyPrinciples: ['Personal Liberty', 'Due Process', 'Natural Justice'],
      caseType: 'Constitutional',
      relevanceScore: 0.88,
      similarityScore: 0.85,
      isBinding: true,
      category: 'Constitutional Law',
      tags: ['article 21', 'personal liberty', 'natural justice']
    },
    {
      id: '3',
      title: 'Vishakha v. State of Rajasthan',
      citation: 'AIR 1997 SC 3011',
      court: 'Supreme Court of India',
      date: '1997-08-13',
      summary: 'Established guidelines to prevent sexual harassment at workplace and filled legislative vacuum.',
      keyPrinciples: ['Sexual Harassment', 'Gender Equality', 'Workplace Safety'],
      caseType: 'Civil',
      relevanceScore: 0.82,
      similarityScore: 0.78,
      isBinding: true,
      category: 'Labor Law',
      tags: ['sexual harassment', 'gender equality', 'workplace guidelines']
    },
    {
      id: '4',
      title: 'Shreya Singhal v. Union of India',
      citation: 'AIR 2015 SC 1523',
      court: 'Supreme Court of India',
      date: '2015-03-24',
      summary: 'Struck down Section 66A of IT Act as unconstitutional, protecting freedom of speech online.',
      keyPrinciples: ['Freedom of Speech', 'Internet Freedom', 'Constitutional Validity'],
      caseType: 'Constitutional',
      relevanceScore: 0.76,
      similarityScore: 0.72,
      isBinding: true,
      category: 'Cyber Law',
      tags: ['freedom of speech', 'internet', 'section 66a']
    },
    {
      id: '5',
      title: 'Naz Foundation v. Government of NCT of Delhi',
      citation: '160 (2009) DLT 277',
      court: 'Delhi High Court',
      date: '2009-07-02',
      summary: 'Decriminalized consensual homosexual acts between adults, interpreting Article 15 read with Article 21.',
      keyPrinciples: ['LGBTQ+ Rights', 'Privacy', 'Non-discrimination'],
      caseType: 'Criminal',
      relevanceScore: 0.71,
      similarityScore: 0.68,
      isBinding: false,
      category: 'Human Rights',
      tags: ['lgbtq+ rights', 'privacy', 'article 15']
    }
  ]

  useEffect(() => {
    // Load initial precedents
    setPrecedents(mockPrecedents)
  }, [])

  const handleSearch = () => {
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      let filtered = mockPrecedents

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.keyPrinciples.some(principle => 
            principle.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      }

      // Apply other filters
      if (filters.caseType && filters.caseType !== 'ALL_TYPES') {
        filtered = filtered.filter(p => p.caseType === filters.caseType)
      }
      if (filters.court && filters.court !== 'ALL_COURTS') {
        filtered = filtered.filter(p => p.court.includes(filters.court))
      }
      if (filters.category && filters.category !== 'ALL_CATEGORIES') {
        filtered = filtered.filter(p => p.category === filters.category)
      }

      // Apply sorting
      filtered.sort((a, b) => {
        const scoreA = a[filters.sortBy as keyof Precedent] as number || 0
        const scoreB = b[filters.sortBy as keyof Precedent] as number || 0
        return filters.sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB
      })

      setPrecedents(filtered)
      setLoading(false)
    }, 500) // Reduced timeout for faster response
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500'
    if (score >= 0.7) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Precedent Browser
          </CardTitle>
          <CardDescription>
            Search and browse through legal precedents and case law
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search precedents by title, citation, or key principles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Select value={filters.caseType} onValueChange={(value) => setFilters(prev => ({ ...prev, caseType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Case Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_TYPES">All Types</SelectItem>
                <SelectItem value="Constitutional">Constitutional</SelectItem>
                <SelectItem value="Civil">Civil</SelectItem>
                <SelectItem value="Criminal">Criminal</SelectItem>
                <SelectItem value="Administrative">Administrative</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.court} onValueChange={(value) => setFilters(prev => ({ ...prev, court: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Court" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_COURTS">All Courts</SelectItem>
                <SelectItem value="Supreme Court">Supreme Court</SelectItem>
                <SelectItem value="High Court">High Court</SelectItem>
                <SelectItem value="District Court">District Court</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_CATEGORIES">All Categories</SelectItem>
                <SelectItem value="Constitutional Law">Constitutional Law</SelectItem>
                <SelectItem value="Labor Law">Labor Law</SelectItem>
                <SelectItem value="Cyber Law">Cyber Law</SelectItem>
                <SelectItem value="Human Rights">Human Rights</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="similarityScore">Similarity</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Precedent List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Search Results</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{precedents.length} precedents</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea style={{ maxHeight }}>
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="ml-2">Searching precedents...</span>
                    </div>
                  ) : precedents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No precedents found matching your search criteria.
                    </div>
                  ) : (
                    precedents.map((precedent) => (
                      <Card 
                        key={precedent.id} 
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedPrecedent?.id === precedent.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => {
                          setSelectedPrecedent(precedent)
                          onPrecedentSelect?.(precedent)
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-sm">{precedent.title}</h3>
                                <p className="text-xs text-muted-foreground">{precedent.citation}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {showSimilarity && precedent.similarityScore && (
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${getSimilarityColor(precedent.similarityScore)}`} />
                                    <span className="text-xs font-medium">{Math.round(precedent.similarityScore * 100)}%</span>
                                  </div>
                                )}
                                <Badge variant={precedent.isBinding ? 'default' : 'secondary'} className="text-xs">
                                  {precedent.isBinding ? 'Binding' : 'Persuasive'}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {precedent.summary}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(precedent.date).getFullYear()}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Gavel className="w-3 h-3 mr-1" />
                                  {precedent.court.split(' ')[0]}
                                </Badge>
                              </div>
                              <div className={`text-xs font-medium ${getRelevanceColor(precedent.relevanceScore || 0)}`}>
                                {Math.round((precedent.relevanceScore || 0) * 100)}% relevant
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {precedent.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {precedent.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{precedent.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Precedent Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Precedent Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPrecedent ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">{selectedPrecedent.title}</h3>
                      <p className="text-sm text-muted-foreground">{selectedPrecedent.citation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Court:</span>
                        <p>{selectedPrecedent.court}</p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p>{new Date(selectedPrecedent.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <p>{selectedPrecedent.caseType}</p>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <p>{selectedPrecedent.category}</p>
                      </div>
                    </div>

                    {showSimilarity && selectedPrecedent.similarityScore && (
                      <div>
                        <span className="font-medium">Similarity Score:</span>
                        <div className="mt-1">
                          <Progress value={selectedPrecedent.similarityScore * 100} className="w-full" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(selectedPrecedent.similarityScore * 100)}% match
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="font-medium">Summary:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedPrecedent.summary}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium">Key Principles:</span>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                        {selectedPrecedent.keyPrinciples.map((principle, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {principle}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPrecedent.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View Full Text
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Select a precedent to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}