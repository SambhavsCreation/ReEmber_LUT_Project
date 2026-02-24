from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_BASE_URL = "http://localhost:8000"
QUERY_ENDPOINT_PATH = "/api/database/query"

# Reads metadata and lists every base table in the public schema.
LIST_TABLES_SQL = """
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
""".strip()

# Reads metadata and lists all columns for the public.users table.
DESCRIBE_USERS_TABLE_SQL = """
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
""".strip()

# Creates a simple public.query_api_test table if it does not already exist.
CREATE_TEST_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS public.query_api_test (
  id BIGSERIAL PRIMARY KEY,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
""".strip()

# Alters public.query_api_test by adding a status column when missing.
ALTER_TEST_TABLE_SQL = """
ALTER TABLE public.query_api_test
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
""".strip()

EXAMPLES: dict[str, str] = {
  "list_tables": LIST_TABLES_SQL,
  "describe_users_table": DESCRIBE_USERS_TABLE_SQL,
  "create_test_table": CREATE_TEST_TABLE_SQL,
  "alter_test_table": ALTER_TEST_TABLE_SQL,
}


def call_query_api(base_url: str, sql: str, timeout: float) -> tuple[int, dict]:
  query = urllib.parse.urlencode({"sql": sql})
  url = f"{base_url.rstrip('/')}{QUERY_ENDPOINT_PATH}?{query}"
  req = urllib.request.Request(url=url, method="GET")

  try:
    with urllib.request.urlopen(req, timeout=timeout) as resp:
      body = resp.read().decode("utf-8", errors="replace")
      return resp.getcode(), json.loads(body or "{}")
  except urllib.error.HTTPError as exc:
    body = exc.read().decode("utf-8", errors="replace")
    try:
      parsed = json.loads(body or "{}")
    except json.JSONDecodeError:
      parsed = {"error": body}
    return exc.code, parsed


def print_examples() -> None:
  print("Available examples:")
  for name, sql in EXAMPLES.items():
    print(f"  - {name}")
    print(f"    {sql}")


def build_parser() -> argparse.ArgumentParser:
  parser = argparse.ArgumentParser(
    description=(
      "Run SQL against the public /api/database/query endpoint. "
      "No bearer token is required for this endpoint."
    )
  )
  parser.add_argument(
    "example",
    nargs="?",
    choices=sorted(EXAMPLES.keys()),
    help="Run a named example query.",
  )
  parser.add_argument(
    "--sql",
    help="Run a custom single SQL statement instead of an example.",
  )
  parser.add_argument(
    "--base-url",
    default=DEFAULT_BASE_URL,
    help=f"Backend base URL (default: {DEFAULT_BASE_URL}).",
  )
  parser.add_argument(
    "--timeout",
    type=float,
    default=30.0,
    help="HTTP timeout in seconds (default: 30).",
  )
  parser.add_argument(
    "--list",
    action="store_true",
    help="Print available examples and exit.",
  )
  return parser


def main() -> int:
  parser = build_parser()
  args = parser.parse_args()

  if args.list:
    print_examples()
    return 0

  if args.example and args.sql:
    parser.error("Provide either an example name or --sql, not both.")

  sql = ""
  if args.sql:
    sql = args.sql.strip()
  elif args.example:
    sql = EXAMPLES[args.example]
  else:
    parser.print_help()
    print()
    print_examples()
    return 1

  if not sql:
    print("No SQL provided.", file=sys.stderr)
    return 1

  print(f"Base URL: {args.base_url.rstrip('/')}")
  print(f"Endpoint: {QUERY_ENDPOINT_PATH}")
  print("SQL:")
  print(sql)
  print("-" * 80)

  status_code, payload = call_query_api(args.base_url, sql, args.timeout)
  print(f"HTTP {status_code}")
  print(json.dumps(payload, indent=2, sort_keys=True))

  return 0 if 200 <= status_code < 300 else 2


if __name__ == "__main__":
  raise SystemExit(main())
