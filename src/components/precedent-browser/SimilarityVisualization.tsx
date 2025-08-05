'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Network, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Eye,
  Filter,
  Maximize2
} from 'lucide-react'

interface PrecedentNode {
  id: string
  title: string
  citation: string
  similarity: number
  category: string
  year: number
  x?: number
  y?: number
}

interface SimilarityVisualizationProps {
  basePrecedent: {
    id: string
    title: string
    citation: string
    category: string
    year: number
  }
  similarPrecedents: PrecedentNode[]
  onPrecedentSelect?: (precedent: PrecedentNode) => void
}

export function SimilarityVisualization({ 
  basePrecedent, 
  similarPrecedents, 
  onPrecedentSelect 
}: SimilarityVisualizationProps) {
  const [selectedView, setSelectedView] = useState<'network' | 'bars' | 'pie'>('network')
  const [selectedPrecedent, setSelectedPrecedent] = useState<PrecedentNode | null>(null)

  // Calculate positions for network visualization
  const networkNodes = useMemo(() => {
    const nodes = [
      {
        ...basePrecedent,
        similarity: 1,
        x: 200,
        y: 200
      },
      ...similarPrecedents.map((precedent, index) => {
        const angle = (index / similarPrecedents.length) * 2 * Math.PI
        const radius = 150 + (1 - precedent.similarity) * 100
        return {
          ...precedent,
          x: 200 + radius * Math.cos(angle),
          y: 200 + radius * Math.sin(angle)
        }
      })
    ]
    return nodes
  }, [basePrecedent, similarPrecedents])

  // Calculate category distribution for pie chart
  const categoryDistribution = useMemo(() => {
    const distribution = similarPrecedents.reduce((acc, precedent) => {
      acc[precedent.category] = (acc[precedent.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(distribution).map(([category, count]) => ({
      category,
      count,
      percentage: (count / similarPrecedents.length) * 100
    }))
  }, [similarPrecedents])

  // Calculate year distribution
  const yearDistribution = useMemo(() => {
    const decades = similarPrecedents.reduce((acc, precedent) => {
      const decade = Math.floor(precedent.year / 10) * 10
      acc[decade] = (acc[decade] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    return Object.entries(decades)
      .map(([decade, count]) => ({
        decade: parseInt(decade),
        count,
        decadeLabel: `${decade}s`
      }))
      .sort((a, b) => a.decade - b.decade)
  }, [similarPrecedents])

  const handleNodeClick = (node: PrecedentNode) => {
    setSelectedPrecedent(node)
    onPrecedentSelect?.(node)
  }

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return '#10b981' // green
    if (similarity >= 0.7) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Similarity Visualization
              </CardTitle>
              <CardDescription>
                Visual analysis of precedent relationships and similarities
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Maximize2 className="w-4 h-4 mr-1" />
                Expand
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="network" className="flex items-center gap-1">
                <Network className="w-4 h-4" />
                Network
              </TabsTrigger>
              <TabsTrigger value="bars" className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Similarity
              </TabsTrigger>
              <TabsTrigger value="pie" className="flex items-center gap-1">
                <PieChart className="w-4 h-4" />
                Categories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="network" className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/20">
                <svg width="400" height="400" className="w-full h-auto max-w-md mx-auto">
                  {/* Render connections */}
                  {networkNodes.slice(1).map((node, index) => (
                    <line
                      key={`line-${index}`}
                      x1={networkNodes[0].x}
                      y1={networkNodes[0].y}
                      x2={node.x}
                      y2={node.y}
                      stroke={getSimilarityColor(node.similarity)}
                      strokeWidth={Math.max(1, node.similarity * 3)}
                      strokeOpacity={0.6}
                    />
                  ))}
                  
                  {/* Render nodes */}
                  {networkNodes.map((node, index) => (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={index === 0 ? 8 : 6}
                        fill={index === 0 ? '#3b82f6' : getSimilarityColor(node.similarity)}
                        stroke="#ffffff"
                        strokeWidth={2}
                        className="cursor-pointer hover:stroke-primary"
                        onClick={() => handleNodeClick(node)}
                      />
                      <text
                        x={node.x}
                        y={node.y + (index === 0 ? 20 : 15)}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6b7280"
                        className="pointer-events-none"
                      >
                        {index === 0 ? 'Base' : `${Math.round(node.similarity * 100)}%`}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>High Similarity (≥90%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Medium Similarity (70-89%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Low Similarity (&lt;70%)</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bars" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Similarity Scores</h4>
                {similarPrecedents
                  .sort((a, b) => b.similarity - a.similarity)
                  .map((precedent, index) => (
                    <div key={precedent.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate flex-1 mr-2">
                          {precedent.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {precedent.year}
                          </Badge>
                          <span className="text-xs font-medium w-12 text-right">
                            {Math.round(precedent.similarity * 100)}%
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={precedent.similarity * 100} 
                        className="h-2 cursor-pointer"
                        onClick={() => handleNodeClick(precedent)}
                      />
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="pie" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-3">Category Distribution</h4>
                  <div className="space-y-2">
                    {categoryDistribution.map((item, index) => (
                      <div key={item.category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.category}</span>
                          <span>{Math.round(item.percentage)}%</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Year Distribution</h4>
                  <div className="space-y-2">
                    {yearDistribution.map((item, index) => (
                      <div key={item.decade} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.decadeLabel}</span>
                          <span>{item.count} cases</span>
                        </div>
                        <Progress 
                          value={(item.count / similarPrecedents.length) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Selected Precedent Details */}
      {selectedPrecedent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Selected Precedent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">{selectedPrecedent.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedPrecedent.citation}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Similarity Score:</span>
                  <div className="mt-1">
                    <Progress value={selectedPrecedent.similarity * 100} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(selectedPrecedent.similarity * 100)}% match
                    </p>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Category:</span>
                  <p>{selectedPrecedent.category}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  View Full Details
                </Button>
                <Button size="sm" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Find Related
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Similarity Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {similarPrecedents.length}
              </div>
              <p className="text-xs text-muted-foreground">Total Precedents</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((similarPrecedents.filter(p => p.similarity >= 0.8).length / similarPrecedents.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">High Similarity</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(similarPrecedents.reduce((sum, p) => sum + p.similarity, 0) / similarPrecedents.length * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Avg Similarity</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(similarPrecedents.map(p => p.category)).size}
              </div>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}