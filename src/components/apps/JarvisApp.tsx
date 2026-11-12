import React, { useMemo, useState } from 'react';
import {
  dcf,
  dcfSensitivity,
  moneylenderCheck,
  feeDrag,
  fmtCr,
  fmtRs,
  fmtRs0,
  fmtPct,
  type DcfInputs,
  type TraceStep
} from '../../lib/finance';
import { retroAudio } from '../../services/audio';

type Tab = 'dcf' | 'loan' | 'fees';

/* ---------- small Win98 building blocks ---------- */

const NumberField: React.FC<{
  label: string;
  unit?: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  hint?: string;
}> = ({ label, unit, value, onChange, step = 'any', hint }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', color: '#222' }}>
    <span>
      {label}
      {unit && <span style={{ color: '#666' }}> ({unit})</span>}
    </span>
    <input
      type="number"
      inputMode="decimal"
      step={step}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="win-inset"
      style={{ padding: '3px 5px', fontSize: '12px', background: '#ffffff', fontFamily: 'monospace', width: '100%' }}
    />
    {hint && <span style={{ fontSize: '10px', color: '#777' }}>{hint}</span>}
  </label>
);

const Tile: React.FC<{ label: string; value: string; tone?: 'normal' | 'warn' | 'good' }> = ({ label, value, tone = 'normal' }) => (
  <div
    className="win-sunken"
    style={{
      padding: '8px',
      background: '#071018',
      color: tone === 'warn' ? '#ffb347' : tone === 'good' ? '#75ffa0' : '#39ff14',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      minWidth: 0
    }}
  >
    <span style={{ fontSize: '10px', color: '#b8c7b8' }}>{label}</span>
    <span style={{ fontFamily: 'var(--font-dos), monospace', fontSize: '20px', lineHeight: 1.1, wordBreak: 'break-word' }}>
      {value}
    </span>
  </div>
);

const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="win-sunken" style={{ padding: '8px', background: '#fff4f4', color: '#8a0000', fontSize: '11.5px' }}>
    ⛔ {message}
  </div>
);

