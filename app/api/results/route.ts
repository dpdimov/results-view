import { NextRequest, NextResponse } from 'next/server';
import { ResultsService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      assessmentId: searchParams.get('assessmentId') || undefined,
      customCode: searchParams.get('customCode') || undefined,
      emailDomain: searchParams.get('emailDomain') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      limit: 1000, // Fixed limit for visualization data
      offset: 0,
    };

    // Only fetch data needed for visualizations and analytics
    const [results, count] = await Promise.all([
      ResultsService.getAllResults(filters),
      ResultsService.getResultsCount(filters)
    ]);

    return NextResponse.json({
      results,
      count,
      filters
    });
  } catch (error) {
    console.error('API error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}