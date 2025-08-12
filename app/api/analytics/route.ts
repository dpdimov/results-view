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
    };

    const analytics = await ResultsService.getAnalyticsSummary(filters);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('API error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}