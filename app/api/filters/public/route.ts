import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const assessmentIdsResult = await sql`SELECT DISTINCT assessment_id FROM assessment_results WHERE assessment_id IS NOT NULL ORDER BY assessment_id`;

    return NextResponse.json({
      assessmentIds: assessmentIdsResult.rows.map(row => row.assessment_id)
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('API error fetching public filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}