/**
 * Deterministic finance calculators for JARVIS.exe.
 *
 * Same rule as the JARVIS project: no model writes a figure. Every function is
 * pure, returns its result plus a step-by-step trace of the working, and refuses
 * inputs that would make the maths meaningless instead of guessing.
 */

export interface TraceStep {
  label: string;
  formula: string;
  value: string;
}

export type CalcResult<T> = ({ ok: true } & T) | { ok: false; error: string };

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const inr0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const fmtCr = (n: number) => `₹${inr.format(n)} Cr`;
export const fmtRs = (n: number) => `₹${inr.format(n)}`;
export const fmtRs0 = (n: number) => `₹${inr0.format(Math.round(n))}`;
export const fmtPct = (n: number, digits = 2) => `${n.toFixed(digits)}%`;

const isNum = (n: number) => typeof n === 'number' && Number.isFinite(n);

/* ------------------------------------------------------------------ */
/* 1. Discounted cash flow valuation                                   */
/* ------------------------------------------------------------------ */

export interface DcfInputs {
  /** Most recent annual free cash flow, ₹ crore. */
  baseFcf: number;
  /** FCF growth per year during the explicit forecast, %. */
  growth: number;
  /** Perpetual growth after the forecast (Gordon growth), %. */
  terminalGrowth: number;
  /** Discount rate (WACC), %. */
  wacc: number;
  /** Debt minus cash, ₹ crore. Negative means net cash. */
  netDebt: number;
  /** Shares outstanding, crore. */
  shares: number;
  /** Length of the explicit forecast, years. */
  years: number;
}

export interface DcfYear {
  year: number;
  fcf: number;
  discountFactor: number;
  pv: number;
}

export interface DcfOutput {
  rows: DcfYear[];
  sumPv: number;
  terminalValue: number;
  pvTerminal: number;
  enterpriseValue: number;
  equityValue: number;
  perShare: number;
  /** Share of enterprise value that comes from the terminal value, %. */
  terminalShare: number;
  trace: TraceStep[];
}

export function validateDcf(i: DcfInputs): string | null {
  const fields: [keyof DcfInputs, string][] = [
    ['baseFcf', 'Base free cash flow'],
    ['growth', 'Forecast growth'],
    ['terminalGrowth', 'Terminal growth'],
    ['wacc', 'WACC'],
    ['netDebt', 'Net debt'],
    ['shares', 'Shares outstanding'],
    ['years', 'Forecast years']
  ];
  for (const [key, label] of fields) {
    if (!isNum(i[key])) return `${label} must be a number.`;
  }
  if (i.baseFcf <= 0) return 'Base free cash flow must be positive for a DCF to be meaningful.';
  if (i.shares <= 0) return 'Shares outstanding must be greater than zero.';
  if (i.wacc <= 0 || i.wacc >= 50) return 'WACC must be between 0% and 50%.';
  if (i.growth <= -50 || i.growth >= 100) return 'Forecast growth must be between -50% and 100%.';
  if (i.terminalGrowth >= i.wacc) {
    return `Terminal growth (${fmtPct(i.terminalGrowth)}) must be below WACC (${fmtPct(i.wacc)}); otherwise the perpetuity has no finite value.`;
  }
  if (!Number.isInteger(i.years) || i.years < 1 || i.years > 15) return 'Forecast years must be a whole number from 1 to 15.';
  return null;
}

