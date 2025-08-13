import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCoordinateLabelsForAssessment } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      assessmentId: searchParams.get('assessmentId') || undefined,
      customCode: searchParams.get('customCode') || undefined,
      emailDomain: searchParams.get('emailDomain') || undefined,
      styleName: searchParams.get('styleName') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    };

    // Build where clause for filtering
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (filters.assessmentId) {
      paramCount++;
      whereClause += ` AND assessment_id = $${paramCount}`;
      params.push(filters.assessmentId);
    }
    if (filters.customCode) {
      paramCount++;
      whereClause += ` AND custom_code = $${paramCount}`;
      params.push(filters.customCode);
    }
    if (filters.emailDomain) {
      paramCount++;
      whereClause += ` AND email_domain = $${paramCount}`;
      params.push(filters.emailDomain);
    }
    if (filters.styleName) {
      paramCount++;
      whereClause += ` AND style_name = $${paramCount}`;
      params.push(filters.styleName);
    }
    if (filters.dateFrom) {
      paramCount++;
      whereClause += ` AND completed_at >= $${paramCount}`;
      params.push(filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      paramCount++;
      whereClause += ` AND completed_at <= $${paramCount}`;
      params.push(filters.dateTo.toISOString());
    }

    // Get per-assessment analytics
    const perAssessmentQuery = `
      SELECT 
        assessment_id,
        COUNT(*) as total_assessments,
        AVG(x_coordinate) as avg_x,
        AVG(y_coordinate) as avg_y,
        MIN(completed_at) as first_assessment,
        MAX(completed_at) as last_assessment,
        COUNT(DISTINCT custom_code) as unique_custom_codes,
        COUNT(DISTINCT email_domain) as unique_domains
      FROM assessment_results 
      ${whereClause}
      GROUP BY assessment_id
      ORDER BY assessment_id
    `;

    // Get overall analytics
    const overallQuery = `
      SELECT 
        COUNT(*) as total_assessments,
        AVG(x_coordinate) as avg_x,
        AVG(y_coordinate) as avg_y,
        MIN(completed_at) as first_assessment,
        MAX(completed_at) as last_assessment,
        COUNT(DISTINCT custom_code) as unique_custom_codes,
        COUNT(DISTINCT email_domain) as unique_domains,
        COUNT(DISTINCT assessment_id) as unique_assessment_ids
      FROM assessment_results 
      ${whereClause}
    `;

    const [perAssessmentResult, overallResult] = await Promise.all([
      sql.query(perAssessmentQuery, params),
      sql.query(overallQuery, params)
    ]);

    // Get coordinate labels for the specific assessment (use first assessment if filtering by specific one, or default)
    const assessmentId = filters.assessmentId || 'kinetic-thinking';
    const coordinateLabels = await getCoordinateLabelsForAssessment(assessmentId);

    return NextResponse.json({
      overall: overallResult.rows[0],
      perAssessment: perAssessmentResult.rows,
      coordinateLabels
    });
  } catch (error) {
    console.error('API error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}