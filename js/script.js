/* Utility: format currency */
const fmtRs = (n) => {
  if (isNaN(n) || !isFinite(n)) return "—";
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(n);
};

const clamp = (n, min = 0) => Math.max(min, Number(n) || 0);

/* Tab switching */
document.querySelectorAll('.tab[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.querySelector(btn.dataset.target);
    if (panel) panel.classList.add('active');
  });
});

/* Footer year */
document.getElementById('year').textContent = new Date().getFullYear();

/* Global reset */
document.getElementById('resetAll').addEventListener('click', () => {
  document.querySelectorAll('form').forEach(f => f.reset());
  document.querySelectorAll('.result').forEach(r => r.innerHTML = '');
  document.querySelectorAll('.error').forEach(e => e.textContent = '');
});

/* Helpers */
const validatePositive = (value, errorEl, msg = 'Enter a number greater than 0.') => {
  const num = Number(value);
  if (!value || isNaN(num) || num <= 0) {
    errorEl.textContent = msg;
    return null;
  }
  errorEl.textContent = '';
  return num;
};

const buildTable = (headers, rows, footer) => {
  const th = headers.map(h => `<th>${h}</th>`).join('');
  const trs = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
  const tfoot = footer ? `<tfoot><tr>${footer.map(c => `<td>${c}</td>`).join('')}</tr></tfoot>` : '';
  return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody>${tfoot}</table>`;
};

/* ============ 1) WITHHOLDING TAX ============ */
document.getElementById('withholdingForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.getElementById('whtType').value;
  const amountEl = document.getElementById('whtAmount');
  const errEl = document.getElementById('whtAmountError');
  const resultEl = document.getElementById('whtResult');

  const amount = validatePositive(amountEl.value, errEl);
  if (amount === null) { resultEl.innerHTML = ''; return; }

  let rate = 0, note = '';
  if (type === 'interest') {
    rate = 0.05;
    note = 'Bank Interest taxed at 5% regardless of amount.';
  } else if (type === 'rent') {
    rate = amount > 100000 ? 0.10 : 0;
    note = amount > 100000 ? 'Rent above Rs. 100,000 taxed at 10%.' : 'Amount ≤ Rs. 100,000 → 0%.';
  } else if (type === 'dividend') {
    rate = amount > 100000 ? 0.14 : 0;
    note = amount > 100,000 ? 'Dividend above Rs. 100,000 taxed at 14%.' : 'Amount ≤ Rs. 100,000 → 0%.';
  }

  const tax = amount * rate;
  const net = amount - tax;

  resultEl.innerHTML = `
    <div><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</div>
    <div><strong>Amount:</strong> ${fmtRs(amount)}</div>
    <div><strong>Rate:</strong> ${(rate*100).toFixed(2)}%</div>
    <div><strong>Tax:</strong> ${fmtRs(tax)}</div>
    <div><strong>Net after withholding:</strong> ${fmtRs(net)}</div>
    <p class="hint">${note}</p>
  `;
});

document.querySelector('#withholdingForm [data-action="clear"]').addEventListener('click', () => {
  document.getElementById('withholdingForm').reset();
  document.getElementById('whtResult').innerHTML = '';
  document.getElementById('whtAmountError').textContent = '';
});

/* ============ Progressive tax helpers ============ */
const monthlyBrackets = [
  { upTo: 100000, rate: 0.00 },
  { upTo: 141667, rate: 0.06 },
  { upTo: 183333, rate: 0.12 },
  { upTo: 225000, rate: 0.18 },
  { upTo: 266667, rate: 0.24 },
  { upTo: 308333, rate: 0.30 },
  { upTo: Infinity, rate: 0.36 },
];

const annualBrackets = [
  { upTo: 1200000, rate: 0.00 },
  { upTo: 1700000, rate: 0.06 },
  { upTo: 2200000, rate: 0.12 },
  { upTo: 2700000, rate: 0.18 },
  { upTo: 3200000, rate: 0.24 },
  { upTo: 3700000, rate: 0.30 },
  { upTo: Infinity, rate: 0.36 },
];

function calcProgressive(amount, brackets) {
  let remaining = amount;
  let lastCap = 0;
  const lines = [];
  let totalTax = 0;

  for (const b of brackets) {
    const cap = b.upTo;
    const slabAmt = Math.max(0, Math.min(remaining, cap - lastCap));
    if (slabAmt <= 0) { lastCap = cap; continue; }
    const taxPart = slabAmt * b.rate;
    lines.push({ range: `${lastCap.toLocaleString()} – ${cap === Infinity ? '∞' : cap.toLocaleString()}`, rate: b.rate, amount: slabAmt, tax: taxPart });
    totalTax += taxPart;
    remaining -= slabAmt;
    lastCap = cap;
    if (remaining <= 0) break;
  }
  return { lines, totalTax };
}

/* ============ 2) PAYABLE TAX (MONTHLY) ============ */
document.getElementById('payableForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const valueEl = document.getElementById('monthlySalary');
  const errEl = document.getElementById('monthlySalaryError');
  const resultEl = document.getElementById('payableResult');

  const salary = validatePositive(valueEl.value, errEl, 'Enter a positive monthly salary.');
  if (salary === null) { resultEl.innerHTML = ''; return; }

  const { lines, totalTax } = calcProgressive(salary, monthlyBrackets);
  const net = salary - totalTax;

  const rows = lines.map(l => [
    l.range, (l.rate*100).toFixed(2) + '%', fmtRs(l.amount), fmtRs(l.tax)
  ]);

  const table = buildTable(
    ['Salary Range (Rs.)', 'Rate', 'Taxable Amount', 'Tax'],
    rows,
    ['Total', '', '', fmtRs(totalTax)]
  );

  resultEl.innerHTML = `
    <div><strong>Monthly Salary:</strong> ${fmtRs(salary)}</div>
    ${table}
    <p><strong>Net Salary after Tax:</strong> ${fmtRs(net)}</p>
  `;
});

document.querySelector('#payableForm [data-action="clear"]').addEventListener('click', () => {
  document.getElementById('payableForm').reset();
  document.getElementById('payableResult').innerHTML = '';
  document.getElementById('monthlySalaryError').textContent = '';
});

/* ============ 3) INCOME TAX (ANNUAL) ============ */
document.getElementById('incomeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const valueEl = document.getElementById('annualIncome');
  const errEl = document.getElementById('annualIncomeError');
  const resultEl = document.getElementById('incomeResult');

  const income = validatePositive(valueEl.value, errEl, 'Enter a positive annual income.');
  if (income === null) { resultEl.innerHTML = ''; return; }

  const { lines, totalTax } = calcProgressive(income, annualBrackets);
  const net = income - totalTax;

  const rows = lines.map(l => [
    l.range, (l.rate*100).toFixed(2) + '%', fmtRs(l.amount), fmtRs(l.tax)
  ]);
  const table = buildTable(
    ['Income Range (Rs.)', 'Rate', 'Taxable Amount', 'Tax'],
    rows,
    ['Total', '', '', fmtRs(totalTax)]
  );

  resultEl.innerHTML = `
    <div><strong>Annual Income:</strong> ${fmtRs(income)}</div>
    ${table}
    <p><strong>Net Income after Tax:</strong> ${fmtRs(net)}</p>
  `;
});

document.querySelector('#incomeForm [data-action="clear"]').addEventListener('click', () => {
  document.getElementById('incomeForm').reset();
  document.getElementById('incomeResult').innerHTML = '';
  document.getElementById('annualIncomeError').textContent = '';
});

/* ============ 4) SSCL TAX ============ */
document.getElementById('ssclForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const valueEl = document.getElementById('ssclValue');
  const errEl = document.getElementById('ssclValueError');
  const resultEl = document.getElementById('ssclResult');

  const val = validatePositive(valueEl.value, errEl, 'Enter a positive value.');
  if (val === null) { resultEl.innerHTML = ''; return; }

  const saleTax = val * 0.025;
  const afterSaleTax = val + saleTax;
  const vat = afterSaleTax * 0.15;
  const sscl = saleTax + vat;

  const table = buildTable(
    ['Item', 'Amount (Rs.)'],
    [
      ['Sale Tax (2.5%)', fmtRs(saleTax)],
      ['After-Sale Amount', fmtRs(afterSaleTax)],
      ['VAT (15% on above)', fmtRs(vat)],
      ['Final SSCL', fmtRs(sscl)],
    ]
  );

  resultEl.innerHTML = `<div><strong>Base Value:</strong> ${fmtRs(val)}</div>${table}`;
});

document.querySelector('#ssclForm [data-action="clear"]').addEventListener('click', () => {
  document.getElementById('ssclForm').reset();
  document.getElementById('ssclResult').innerHTML = '';
  document.getElementById('ssclValueError').textContent = '';
});

/* ============ 5) LEASING ============ */
function toMonthlyRate(annualPct) {
  const r = Number(annualPct);
  return r > 0 ? (r / 100) / 12 : 0;
}

function emi(principal, monthlyRate, months) {
  if (monthlyRate <= 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

document.getElementById('leasingForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const P = validatePositive(document.getElementById('loanAmount').value, document.getElementById('loanAmountError'), 'Enter loan amount > 0.');
  const rA = validatePositive(document.getElementById('annualRate').value, document.getElementById('annualRateError'), 'Enter interest rate > 0.');
  const yearsVal = validatePositive(document.getElementById('years').value, document.getElementById('yearsError'), 'Enter years (1–5).');

  const resultEl = document.getElementById('leasingResult');
  if (P === null || rA === null || yearsVal === null) { resultEl.innerHTML = ''; return; }
  if (yearsVal > 5) { document.getElementById('yearsError').textContent = 'Years must be ≤ 5.'; resultEl.innerHTML = ''; return; }

  const i = toMonthlyRate(rA);
  const n = yearsVal * 12;
  const M = emi(P, i, n);
  const totalPay = M * n;
  const totalInt = totalPay - P;

  const table = buildTable(
    ['Item', 'Value'],
    [
      ['Principal (A)', fmtRs(P)],
      ['Monthly Rate (i)', (i*100).toFixed(4) + '%'],
      ['Months (n)', n.toString()],
      ['Monthly EMI', fmtRs(M)],
      ['Total Payment', fmtRs(totalPay)],
      ['Total Interest', fmtRs(totalInt)],
    ]
  );

  resultEl.innerHTML = `<h3>EMI Result</h3>${table}`;
});

document.getElementById('comparePlans').addEventListener('click', () => {
  const P = validatePositive(document.getElementById('loanAmount').value, document.getElementById('loanAmountError'), 'Enter loan amount > 0.');
  const rA = validatePositive(document.getElementById('annualRate').value, document.getElementById('annualRateError'), 'Enter interest rate > 0.');
  if (P === null || rA === null) return;

  const i = toMonthlyRate(rA);
  const terms = [3,4,5];
  const rows = terms.map(y => {
    const n = y * 12;
    const M = emi(P, i, n);
    return [y + ' years', n.toString(), fmtRs(M), fmtRs(M*n)];
  });

  const table = buildTable(['Term', 'Months', 'Monthly EMI', 'Total Payment'], rows);
  document.getElementById('planResult').innerHTML = `<h3>Plan Comparison</h3>${table}`;
});

document.querySelector('#leasingForm [data-action="clear"]').addEventListener('click', () => {
  document.getElementById('leasingForm').reset();
  document.getElementById('leasingResult').innerHTML = '';
  document.getElementById('planResult').innerHTML = '';
  ['loanAmountError','annualRateError','yearsError'].forEach(id => document.getElementById(id).textContent='');
});

/* Reverse calculation: Given M, r, n -> A */
document.getElementById('reverseForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const M = validatePositive(document.getElementById('monthlyPay').value, document.getElementById('monthlyPayError'), 'Enter monthly payment > 0.');
  const rA = validatePositive(document.getElementById('revAnnualRate').value, document.getElementById('revAnnualRateError'), 'Enter interest rate > 0.');
  const years = validatePositive(document.getElementById('revYears').value, document.getElementById('revYearsError'), 'Enter years (1–5).');
  const resultEl = document.getElementById('reverseResult');

  if (M === null || rA === null || years === null) { resultEl.innerHTML = ''; return; }
  if (years > 5) { document.getElementById('revYearsError').textContent = 'Years must be ≤ 5.'; resultEl.innerHTML = ''; return; } 

  const i = toMonthlyRate(rA);
  const n = years * 12;
  const A = i <= 0 ? M * n : M * (1 - Math.pow(1 + i, -n)) / i;

  const table = buildTable(
    ['Item', 'Value'],
    [
      ['Monthly Payment (M)', fmtRs(M)],
      ['Monthly Rate (i)', (i*100).toFixed(4) + '%'],
      ['Months (n)', n.toString()],
      ['Max Loan (A)', fmtRs(A)],
    ]
  );
  resultEl.innerHTML = `<h3>Reverse Calculation</h3>${table}`;
});

document.querySelector('#reverseForm [data-action="clear"]').addEventListener('click', () => {
  document.getElementById('reverseForm').reset();
  document.getElementById('reverseResult').innerHTML = '';
  ['monthlyPayError','revAnnualRateError','revYearsError'].forEach(id => document.getElementById(id).textContent='');
});
