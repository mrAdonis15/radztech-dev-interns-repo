/**
 * SQL Formatter utilities - formats and minifies SQL queries.
 * No external dependencies; compatible with React 16.
 */

const MAIN_CLAUSES = [
  "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN",
  "INNER JOIN", "OUTER JOIN", "CROSS JOIN", "FULL JOIN",
  "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET",
  "UNION", "UNION ALL", "INSERT INTO", "VALUES", "UPDATE", "SET",
  "DELETE FROM", "AND", "OR",
];

/**
 * Format SQL with proper indentation and uppercase keywords.
 * @param {string} sql - Raw SQL string
 * @returns {string} Formatted SQL
 */
export function formatSql(sql) {
  if (!sql || typeof sql !== "string") return "";
  let s = sql
    .replace(/\s+/g, " ")
    .replace(/\s*([(),;])\s*/g, "$1")
    .trim();
  if (!s) return "";

  // Uppercase keywords (preserve strings)
  s = uppercaseKeywords(s);

  // Add newlines before main clauses
  for (const clause of MAIN_CLAUSES) {
    const re = new RegExp(`\\b${clause.replace(/\s/g, "\\s+")}\\b`, "gi");
    s = s.replace(re, (m) => "\n" + m.toUpperCase());
  }

  // Add newline after comma in SELECT lists (basic heuristic)
  s = s.replace(/,\s*/g, ",\n  ");

  // Clean and indent
  const lines = s.split("\n").filter((l) => l.trim());
  let indent = 0;
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.startsWith(")")) indent = Math.max(0, indent - 1);
    result.push("  ".repeat(indent) + line);
    if (line.endsWith("(") && !line.endsWith(" (")) indent++;
  }
  return result.join("\n").trim();
}

function uppercaseKeywords(sql) {
  const keywords = [
    "select", "from", "where", "and", "or", "not", "in", "as", "on", "join",
    "left", "right", "inner", "outer", "cross", "full", "natural",
    "group by", "order by", "having", "limit", "offset", "union", "values",
    "insert into", "update", "set", "delete from", "create table",
    "drop table", "alter table", "add", "column", "primary key",
    "foreign key", "references", "index", "unique", "null", "default",
    "case", "when", "then", "else", "end", "with", "distinct",
    "between", "like", "is", "exists", "asc", "desc", "by",
    "count", "sum", "avg", "min", "max", "cast", "coalesce",
    "true", "false", "current_timestamp",
  ];
  let result = sql;
  for (const kw of keywords.sort((a, b) => b.length - a.length)) {
    const re = new RegExp("\\b" + kw.replace(/\s/g, "\\s+") + "\\b", "gi");
    result = result.replace(re, kw.toUpperCase());
  }
  return result;
}

/**
 * Minify SQL by removing extra whitespace and newlines.
 * @param {string} sql - SQL string
 * @returns {string} Minified SQL
 */
export function minifySql(sql) {
  if (!sql || typeof sql !== "string") return "";
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
