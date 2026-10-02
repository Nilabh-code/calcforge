// CalcForge static site generator. Run: node build.js [BASE_URL]
// One spec array -> 17 keyword-targeted calculator pages + homepage + sitemap.xml
const fs = require('fs');
const path = require('path');
const OUT = __dirname;
const BASE = (process.argv[2] || 'https://calcforge.example').replace(/\/$/, '');

// [slug, H1/title, meta description, intro paragraph, formula, fields, related[], faqs[[q,a],...]]
const PAGES = [
  {
    slug: 'emi-calculator', title: 'EMI Calculator – Loan EMI in Seconds | CalcForge',
    desc: 'Free EMI calculator for home, car and personal loans in India. Enter loan amount, interest rate and tenure to get your monthly EMI, total interest and payable amount instantly.',
    intro: 'An EMI (Equated Monthly Instalment) is the fixed payment you make to a bank every month to repay a loan. This calculator works out the exact EMI for any home, car, personal or education loan using the standard banking formula — no sign-up, no lead forms, results update as you type.',
    formula: 'EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1)',
    fields: [
      { key: 'amount', label: 'Loan amount', unit: '₹', value: 2500000 },
      { key: 'rate', label: 'Interest rate (p.a.)', unit: '%', value: 8.5 },
      { key: 'years', label: 'Tenure', unit: 'yrs', value: 20 }
    ],
    faqs: [
      ['What is an EMI calculator?', 'It computes the fixed monthly payment required to repay a loan by the end of its tenure, given the principal, annual interest rate and time period. Banks use exactly this formula.'],
      ['Why does my bank EMI differ slightly from the calculated value?', 'Banks may round the EMI, use actual month lengths for the first instalment, or reset rates (external benchmark lending rates). Differences are usually a few rupees per month.'],
      ['What happens to my EMI if the interest rate rises by 0.5%?', 'On a ₹25 lakh loan over 20 years, moving from 8.5% to 9% raises the EMI by roughly ₹800/month and total interest by nearly ₹1.9 lakh.']
    ]
  },
  {
    slug: 'sip-calculator', title: 'SIP Calculator – Mutual Fund Returns | CalcForge',
    desc: 'Free SIP calculator for India. Enter your monthly investment, expected return rate and years to see your mutual fund corpus, total invested amount and estimated gains.',
    intro: 'A Systematic Investment Plan (SIP) lets you invest a fixed amount in a mutual fund every month. Because you buy more units when NAVs are low and fewer when they are high, SIPs average out market volatility — this calculator projects what your monthly investment can grow to.',
    formula: 'Future value = P × ((1+i)ⁿ − 1) ÷ i × (1+i)',
    fields: [
      { key: 'amount', label: 'Monthly investment', unit: '₹', value: 10000 },
      { key: 'rate', label: 'Expected return (p.a.)', unit: '%', value: 12 },
      { key: 'years', label: 'Time period', unit: 'yrs', value: 15 }
    ],
    faqs: [
      ['What return rate should I assume for equity SIPs?', 'Indian large-cap funds have historically returned around 11–13% annualised over long periods. Use 12% as a realistic planning number; debt funds typically target 6–8%.'],
      ['Is SIP better than a lump sum investment?', 'Neither always wins. SIPs reduce timing risk by spreading entry across markets, while lump sums win more often in rising markets. For salaried investors, SIP discipline usually beats trying to time a lump sum.'],
      ['What is the power of compounding in a SIP?', 'Investing ₹10,000/month for 15 years at 12% puts in ₹18 lakh but grows to about ₹50 lakh — about two-thirds of the final corpus comes from returns, not your money.']
    ]
  },
  {
    slug: 'fd-calculator', title: 'FD Calculator – Fixed Deposit Maturity | CalcForge',
    desc: 'Free FD calculator for India. Calculate fixed deposit maturity amount and interest with quarterly, half-yearly, monthly or yearly compounding.',
    intro: 'A fixed deposit locks your money with a bank for a fixed tenure at a declared interest rate. Because most Indian banks compound FD interest quarterly, the effective return is higher than the simple rate printed on the brochure — this calculator lets you match any bank\u2019s compounding frequency.',
    formula: 'A = P × (1 + r/n)^(n×t)',
    fields: [
      { key: 'amount', label: 'Deposit amount', unit: '₹', value: 500000 },
      { key: 'rate', label: 'Interest rate (p.a.)', unit: '%', value: 7 },
      { key: 'years', label: 'Tenure', unit: 'yrs', value: 5 },
      { key: 'freq', label: 'Compounding', select: [['4', 'Quarterly (banks)'], ['12', 'Monthly'], ['2', 'Half-yearly'], ['1', 'Yearly']] }
    ],
    faqs: [
      ['How is FD interest different from simple interest?', 'Most Indian banks compound FD interest quarterly, so you earn interest on accrued interest. A ₹5 lakh FD at 7% for 5 years earns about ₹2.07 lakh compounded versus ₹1.75 lakh simple.'],
      ['Are bank FD returns taxable?', 'Yes. FD interest is added to your income and taxed at your slab rate, unlike PPF which is tax-free. Senior citizens get higher rates and a larger deduction under section 80TTB.'],
      ['What is the ideal FD tenure?', 'Laddering — splitting money across 1, 2 and 3 year FDs — balances liquidity with the better rates offered on longer tenures.']
    ]
  },
  {
    slug: 'rd-calculator', title: 'RD Calculator – Recurring Deposit Maturity | CalcForge',
    desc: 'Free RD calculator for India. Enter your monthly deposit, interest rate and tenure to find your recurring deposit maturity value and total interest earned.',
    intro: 'A recurring deposit (RD) is the savings cousin of an FD: instead of one lump sum, you deposit a fixed amount every month for a fixed tenure, and the bank compounds it quarterly. It is the classic tool for salaried monthly savers.',
    formula: 'M = R × ((1+i)ⁿ − 1) ÷ i  (quarterly rate i, quarters n)',
    fields: [
      { key: 'amount', label: 'Monthly deposit', unit: '₹', value: 5000 },
      { key: 'rate', label: 'Interest rate (p.a.)', unit: '%', value: 7 },
      { key: 'years', label: 'Tenure', unit: 'yrs', value: 5 }
    ],
    faqs: [
      ['What is the difference between RD and SIP?', 'An RD has a guaranteed, bank-declared return; a SIP invests in markets so returns vary. RDs suit fixed goals like a planned purchase; SIPs suit long-term wealth creation.'],
      ['Can I break an RD before maturity?', 'Yes, most banks allow premature withdrawal of an RD with a small penalty on the interest rate, usually 0.5–1%.'],
      ['Is RD interest taxable?', 'Yes, RD interest is fully taxable at your income slab, like FD interest.']
    ]
  },
  {
    slug: 'ppf-calculator', title: 'PPF Calculator – Public Provident Fund | CalcForge',
    desc: 'Free PPF calculator for India. Project your public provident fund maturity corpus with the government declared rate and the 15-year lock-in.',
    intro: 'The Public Provident Fund is India\u2019s most tax-efficient small savings scheme: contributions qualify for deduction under section 80C, interest is tax-free, and the maturity payout is tax-free — the famous EEE status. The government revises the rate quarterly; this calculator lets you model any assumed rate.',
    formula: 'M = D × ((1+i)ⁿ − 1) ÷ i × (1+i)',
    fields: [
      { key: 'amount', label: 'Yearly deposit', unit: '₹', value: 150000 },
      { key: 'rate', label: 'Interest rate (p.a.)', unit: '%', value: 7.1 },
      { key: 'years', label: 'Period', unit: 'yrs', value: 15 }
    ],
    faqs: [
      ['What is the PPF limit per year?', 'The minimum deposit is ₹500 and the maximum is ₹1.5 lakh per financial year across both your own account and any minor accounts (combined limit since 2005).'],
      ['Is PPF interest really tax-free?', 'Yes — PPF is exempt-exempt-exempt: the deduction at investment, the interest earned, and the maturity amount are all free of tax.'],
      ['Can I extend PPF after 15 years?', 'Yes, in blocks of 5 years, either with or without further contributions. Without contributions you keep earning the declared rate on the balance, tax-free.']
    ]
  },
  {
    slug: 'epf-calculator', title: 'EPF Calculator – Employee Provident Fund | CalcForge',
    desc: 'Free EPF calculator for India. Project your provident fund corpus from your monthly contribution, employer share and the declared EPF interest rate.',
    intro: 'Every salaried employee in India contributes 12% of basic pay to the Employees\u2019 Provident Fund, and the employer matches it. Interest is credited monthly at a government-declared rate. This calculator projects your retirement corpus from those monthly contributions.',
    formula: 'FV = C × ((1+i)ⁿ − 1) ÷ i × (1+i)  (monthly)',
    fields: [
      { key: 'amount', label: 'Monthly contribution (you + employer)', unit: '₹', value: 6000 },
      { key: 'rate', label: 'EPF interest rate (p.a.)', unit: '%', value: 8.25 },
      { key: 'years', label: 'Service period', unit: 'yrs', value: 25 }
    ],
    faqs: [
      ['What is the EPF withdrawal rule after unemployment?', 'If you remain unemployed for two months you can withdraw; withdrawing before completing 5 years of continuous service makes the payout taxable unless specific exceptions apply.'],
      ['Is EPF interest compounded monthly?', 'Interest accrues monthly on balances but is credited to accounts at year-end, which effectively gives a slightly higher yield than simple crediting.'],
      ['What is the employer\u2019s 12% split?', 'Of the employer\u2019s 12%, 8.33% goes to the pension fund (EPS) and the rest to EPF, so only part of the employer share compounds in your EPF balance.']
    ]
  },
  {
    slug: 'gst-calculator', title: 'GST Calculator – Add or Remove GST Instantly | CalcForge',
    desc: 'Free GST calculator for India. Add or remove 0%, 5%, 12%, 18% or 28% GST and split it into CGST, SGST or IGST with the base price and invoice total.',
    intro: 'India\u2019s Goods and Services Tax has five main slabs — 0%, 5%, 12%, 18% and 28%. For a sale inside your state, GST splits into CGST + SGST; for inter-state sales it is charged as IGST. This calculator both adds GST to a base price and backs it out of a tax-inclusive invoice.',
    formula: 'Base = Inclusive ÷ (1 + r)  |  GST = Base × r',
    fields: [
      { key: 'amount', label: 'Amount', unit: '₹', value: 10000 },
      { key: 'rate', label: 'GST rate', select: [['18', '18%'], ['5', '5%'], ['12', '12%'], ['28', '28%'], ['0', '0%']] },
      { key: 'mode', label: 'Direction', select: [['out', 'Add GST to price'], ['in', 'Remove GST from invoice']] },
      { key: 'type', label: 'Supply type', select: [['intra', 'Intra-state (CGST+SGST)'], ['inter', 'Inter-state (IGST)']] }
    ],
    faqs: [
      ['How do I remove GST from a tax-inclusive price?', 'Divide the invoice total by (1 + rate). For 18% GST on a ₹11,800 bill: 11,800 ÷ 1.18 = ₹10,000 base, ₹1,800 GST.'],
      ['Why does GST show as CGST and SGST?', 'Within one state, GST is dual: the centre takes CGST and the state takes SGST, each half the total rate. Across states it is a single IGST.'],
      ['What are the GST slabs in India?', 'The main slabs are 0%, 5%, 12%, 18% and 28%; some luxury and sin goods attract a compensation cess on top of 28%.']
    ]
  },
  {
    slug: 'income-tax-calculator', title: 'Income Tax Calculator FY 2026-27 (AY 2027-28) | CalcForge',
    desc: 'Free India income tax calculator for FY 2026-27 new regime. Slabs, standard deduction, 87A rebate and 4% cess — see your exact tax payable instantly.',
    intro: 'Under the New Tax Regime for FY 2026-27 (Assessment Year 2027-28), income up to ₹4 lakh is untaxed, salaried taxpayers get a standard deduction, and a rebate under section 87A wipes out tax entirely on taxable income up to ₹12 lakh. This calculator applies the full slab table plus the 4% health and education cess.',
    formula: 'Slab-wise tax − 87A rebate + 4% cess',
    fields: [
      { key: 'gross', label: 'Gross annual income', unit: '₹', value: 1200000 },
      { key: 'sd', label: 'Standard deduction', unit: '₹', value: 75000 }
    ],
    faqs: [
      ['Do I pay tax on ₹12 lakh salary in FY 2026-27?', 'Under the new regime, a salaried person with ₹12 lakh gross minus standard deduction has taxable income below ₹12 lakh, so the section 87A rebate reduces tax liability to zero.'],
      ['What is the section 87A rebate?', 'It rebates up to ₹60,000 of tax for taxpayers whose taxable income does not exceed ₹12 lakh under the new regime — the reason zero tax applies up to that level.'],
      ['Is the 4% cess avoidable?', 'No — the health and education cess of 4% applies on tax after rebate, whatever your slab.']
    ]
  },
  {
    slug: 'hra-exemption-calculator', title: 'HRA Calculator – House Rent Allowance Exemption | CalcForge',
    desc: 'Free HRA exemption calculator for India. Enter basic salary, HRA received and rent paid to find your tax-free HRA under section 10(13A).',
    intro: 'House Rent Allowance is partially exempt from income tax under section 10(13A), but only the least of three limits counts: the actual HRA received, rent paid minus 10% of basic salary, or 50% of basic (metros) / 40% (other cities). This calculator applies all three and shows you the winner.',
    formula: 'Exempt = min(HRA received, rent − 10% basic, 50%/40% basic)',
    fields: [
      { key: 'basic', label: 'Basic salary (monthly)', unit: '₹', value: 60000 },
      { key: 'hra', label: 'HRA received (monthly)', unit: '₹', value: 24000 },
      { key: 'rent', label: 'Rent paid (monthly)', unit: '₹', value: 20000 },
      { key: 'city', label: 'City', select: [['metro', 'Metro (50% cap)'], ['other', 'Other city (40% cap)']] }
    ],
    faqs: [
      ['Can I claim HRA if I live in my own house?', 'No — HRA exemption requires actual rent paid. If you own your home and pay no rent, the full HRA is taxable (though you may claim home loan deductions instead).'],
      ['Do I need rent receipts to claim HRA?', 'If annual rent exceeds ₹1 lakh, your employer needs the landlord\u2019s PAN; otherwise rent receipts suffice. Claiming without genuine rent paid can trigger scrutiny.'],
      ['Does HRA exemption apply in the new tax regime?', 'For most salaried taxpayers under the new regime, HRA exemption is not available — it mainly benefits those in the old regime.']
    ]
  },
  {
    slug: 'salary-calculator', title: 'Salary Calculator – CTC to In-Hand Salary | CalcForge',
    desc: 'Free CTC to in-hand salary calculator for India. Estimate your monthly take-home from annual CTC after PF, professional tax and income tax.',
    intro: 'Cost to Company (CTC) is everything your employer spends on you — but your bank credit is smaller after provident fund, professional tax, income tax and benefits. This calculator breaks CTC down into a realistic monthly in-hand estimate.',
    formula: 'In-hand ≈ CTC − PF − PT − Tax − Benefits',
    fields: [
      { key: 'ctc', label: 'Annual CTC', unit: '₹', value: 1200000 },
      { key: 'basicPct', label: 'Basic as % of CTC', unit: '%', value: 40 },
      { key: 'tax', label: 'Annual income tax (est.)', unit: '₹', value: 0 },
      { key: 'pt', label: 'Professional tax (annual)', unit: '₹', value: 2400 },
      { key: 'other', label: 'Other monthly deductions', unit: '₹', value: 0 }
    ],
    faqs: [
      ['Why is in-hand salary less than CTC ÷ 12?', 'CTC includes employer PF contributions, gratuity, insurance premiums and other benefits that never appear in your monthly credit — those are deducted from the annual figure before dividing.'],
      ['What percentage of CTC is usually basic?', 'Most Indian companies set basic at 40–50% of CTC. A higher basic raises your PF contribution but can also raise gratuity and leave encashment later.'],
      ['Is employer PF part of my salary?', 'Yes — the employer\u2019s 12% goes into your EPF account, so it is deferred salary, not lost money.']
    ]
  },
  {
    slug: 'compound-interest-calculator', title: 'Compound Interest Calculator | CalcForge',
    desc: 'Free compound interest calculator. Enter amount, rate, years and compounding frequency to get the maturity value and effective annual yield.',
    intro: 'Compound interest means earning interest on your interest. The more often it compounds — yearly, half-yearly, quarterly or monthly — the faster money grows at the same nominal rate. This calculator also shows the effective annual yield so you can compare offers with different compounding schedules.',
    formula: 'A = P × (1 + r/n)^(n×t)',
    fields: [
      { key: 'amount', label: 'Principal', unit: '₹', value: 100000 },
      { key: 'rate', label: 'Interest rate (p.a.)', unit: '%', value: 8 },
      { key: 'years', label: 'Period', unit: 'yrs', value: 5 },
      { key: 'freq', label: 'Compounding', select: [['12', 'Monthly'], ['4', 'Quarterly'], ['2', 'Half-yearly'], ['1', 'Yearly']] }
    ],
    faqs: [
      ['What is the rule of 72?', 'Divide 72 by your annual return to approximate how many years your money doubles. At 8%, that is about 9 years.'],
      ['Does monthly compounding beat quarterly?', 'Yes, at the same nominal rate — more frequent compounding means a higher effective yield (8% compounded monthly yields 8.30% effectively).'],
      ['What is effective annual rate?', 'The real yearly growth after compounding. It is always equal to or above the quoted nominal rate whenever compounding happens more than once a year.']
    ]
  },
  {
    slug: 'simple-interest-calculator', title: 'Simple Interest Calculator | CalcForge',
    desc: 'Free simple interest calculator. Compute SI on any principal at any rate for any period, plus the total repayable amount.',
    intro: 'Simple interest is charged only on the original principal — it never compounds. Personal loans between family members, some crop loans and many short-term advances use it. The formula is one line, but doing it right every time is what this calculator is for.',
    formula: 'SI = P × R × T ÷ 100',
    fields: [
      { key: 'amount', label: 'Principal', unit: '₹', value: 200000 },
      { key: 'rate', label: 'Interest rate (p.a.)', unit: '%', value: 10 },
      { key: 'years', label: 'Period', unit: 'yrs', value: 3 }
    ],
    faqs: [
      ['When is simple interest used in India?', 'Short-term personal loans, some agri and gold loans, and internal company advances commonly use simple interest; mortgages and deposits almost always compound.'],
      ['Why does a bank quote flat interest on loans?', 'Flat-rate loans (common for vehicle finance) charge interest on the original principal even as you repay — the effective rate is roughly double the quoted flat rate.'],
      ['Simple vs compound: which is cheaper to borrow at?', 'For the same nominal rate, simple interest costs less over the life of a loan because interest never accrues on unpaid interest.']
    ]
  },
  {
    slug: 'percentage-calculator', title: 'Percentage Calculator – %, Increase and Share | CalcForge',
    desc: 'Free percentage calculator. Find X% of a number, what percent one number is of another, or the percentage increase/decrease between two values.',
    intro: 'Three questions account for almost every percentage calculation in daily life: What is 20% of 500? 45 is what percent of 90? Did sales rise or fall from 120 to 150? This tool answers all three instantly — useful for exam scores, discounts, tips and growth rates.',
    formula: '% = part ÷ whole × 100',
    fields: [
      { key: 'mode', label: 'Question type', select: [['of', 'X% of Y'], ['what', 'X is what % of Y'], ['change', '% change from X to Y']] },
      { key: 'x', label: 'First number (X)', value: 20 },
      { key: 'y', label: 'Second number (Y)', value: 500 }
    ],
    faqs: [
      ['How do I calculate percentage increase?', 'Subtract the old value from the new, divide by the old value, multiply by 100. From 120 to 150: (30 ÷ 120) × 100 = +25%.'],
      ['Is a 10% rise then 10% fall break-even?', 'No — you end 1% lower, because the fall applies to the larger base. Percentage changes are always relative to their starting value.'],
      ['How do I reverse a percentage?', 'To undo a 20% discount from ₹480, divide by 1.20 (not multiply): the original was ₹400.']
    ]
  },
  {
    slug: 'age-calculator', title: 'Age Calculator – Exact Age in Years, Months, Days | CalcForge',
    desc: 'Free age calculator for India. Enter a date of birth to get exact age in years, months and days, total days lived, and days to the next birthday.',
    intro: 'Most people know their age in years, but government forms, school admissions, job eligibility and sports categories need it in years, months and days — or even total days. Enter any date of birth and get all three instantly.',
    formula: 'Calendar-accurate Y-M-D difference',
    fields: [
      { key: 'dob', label: 'Date of birth', type: 'date', value: '2009-08-15' }
    ],
    faqs: [
      ['How is exact age different from what I say?', 'Someone born 15 August 2009 is "16" after August 2025, but before that birthday their calendar age is 15 years, N months and D days — which is what official forms ask.'],
      ['Does this account for leap years?', 'Yes — the calculation uses real calendar dates, so February 29 birthdays and leap-year spans are handled correctly.'],
      ['Can I use it for upcoming birthdays?', 'Yes, the result shows exactly how many days remain until the next birthday.']
    ]
  },
  {
    slug: 'bmi-calculator', title: 'BMI Calculator – Body Mass Index in kg and cm | CalcForge',
    desc: 'Free BMI calculator. Enter height in cm and weight in kg to get your body mass index, WHO category and healthy weight range for your height.',
    intro: 'Body Mass Index is the quick screening number that compares your weight to your height. It is not a diagnosis — athletes can misread it — but it is the standard first check doctors use worldwide for underweight, overweight and obesity risk.',
    formula: 'BMI = weight (kg) ÷ height² (m)',
    fields: [
      { key: 'height', label: 'Height', unit: 'cm', value: 172 },
      { key: 'weight', label: 'Weight', unit: 'kg', value: 68 }
    ],
    faqs: [
      ['What BMI range is healthy?', 'By WHO standards: under 18.5 is underweight, 18.5–24.9 normal, 25–29.9 overweight, 30+ obese.'],
      ['Is BMI accurate for muscular people?', 'Not perfectly — muscle weighs more than fat, so athletes can show "overweight" BMIs with low body fat. Waist circumference is a useful cross-check.'],
      ['Does BMI differ for Indians?', 'Indian health guidelines often use lower action thresholds (23 for overweight) because South Asians carry more visceral fat at the same BMI.']
    ]
  },
  {
    slug: 'loan-comparison-calculator', title: 'Home Loan EMI Comparison – Rate & Tenure | CalcForge',
    desc: 'Compare home loan EMIs by changing rate and tenure side by side. See how each option moves your monthly EMI, total interest and total payable.',
    intro: 'The same ₹50 lakh loan costs wildly different amounts depending on the rate you accept and the tenure you choose. Change either field here and watch all three numbers — EMI, total interest, total payable — update together, so you can decide between a longer tenure or a lower rate.',
    formula: 'Same EMI formula, two levers',
    fields: [
      { key: 'amount', label: 'Loan amount', unit: '₹', value: 5000000 },
      { key: 'rate', label: 'Interest rate (p.a.)', unit: '%', value: 8.7 },
      { key: 'years', label: 'Tenure', unit: 'yrs', value: 25 }
    ],
    faqs: [
      ['Is a longer tenure better for a home loan?', 'Lower EMIs and easier cash flow — but total interest balloons, often exceeding the principal on 25–30 year loans. Shorter tenures build equity faster.'],
      ['How much does one year of tenure change my EMI?', 'On ₹50 lakh at 8.7%, cutting tenure from 25 to 20 years raises the EMI by roughly ₹3,100 but saves around ₹17 lakh in interest.'],
      ['Should I take a floating or fixed rate?', 'Floating rates track the RBI repo-linked benchmark and fall when rates do; fixed rates give certainty. In a falling-rate cycle, floating usually wins.']
    ]
  },
  {
    slug: 'about', title: 'About CalcForge – Free Online Calculators | CalcForge',
    desc: 'CalcForge is a fast, free collection of Indian finance and everyday calculators — EMI, SIP, FD, PPF, EPF, GST, income tax and more. No sign-up, no data sold.',
    kind: 'static'
  },
  {
    slug: 'privacy-policy', title: 'Privacy Policy | CalcForge', desc: 'CalcForge privacy policy: what data the site stores and does not store.', kind: 'static' }
];