export function dcf(i: DcfInputs): CalcResult<DcfOutput> {
  const error = validateDcf(i);
  if (error) return { ok: false, error };

  const r = i.wacc / 100;
  const g = i.growth / 100;
  const gT = i.terminalGrowth / 100;

  const rows: DcfYear[] = [];
  for (let year = 1; year <= i.years; year++) {
    const fcf = i.baseFcf * Math.pow(1 + g, year);
    const discountFactor = 1 / Math.pow(1 + r, year);
    rows.push({ year, fcf, discountFactor, pv: fcf * discountFactor });
  }

  const sumPv = rows.reduce((acc, row) => acc + row.pv, 0);
  const lastFcf = rows[rows.length - 1].fcf;
  const terminalValue = (lastFcf * (1 + gT)) / (r - gT);
  const pvTerminal = terminalValue / Math.pow(1 + r, i.years);
  const enterpriseValue = sumPv + pvTerminal;
  const equityValue = enterpriseValue - i.netDebt;
  const perShare = equityValue / i.shares;
  const terminalShare = (pvTerminal / enterpriseValue) * 100;
  const n = i.years;

  const trace: TraceStep[] = [
    {
      label: `Forecast FCF, years 1–${n}`,
      formula: `FCFₜ = ${fmtCr(i.baseFcf)} × (1 + ${fmtPct(i.growth)})ᵗ`,
      value: `year ${n}: ${fmtCr(lastFcf)}`
    },
    {
      label: 'Discount each year',
      formula: `PVₜ = FCFₜ ÷ (1 + ${fmtPct(i.wacc)})ᵗ, summed over t = 1…${n}`,
      value: fmtCr(sumPv)
    },
    {
      label: 'Terminal value (Gordon growth)',
      formula: `TV = FCF${subscript(n)} × (1 + ${fmtPct(i.terminalGrowth)}) ÷ (${fmtPct(i.wacc)} − ${fmtPct(i.terminalGrowth)})`,
      value: fmtCr(terminalValue)
    },
    {
      label: 'Present value of terminal value',
      formula: `PV(TV) = TV ÷ (1 + ${fmtPct(i.wacc)})${superscript(n)}`,
      value: fmtCr(pvTerminal)
    },
    {
      label: 'Enterprise value',
      formula: 'EV = Σ PVₜ + PV(TV)',
      value: fmtCr(enterpriseValue)
    },
    {
      label: 'Equity value',
      formula: `Equity = EV − net debt (${fmtCr(i.netDebt)})`,
      value: fmtCr(equityValue)
    },
    {
      label: 'Value per share',
      formula: `Equity ÷ ${inr.format(i.shares)} Cr shares (₹ Cr ÷ Cr shares = ₹ per share)`,
      value: fmtRs(perShare)
    }
  ];

  return {
    ok: true,
    rows,
    sumPv,
    terminalValue,
    pvTerminal,
    enterpriseValue,
    equityValue,
    perShare,
    terminalShare,
    trace
  };
}

export interface SensitivityGrid {
  waccValues: number[];
  terminalGrowthValues: number[];
  /** perShare[w][g]; null where WACC ≤ terminal growth (undefined perpetuity). */
  perShare: (number | null)[][];
}

/** Value per share across a WACC × terminal-growth grid around the base case. */
export function dcfSensitivity(
  base: DcfInputs,
  waccDeltas: number[] = [-2, -1, 0, 1, 2],
  growthDeltas: number[] = [-1, -0.5, 0, 0.5, 1]
): SensitivityGrid {
  const waccValues = waccDeltas.map(d => round2(base.wacc + d));
  const terminalGrowthValues = growthDeltas.map(d => round2(base.terminalGrowth + d));
  const perShare = waccValues.map(wacc =>
    terminalGrowthValues.map(terminalGrowth => {
      const result = dcf({ ...base, wacc, terminalGrowth });
      return result.ok ? result.perShare : null;
    })
  );
  return { waccValues, terminalGrowthValues, perShare };
}

/* ------------------------------------------------------------------ */
/* 2. Moneylender check (informal credit vs a formal KCC loan)         */
/* ------------------------------------------------------------------ */

export interface LoanInputs {
  principal: number;
  /** Quoted as rupees of interest per ₹100 per month, e.g. 3 means ₹3 per ₹100 per month. */
  ratePer100PerMonth: number;
  months: number;
  /** Formal comparison rate, % per year (simple). */
  formalAnnualRate: number;
}

export interface LoanOutput {
  annualSimpleRate: number;
  effectiveAnnualCompounded: number;
  informalInterest: number;
  formalInterest: number;
  extraCost: number;
  multiple: number;
  trace: TraceStep[];
}

export function moneylenderCheck(i: LoanInputs): CalcResult<LoanOutput> {
  if (![i.principal, i.ratePer100PerMonth, i.months, i.formalAnnualRate].every(isNum)) {
    return { ok: false, error: 'All fields must be numbers.' };
  }
  if (i.principal <= 0) return { ok: false, error: 'Loan amount must be positive.' };
  if (i.ratePer100PerMonth <= 0 || i.ratePer100PerMonth > 50) {
    return { ok: false, error: 'Quoted rate must be between ₹0 and ₹50 per ₹100 per month.' };
  }
  if (!Number.isInteger(i.months) || i.months < 1 || i.months > 120) {
    return { ok: false, error: 'Months must be a whole number from 1 to 120.' };
  }
  if (i.formalAnnualRate < 0 || i.formalAnnualRate > 50) {
    return { ok: false, error: 'Formal rate must be between 0% and 50% a year.' };
  }

  const monthly = i.ratePer100PerMonth / 100;
  const annualSimpleRate = i.ratePer100PerMonth * 12;
  const effectiveAnnualCompounded = (Math.pow(1 + monthly, 12) - 1) * 100;
  const informalInterest = i.principal * monthly * i.months;
  const formalInterest = i.principal * (i.formalAnnualRate / 100) * (i.months / 12);
  const extraCost = informalInterest - formalInterest;
  const multiple = formalInterest > 0 ? informalInterest / formalInterest : Infinity;

  const trace: TraceStep[] = [
    {
      label: 'Quoted rate as a yearly rate (simple)',
      formula: `₹${i.ratePer100PerMonth} per ₹100 per month × 12 months`,
      value: fmtPct(annualSimpleRate, 1) + ' a year'
    },
    {
      label: 'If unpaid interest is added to the loan each month',
      formula: `(1 + ${i.ratePer100PerMonth}/100)¹² − 1`,
      value: fmtPct(effectiveAnnualCompounded, 1) + ' a year'
    },
    {
      label: `Interest over ${i.months} months (informal, simple)`,
      formula: `${fmtRs0(i.principal)} × ${i.ratePer100PerMonth}/100 × ${i.months}`,
      value: fmtRs0(informalInterest)
    },
    {
      label: `Interest over ${i.months} months (formal at ${fmtPct(i.formalAnnualRate, 1)} a year)`,
      formula: `${fmtRs0(i.principal)} × ${fmtPct(i.formalAnnualRate, 1)} × ${i.months}/12`,
      value: fmtRs0(formalInterest)
    },
    {
      label: 'Extra cost of the informal loan',
      formula: 'informal interest − formal interest',
      value: fmtRs0(extraCost)
    }
  ];

  return { ok: true, annualSimpleRate, effectiveAnnualCompounded, informalInterest, formalInterest, extraCost, multiple, trace };
}

