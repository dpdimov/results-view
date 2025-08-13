import analyticsConfig from '@/config/analytics.json';

export interface AssessmentConfig {
  name: string;
  description: string;
  coordinateLabels: {
    x_coordinate: string;
    y_coordinate: string;
  };
  backgroundImage: string;
  visualization: {
    densityConfig: {
      bandwidth: number;
      maxDistanceMultiplier: number;
      alphaRange: {
        min: number;
        max: number;
      };
    };
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

export interface AnalyticsConfig {
  coordinateLabels: {
    x_coordinate: string;
    y_coordinate: string;
  };
  analyticsConfig: {
    showPerAssessment: boolean;
    defaultAssessmentName: string;
  };
}

// Default fallback configuration
const defaultAssessmentConfig: AssessmentConfig = {
  name: "Assessment",
  description: "Assessment configuration",
  coordinateLabels: {
    x_coordinate: "X Coordinate",
    y_coordinate: "Y Coordinate"
  },
  backgroundImage: "/images/plot-background.png",
  visualization: {
    densityConfig: {
      bandwidth: 0.03,
      maxDistanceMultiplier: 2,
      alphaRange: {
        min: 30,
        max: 150
      }
    },
    colors: {
      primary: "#4338ca",
      secondary: "#06b6d4"
    }
  }
};

export async function getAssessmentConfig(assessmentId: string): Promise<AssessmentConfig> {
  try {
    // Try to load the specific assessment configuration
    const configModule = await import(`@/config/assessments/${assessmentId}.json`);
    return configModule.default;
  } catch (error) {
    console.warn(`Configuration not found for assessment ${assessmentId}, using default config`);
    return defaultAssessmentConfig;
  }
}

export function getAnalyticsConfig(): AnalyticsConfig {
  return analyticsConfig;
}

export function getCoordinateLabels() {
  return analyticsConfig.coordinateLabels;
}

export function getXCoordinateLabel(): string {
  return analyticsConfig.coordinateLabels.x_coordinate;
}

export function getYCoordinateLabel(): string {
  return analyticsConfig.coordinateLabels.y_coordinate;
}

// New assessment-specific functions
export async function getCoordinateLabelsForAssessment(assessmentId: string) {
  const config = await getAssessmentConfig(assessmentId);
  return config.coordinateLabels;
}

export async function getBackgroundImageForAssessment(assessmentId: string): Promise<string> {
  const config = await getAssessmentConfig(assessmentId);
  return config.backgroundImage;
}

export async function getVisualizationConfigForAssessment(assessmentId: string) {
  const config = await getAssessmentConfig(assessmentId);
  return config.visualization;
}