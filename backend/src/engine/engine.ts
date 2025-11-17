import fs from 'fs';
import path from 'path';
import { load as loadYaml } from 'js-yaml';

export interface NumericRange {
  min?: number;
  max?: number;
}

export interface RuleConditions {
  time?: NumericRange;
  dose?: NumericRange;
  yield?: NumericRange;
  temperature?: NumericRange;
  degassing?: NumericRange;
  season?: string[];
}

export interface RuleDefinition {
  id: string;
  issue: string;
  priority: number;
  conditions: RuleConditions;
  adjustments: string[];
  source?: string;
}

export interface BrewInput {
  time?: number | string;
  dose?: number | string;
  yield?: number | string;
  temperature?: number | string;
  degassing?: number | string;
  season?: string;
}

export interface NormalizedInput {
  time?: number;
  dose?: number;
  yield?: number;
  temperature?: number;
  degassing?: number;
  season?: string;
}

export interface RuleMatch extends RuleDefinition {
  score: number;
  matchedConditions: number;
  totalConditions: number;
}

const RULES_DIR = path.resolve(__dirname, 'rules');

const parseNumber = (value?: number | string): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const parsed = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeSeason = (season?: string): string | undefined => {
  if (!season) return undefined;
  const normalized = season.trim().toLowerCase();
  if (normalized === 'fall') return 'autumn';
  return normalized;
};

export const normalizeInput = (input: BrewInput): NormalizedInput => {
  return {
    time: parseNumber(input.time),
    dose: parseNumber(input.dose),
    yield: parseNumber(input.yield),
    temperature: parseNumber(input.temperature),
    degassing: parseNumber(input.degassing),
    season: normalizeSeason(input.season),
  };
};

const ensureRule = (rawRule: any, source: string): RuleDefinition => {
  if (!rawRule || typeof rawRule !== 'object') {
    throw new Error(`Invalid rule structure in ${source}`);
  }

  const requiredFields = ['id', 'issue', 'priority', 'conditions', 'adjustments'];
  requiredFields.forEach((field) => {
    if (rawRule[field] === undefined) {
      throw new Error(`Missing required field '${field}' in ${source}`);
    }
  });

  return {
    id: String(rawRule.id),
    issue: String(rawRule.issue),
    priority: Number(rawRule.priority),
    conditions: rawRule.conditions as RuleConditions,
    adjustments: Array.isArray(rawRule.adjustments)
      ? rawRule.adjustments.map((text: any) => String(text))
      : [],
    source,
  };
};

export const loadRuleDefinitions = (rulesDir: string = RULES_DIR): RuleDefinition[] => {
  if (!fs.existsSync(rulesDir)) {
    return [];
  }

  const files = fs
    .readdirSync(rulesDir)
    .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'));

  const rules: RuleDefinition[] = [];

  files.forEach((file) => {
    const fullPath = path.join(rulesDir, file);
    const raw = loadYaml(fs.readFileSync(fullPath, 'utf8'));
    if (Array.isArray(raw)) {
      raw.forEach((item, index) => rules.push(ensureRule(item, `${file}#${index}`)));
    } else {
      rules.push(ensureRule(raw, file));
    }
  });

  return rules;
};

const matchesRange = (value: number | undefined, range?: NumericRange): boolean => {
  if (!range) return true;
  if (value === undefined) return false;
  if (range.min !== undefined && value < range.min) return false;
  if (range.max !== undefined && value > range.max) return false;
  return true;
};

const matchesSeason = (value: string | undefined, allowed?: string[]): boolean => {
  if (!allowed || allowed.length === 0) return true;
  if (!value) return false;
  const normalizedAllowed = allowed.map(normalizeSeason).filter(Boolean) as string[];
  return normalizedAllowed.includes(value);
};

const evaluateRule = (input: NormalizedInput, rule: RuleDefinition): RuleMatch | null => {
  const tests: Array<{ considered: boolean; matched: boolean }> = [
    { considered: !!rule.conditions.time, matched: matchesRange(input.time, rule.conditions.time) },
    { considered: !!rule.conditions.dose, matched: matchesRange(input.dose, rule.conditions.dose) },
    { considered: !!rule.conditions.yield, matched: matchesRange(input.yield, rule.conditions.yield) },
    {
      considered: !!rule.conditions.temperature,
      matched: matchesRange(input.temperature, rule.conditions.temperature),
    },
    { considered: !!rule.conditions.degassing, matched: matchesRange(input.degassing, rule.conditions.degassing) },
    { considered: !!rule.conditions.season, matched: matchesSeason(input.season, rule.conditions.season) },
  ];

  const totalConditions = tests.filter((t) => t.considered).length;
  const matchedConditions = tests.filter((t) => t.considered && t.matched).length;

  if (totalConditions > 0 && matchedConditions < totalConditions) {
    return null;
  }

  const score = rule.priority + matchedConditions + (totalConditions === 0 ? 0 : matchedConditions / totalConditions);

  return {
    ...rule,
    score,
    matchedConditions,
    totalConditions,
  };
};

const selectTopMatches = (matches: RuleMatch[], limit = 3): RuleMatch[] => {
  return matches
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.matchedConditions !== a.matchedConditions) return b.matchedConditions - a.matchedConditions;
      return a.id.localeCompare(b.id);
    })
    .slice(0, limit);
};

export const evaluateRules = (input: BrewInput, rulesDir?: string): RuleMatch[] => {
  const normalized = normalizeInput(input);
  const rules = loadRuleDefinitions(rulesDir);
  const matches = rules
    .map((rule) => evaluateRule(normalized, rule))
    .filter((result): result is RuleMatch => Boolean(result));

  return selectTopMatches(matches);
};

export const suggestAdjustments = (input: BrewInput, rulesDir?: string): RuleMatch[] => {
  return evaluateRules(input, rulesDir);
};
