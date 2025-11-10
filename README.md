# 💼 Web Based Tax & Leasing Calculator

A responsive, single-page web application developed using **HTML**, **CSS**, and **JavaScript** to calculate various taxes and leasing plans.  
This project fulfills the assignment requirements of the **Institute of Computer Engineering Technology (ICET)**.

---

## 🌟 Overview

The Web Based Tax & Leasing Calculator allows users to compute multiple financial values interactively, such as:
- Withholding tax (for rent, bank interest, and dividends)
- Monthly payable tax based on progressive slabs
- Annual income tax computation
- SSCL tax (Sales & VAT calculation)
- Leasing payment estimations and plan comparisons

The project includes a **clean user interface**, **inline validation**, and **dynamic result rendering** — all within a single page.

---

## 🎯 Learning Outcomes

This project demonstrates:
- The use of **JavaScript** for logic, validation, and user interface interaction  
- Implementation of **progressive tax calculation methods**  
- Application of **financial formulas** for EMI-based leasing computations  
- Organized **code structure and modular scripting**  
- Application of **HTML form validation** and DOM manipulation  
- Use of **GitHub version control** for submission and tracking

---

## 🧩 Features

### 1. Navigation
Tabbed layout to switch between modules:
- **Withholding Tax**
- **Payable Tax (Monthly)**
- **Income Tax (Annual)**
- **SSCL Tax**
- **Leasing Calculations**
- **Reset / Clear Function**

### 2. Withholding Tax
- **Tax Types:** Rent, Bank Interest, Dividend  
- **Rates:**  
  - Rent → 10% if above Rs. 100,000  
  - Bank Interest → 5%  
  - Dividend → 14% if above Rs. 100,000  
- Inline numeric validation and results displayed on-page.

### 3. Payable Tax (Monthly)
Implements a **progressive tax system**:

| Salary Range (Rs.) | Tax Rate |
|--------------------:|----------|
| 0 – 100,000 | 0% |
| 100,001 – 141,667 | 6% |
| 141,668 – 183,333 | 12% |
| 183,334 – 225,000 | 18% |
| 225,001 – 266,667 | 24% |
| 266,668 – 308,333 | 30% |
| 308,334+ | 36% |

**Outputs:**  
- Applied rate(s)  
- Tax amount  
- Net salary after tax  

### 4. Income Tax (Annual)
Similar progressive calculation for **annual income**:

| Income Range (Rs.) | Tax Rate |
|--------------------:|----------|
| Up to 1,200,000 | 0% |
| 1,200,001 – 1,700,000 | 6% |
| 1,700,001 – 2,200,000 | 12% |
| 2,200,001 – 2,700,000 | 18% |
| 2,700,001 – 3,200,000 | 24% |
| 3,200,001 – 3,700,000 | 30% |
| Above 3,700,000 | 36% |

**Outputs:**  
- Full tax breakdown by range  
- Net annual income after tax  

### 5. SSCL Tax
Formula-based calculation:

