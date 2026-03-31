export type CategoryType = 'HIGH' | 'FEVER' | 'DATA_QUALITY';

export interface Statistics {
    high_risk_patients: string[];
    fever_patients: string[];
    data_quality_issues: string[];
};