// CalcForge — all math runs in the browser, zero dependencies.
const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
const num = (n, d = 2) => Number(n).toFixed(d);
const pct = p => (p * 100).toFixed(1) + '%';

const CALCULATORS = {
  emi(v) {
    const P = +v.amount, r = +v.rate / 1200, n = Math.round(+v.years * 12);
    if (!(P > 0 && n > 0)) return null;
    const emi = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const total = emi * n, interest = total - P;
    return { primary: ['Monthly EMI', money(emi)], rows: [['Total payable', money(total)], ['Total interest', money(interest)]], note: `Interest is ${pct(interest / total)} of what you pay back. Principal is ${money(P)}.` };
  },
  sip(v) {
    const P = +v.amount, i = +v.rate / 1200, n = Math.round(+v.years * 12);
    if (!(P > 0 && n > 0)) return null;
    const fv = i === 0 ? P * n : P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const invested = P * n, gains = fv - invested;
    return { primary: ['Projected corpus', money(fv)], rows: [['Total invested', money(invested)], ['Estimated gains', money(gains)]], note: `${pct(gains / invested)} growth over ${num(n / 12, 0)} years at ${v.rate}% expected annual return.` };
  },
  fd(v) {
    const P = +v.amount, r = +v.rate / 100, t = +v.years, f = +v.freq;
    if (!(P > 0 && t > 0)) return null;
    const A = P * Math.pow(1 + r / f, f * t);
    return { primary: ['Maturity amount', money(A)], rows: [['Interest earned', money(A - P)], ['Principal', money(P)]], note: `Compounded ${f === 4 ? 'quarterly (typical bank FD)' : f === 2 ? 'half-yearly' : f === 12 ? 'monthly' : 'yearly'}.` };
  },
  rd(v) {
    const R = +v.amount, iq = +v.rate / 400, n = Math.round(+v.years * 12);
    if (!(R > 0 && n > 0)) return null;
    // monthly deposits at month-end, interest compounded quarterly (bank method) -> monthly-equivalent rate
    const jm = Math.pow(1 + iq, 1 / 3) - 1;
    const fv = jm === 0 ? R * n : R * ((Math.pow(1 + jm, n) - 1) / jm);
    const invested = R * n;
    return { primary: ['Maturity amount', money(fv)], rows: [['Total deposited', money(invested)], ['Interest earned', money(fv - invested)]], note: 'Deposits are modelled at month-end with quarterly compounding, the standard bank RD method.' };
  },
  ppf(v) {
    const D = +v.amount, i = +v.rate / 100, n = Math.round(+v.years);
    if (!(D > 0 && n > 0)) return null;
    const fv = i === 0 ? D * n : D * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const invested = D * n;
    return { primary: ['Maturity amount', money(fv)], rows: [['Total invested', money(invested)], ['Interest earned', money(fv - invested)]], note: 'Assumes deposit at the start of each year (start-of-year deposits earn a full year of interest). PPF lock-in is 15 years.' };
  },
  epf(v) {
    const C = +v.amount, i = +v.rate / 1200, n = Math.round(+v.years * 12);
    if (!(C > 0 && n > 0)) return null;
    const fv = i === 0 ? C * n : C * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const invested = C * n;
    return { primary: ['Projected corpus', money(fv)], rows: [['Total contributed', money(invested)], ['Interest earned', money(fv - invested)]], note: 'Enter combined employee + employer contribution. Simplified model — actual EPF credits monthly at declared rates.' };
  },
  gst(v) {
    const amt = +v.amount, rate = +v.rate;
    if (!(amt > 0)) return null;
    let base, gst;
    if (v.mode === 'in') { base = amt / (1 + rate / 100); gst = amt - base; }
    else { base = amt; gst = amt * rate / 100; }
    const rows = v.type === 'inter'
      ? [['IGST', money(gst)]]
      : [['CGST', money(gst / 2)], ['SGST/UTGST', money(gst / 2)]];
    return { primary: [v.mode === 'in' ? 'Base price (excl. GST)' : 'Total with GST', v.mode === 'in' ? money(base) : money(base + gst)], rows: [['GST amount', money(gst)], ...rows, [v.mode === 'in' ? 'Invoice total' : 'Base price', v.mode === 'in' ? money(amt) : money(base)]], note: v.type === 'inter' ? 'Inter-state supply: IGST is charged instead of CGST + SGST.' : 'Intra-state supply: GST splits equally into CGST and SGST.' };
  },
  incometax(v) {
    const gross = +v.gross, sd = Math.max(0, +v.sd);
    if (!(gross > 0)) return null;
    const taxable = Math.max(0, gross - sd);
    const S = [[400000, 0], [800000, .05], [1200000, .10], [1600000, .15], [2000000, .20], [2400000, .25], [Infinity, .30]];
    let last = 0, tax = 0;
    for (const [cap, rate] of S) { if (taxable > last) { tax += (Math.min(taxable, cap) - last) * rate; last = cap; } else break; }
    const rebate = taxable <= 1200000 ? Math.min(tax, 60000) : 0;
    const finalTax = Math.max(0, tax - rebate) * 1.04;
    return { primary: ['Tax payable FY 2026-27', money(finalTax)], rows: [['Gross income', money(gross)], ['Standard deduction', money(sd)], ['Taxable income', money(taxable)], ['Income tax before rebate', money(tax)], ['Rebate u/s 87A', money(-rebate)], ['Health & education cess (4%)', money(Math.max(0, tax - rebate) * .04)]], note: 'New Tax Regime. With the 87A rebate, taxable income up to ₹12 lakh pays zero tax.' };
  },
  hra(v) {
    const basic = +v.basic, hraR = +v.hra, rent = +v.rent;
    if (!(basic > 0)) return null;
    const cap = v.city === 'metro' ? .5 * basic : .4 * basic;
    const exempt = Math.min(hraR || 0, Math.max(rent - .1 * basic, 0), cap);
    return { primary: ['HRA exempt per month', money(exempt)], rows: [['Least of — HRA received', money(hraR || 0)], ['Least of — rent − 10% of basic', money(Math.max((rent || 0) - .1 * basic, 0))], [`Least of — ${v.city === 'metro' ? '50%' : '40%'} of basic`, money(cap)], ['Taxable HRA per year', money(((hraR || 0) - exempt) * 12)]], note: 'Exemption is the least of the three limits above. Rent paid must exceed 10% of basic for any exemption.' };
  },
  ctc(v) {
    const ctc = +v.ctc; if (!(ctc > 0)) return null;
    const basicPct = +v.basicPct, tax = Math.max(0, +v.tax), other = Math.max(0, +v.other);
    const basic = ctc * basicPct / 100;
    const pf = .12 * basic, pt = Math.max(0, +v.pt);
    const takeHome = ctc - pf - pt - tax - other * 12;
    return { primary: ['Monthly in-hand (approx)', money(takeHome / 12)], rows: [['Basic (' + basicPct + '% of CTC)', money(basic)], ['Employer PF contribution (12%)', money(pf)], ['Income tax (annual)', money(tax)], ['Professional tax (annual)', money(pt)], ['Other deductions (annual)', money(other * 12)]], note: 'Simplified estimate — actual in-hand depends on your company\u2019s salary structure, variable pay and benefits.' };
  },
  compound(v) {
    const P = +v.amount, r = +v.rate / 100, t = +v.years, f = +v.freq;
    if (!(P > 0 && t > 0)) return null;
    const A = P * Math.pow(1 + r / f, f * t);
    const ear = (Math.pow(1 + r / f, f) - 1) * 100;
    return { primary: ['Maturity amount', money(A)], rows: [['Compound interest earned', money(A - P)], ['Effective annual yield', num(ear) + '%']], note: 'Higher compounding frequency grows the same money faster at the same nominal rate.' };
  },
  simple(v) {
    const P = +v.amount, r = +v.rate, t = +v.years;
    if (!(P > 0 && t > 0)) return null;
    const si = P * r * t / 100;
    return { primary: ['Simple interest', money(si)], rows: [['Total repayable', money(P + si)]], note: 'SI = P × R × T ÷ 100.' };
  },
  percentage(v) {
    const x = +v.x, y = +v.y;
    if (isNaN(x) || isNaN(y)) return null;
    if (v.mode === 'of') return { primary: [`${num(x, 0)}% of ${num(y, 0)}`, num(x * y / 100)], note: 'Multiply: x ÷ 100 × y.' };
    if (v.mode === 'what') { if (y === 0) return null; const p = x / y * 100; return { primary: [`${num(x, 0)} is this % of ${num(y, 0)}`, num(p) + '%'], note: 'Divide: x ÷ y × 100.' }; }
    if (x === 0) return null;
    const d = (y - x) / x * 100;
    return { primary: [`Change from ${num(x, 0)} to ${num(y, 0)}`, (d >= 0 ? '+' : '') + num(d) + '%'], note: d >= 0 ? 'That is an increase.' : 'That is a decrease.' };
  },
  age(v) {
    if (!v.dob) return null;
    const dob = new Date(v.dob + 'T00:00:00'); if (isNaN(dob)) return null;
    const now = new Date(); if (dob > now) return null;
    let y = now.getFullYear() - dob.getFullYear(), m = now.getMonth() - dob.getMonth(), d = now.getDate() - dob.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    const days = Math.floor((now - dob) / 86400000);
    let next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(now.getFullYear() + 1);
    const toBday = Math.round((next - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    return { primary: ['Age', `${y} yrs ${m} mos ${d} days`], rows: [['Total days lived', days.toLocaleString('en-IN')], ['Next birthday', toBday === 0 ? 'Today 🎉' : `in ${toBday} days (turns ${y + 1})`]], note: 'Exact calendar age — the same counting used for Aadhaar, passports and sports categories.' };
  },
  bmi(v) {
    const h = +v.height / 100, w = +v.weight;
    if (!(h > 0 && w > 0)) return null;
    const bmi = w / (h * h);
    const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese';
    return { primary: ['Your BMI', num(bmi, 1)], rows: [['Category (WHO)', cat], ['Healthy weight for your height', `${num(18.5 * h * h, 1)}–${num(24.9 * h * h, 1)} kg`]], note: 'BMI = weight (kg) ÷ height² (m). It is a screening number, not a diagnosis.' };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[data-calc]');
  if (!form) return;
  const calc = CALCULATORS[form.dataset.calc];
  const out = document.getElementById('results');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function run() {
    const v = {};
    form.querySelectorAll('[data-key]').forEach(el => { v[el.dataset.key] = el.value; });
    let r = null; try { r = calc(v); } catch (e) { /* keep null */ }
    if (!r) { out.innerHTML = '<p class="hint">Enter values to see results.</p>'; return; }
    let html = `<div class="primary"><small>${esc(r.primary[0])}</small>${esc(r.primary[1])}</div>`;
    if (r.rows && r.rows.length) html += '<table>' + r.rows.map(row => `<tr><td>${esc(row[0])}</td><td>${esc(row[1])}</td></tr>`).join('') + '</table>';
    if (r.note) html += `<p class="note">${esc(r.note)}</p>`;
    out.innerHTML = html;
  }
  form.addEventListener('input', run);
  form.addEventListener('change', run);
  run();
});
