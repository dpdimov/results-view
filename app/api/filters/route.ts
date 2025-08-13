import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [customCodesResult, emailDomainsResult] = await Promise.all([
      sql`SELECT DISTINCT custom_code, COUNT(*) as count FROM assessment_results WHERE custom_code IS NOT NULL GROUP BY custom_code ORDER BY custom_code`,
      sql`SELECT DISTINCT email_domain FROM assessment_results WHERE email_domain IS NOT NULL AND email_domain != ''`
    ]);

    const customCodes = customCodesResult.rows
      .map(row => row.custom_code)
      .filter(code => code !== null && code !== undefined && String(code).trim().length > 0);
      
    const emailDomains = emailDomainsResult.rows
      .map(row => row.email_domain)
      .filter(domain => domain !== null && domain !== undefined && String(domain).trim().length > 0)
      .sort(); // Sort in JavaScript since ORDER BY breaks the DISTINCT query

    return NextResponse.json({
      customCodes,
      emailDomains
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