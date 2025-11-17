export type Unit = 'g' | 'mL' | 'celsius';

export interface BrewInputs {
  dose: number;
  yield: number;
  yieldUnit: Unit;
  time: number;
  temperature: number;
  tds: number;
  roastLevel: string;
  tasteNote: string;
  roastDate: string;
  shopTemperature: number;
}

export interface Adjustment {
  name: string;
  priority: number;
  rationale?: string;
}

export interface ValueTweak {
  field: string;
  change: string;
  reason?: string;
}

export interface FeedbackSchema {
  rule: string;
  reasoning: string;
  source?: string;
}

export interface EngineResponse {
  issuedAt: string;
  flavorProjection: string;
  topAdjustments: Adjustment[];
  valueTweaks: ValueTweak[];
  contextualHints: string[];
  feedbackSchema: FeedbackSchema;
  echo: Partial<BrewInputs>;
  advisoryNote?: string;
}
