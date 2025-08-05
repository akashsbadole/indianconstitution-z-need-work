'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  BookOpen, 
  Filter, 
  Gavel, 
  Clock, 
  TrendingUp,
  FileText,
  Hash,
  Calendar
} from 'lucide-react'

interface ConstitutionSearchResult {
  id: string
  articleNumber: string
  title: string
  content: string
  relevanceScore: number
  highlightedContent: string
  category: string
  part: string
}

interface ConstitutionSearchProps {
  onArticleSelect?: (article: ConstitutionSearchResult) => void
}

export function ConstitutionSearch({ onArticleSelect }: ConstitutionSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedArticle, setSelectedArticle] = useState('')
  const [searchType, setSearchType] = useState<'EXACT' | 'SEMANTIC' | 'KEYWORD'>('SEMANTIC')
  const [results, setResults] = useState<ConstitutionSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [selectedResult, setSelectedResult] = useState<ConstitutionSearchResult | null>(null)
  const [constitutionStats, setConstitutionStats] = useState<any>(null)

  const categories = [
    'FUNDAMENTAL_RIGHTS',
    'CITIZENSHIP',
    'UNION_TERRITORY',
    'EXECUTIVE',
    'LEGISLATURE',
    'JUDICIARY',
    'ELECTIONS',
    'EMERGENCY_PROVISIONS',
    'AMENDMENT',
    'LANGUAGE',
    'GENERAL'
  ]

  useEffect(() => {
    loadConstitutionStats()
  }, [])

  const loadConstitutionStats = async () => {
    try {
      const response = await fetch('/api/constitution/load')
      const data = await response.json()
      if (data.success) {
        setConstitutionStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading Constitution stats:', error)
    }
  }

  const loadConstitutionData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/constitution/load', {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        setConstitutionStats(data.stats)
        alert('Constitution data loaded successfully!')
      }
    } catch (error) {
      console.error('Error loading Constitution data:', error)
      alert('Failed to load Constitution data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query')
      return
    }

    setIsLoading(true)
    setCurrentPage(page)

    try {
      const response = await fetch('/api/constitution/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          category: selectedCategory && selectedCategory !== 'ALL' ? selectedCategory : undefined,
          articleNumber: selectedArticle || undefined,
          searchType,
          limit: 10,
          page
        })
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      
      if (page === 1) {
        setResults(data.results)
      } else {
        setResults(prev => [...prev, ...data.results])
      }
      
      setTotalResults(data.searchMetadata.totalResults)
      setHasMore(data.searchMetadata.hasMore)
      
      if (data.stats) {
        setConstitutionStats(data.stats)
      }

    } catch (error) {
      console.error('Search error:', error)
      alert('Failed to search Constitution. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultClick = (result: ConstitutionSearchResult) => {
    setSelectedResult(result)
    if (onArticleSelect) {
      onArticleSelect(result)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(1)
    }
  }

  const formatRelevanceScore = (score: number) => {
    return Math.round(score * 100)
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'FUNDAMENTAL_RIGHTS': 'bg-red-100 text-red-800',
      'CITIZENSHIP': 'bg-blue-100 text-blue-800',
      'UNION_TERRITORY': 'bg-green-100 text-green-800',
      'EXECUTIVE': 'bg-purple-100 text-purple-800',
      'LEGISLATURE': 'bg-orange-100 text-orange-800',
      'JUDICIARY': 'bg-pink-100 text-pink-800',
      'ELECTIONS': 'bg-yellow-100 text-yellow-800',
      'EMERGENCY_PROVISIONS': 'bg-red-100 text-red-800',
      'AMENDMENT': 'bg-indigo-100 text-indigo-800',
      'LANGUAGE': 'bg-teal-100 text-teal-800',
      'GENERAL': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Indian Constitution Search
              </CardTitle>
              <CardDescription>
                Search through the Constitution of India with advanced AI-powered search
              </CardDescription>
            </div>
            {constitutionStats && constitutionStats.totalArticles === 0 && (
              <Button onClick={loadConstitutionData} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load Constitution Data'}
              </Button>
            )}
          </div>
        </CardHeader>
        {constitutionStats && constitutionStats.totalArticles > 0 && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{constitutionStats.totalArticles}</span>
                <span className="text-muted-foreground">Articles</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-green-600" />
                <span className="font-medium">{constitutionStats.categories?.length || 0}</span>
                <span className="text-muted-foreground">Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="font-medium">AI</span>
                <span className="text-muted-foreground">Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Real-time</span>
                <span className="text-muted-foreground">Search</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Search Constitution</CardTitle>
          <CardDescription>
            Enter your query to search through Constitution articles, provisions, and amendments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search Constitution articles... (e.g., 'fundamental rights', 'citizenship', 'equality')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </div>
            <Button onClick={() => handleSearch(1)} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Article Number</label>
              <Input
                placeholder="e.g., 14, 21A, 32"
                value={selectedArticle}
                onChange={(e) => setSelectedArticle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Search Type</label>
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEMANTIC">AI Semantic Search</SelectItem>
                  <SelectItem value="KEYWORD">Keyword Match</SelectItem>
                  <SelectItem value="EXACT">Exact Match</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Results List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Search Results</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {totalResults} results found
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div
                        key={result.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedResult?.id === result.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                Article {result.articleNumber}
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getCategoryColor(result.category)}`}
                              >
                                {result.category.replace('_', ' ')}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                              >
                                {formatRelevanceScore(result.relevanceScore)}% match
                              </Badge>
                            </div>
                            
                            <h3 className="font-medium mb-2">{result.title}</h3>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {result.highlightedContent}
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{result.part}</span>
                              <Separator orientation="vertical" className="h-3" />
                              <span>Constitution of India</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Gavel className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              #{(currentPage - 1) * 10 + index + 1}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {hasMore && (
                    <div className="flex justify-center mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => handleSearch(currentPage + 1)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading...' : 'Load More Results'}
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Selected Article Detail */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Article Details</CardTitle>
                <CardDescription>
                  {selectedResult ? 'Selected article content' : 'Select an article to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedResult ? (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Article {selectedResult.articleNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {selectedResult.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <Badge 
                          variant="secondary" 
                          className={getCategoryColor(selectedResult.category)}
                        >
                          {selectedResult.category.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {formatRelevanceScore(selectedResult.relevanceScore)}% relevant
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Content</h4>
                        <div className="text-sm bg-muted p-4 rounded-lg">
                          {selectedResult.content}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Part</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedResult.part}
                        </p>
                      </div>

                      <div className="pt-4 border-t">
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            if (onArticleSelect) {
                              onArticleSelect(selectedResult)
                            }
                          }}
                        >
                          Use in Case Analysis
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select an article to view details</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && results.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search query or filters
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

