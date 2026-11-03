"""Offline checks for API response handling, including malformed responses."""

import unittest

from check_sources import inspect_payload


class PayloadTests(unittest.TestCase):
    def test_count_response_has_no_invented_total(self):
        result = inspect_payload("openfda-count", {
            "meta": {}, "results": [{"term": "example", "count": 2}]})
        self.assertEqual(result["returnedRecords"], 1)
        self.assertIsNone(result["availableRecords"])

    def test_zero_pubmed_matches_is_valid(self):
        result = inspect_payload("pubmed-search", {
            "esearchresult": {"count": "0", "idlist": []}})
        self.assertEqual(result["availableRecords"], 0)

    def test_error_response_is_not_a_zero_count(self):
        with self.assertRaises(KeyError):
            inspect_payload("openfda-records", {"error": {"message": "No results"}})

    def test_invalid_trial_identifier_fails(self):
        with self.assertRaises(ValueError):
            inspect_payload("clinicaltrials", {
                "studies": [{"protocolSection": {
                    "identificationModule": {"nctId": "invalid"}}}], "totalCount": 1})

    def test_missing_event_patient_fails(self):
        with self.assertRaises(KeyError):
            inspect_payload("openfda-events", {
                "results": [{"safetyreportid": "example"}], "meta": {}})

    def test_missing_label_indications_fails(self):
        with self.assertRaises(KeyError):
            inspect_payload("openfda-labels", {
                "results": [{"set_id": "example"}], "meta": {}})


if __name__ == "__main__":
    unittest.main()
