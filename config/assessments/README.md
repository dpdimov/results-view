# Assessment Configuration System

This directory contains configuration files for each assessment type. The system allows you to customize visualization settings, coordinate labels, and background images for different assessments.

## Directory Structure

```
config/
└── assessments/
    ├── README.md                    (this file)
    ├── kinetic-thinking.json        (example configuration)
    └── [assessment-id].json         (your new assessment configs)
```

## Creating a New Assessment Configuration

### Step 1: Create the JSON Configuration File

1. **Location**: Create a new JSON file in this directory (`/config/assessments/`)
2. **Naming**: The filename must match the `assessment_id` from your database
   - Example: If `assessment_id = "creative-problem-solving"`, create `creative-problem-solving.json`

### Step 2: JSON Configuration Structure

Copy and modify this template for your new assessment:

```json
{
  "name": "Your Assessment Name",
  "description": "Brief description of what this assessment measures",
  "coordinateLabels": {
    "x_coordinate": "Your X-Axis Label",
    "y_coordinate": "Your Y-Axis Label"
  },
  "backgroundImage": "/images/your-assessment-background.png",
  "visualization": {
    "densityConfig": {
      "bandwidth": 0.03,
      "maxDistanceMultiplier": 2,
      "alphaRange": {
        "min": 30,
        "max": 150
      }
    },
    "colors": {
      "primary": "#4338ca",
      "secondary": "#06b6d4"
    }
  }
}
```

### Step 3: Add Background Image

1. **Location**: Place your background image in `/public/images/`
2. **Naming**: Use a descriptive name like `your-assessment-background.png`
3. **Format**: PNG recommended for transparency support
4. **Size**: 400x400 pixels for optimal display
5. **Update JSON**: Ensure the `backgroundImage` path in your JSON matches the actual file location

## Configuration Options Explained

### Basic Information
- **`name`**: Display name for the assessment (shown in UI)
- **`description`**: Brief description of the assessment purpose

### Coordinate Labels
- **`coordinateLabels.x_coordinate`**: Label for the X-axis (horizontal)
- **`coordinateLabels.y_coordinate`**: Label for the Y-axis (vertical)
- These appear in analytics summaries and axis labels

### Background Image
- **`backgroundImage`**: Path to the background image file
- Path is relative to `/public/` directory
- Example: `"/images/my-assessment.png"` points to `/public/images/my-assessment.png`

### Visualization Settings

#### Density Configuration
- **`bandwidth`**: Controls density map smoothness (0.01-0.1, smaller = more precise)
- **`maxDistanceMultiplier`**: How far density effects spread (1-3, larger = wider spread)
- **`alphaRange.min`**: Minimum transparency (0-255, lower = more transparent)
- **`alphaRange.max`**: Maximum transparency (0-255, higher = more opaque)

#### Colors
- **`primary`**: Main color for UI elements (hex color code)
- **`secondary`**: Secondary color for accents (hex color code)

## Example Assessment Configurations

### Kinetic Thinking Assessment
```json
{
  "name": "Kinetic Thinking Assessment",
  "description": "Measures creative and dynamic thinking patterns",
  "coordinateLabels": {
    "x_coordinate": "Creative Flexibility",
    "y_coordinate": "Dynamic Innovation"
  },
  "backgroundImage": "/images/kinetic-thinking-background.png",
  "visualization": {
    "densityConfig": {
      "bandwidth": 0.03,
      "maxDistanceMultiplier": 2,
      "alphaRange": {"min": 30, "max": 150}
    },
    "colors": {"primary": "#4338ca", "secondary": "#06b6d4"}
  }
}
```

### Creative Problem Solving (Example)
```json
{
  "name": "Creative Problem Solving",
  "description": "Evaluates creative approaches to problem-solving scenarios",
  "coordinateLabels": {
    "x_coordinate": "Solution Originality",
    "y_coordinate": "Implementation Feasibility"
  },
  "backgroundImage": "/images/creative-problem-solving-background.png",
  "visualization": {
    "densityConfig": {
      "bandwidth": 0.04,
      "maxDistanceMultiplier": 2.5,
      "alphaRange": {"min": 40, "max": 140}
    },
    "colors": {"primary": "#059669", "secondary": "#f59e0b"}
  }
}
```

## Quick Setup Checklist

When creating a new assessment:

1. ✅ **Database**: Ensure your database has records with the correct `assessment_id`
2. ✅ **JSON Config**: Create `[assessment-id].json` in `/config/assessments/`
3. ✅ **Background Image**: Add background image to `/public/images/`
4. ✅ **Test**: Restart development server (`npm run dev`) and test with new assessment
5. ✅ **Filter**: The new assessment should appear in the filter dropdown automatically

## Troubleshooting

### Configuration Not Loading
- **Check filename**: Must exactly match the `assessment_id` from database
- **Check JSON syntax**: Use a JSON validator to ensure proper formatting
- **Check file location**: Must be in `/config/assessments/` directory

### Background Image Not Showing
- **Check file path**: Ensure path in JSON matches actual file location
- **Check file format**: PNG recommended, ensure it's not corrupted
- **Check file permissions**: Ensure file is readable

### Fallback Behavior
If a configuration file is missing or invalid, the system will:
- Use default coordinate labels ("X Coordinate", "Y Coordinate")
- Use default background image (`/images/plot-background.png`)
- Use default visualization settings
- Log a warning in the browser console

## File Locations Summary

```
/config/assessments/[assessment-id].json    ← Configuration files go here
/public/images/[assessment-name].png        ← Background images go here
```

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify JSON syntax with an online JSON validator
3. Ensure file paths and names match exactly
4. Restart the development server after making changes