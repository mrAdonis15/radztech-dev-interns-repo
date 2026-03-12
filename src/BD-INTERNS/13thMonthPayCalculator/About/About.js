import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about">
      <h1>About 13th Month Pay</h1>

      <section>
        <h2>What is 13th Month Pay?</h2>
        <p>
          13th month pay is a mandatory benefit in the Philippines (Presidential Decree No. 851).
          It is equivalent to one-twelfth (1/12) of the total basic salary earned by an employee
          within the calendar year.
        </p>
      </section>

      <section>
        <h2>Formula</h2>
        <div className="formula">
          <strong>13th Month Pay = Total Basic Salary Earned ÷ 12</strong>
        </div>
        <p>
          For employees who worked less than a full year, the amount is prorated based on the
          actual basic salary earned from the start of employment (or January 1) to the end
          date (or December 31).
        </p>
      </section>

      <section>
        <h2>What is included in basic salary?</h2>
        <ul>
          <li>Regular wages for services rendered</li>
          <li>Paid absences (vacation, sick leave with pay)</li>
        </ul>
        <p>
          <strong>Excluded:</strong> overtime, allowances, bonuses (unless integrated), night shift
          differential, and similar payments.
        </p>
      </section>

      <section>
        <h2>Eligibility</h2>
        <p>
          Rank-and-file employees who worked at least one month in the calendar year are eligible.
          Managerial staff, government employees, and household helpers may be excluded under the law.
        </p>
      </section>

      <section>
        <h2>Payment deadline</h2>
        <p>
          Full 13th month pay must be paid on or before <strong>December 24</strong> each year.
        </p>
      </section>
    </div>
  );
}

export default About;
