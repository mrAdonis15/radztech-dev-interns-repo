import React, { useState, useCallback, useEffect } from "react";
import Barcode from "react-barcode";
import {
  computeTotalBasicEarned,
  compute13thMonthPay,
  countWeekdaysInRange,
} from "../utils/thirteenthMonthCalc";
import "../Calculator/Calculator.css";

const getYearStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1);
};
const getYearEnd = () => {
  const d = new Date();
  return new Date(d.getFullYear(), 11, 31);
};

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function formatCurrency(n) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(n);
}

const MAX_AMOUNT = 1e12; // 1 trillion

function clampAmount(value) {
  if (value === "" || value === null || value === undefined) return value;
  const num = parseFloat(String(value).replace(/,/g, ""));
  if (Number.isNaN(num) || num < 0) return value;
  if (num > MAX_AMOUNT) return String(MAX_AMOUNT);
  return value;
}

function Calculator() {
  const [monthlySalary, setMonthlySalary] = useState("");
  const [startDate, setStartDate] = useState(formatDate(getYearStart()));
  const [endDate, setEndDate] = useState(formatDate(getYearEnd()));
  const [unpaidDays, setUnpaidDays] = useState("0");
  const [allowances, setAllowances] = useState("0");
  const [copied, setCopied] = useState(false);

  const monthlyNum = parseFloat(monthlySalary) || 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const unpaid = Math.max(0, parseInt(unpaidDays, 10) || 0);
  const allowancesNum = parseFloat(allowances) || 0;

  const maxWeekdays = countWeekdaysInRange(start, end);

  useEffect(() => {
    if (unpaidDays === "") return;
    const n = parseInt(unpaidDays, 10);
    if (!Number.isNaN(n) && maxWeekdays >= 0 && n > maxWeekdays) {
      setUnpaidDays(String(maxWeekdays));
    }
  }, [maxWeekdays, unpaidDays]);

  const { totalBasicEarned, dailyRate, unpaidDeduction } =
    computeTotalBasicEarned(monthlyNum, start, end, unpaid);
  const totalFor13th = totalBasicEarned + allowancesNum;
  const thirteenthMonth = compute13thMonthPay(totalFor13th);

  // Barcode value: 13M + YYYYMMDD + amount (e.g. 13M2025022525000) for receipt/print
  const receiptBarcodeValue =
    monthlyNum > 0
      ? `13M${formatDate(new Date()).replace(/-/g, "")}${Math.round(thirteenthMonth)}`
      : "";

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopy = useCallback(() => {
    const text = formatCurrency(thirteenthMonth);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  }, [thirteenthMonth]);

  const handleReset = useCallback(() => {
    setMonthlySalary("");
    setStartDate(formatDate(getYearStart()));
    setEndDate(formatDate(getYearEnd()));
    setUnpaidDays("0");
    setAllowances("0");
  }, []);

  return (
    <div className="calculator">
      <h1 className="calculator-title">13th Month Pay Calculator</h1>

      <div className="calculator-layout">
        <section className="calculator-form">
          <div className="form-group">
            <label htmlFor="monthly-salary">Monthly Basic Salary (PHP)</label>
            <input
              id="monthly-salary"
              type="number"
              min="0"
              max={MAX_AMOUNT}
              step="0.01"
              placeholder="e.g. 25000"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(clampAmount(e.target.value))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start-date">Employment Start Date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="end-date">Employment End Date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="allowances">Allowances (optional, PHP)</label>
            <input
              id="allowances"
              type="number"
              min="0"
              max={MAX_AMOUNT}
              step="0.01"
              placeholder="0"
              value={allowances}
              onChange={(e) => setAllowances(clampAmount(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="unpaid-days">Unpaid Absence Days (optional)</label>
            <input
              id="unpaid-days"
              type="number"
              min="0"
              max={maxWeekdays}
              step="1"
              placeholder="0"
              value={unpaidDays}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  setUnpaidDays(v);
                  return;
                }
                const n = parseInt(v, 10);
                if (Number.isNaN(n) || n < 0) return;
                setUnpaidDays(n > maxWeekdays ? String(maxWeekdays) : v);
              }}
            />
            {maxWeekdays > 0 && (
              <span className="form-hint">
                Max {maxWeekdays} weekdays in selected period
              </span>
            )}
          </div>

          <button type="button" className="btn-reset" onClick={handleReset}>
            Reset
          </button>
        </section>

        <section className="calculator-results receipt">
          <div className="receipt-paper">
            <div className="receipt-print-header" aria-hidden="true">
              <span className="receipt-print-title">
                13th Month Pay Calculator
              </span>
              <span className="receipt-print-date">
                {new Date().toLocaleString("en-PH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="receipt-header">
              <h2 className="receipt-title">13TH MONTH PAY</h2>
              <div className="receipt-sub">Estimate</div>
            </div>
            <div className="receipt-body">
              <div className="receipt-line">
                <span>Basic salary earned</span>
                <span>{formatCurrency(totalBasicEarned)}</span>
              </div>
              {allowancesNum > 0 && (
                <div className="receipt-line">
                  <span>Allowances</span>
                  <span>+{formatCurrency(allowancesNum)}</span>
                </div>
              )}
              {unpaid > 0 && (
                <div className="receipt-line receipt-line-deduct">
                  <span>Unpaid absence</span>
                  <span>-{formatCurrency(unpaidDeduction)}</span>
                </div>
              )}
              <div className="receipt-divider" aria-hidden="true" />
              {monthlyNum > 0 && totalFor13th > 0 && (
                <div className="receipt-calculation">
                  <div className="receipt-calculation-formula">
                    {formatCurrency(totalFor13th)} ÷ 12 ={" "}
                    {formatCurrency(thirteenthMonth)}
                  </div>
                  <div className="receipt-calculation-label">
                    13th Month Pay = Total earned in period ÷ 12
                  </div>
                </div>
              )}
              <div className="receipt-line receipt-total">
                <span>13TH MONTH PAY</span>
                <span>{formatCurrency(thirteenthMonth)}</span>
              </div>
              {receiptBarcodeValue && (
                <div className="receipt-barcode">
                  <Barcode
                    value={receiptBarcodeValue}
                    format="CODE128"
                    width={1.2}
                    height={36}
                    displayValue={true}
                    fontSize={10}
                    margin={4}
                  />
                </div>
              )}
              {monthlyNum > 0 && (
                <div className="receipt-actions">
                  <button
                    type="button"
                    className={`btn-copy ${copied ? "copied" : ""}`}
                    onClick={handleCopy}
                    title="Copy amount"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    type="button"
                    className="btn-print"
                    onClick={handlePrint}
                    title="Print receipt"
                  >
                    Print
                  </button>
                </div>
              )}
            </div>
            {monthlyNum > 0 && (
              <div className="receipt-footer">
                Daily rate (÷22): {formatCurrency(dailyRate)}/day
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Calculator;
