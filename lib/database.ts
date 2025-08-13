import { sql } from '@vercel/postgres';

export interface AssessmentResult {
  id: number;
  assessment_id?: string;
  x_coordinate: number;
  y_coordinate: number;
  custom_code?: string;
  email_domain?: string;
  user_agent?: string;
  ip_address?: string;
  style_name?: string;
  completed_at: Date;
  created_at: Date;
}

export interface FilterOptions {
  assessmentId?: string;
  customCode?: string;
  emailDomain?: string;
  styleName?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export class ResultsService {
  static async getAllResults(filters: FilterOptions = {}): Promise<AssessmentResult[]> {
    try {
      let query = `SELECT * FROM assessment_results WHERE 1=1`;
      const params: any[] = [];
      let paramCount = 0;

      if (filters.assessmentId) {
        paramCount++;
        query += ` AND assessment_id = $${paramCount}`;
        params.push(filters.assessmentId);
      }

      if (filters.customCode) {
        paramCount++;
        query += ` AND custom_code = $${paramCount}`;
        params.push(filters.customCode);
      }

      if (filters.emailDomain) {
        paramCount++;
        query += ` AND email_domain = $${paramCount}`;
        params.push(filters.emailDomain);
      }

      if (filters.styleName) {
        paramCount++;
        query += ` AND style_name = $${paramCount}`;
        params.push(filters.styleName);
      }

      if (filters.dateFrom) {
        paramCount++;
        query += ` AND completed_at >= $${paramCount}`;
        params.push(filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        paramCount++;
        query += ` AND completed_at <= $${paramCount}`;
        params.push(filters.dateTo.toISOString());
      }

      query += ` ORDER BY completed_at DESC`;

      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      if (filters.offset) {
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }

      const result = await sql.query(query, params);
      return result.rows as AssessmentResult[];
    } catch (error) {
      console.error('Database error fetching results:', error);
      return [];
    }
  }

  static async getResultsCount(filters: FilterOptions = {}): Promise<number> {
    try {
      let query = `SELECT COUNT(*) as count FROM assessment_results WHERE 1=1`;
      const params: any[] = [];
      let paramCount = 0;

      if (filters.assessmentId) {
        paramCount++;
        query += ` AND assessment_id = $${paramCount}`;
        params.push(filters.assessmentId);
      }

      if (filters.customCode) {
        paramCount++;
        query += ` AND custom_code = $${paramCount}`;
        params.push(filters.customCode);
      }

      if (filters.emailDomain) {
        paramCount++;
        query += ` AND email_domain = $${paramCount}`;
        params.push(filters.emailDomain);
      }

      if (filters.styleName) {
        paramCount++;
        query += ` AND style_name = $${paramCount}`;
        params.push(filters.styleName);
      }

      if (filters.dateFrom) {
        paramCount++;
        query += ` AND completed_at >= $${paramCount}`;
        params.push(filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        paramCount++;
        query += ` AND completed_at <= $${paramCount}`;
        params.push(filters.dateTo.toISOString());
      }

      const result = await sql.query(query, params);
      return parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Database error counting results:', error);
      return 0;
    }
  }

  static async getUniqueCustomCodes(): Promise<string[]> {
    try {
      const result = await sql`
        SELECT DISTINCT custom_code 
        FROM assessment_results 
        WHERE custom_code IS NOT NULL 
        ORDER BY custom_code
      `;
      return result.rows.map(row => row.custom_code);
    } catch (error) {
      console.error('Database error fetching custom codes:', error);
      return [];
    }
  }

  static async getUniqueEmailDomains(): Promise<string[]> {
    try {
      const result = await sql`
        SELECT DISTINCT email_domain 
        FROM assessment_results 
        WHERE email_domain IS NOT NULL 
        ORDER BY email_domain
      `;
      return result.rows.map(row => row.email_domain);
    } catch (error) {
      console.error('Database error fetching email domains:', error);
      return [];
    }
  }

  static async getUniqueStyleNames(): Promise<string[]> {
    try {
      const result = await sql`
        SELECT DISTINCT style_name 
        FROM assessment_results 
        WHERE style_name IS NOT NULL 
        ORDER BY style_name
      `;
      return result.rows.map(row => row.style_name);
    } catch (error) {
      console.error('Database error fetching style names:', error);
      return [];
    }
  }

  static async getUniqueAssessmentIds(): Promise<string[]> {
    try {
      const result = await sql`
        SELECT DISTINCT assessment_id 
        FROM assessment_results 
        WHERE assessment_id IS NOT NULL 
        ORDER BY assessment_id
      `;
      return result.rows.map(row => row.assessment_id);
    } catch (error) {
      console.error('Database error fetching assessment IDs:', error);
      return [];
    }
  }

  static async getAnalyticsSummary(filters: FilterOptions = {}) {
    try {
      let query = `
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
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 0;

      if (filters.assessmentId) {
        paramCount++;
        query += ` AND assessment_id = $${paramCount}`;
        params.push(filters.assessmentId);
      }

      if (filters.customCode) {
        paramCount++;
        query += ` AND custom_code = $${paramCount}`;
        params.push(filters.customCode);
      }

      if (filters.emailDomain) {
        paramCount++;
        query += ` AND email_domain = $${paramCount}`;
        params.push(filters.emailDomain);
      }

      if (filters.styleName) {
        paramCount++;
        query += ` AND style_name = $${paramCount}`;
        params.push(filters.styleName);
      }

      if (filters.dateFrom) {
        paramCount++;
        query += ` AND completed_at >= $${paramCount}`;
        params.push(filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        paramCount++;
        query += ` AND completed_at <= $${paramCount}`;
        params.push(filters.dateTo.toISOString());
      }

      const result = await sql.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Database error fetching analytics:', error);
      return null;
    }
  }
}