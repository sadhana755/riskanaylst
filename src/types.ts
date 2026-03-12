export type AssetType = 'Server' | 'Database' | 'Network' | 'Employee' | 'Application';
export type Criticality = 'Low' | 'Medium' | 'High' | 'Critical';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Asset {
  id: number;
  name: string;
  type: AssetType;
  criticality: Criticality;
  owner: string;
}

export interface Risk {
  id: number;
  asset_id: number;
  asset_name?: string;
  threat: string;
  vulnerability: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  risk_score: number;
  risk_level: RiskLevel;
  mitigation_strategy: string;
  status: string;
}
