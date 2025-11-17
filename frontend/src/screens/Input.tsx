import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { BrewInputs } from '../types';

interface InputProps {
  defaultValues?: BrewInputs;
  onSubmit: (payload: BrewInputs) => void;
  submitting?: boolean;
}

type FieldError = Partial<Record<keyof BrewInputs, string>>;

const defaultForm: BrewInputs = {
  dose: 18.5,
  yield: 36,
  yieldUnit: 'g',
  time: 28,
  temperature: 93,
  tds: 9.8,
  roastLevel: 'Medium',
  tasteNote: '밸런스 양호, 단맛 부족',
  roastDate: '2024-05-01',
  shopTemperature: 25,
};

const numericFields: Array<keyof BrewInputs> = [
  'dose',
  'yield',
  'time',
  'temperature',
  'tds',
  'shopTemperature',
];

function parseNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function Input({ defaultValues, onSubmit, submitting }: InputProps) {
  const [formState, setFormState] = useState<BrewInputs>(defaultValues ?? defaultForm);
  const [errors, setErrors] = useState<FieldError>({});

  useEffect(() => {
    if (defaultValues) {
      setFormState(defaultValues);
    }
  }, [defaultValues]);

  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  const validate = (state: BrewInputs): FieldError => {
    const nextErrors: FieldError = {};

    numericFields.forEach((field) => {
      const raw = String(state[field]);
      const parsed = parseNumber(raw);
      if (parsed === null) {
        nextErrors[field] = '숫자를 입력하세요';
      } else if (parsed < 0) {
        nextErrors[field] = '0 이상의 값을 입력하세요';
      }
    });

    if (!state.yieldUnit) {
      nextErrors.yieldUnit = '단위를 선택하세요';
    }

    return nextErrors;
  };

  const handleChange = (field: keyof BrewInputs) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value } as BrewInputs));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validation = validate(formState);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    const payload: BrewInputs = {
      ...formState,
      dose: Number(formState.dose),
      yield: Number(formState.yield),
      time: Number(formState.time),
      temperature: Number(formState.temperature),
      tds: Number(formState.tds),
      shopTemperature: Number(formState.shopTemperature),
    };

    onSubmit(payload);
  };

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <header className="card__header">
        <div className="pill">입력</div>
        <p className="card__title">추출 변수를 입력하고 바로 엔진을 호출하세요.</p>
      </header>

      <div className="form__grid">
        <label className="field">
          <span>도징량 (g)</span>
          <input
            name="dose"
            type="number"
            step="0.1"
            inputMode="decimal"
            value={formState.dose}
            onChange={handleChange('dose')}
          />
          {errors.dose && <span className="field__error">{errors.dose}</span>}
        </label>

        <label className="field">
          <span>추출량</span>
          <div className="field__group">
            <input
              name="yield"
              type="number"
              step="0.1"
              inputMode="decimal"
              value={formState.yield}
              onChange={handleChange('yield')}
            />
            <select name="yieldUnit" value={formState.yieldUnit} onChange={handleChange('yieldUnit')}>
              <option value="g">g</option>
              <option value="mL">mL</option>
            </select>
          </div>
          {errors.yield && <span className="field__error">{errors.yield}</span>}
          {errors.yieldUnit && <span className="field__error">{errors.yieldUnit}</span>}
        </label>

        <label className="field">
          <span>추출 시간 (초)</span>
          <input
            name="time"
            type="number"
            step="0.1"
            inputMode="decimal"
            value={formState.time}
            onChange={handleChange('time')}
          />
          {errors.time && <span className="field__error">{errors.time}</span>}
        </label>

        <label className="field">
          <span>추출 온도 (°C)</span>
          <input
            name="temperature"
            type="number"
            step="0.1"
            inputMode="decimal"
            value={formState.temperature}
            onChange={handleChange('temperature')}
          />
          {errors.temperature && <span className="field__error">{errors.temperature}</span>}
        </label>

        <label className="field">
          <span>TDS (%)</span>
          <input
            name="tds"
            type="number"
            step="0.1"
            inputMode="decimal"
            value={formState.tds}
            onChange={handleChange('tds')}
          />
          {errors.tds && <span className="field__error">{errors.tds}</span>}
        </label>

        <label className="field">
          <span>매장 온도 (°C)</span>
          <input
            name="shopTemperature"
            type="number"
            step="0.1"
            inputMode="decimal"
            value={formState.shopTemperature}
            onChange={handleChange('shopTemperature')}
          />
          {errors.shopTemperature && <span className="field__error">{errors.shopTemperature}</span>}
        </label>

        <label className="field">
          <span>로스팅 레벨</span>
          <input
            name="roastLevel"
            type="text"
            value={formState.roastLevel}
            onChange={handleChange('roastLevel')}
          />
        </label>

        <label className="field">
          <span>맛 노트</span>
          <input
            name="tasteNote"
            type="text"
            value={formState.tasteNote}
            onChange={handleChange('tasteNote')}
          />
        </label>

        <label className="field">
          <span>로스팅 날짜</span>
          <input
            name="roastDate"
            type="date"
            value={formState.roastDate}
            onChange={handleChange('roastDate')}
          />
        </label>
      </div>

      <footer className="form__footer">
        {hasErrors && <p className="form__hint">모든 숫자 입력칸에 숫자와 단위를 확인해주세요.</p>}
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? '엔진 호출 중...' : '엔진 호출하기'}
        </button>
      </footer>
    </form>
  );
}
