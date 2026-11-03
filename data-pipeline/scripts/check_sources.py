"""Run bounded API checks; save raw responses locally and a shareable audit log."""

import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from time import sleep

import requests
from dotenv import load_dotenv

PIPELINE = Path(__file__).resolve().parents[1]


def inspect_payload(kind, payload):
    """Validate essential response fields without interpreting sample counts."""
    if kind.startswith("openfda-"):
        rows = payload["results"]
        if not isinstance(rows, list) or not rows:
            raise ValueError("Expected nonempty results")
        if kind == "openfda-count":
            if not all(isinstance(r["count"], int) and "term" in r for r in rows):
                raise ValueError("Invalid count rows")
            return {"returnedRecords": len(rows), "availableRecords": None,
                    "apiLastUpdated": payload["meta"].get("last_updated")}
        if kind == "openfda-events":
            for row in rows:
                if not row["safetyreportid"] or not isinstance(row["patient"]["drug"], list):
                    raise ValueError("Invalid event structure")
                if not isinstance(row["patient"]["reaction"], list):
                    raise ValueError("Invalid reaction structure")
        elif kind == "openfda-labels":
            for row in rows:
                if not row["set_id"] or not isinstance(row["indications_and_usage"], list):
                    raise ValueError("Invalid label structure")
        return {"returnedRecords": len(rows),
                "availableRecords": payload["meta"]["results"]["total"],
                "apiLastUpdated": payload["meta"].get("last_updated")}
    if kind == "pubmed-search":
        result = payload["esearchresult"]
        if result.get("errorlist") or not isinstance(result["idlist"], list):
            raise ValueError("Invalid PubMed search")
        return {"returnedRecords": len(result["idlist"]),
                "availableRecords": int(result["count"]),
                "queryTranslation": result.get("querytranslation"),
                "warnings": result.get("warninglist", {})}
    if kind == "clinicaltrials":
        rows = payload["studies"]
        if not isinstance(rows, list) or not rows:
            raise ValueError("Expected studies")
        for row in rows:
            if not row["protocolSection"]["identificationModule"]["nctId"].startswith("NCT"):
                raise ValueError("Missing study identifier")
        return {"returnedRecords": len(rows), "availableRecords": payload["totalCount"],
                "hasNextPage": bool(payload.get("nextPageToken"))}
    raise ValueError("Unknown response kind")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", help="Run one check ID from queries.json")
    args = parser.parse_args()
    load_dotenv(PIPELINE / ".env")
    protocol = json.loads((PIPELINE / "queries.json").read_text(encoding="utf-8"))
    checks = protocol["checks"]
    if args.only:
        checks = [check for check in checks if check["id"] == args.only]
        if not checks:
            parser.error("Unknown check ID")
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    raw_dir = PIPELINE / "raw" / "phase-1" / stamp
    raw_dir.mkdir(parents=True, exist_ok=False)
    log_dir = PIPELINE / "clean" / "source-checks"
    log_dir.mkdir(parents=True, exist_ok=True)
    log = {"protocolVersion": protocol["protocolVersion"],
           "purpose": protocol["purpose"], "checks": []}
    with requests.Session() as session:
        session.headers["User-Agent"] = "SpironolactoneAtlas/0.1 (educational API validation)"
        for check in checks:
            params = dict(check["params"])
            if check["endpoint"].startswith("https://api.fda.gov/"):
                if api_key := os.getenv("OPENFDA_API_KEY"):
                    params["api_key"] = api_key
            entry = {**check, "retrievedAt": datetime.now(timezone.utc).isoformat(),
                     "status": "failed"}
            try:
                response = session.get(check["endpoint"], params=params, timeout=(10, 30))
                entry["httpStatus"] = response.status_code
                if response.status_code != 200:
                    entry["error"] = f"HTTP {response.status_code}; no analytical count inferred"
                else:
                    payload = response.json()
                    raw_file = raw_dir / f"{check['id']}.json"
                    raw_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")
                    entry["rawFile"] = raw_file.relative_to(PIPELINE).as_posix()
                    entry["sha256"] = hashlib.sha256(raw_file.read_bytes()).hexdigest()
                    entry.update(inspect_payload(check["responseKind"], payload))
                    entry["status"] = "passed"
            except (requests.RequestException, ValueError, KeyError, TypeError) as error:
                # Exception URLs can contain API keys; retain only the error class.
                entry["error"] = f"{type(error).__name__}; inspect local response/network"
            log["checks"].append(entry)
            print(f"{check['id']}: {entry['status']} (HTTP {entry.get('httpStatus', 'unavailable')})")
            sleep(0.4)  # Remain below the unauthenticated NCBI request rate.
    output = log_dir / f"{stamp}.json"
    output.write_text(json.dumps(log, indent=2) + "\n", encoding="utf-8")
    print(f"Audit log: {output.relative_to(PIPELINE)}")
    return int(any(entry["status"] != "passed" for entry in log["checks"]))


if __name__ == "__main__":
    raise SystemExit(main())
