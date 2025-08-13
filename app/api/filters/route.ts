import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [assessmentIdsResult, customCodesResult, emailDomainsResult] = await Promise.all([
      sql`SELECT DISTINCT assessment_id FROM assessment_results WHERE assessment_id IS NOT NULL ORDER BY assessment_id`,
      sql`SELECT DISTINCT custom_code FROM assessment_results WHERE custom_code IS NOT NULL ORDER BY custom_code`,
      sql`SELECT DISTINCT email_domain FROM assessment_results WHERE email_domain IS NOT NULL ORDER BY email_domain`
    ]);

    return NextResponse.json({
      assessmentIds: assessmentIdsResult.rows.map(row => row.assessment_id),
      customCodes: customCodesResult.rows.map(row => row.custom_code),
      emailDomains: emailDomainsResult.rows.map(row => row.email_domain)
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('API error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}