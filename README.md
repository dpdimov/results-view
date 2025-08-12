# Assessment Results Viewer

A Next.js application for viewing and analyzing style assessment results from your Neon PostgreSQL database.

## Features

- **Admin Authentication**: Simple password protection for accessing the results viewer
- **Interactive Heatmap**: Scatterplot visualization with density-based heatmapping and custom background image support
- **Filter Results**: Filter by custom code, email domain, style name, date range, and result limit
- **Analytics Dashboard**: View summary statistics including total assessments, average coordinates, and unique counts
- **Responsive Table**: Browse through all assessment results with detailed information
- **Real-time Data**: Connect directly to your Neon database for live results

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database Connection

You'll need to set up your Neon database connection. Create a `.env.local` file in the root directory:

```bash
# .env.local
POSTGRES_URL="your-neon-connection-string-here"

# Admin password for accessing the results viewer (change this!)
ADMIN_PASSWORD="your-secure-password-here"
```

To get your connection string:
1. Go to your Neon dashboard
2. Navigate to your project
3. Go to "Connection Details"
4. Copy the connection string

### 3. Database Schema

Make sure your Neon database has the `assessment_results` table. If you haven't created it yet, run this SQL in your Neon SQL console:

```sql
CREATE TABLE assessment_results (
  id SERIAL PRIMARY KEY,
  x_coordinate DECIMAL(10, 8) NOT NULL,
  y_coordinate DECIMAL(10, 8) NOT NULL,
  custom_code VARCHAR(50),
  email_domain VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  style_name VARCHAR(100),
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_custom_code ON assessment_results(custom_code);
CREATE INDEX idx_email_domain ON assessment_results(email_domain);
CREATE INDEX idx_completed_at ON assessment_results(completed_at);
```

### 4. Run the Application

For development:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

For production:
```bash
npm run build
npm start
```

### 5. Custom Background Image (Optional)

To use your custom background image for the scatterplot heatmap:

1. Place your image in `public/images/plot-background.png`
2. The image will automatically be loaded as a semi-transparent background
3. Recommended: PNG format, 800x800+ pixels
4. If no image is found, the chart will use a default white background

## Usage

### Filtering Results

Use the filter panel at the top to narrow down results:
- **Custom Code**: Filter by specific assessment custom codes
- **Email Domain**: Filter by email domains of participants
- **Style Name**: Filter by detected personality style names
- **Date Range**: Filter results within a specific time period
- **Results Limit**: Control how many results to display (50-1000)

### Analytics Panel

The analytics panel shows:
- Total number of assessments matching your filters
- Average X and Y coordinates (personality quadrant positions)
- Number of unique custom codes and domains
- Date range of assessments

### Results Table

The table displays:
- Assessment ID
- X,Y coordinates (personality position)
- Custom code used for the assessment
- Email domain of participant
- Detected style name
- Completion timestamp

## API Endpoints

The application exposes these API endpoints:

- `GET /api/results` - Fetch filtered assessment results
- `GET /api/filters` - Get available filter options
- `GET /api/analytics` - Get analytics summary

## Database Structure

The app reads from the `assessment_results` table with these columns:
- `id` - Primary key
- `x_coordinate` - Personality X-axis position
- `y_coordinate` - Personality Y-axis position  
- `custom_code` - Optional custom tracking code
- `email_domain` - Domain from participant email
- `user_agent` - Browser/device information
- `ip_address` - Participant IP address
- `style_name` - Detected personality style
- `completed_at` - Assessment completion time
- `created_at` - Database record creation time

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
1. Verify your `POSTGRES_URL` is correctly set in `.env.local`
2. Ensure your Neon database is running and accessible
3. Check that the connection string includes proper authentication

### Build Errors

The build process may show warnings about static generation - this is expected for dynamic API routes that depend on query parameters.

### No Results Displayed

If no results appear:
1. Check that your database has data in the `assessment_results` table
2. Verify your filters aren't too restrictive
3. Try clearing all filters and increasing the result limit