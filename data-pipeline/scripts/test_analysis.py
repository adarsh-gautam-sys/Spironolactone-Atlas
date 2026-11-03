import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import analyse
from test_pipeline import drug, report


class AnalysisTests(unittest.TestCase):
    def test_unknown_term_cooccurring_with_acne_does_not_hide_acne(self):
        result = analyse.record_metrics([report([drug(indication='acne'), drug(indication='product used for unknown indication')])])
        self.assertEqual(result['counts']['reports'], 1)
        self.assertEqual(result['counts']['no-informative-indication'], 0)
        self.assertEqual(result['counts']['any-outside-reference-label-topic'], 1)

    def test_repeated_indications_count_one_report(self):
        result = analyse.record_metrics([report([drug(indication='acne'), drug(indication='ACNE')])])
        self.assertEqual(result['indicationTerms']['acne'], 1)

    def test_blank_and_explicit_unknown_are_not_informative(self):
        result = analyse.record_metrics([report([drug(indication=None), drug(indication='unknown indication')])])
        self.assertEqual(result['counts']['no-informative-indication'], 1)

    def test_hyperkalaemia_is_per_report_not_per_spelling(self):
        r = report([drug()], [{'reactionmeddrapt': 'Hyperkalaemia'}, {'reactionmeddrapt': 'HYPERKALAEMIA'}])
        self.assertEqual(analyse.record_metrics([r])['counts']['hyperkalaemia-spelling-union'], 1)

    def test_label_topic_is_not_a_definite_on_label_classification(self):
        _, states = analyse.usage_profile(['hypertension'])
        self.assertEqual(states, {'label-topic-needs-qualifiers'})

    def test_missing_denominator_does_not_become_zero(self):
        self.assertIsNone(analyse.rate(1, 0))

    def test_tampered_export_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)/'public/data'; directory.mkdir(parents=True)
            (directory/'example.json').write_text('{}', encoding='utf-8')
            (directory/'manifest.json').write_text(json.dumps({'datasets': [{'name': 'example', 'sha256': 'invalid'}]}), encoding='utf-8')
            with patch.object(analyse, 'ROOT', Path(tmp)), self.assertRaises(ValueError):
                analyse.load('example')


if __name__ == '__main__':
    unittest.main()