const MathTrace: React.FC<{ steps: TraceStep[] }> = ({ steps }) => (
  <details open style={{ marginTop: '10px' }}>
    <summary style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#000080' }}>
      Show the math ({steps.length} steps, computed by code)
    </summary>
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '6px', fontSize: '11px' }}>
      <tbody>
        {steps.map((s, i) => (
          <tr key={s.label} style={{ borderTop: '1px solid #d0d0d0' }}>
            <td style={{ padding: '4px 4px', verticalAlign: 'top', color: '#000080', fontWeight: 'bold', width: '18px' }}>{i + 1}</td>
            <td style={{ padding: '4px 4px', verticalAlign: 'top' }}>
              <div style={{ color: '#222' }}>{s.label}</div>
              <div style={{ fontFamily: 'monospace', color: '#555', fontSize: '10.5px' }}>{s.formula}</div>
            </td>
            <td style={{ padding: '4px 4px', verticalAlign: 'top', textAlign: 'right', fontFamily: 'monospace', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
              {s.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </details>
);

const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' };
const h4: React.CSSProperties = { fontSize: '12px', color: '#000080', margin: '12px 0 6px 0' };

/* ---------- DCF ---------- */

type DcfForm = Record<keyof DcfInputs, string>;

const DCF_PRESETS: { name: string; values: DcfForm }[] = [
  {
    name: 'Steady compounder',
    values: { baseFcf: '1200', growth: '12', terminalGrowth: '5', wacc: '11', netDebt: '2500', shares: '150', years: '5' }
  },
  {
    name: 'High growth, high risk',
    values: { baseFcf: '300', growth: '25', terminalGrowth: '5', wacc: '14', netDebt: '-200', shares: '40', years: '5' }
  },
  {
    name: 'Mature, low growth',
    values: { baseFcf: '5000', growth: '4', terminalGrowth: '3', wacc: '9', netDebt: '12000', shares: '600', years: '5' }
  }
];

const parseDcf = (f: DcfForm): DcfInputs => ({
  baseFcf: Number(f.baseFcf),
  growth: Number(f.growth),
  terminalGrowth: Number(f.terminalGrowth),
  wacc: Number(f.wacc),
  netDebt: Number(f.netDebt),
  shares: Number(f.shares),
  years: Number(f.years)
});

const DcfTab: React.FC = () => {
  const [form, setForm] = useState<DcfForm>(DCF_PRESETS[0].values);
  const set = (key: keyof DcfInputs) => (v: string) => setForm(prev => ({ ...prev, [key]: v }));

  const inputs = useMemo(() => parseDcf(form), [form]);
  const result = useMemo(() => dcf(inputs), [inputs]);
  const grid = useMemo(() => (result.ok ? dcfSensitivity(inputs) : null), [inputs, result.ok]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px', fontSize: '11px' }}>
        <span>Example inputs:</span>
        {DCF_PRESETS.map(p => (
          <button
            key={p.name}
            className="win-button"
            style={{ fontSize: '11px', padding: '2px 8px' }}
            onClick={() => {
              retroAudio.playMouseDown();
              setForm(p.values);
            }}
          >
            {p.name}
          </button>
        ))}
        <span style={{ color: '#777' }}>(illustrative, not real companies)</span>
      </div>

      <div style={grid2}>
        <NumberField label="Latest free cash flow" unit="₹ Cr" value={form.baseFcf} onChange={set('baseFcf')} />
        <NumberField label="FCF growth, forecast years" unit="% / yr" value={form.growth} onChange={set('growth')} />
        <NumberField label="Forecast length" unit="years" value={form.years} onChange={set('years')} step="1" />
        <NumberField label="Discount rate (WACC)" unit="%" value={form.wacc} onChange={set('wacc')} />
        <NumberField label="Terminal growth" unit="%" value={form.terminalGrowth} onChange={set('terminalGrowth')} hint="Must stay below WACC" />
        <NumberField label="Net debt" unit="₹ Cr" value={form.netDebt} onChange={set('netDebt')} hint="Negative = net cash" />
        <NumberField label="Shares outstanding" unit="Cr" value={form.shares} onChange={set('shares')} />
      </div>

      <h4 style={h4}>Valuation</h4>
      {!result.ok ? (
        <ErrorBox message={result.error} />
      ) : (
        <>
          <div style={grid2}>
            <Tile label="Enterprise value" value={fmtCr(result.enterpriseValue)} />
            <Tile label="Equity value" value={fmtCr(result.equityValue)} tone={result.equityValue < 0 ? 'warn' : 'normal'} />
            <Tile label="Value per share" value={fmtRs(result.perShare)} tone={result.perShare < 0 ? 'warn' : 'good'} />
            <Tile
              label="Terminal value share of EV"
              value={fmtPct(result.terminalShare, 1)}
              tone={result.terminalShare > 75 ? 'warn' : 'normal'}
            />
          </div>
          {result.terminalShare > 75 && (
            <p style={{ fontSize: '11px', color: '#8a4b00', margin: '6px 0 0 0' }}>
              ⚠ {fmtPct(result.terminalShare, 0)} of the value comes from after year {inputs.years}. Small changes to WACC or terminal
              growth move this a lot; check the sensitivity table.
            </p>
          )}

          <h4 style={h4}>Forecast</h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="win-sunken" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', background: '#ffffff' }}>
              <thead>
                <tr style={{ background: '#000080', color: '#ffffff' }}>
                  {['Year', 'FCF', 'Discount factor', 'Present value'].map(h => (
                    <th key={h} style={{ padding: '3px 6px', textAlign: h === 'Year' ? 'left' : 'right', fontWeight: 'normal' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ fontFamily: 'monospace' }}>
                {result.rows.map(row => (
                  <tr key={row.year} style={{ borderTop: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '2px 6px' }}>{row.year}</td>
                    <td style={{ padding: '2px 6px', textAlign: 'right' }}>{fmtCr(row.fcf)}</td>
                    <td style={{ padding: '2px 6px', textAlign: 'right' }}>{row.discountFactor.toFixed(4)}</td>
                    <td style={{ padding: '2px 6px', textAlign: 'right' }}>{fmtCr(row.pv)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #808080', fontWeight: 'bold' }}>
                  <td style={{ padding: '2px 6px' }}>TV</td>
                  <td style={{ padding: '2px 6px', textAlign: 'right' }}>{fmtCr(result.terminalValue)}</td>
                  <td style={{ padding: '2px 6px', textAlign: 'right' }}>{(result.pvTerminal / result.terminalValue).toFixed(4)}</td>
                  <td style={{ padding: '2px 6px', textAlign: 'right' }}>{fmtCr(result.pvTerminal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {grid && (
            <>
              <h4 style={h4}>Sensitivity: value per share (₹)</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="win-sunken" style={{ borderCollapse: 'collapse', fontSize: '11px', background: '#ffffff', fontFamily: 'monospace' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '3px 6px', fontWeight: 'normal', color: '#555', textAlign: 'left' }}>WACC ↓ / g →</th>
                      {grid.terminalGrowthValues.map(g => (
                        <th key={g} style={{ padding: '3px 8px', background: '#dfdfdf' }}>{fmtPct(g, 1)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grid.waccValues.map((w, wi) => (
                      <tr key={w}>
                        <th style={{ padding: '3px 6px', background: '#dfdfdf', textAlign: 'left' }}>{fmtPct(w, 1)}</th>
                        {grid.perShare[wi].map((v, gi) => {
                          const isBase = wi === 2 && gi === 2;
                          return (
                            <td
                              key={gi}
                              style={{
                                padding: '3px 8px',
                                textAlign: 'right',
                                background: isBase ? '#000080' : 'transparent',
                                color: isBase ? '#ffffff' : v === null ? '#999' : '#111',
                                fontWeight: isBase ? 'bold' : 'normal'
                              }}
                              title={v === null ? 'WACC ≤ terminal growth: no finite value' : undefined}
                            >
                              {v === null ? 'n/a' : Math.round(v).toLocaleString('en-IN')}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <MathTrace steps={result.trace} />
        </>
      )}
    </div>
  );
};

/* ---------- Moneylender check ---------- */

const LoanTab: React.FC = () => {
  const [principal, setPrincipal] = useState('50000');
  const [rate, setRate] = useState('3');
  const [months, setMonths] = useState('12');
  const [formal, setFormal] = useState('7');

  const result = useMemo(
    () =>
      moneylenderCheck({
        principal: Number(principal),
        ratePer100PerMonth: Number(rate),
        months: Number(months),
        formalAnnualRate: Number(formal)
      }),
    [principal, rate, months, formal]
  );

  return (
    <div>
      <p style={{ fontSize: '11.5px', color: '#333', margin: '0 0 8px 0', lineHeight: 1.5 }}>
        Informal lenders quote interest as “₹X per ₹100 a month”, which sounds small. This turns the quote into a yearly rate and compares
        it with formal crop credit (Kisan Credit Card, about 7% a year; about 4% with prompt-repayment relief).
      </p>
      <div style={grid2}>
        <NumberField label="Loan amount" unit="₹" value={principal} onChange={setPrincipal} />
        <NumberField label="Quoted rate" unit="₹ per ₹100 per month" value={rate} onChange={setRate} />
        <NumberField label="Loan length" unit="months" value={months} onChange={setMonths} step="1" />
        <NumberField label="Formal loan rate" unit="% / yr" value={formal} onChange={setFormal} />
      </div>

      <h4 style={h4}>Result</h4>
      {!result.ok ? (
        <ErrorBox message={result.error} />
      ) : (
        <>
          <div className="win-sunken" style={{ padding: '8px 10px', background: '#fffbe6', fontSize: '13px', marginBottom: '8px' }}>
            <strong>₹{rate} per ₹100 a month is {fmtPct(result.annualSimpleRate, 0)} a year</strong>
            <span style={{ color: '#555' }}>
              {' '}
              ({fmtPct(result.effectiveAnnualCompounded, 1)} if unpaid interest is added to the loan each month).
            </span>
          </div>
          <div style={grid2}>
            <Tile label={`Informal interest, ${months} mo`} value={fmtRs0(result.informalInterest)} tone="warn" />
            <Tile label={`Formal interest, ${months} mo`} value={fmtRs0(result.formalInterest)} tone="good" />
            <Tile label="Extra cost" value={fmtRs0(result.extraCost)} tone={result.extraCost > 0 ? 'warn' : 'good'} />
            <Tile label="Times more expensive" value={Number.isFinite(result.multiple) ? `${result.multiple.toFixed(1)}×` : '—'} />
          </div>
          <MathTrace steps={result.trace} />
        </>
      )}
    </div>
  );
};

/* ---------- Fee drag ---------- */

const FeesTab: React.FC = () => {
  const [amount, setAmount] = useState('100000');
  const [years, setYears] = useState('20');
  const [gross, setGross] = useState('12');
  const [fee, setFee] = useState('1.5');

  const result = useMemo(
    () => feeDrag({ amount: Number(amount), years: Number(years), grossReturn: Number(gross), fee: Number(fee) }),
    [amount, years, gross, fee]
  );

  return (
    <div>
      <p style={{ fontSize: '11.5px', color: '#333', margin: '0 0 8px 0', lineHeight: 1.5 }}>
        A yearly fee looks tiny, but it is taken from the whole balance every year. Slide the fee to see how much of the long-run gain it
        takes.
      </p>
      <div style={grid2}>
        <NumberField label="Amount invested" unit="₹" value={amount} onChange={setAmount} />
        <NumberField label="Years" unit="years" value={years} onChange={setYears} step="1" />
        <NumberField label="Return before fees" unit="% / yr" value={gross} onChange={setGross} />
        <label style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
          <span>
            Annual fee <span style={{ color: '#666' }}>({fee}% / yr)</span>
          </span>
          <input type="range" min="0" max="3" step="0.05" value={fee} onChange={e => setFee(e.target.value)} />
          <span style={{ fontSize: '10px', color: '#777' }}>Expense ratio charged on assets</span>
        </label>
      </div>

      <h4 style={h4}>Result</h4>
      {!result.ok ? (
        <ErrorBox message={result.error} />
      ) : (
        <>
          <div style={grid2}>
            <Tile label="Without fees" value={fmtRs0(result.withoutFees)} tone="good" />
            <Tile label="With fees" value={fmtRs0(result.withFees)} />
            <Tile label="Fees cost you" value={fmtRs0(result.feeCost)} tone="warn" />
            <Tile label="Share of gain lost" value={fmtPct(result.shareOfGrowthLost, 1)} tone="warn" />
          </div>
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10.5px' }}>
            {[
              { label: 'Without fees', value: result.withoutFees, color: '#2e8b57' },
              { label: 'With fees', value: result.withFees, color: '#000080' }
            ].map(bar => (
              <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '72px' }}>{bar.label}</span>
                <div className="win-sunken" style={{ flex: 1, height: '14px', background: '#ffffff' }}>
                  <div style={{ width: `${(bar.value / result.withoutFees) * 100}%`, height: '100%', background: bar.color }} />
                </div>
              </div>
            ))}
          </div>
          <MathTrace steps={result.trace} />
        </>
      )}
    </div>
  );
};

/* ---------- App shell ---------- */

const TABS: { id: Tab; label: string }[] = [
  { id: 'dcf', label: '📈 DCF Valuation' },
  { id: 'loan', label: '🌾 Moneylender Check' },
  { id: 'fees', label: '💸 Fee Drag' }
];

export const JarvisApp: React.FC = () => {
  const [tab, setTab] = useState<Tab>('dcf');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0' }}>
      <div style={{ background: '#000080', color: '#ffffff', padding: '6px 10px', fontSize: '11px', lineHeight: 1.45 }}>
        <strong style={{ color: '#ffff55' }}>JARVIS // money, plainly.</strong> No model writes a figure: every number here is
        computed by deterministic code (<code style={{ color: '#9fd7ff' }}>src/lib/finance.ts</code>) and every step is shown.
      </div>

      <div role="tablist" style={{ display: 'flex', gap: '2px', padding: '6px 8px 0 8px' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`win-button ${tab === t.id ? 'active' : ''}`}
            onClick={() => {
              retroAudio.playMouseDown();
              setTab(t.id);
            }}
            style={{ fontSize: '11px', padding: '3px 10px', fontWeight: tab === t.id ? 'bold' : 'normal' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="win-inset" style={{ flex: 1, margin: '0 8px 8px 8px', padding: '10px 12px', background: '#ffffff', overflowY: 'auto' }}>
        {tab === 'dcf' && <DcfTab />}
        {tab === 'loan' && <LoanTab />}
        {tab === 'fees' && <FeesTab />}
      </div>
    </div>
  );
};
