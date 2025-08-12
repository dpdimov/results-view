import { NextResponse } from 'next/server';
import { ResultsService } from '@/lib/database';

export async function GET() {
  try {
    const [customCodes, emailDomains, styleNames] = await Promise.all([
      ResultsService.getUniqueCustomCodes(),
      ResultsService.getUniqueEmailDomains(),
      ResultsService.getUniqueStyleNames()
    ]);

    return NextResponse.json({
      customCodes,
      emailDomains,
      styleNames
    });
  } catch (error) {
    console.error('API error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}