/* ------------------------------------------------------------------ */
/* 3. Fee drag on a long-term investment                               */
/* ------------------------------------------------------------------ */

export interface FeeDragInputs {
  amount: number;
  years: number;
  /** Return before fees, % per year. */
  grossReturn: number;
  /** Annual fee charged on assets (expense ratio), % per year. */
  fee: number;
}

export interface FeeDragOutput {
  withoutFees: number;
  withFees: number;
  feeCost: number;
  /** Share of the fee-free gain that fees take, %. */
  shareOfGrowthLost: number;
  netReturn: number;
  trace: TraceStep[];
}

export function feeDrag(i: FeeDragInputs): CalcResult<FeeDragOutput> {
  if (![i.amount, i.years, i.grossReturn, i.fee].every(isNum)) {
    return { ok: false, error: 'All fields must be numbers.' };
  }
  if (i.amount <= 0) return { ok: false, error: 'Amount must be positive.' };
  if (!Number.isInteger(i.years) || i.years < 1 || i.years > 60) {
    return { ok: false, error: 'Years must be a whole number from 1 to 60.' };
  }
  if (i.grossReturn <= 0 || i.grossReturn > 40) return { ok: false, error: 'Return must be between 0% and 40% a year.' };
  if (i.fee < 0 || i.fee >= 10) return { ok: false, error: 'Fee must be between 0% and 10% a year.' };

  const r = i.grossReturn / 100;
  const f = i.fee / 100;
  const withoutFees = i.amount * Math.pow(1 + r, i.years);
  const netGrowthFactor = (1 + r) * (1 - f);
  const withFees = i.amount * Math.pow(netGrowthFactor, i.years);
  const feeCost = withoutFees - withFees;
  const gain = withoutFees - i.amount;
  const shareOfGrowthLost = gain > 0 ? (feeCost / gain) * 100 : 0;
  const netReturn = (netGrowthFactor - 1) * 100;

  const trace: TraceStep[] = [
    {
      label: 'Without fees',
      formula: `${fmtRs0(i.amount)} × (1 + ${fmtPct(i.grossReturn, 1)})^${i.years}`,
      value: fmtRs0(withoutFees)
    },
    {
      label: 'Yearly growth after the fee is taken from assets',
      formula: `(1 + ${fmtPct(i.grossReturn, 1)}) × (1 − ${fmtPct(i.fee, 2)}) − 1`,
      value: fmtPct(netReturn, 2) + ' a year'
    },
    {
      label: 'With fees',
      formula: `${fmtRs0(i.amount)} × (1 + ${fmtPct(netReturn, 2)})^${i.years}`,
      value: fmtRs0(withFees)
    },
    {
      label: 'What the fee costs you',
      formula: 'without fees − with fees',
      value: fmtRs0(feeCost)
    },
    {
      label: 'Share of your gain taken by fees',
      formula: 'fee cost ÷ (without fees − amount invested)',
      value: fmtPct(shareOfGrowthLost, 1)
    }
  ];

  return { ok: true, withoutFees, withFees, feeCost, shareOfGrowthLost, netReturn, trace };
}

/* ------------------------------------------------------------------ */

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
function subscript(n: number) {
  return String(n).replace(/\d/g, d => SUB[Number(d)]);
}
function superscript(n: number) {
  return String(n).replace(/\d/g, d => SUP[Number(d)]);
}
