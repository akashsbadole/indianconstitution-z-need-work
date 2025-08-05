import { NextRequest, NextResponse } from 'next/server'
import { dataSeedService } from '@/lib/services/dataSeedService'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database seeding...')
    
    // Check if data is already seeded
    const stats = await dataSeedService.getSeedingStats()
    const totalRecords = stats.courts + stats.precedents + stats.cases + stats.judgments
    
    if (totalRecords > 0) {
      return NextResponse.json({
        success: true,
        message: 'Database already contains data',
        stats,
        isSeeded: true
      })
    }

    // Seed the database
    await dataSeedService.seedDatabase()
    
    // Get updated stats
    const newStats = await dataSeedService.getSeedingStats()
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      stats: newStats,
      isSeeded: true
    })

  } catch (error) {
    console.error('Database seeding error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = await dataSeedService.getSeedingStats()
    const totalRecords = stats.courts + stats.precedents + stats.cases + stats.judgments
    
    return NextResponse.json({
      success: true,
      stats,
      isSeeded: totalRecords > 0,
      totalRecords
    })

  } catch (error) {
    console.error('Error getting seeding stats:', error)
    return NextResponse.json(
      { error: 'Failed to get seeding stats', details: error.message },
      { status: 500 }
    )
  }
}