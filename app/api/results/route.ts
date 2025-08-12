import { NextRequest, NextResponse } from 'next/server';
import { ResultsService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      customCode: searchParams.get('customCode') || undefined,
      emailDomain: searchParams.get('emailDomain') || undefined,
      styleName: searchParams.get('styleName') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

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