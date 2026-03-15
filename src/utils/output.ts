export interface TableColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: unknown) => string;
}

export function outputResult(
  data: unknown,
  options: {
    json: boolean;
    columns?: TableColumn[];
    total?: number;
    page?: number;
    pagelen?: number;
    size?: number;
  },
): void {
  if (options.json) {
    if (Array.isArray(data)) {
      const output = {
        values: data,
        page: options.page ?? 1,
        pagelen: options.pagelen ?? data.length,
        size: options.size ?? data.length,
      };
      process.stdout.write(JSON.stringify(output, null, 2) + "\n");
    } else {
      process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    }
    return;
  }

  // Human-readable output
  if (Array.isArray(data)) {
    if (data.length === 0) {
      process.stdout.write("No results found.\n");
      return;
    }
    if (options.columns) {
      formatTable(data, options.columns);
    } else {
      // Fallback: JSON-like output
      for (const item of data) {
        process.stdout.write(JSON.stringify(item) + "\n");
      }
    }
  } else if (data && typeof data === "object") {
    formatKeyValue(data as Record<string, unknown>);
  } else {
    process.stdout.write(String(data) + "\n");
  }
}

export function outputAction(
  message: string,
  json: boolean,
  extra?: Record<string, unknown>,
): void {
  if (json) {
    const output = { success: true, message, ...extra };
    process.stdout.write(JSON.stringify(output, null, 2) + "\n");
  } else {
    process.stdout.write(message + "\n");
  }
}

function formatTable(data: Record<string, unknown>[], columns: TableColumn[]): void {
  // Calculate column widths
  const widths = columns.map((col) => {
    const headerLen = col.header.length;
    const maxDataLen = data.reduce((max, row) => {
      const val = col.format
        ? col.format(row[col.key])
        : String(row[col.key] ?? "");
      return Math.max(max, val.length);
    }, 0);
    return col.width ?? Math.max(headerLen, Math.min(maxDataLen, 60));
  });

  // Print header
  const header = columns
    .map((col, i) => col.header.padEnd(widths[i]))
    .join("  ");
  process.stdout.write(header + "\n");

  // Print separator
  const separator = widths.map((w) => "─".repeat(w)).join("  ");
  process.stdout.write(separator + "\n");

  // Print rows
  for (const row of data) {
    const line = columns
      .map((col, i) => {
        const val = col.format
          ? col.format(row[col.key])
          : String(row[col.key] ?? "");
        return val.slice(0, widths[i]).padEnd(widths[i]);
      })
      .join("  ");
    process.stdout.write(line + "\n");
  }
}

function formatKeyValue(data: Record<string, unknown>): void {
  const entries = Object.entries(data);
  if (entries.length === 0) return;

  const maxKeyLen = Math.max(...entries.map(([k]) => k.length));

  for (const [key, value] of entries) {
    const label = key.padEnd(maxKeyLen);
    const formatted = formatValue(value);
    process.stdout.write(`${label}  ${formatted}\n`);
  }
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    return value.map((v) => (typeof v === "object" && v !== null && "display_name" in v ? (v as { display_name: string }).display_name : String(v))).join(", ");
  }
  if (typeof value === "object") {
    if ("name" in value && typeof (value as Record<string, unknown>).name === "string") {
      return (value as { name: string }).name;
    }
    return JSON.stringify(value);
  }
  return String(value);
}
