/**
 * 13th month pay calculation utilities.
 * Formula: 13th Month Pay = Total Basic Salary Earned in Calendar Year ÷ 12
 * Prorated when employed for less than 12 months.
 */

/**
 * Count weekdays (Mon–Fri) between two dates, inclusive.
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number}
 */
export function countWeekdaysInRange(startDate, endDate) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  if (end < start) return 0;
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    const day = d.getDay();
    if (day >= 1 && day <= 5) count += 1;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

/**
 * Get days in a given month (1-indexed).
 */
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Compute total basic salary earned from startDate to endDate (inclusive),
 * at the given monthly basic salary. Prorates partial months by days worked.
 * @param {number} monthlyBasicSalary - Monthly basic salary
 * @param {Date} startDate - First day of employment in the year
 * @param {Date} endDate - Last day of employment in the year
 * @param {number} unpaidAbsenceDays - Optional unpaid absence days to deduct
 * @returns {{ totalBasicEarned: number, dailyRate: number, workingDays: number, unpaidDeduction: number }}
 */
export function computeTotalBasicEarned(monthlyBasicSalary, startDate, endDate, unpaidAbsenceDays = 0) {
  if (!monthlyBasicSalary || monthlyBasicSalary <= 0) {
    return { totalBasicEarned: 0, dailyRate: 0, workingDays: 0, unpaidDeduction: 0 };
  }

  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (end < start) {
    return { totalBasicEarned: 0, dailyRate: 0, workingDays: 0, unpaidDeduction: 0 };
  }

  let totalEarned = 0;
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endMonth) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const daysInMonth = getDaysInMonth(year, month + 1);

    let firstWorked = 1;
    let lastWorked = daysInMonth;

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, daysInMonth);

    if (monthStart < start) firstWorked = start.getDate();
    if (monthEnd > end) lastWorked = end.getDate();

    const daysWorked = Math.max(0, lastWorked - firstWorked + 1);
    const fraction = daysWorked / daysInMonth;
    totalEarned += monthlyBasicSalary * fraction;

    current.setMonth(current.getMonth() + 1);
  }

  const dailyRate = monthlyBasicSalary / 22;
  const unpaidDeduction = Math.min(unpaidAbsenceDays * dailyRate, totalEarned);
  const totalBasicEarned = Math.max(0, totalEarned - unpaidDeduction);

  return {
    totalBasicEarned,
    dailyRate,
    workingDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
    unpaidDeduction,
  };
}

/**
 * Compute 13th month pay.
 * 13th Month Pay = Total Basic Salary Earned ÷ 12
 */
export function compute13thMonthPay(totalBasicEarned) {
  return totalBasicEarned / 12;
}

/**
 * Compute total basic salary earned from individual monthly amounts per year.
 * monthlyAmountsByYear[year] = length-12 array [Jan..Dec] in PHP. All years in
 * [startDate, endDate] are included; partial months are prorated by days in range.
 * @param {{ [year: number]: number[] }} monthlyAmountsByYear - e.g. { 2025: [12 numbers], 2026: [12 numbers] }
 * @param {Date} startDate - First day of period
 * @param {Date} endDate - Last day of period
 * @param {number} unpaidAbsenceDays - Unpaid absence days to deduct
 * @returns {{ totalBasicEarned: number, dailyRate: number, unpaidDeduction: number, earningsPerMonth: { label: string, year: number, month: number, earned: number }[] }}
 */
export function computeTotalBasicEarnedFromMonthlyAmounts(monthlyAmountsByYear, startDate, endDate, unpaidAbsenceDays = 0) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (end < start || !monthlyAmountsByYear || typeof monthlyAmountsByYear !== "object") {
    return {
      totalBasicEarned: 0,
      dailyRate: 0,
      unpaidDeduction: 0,
      earningsPerMonth: [],
    };
  }

  let totalEarned = 0;
  const earningsPerMonth = [];
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  for (let year = startYear; year <= endYear; year++) {
    const amounts = monthlyAmountsByYear[year];
    const arr = Array.isArray(amounts) && amounts.length >= 12 ? amounts : [];

    for (let month = 0; month < 12; month++) {
      const daysInMonth = getDaysInMonth(year, month + 1);
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month, daysInMonth);

      if (monthEnd < start || monthStart > end) continue;

      const amount = Number(arr[month]) || 0;
      let firstWorked = 1;
      let lastWorked = daysInMonth;
      if (monthStart < start) firstWorked = start.getDate();
      if (monthEnd > end) lastWorked = end.getDate();

      const daysWorked = Math.max(0, lastWorked - firstWorked + 1);
      const fraction = daysInMonth > 0 ? daysWorked / daysInMonth : 0;
      const earned = amount * fraction;
      totalEarned += earned;

      if (earned > 0) {
        earningsPerMonth.push({
          label: `${MONTH_NAMES[month]} ${year}`,
          year,
          month: month + 1,
          earned,
        });
      }
    }
  }

  const workdays = countWeekdaysInRange(start, end);
  const dailyRate = workdays > 0 ? totalEarned / workdays : 0;
  const unpaidDeduction = Math.min(unpaidAbsenceDays * dailyRate, totalEarned);
  const totalBasicEarned = Math.max(0, totalEarned - unpaidDeduction);

  return {
    totalBasicEarned,
    dailyRate,
    unpaidDeduction,
    earningsPerMonth,
  };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Compute basic salary earned per month from startDate to endDate (inclusive).
 * Prorates partial months by days worked. Does not apply unpaid deductions.
 * @param {number} monthlyBasicSalary - Monthly basic salary
 * @param {Date} startDate - First day of employment in the year
 * @param {Date} endDate - Last day of employment in the year
 * @returns {{ label: string, year: number, month: number, daysWorked: number, daysInMonth: number, earned: number }[]}
 */
export function computeEarningsPerMonth(monthlyBasicSalary, startDate, endDate) {
  if (!monthlyBasicSalary || monthlyBasicSalary <= 0) {
    return [];
  }

  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (end < start) return [];

  const result = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endMonth) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const daysInMonth = getDaysInMonth(year, month + 1);

    let firstWorked = 1;
    let lastWorked = daysInMonth;

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, daysInMonth);

    if (monthStart < start) firstWorked = start.getDate();
    if (monthEnd > end) lastWorked = end.getDate();

    const daysWorked = Math.max(0, lastWorked - firstWorked + 1);
    const fraction = daysWorked / daysInMonth;
    const earned = monthlyBasicSalary * fraction;

    result.push({
      label: `${MONTH_NAMES[month]} ${year}`,
      year,
      month: month + 1,
      daysWorked,
      daysInMonth,
      earned,
    });

    current.setMonth(current.getMonth() + 1);
  }

  return result;
}