const CALC_KEY = {'emi-calculator':'emi','loan-comparison-calculator':'emi','sip-calculator':'sip','fd-calculator':'fd','rd-calculator':'rd','ppf-calculator':'ppf','epf-calculator':'epf','gst-calculator':'gst','income-tax-calculator':'incometax','hra-exemption-calculator':'hra','salary-calculator':'ctc','compound-interest-calculator':'compound','simple-interest-calculator':'simple','percentage-calculator':'percentage','age-calculator':'age','bmi-calculator':'bmi'};
const SHORT = {'emi-calculator':'EMI Calculator','loan-comparison-calculator':'Loan Comparison','sip-calculator':'SIP Calculator','fd-calculator':'FD Calculator','rd-calculator':'RD Calculator','ppf-calculator':'PPF Calculator','epf-calculator':'EPF Calculator','gst-calculator':'GST Calculator','income-tax-calculator':'Income Tax Calculator','hra-exemption-calculator':'HRA Calculator','salary-calculator':'Salary (CTC) Calculator','compound-interest-calculator':'Compound Interest','simple-interest-calculator':'Simple Interest','percentage-calculator':'Percentage Calculator','age-calculator':'Age Calculator','bmi-calculator':'BMI Calculator'};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function fieldHTML(f) {
  if (f.select) {
    return `<div class="field"><label>${esc(f.label)}</label><select data-key="${f.key}">${f.select.map(o => `<option value="${o[0]}">${esc(o[1])}</option>`).join('')}</select></div>`;
  }
  const type = f.type || 'number';
  return `<div class="field"><label>${esc(f.label)}</label><div class="input-wrap"><input data-key="${f.key}" type="${type}" value="${f.value}">${f.unit ? `<span class="unit">${esc(f.unit)}</span>` : ''}</div></div>`;
}

function pageShell({ title, desc, body, canonical }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${BASE}/${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="assets/style.css">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000" crossorigin="anonymous"></script>
</head>
<body>
<header class="site"><div class="wrap"><a class="logo" href="index.html">Calc<span>Forge</span></a><nav><a href="index.html">All calculators</a><a href="about.html">About</a></nav></div></header>
${body}
<footer class="site"><div class="wrap"><span>© 2026 CalcForge — free calculators, no sign-up.</span><span><a href="privacy-policy.html">Privacy</a> · <a href="about.html">About</a></span></div></footer>
<script src="assets/calc.js"></script>
</body>
</html>`;
}

const tools = PAGES.filter(p => !p.kind);

function calcPage(p) {
  const related = tools.filter(t => t.slug !== p.slug).slice(0, 5)
    .map(t => `<a href="${t.slug}.html">${esc(SHORT[t.slug])}</a>`).join('\n    ');
  return pageShell({
    title: p.title, desc: p.desc, canonical: p.slug + '.html',
    body: `<main class="wrap">
<div class="breadcrumbs"><a href="index.html">Home</a> › ${esc(p.title.split('|')[0].trim())}</div>
<h1>${esc(p.title.split('|')[0].trim())}</h1>
<p class="lede">${p.intro}</p>
<div class="ad-slot">Ad slot — top banner (728×90)</div>
<div class="card">
  <form data-calc="${CALC_KEY[p.slug]}">
    <div class="calc-form">${p.fields.map(fieldHTML).join('\n    ')}</div>
    <div class="results" id="results"><p class="hint">Enter values to see results.</p></div>
  </form>
</div>
<div class="ad-slot">Ad slot — inline (responsive)</div>
<h2>The formula</h2>
<p class="formula">${esc(p.formula)}</p>
<h2>FAQ</h2>
${p.faqs.map(f => `<h3 style="margin:.9em 0 .2em">${esc(f[0])}</h3><p>${f[1]}</p>`).join('\n')}
<h2>Related calculators</h2>
<div class="related">${related}</div>
</main>`
  });
}

function homePage() {
  const groups = [
    ['Loans & EMIs', ['emi-calculator', 'loan-comparison-calculator', 'simple-interest-calculator', 'compound-interest-calculator']],
    ['Investments & Savings', ['sip-calculator', 'fd-calculator', 'rd-calculator', 'ppf-calculator', 'epf-calculator']],
    ['Salary & Tax', ['income-tax-calculator', 'salary-calculator', 'hra-exemption-calculator', 'gst-calculator']],
    ['Everyday', ['percentage-calculator', 'age-calculator', 'bmi-calculator']]
  ];
  const bySlug = Object.fromEntries(tools.map(t => [t.slug, t]));
  return pageShell({
    title: 'CalcForge – Free Online Calculators for India (EMI, SIP, GST, Income Tax)',
    desc: 'Fast, free calculators for Indian money and daily life: EMI, SIP, FD, RD, PPF, EPF, GST, income tax FY 2026-27, CTC to in-hand, percentage, age and BMI. No sign-up.',
    canonical: '',
    body: `<main class="wrap">
<h1>Free Online Calculators for India</h1>
<p class="lede">CalcForge is a fast collection of money and everyday calculators built for Indian users — no sign-up, no pop-ups, everything runs in your browser.</p>
<div class="ad-slot">Ad slot — top banner (728×90)</div>
${groups.map(([g, slugs]) => `<h2>${esc(g)}</h2>\n<div class="grid">${slugs.map(s => { const t = bySlug[s]; return `<a class="tool-card" href="${s}.html"><strong>${esc(SHORT[s])}</strong><span>${esc(t.desc.split('.')[0])}.</span></a>`; }).join('\n')}</div>`).join('\n')}
<div class="ad-slot">Ad slot — bottom (responsive)</div>
<h2>Why CalcForge?</h2>
<p>Most Indian calculator sites are lead-generation machines buried under pop-ups that sell your phone number to banks. CalcForge does the opposite: pick a tool, type numbers, get an answer in under a second. Every formula is the standard one used by banks and fund houses, and every page explains its math so you can trust the result.</p>
</main>`
  });
}

// --- write files ---
for (const p of PAGES) {
  const body = p.kind === 'static' ? staticBody(p.slug) : calcPage(p);
  if (p.kind === 'static') fs.writeFileSync(path.join(OUT, p.slug + '.html'), pageShell({ title: p.title, desc: p.desc, canonical: p.slug + '.html', body }));
  else fs.writeFileSync(path.join(OUT, p.slug + '.html'), body);
}
fs.writeFileSync(path.join(OUT, 'index.html'), homePage());

function staticBody(slug) {
  if (slug === 'about') return `<main class="wrap">
<h1>About CalcForge</h1>
<p class="lede">A free, fast collection of financial and everyday calculators built for India — no sign-up, no data selling, no lead forms.</p>
<div class="card"><p>CalcForge exists because most Indian finance tools are buried inside aggregator portals that exist to capture your phone number and forward it to banks. Here the calculator is the product: pages load in under two seconds, results update as you type, and every tool shows the formula it used so you can verify the math yourself.</p>
<p>The site is funded entirely by Google AdSense — which is why everything stays free. We do not sell user data, we do not generate leads, and we never lock a feature behind a paywall.</p></div>
<h2>How the tools are built</h2>
<p>All calculations run in your browser with plain JavaScript — no server round-trips, no frameworks to download. Income tax pages follow the FY 2026-27 (AY 2027-28) new-regime slab table including the section 87A rebate and 4% cess; loan and investment tools use the standard compound-interest formulas your bank or fund house uses.</p>
<div class="related"><a href="index.html">All calculators</a><a href="emi-calculator.html">EMI</a><a href="sip-calculator.html">SIP</a><a href="income-tax-calculator.html">Income Tax</a></div>
</main>`;
  return `<main class="wrap">
<h1>Privacy Policy</h1>
<p class="lede">Last updated: October 2026</p>
<div class="card"><p><strong>No accounts, no personal data collection.</strong> CalcForge does not ask you to sign up, and the calculators run entirely in your browser — the numbers you type are never sent to a server or stored by us.</p></div>
<h2>Cookies &amp; advertising</h2>
<p>Google AdSense may use cookies to serve ads on this site. Google\u2019s use of advertising cookies enables it and its partners to serve ads based on your visit to this site and/or other sites on the internet. You may opt out of personalised advertising by visiting Google Ads Settings.</p>
<h2>Analytics</h2>
<p>If analytics are enabled, they collect aggregate page-view statistics only (which tool was used, roughly how long it was open), not personal information.</p>
<h2>Contact</h2><p>Questions? Use the links below or reach out via the GitHub repository linked in the footer.</p>
<div class="related"><a href="index.html">Home</a></div>
</main>`;
}

// --- sitemap ---
const all = ['index', ...PAGES.map(p => p.slug)];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all.map(s => `  <url><loc>${BASE}/${s === 'index' ? '' : s + '.html'}</loc></url>`).join('\n')}\n</urlset>\n`);

// --- robots.txt ---
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);

console.log(`Wrote ${all.length} URLs (index + ${PAGES.length} pages) to ${OUT}`);
