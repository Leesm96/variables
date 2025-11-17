import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { evaluateRules, loadRuleDefinitions, normalizeInput, RuleDefinition } from '../src/engine/engine';

const RULES_DIR = path.resolve(__dirname, '../src/engine/rules');

describe('input normalization', () => {
  it('parses numeric strings and normalizes season names', () => {
    const normalized = normalizeInput({
      time: '24',
      dose: '18.5',
      yield: '36',
      temperature: '92',
      degassing: '7',
      season: 'Fall',
    });

    expect(normalized).toEqual({
      time: 24,
      dose: 18.5,
      yield: 36,
      temperature: 92,
      degassing: 7,
      season: 'autumn',
    });
  });
});

describe('rule loading', () => {
  it('loads all yaml rule definitions', () => {
    const rules = loadRuleDefinitions(RULES_DIR);
    const ids = rules.map((rule) => rule.id).sort();
    expect(ids).toContain('bright_acidity');
    expect(ids).toContain('bitter_overextract');
    expect(ids).toContain('weak_body');
    expect(ids).toContain('muted_aroma');
  });
});

describe('rule evaluation', () => {
  it('suggests bright acidity fix for short, cool, low-dose shots', () => {
    const matches = evaluateRules(
      {
        time: 22,
        dose: 17.5,
        yield: 40,
        temperature: 91,
        degassing: 3,
        season: 'summer',
      },
      RULES_DIR,
    );

    expect(matches[0].id).toBe('bright_acidity');
    expect(matches[0].adjustments[0]).toContain('분쇄도를 조금 더 가늘게');
  });

  it('captures bitter over-extraction symptoms for long, hot shots', () => {
    const matches = evaluateRules(
      {
        time: 32,
        dose: 19,
        yield: 32,
        temperature: 95,
        degassing: 16,
        season: 'autumn',
      },
      RULES_DIR,
    );

    expect(matches[0].id).toBe('bitter_overextract');
    expect(matches[0].adjustments).toContain('추출 온도를 1~2°C 낮춰 쓴맛을 줄입니다.');
  });

  it('highlights weak body issues for winter yields', () => {
    const matches = evaluateRules(
      {
        time: 27,
        dose: 18.2,
        yield: 44,
        temperature: 93.5,
        degassing: 10,
        season: 'winter',
      },
      RULES_DIR,
    );

    expect(matches[0].id).toBe('weak_body');
    expect(matches[0].adjustments).toContain('도징을 0.5~1g 늘려 농도를 보강합니다.');
  });

  it('limits selection to the highest scoring top 3', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rules-'));
    const createRule = (rule: RuleDefinition) => {
      fs.writeFileSync(
        path.join(tempDir, `${rule.id}.yaml`),
        `id: ${rule.id}\nissue: ${rule.issue}\npriority: ${rule.priority}\nconditions:\n  time:\n    min: 20\n  dose:\n    min: 18\n  yield:\n    min: 35\n  temperature:\n    min: 92\n  degassing:\n    min: 5\n  season:\n    - winter\nadjustments:\n  - fix\n`,
      );
    };

    createRule({
      id: 'top_rule',
      issue: 'high priority',
      priority: 10,
      conditions: {},
      adjustments: ['fix'],
    } as RuleDefinition);

    createRule({ id: 'second_rule', issue: 'mid priority', priority: 8, conditions: {}, adjustments: ['fix'] } as RuleDefinition);
    createRule({ id: 'third_rule', issue: 'mid priority', priority: 7, conditions: {}, adjustments: ['fix'] } as RuleDefinition);
    createRule({ id: 'fourth_rule', issue: 'low priority', priority: 5, conditions: {}, adjustments: ['fix'] } as RuleDefinition);

    const matches = evaluateRules(
      {
        time: 25,
        dose: 18.5,
        yield: 38,
        temperature: 93,
        degassing: 8,
        season: 'winter',
      },
      tempDir,
    );

    const ids = matches.map((match) => match.id);
    expect(ids).toEqual(['top_rule', 'second_rule', 'third_rule']);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
