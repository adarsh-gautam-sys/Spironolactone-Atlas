Use the Python environment in `data-pipeline/.venv`.

`check_sources.py` runs the small, read-only API checks defined in `../queries.json`, caching successful raw responses and writing an audit log. It is not the full extraction pipeline. `test_check_sources.py` tests response validation without network access. See `../METHODOLOGY.md` for commands and recorded runs.

Phase 2 uses `pipeline.py` for extraction/cleaning, `curate_reference.py` for reviewed label-reference tables, `schemas.py` for runtime contracts, and `publish_data.py` for validated publication and the audit manifest. `test_pipeline.py` covers counting and validation edge cases. See `../PIPELINE.md` for commands, units and limitations.

`analyse.py` produces Phase 3 reporting shares, missingness, a report-level indication-topic screen, research-count comparisons and analytical figures using the frozen exports and offline raw cache. `test_analysis.py` verifies overlap handling, unknowns, denominator behavior and tampered-input rejection. Evidence judgments are stored separately in `../clean/evidence-appraisal.json` with primary sources and explicit review scope.
