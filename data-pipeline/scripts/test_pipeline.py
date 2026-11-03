import copy
import unittest
import threading
import tempfile
from pathlib import Path

from pipeline import age_band, clean_faers, extract_year, matching, product_kind, validate
from schemas import validate_rows


def report(drugs, reactions=None):
    return {'safetyreportid': 'r1', 'receivedate': '20200101', 'serious': '1',
            'patient': {'patientsex': '2', 'drug': drugs,
                        'reaction': reactions or [{'reactionmeddrapt': 'Example reaction'}]}}


def drug(name='spironolactone', role='1', indication='hypertension'):
    return {'medicinalproduct': name, 'drugcharacterization': role,
            'drugindication': indication}


class CleaningTests(unittest.TestCase):
    def test_reaction_case_variants_are_deduplicated_within_report(self):
        rows = [report([drug()], [{'reactionmeddrapt': 'Hyperkalaemia'}, {'reactionmeddrapt': 'HYPERKALAEMIA'}])]
        result = clean_faers(rows)
        self.assertEqual(result[1]['hyperkalaemia'], 1)
        self.assertEqual(len(result[1]), 1)
    def test_null_indication_stays_unspecified(self):
        result = clean_faers([report([drug(indication=None)])])
        self.assertEqual(result[4][None], 1)

    def test_missing_product_name_can_use_harmonized_ingredient(self):
        d = drug(None)
        d['openfda'] = {'generic_name': ['spironolactone']}
        self.assertEqual(product_kind(d), 'single')
    def test_disputed_dates_requeried_before_acceptance(self):
        first = report([drug()])
        second = copy.deepcopy(first)
        second['safetyreportid'] = 'r2'
        correct = [first, second]
        incorrect = copy.deepcopy(correct)
        for row in incorrect:
            row['receivedate'] = '20200102'
        class RepairClient:
            def get(self, endpoint, params):
                if 'count' in params:
                    return {'results': [{'time': '20200101', 'count': 2}]}, None
                return {'meta': {'results': {'total': 2}}, 'results': correct if 'TO 20200101]' in params['search'] else incorrect}, None
        with tempfile.TemporaryDirectory() as tmp:
            client = RepairClient()
            client.lock = threading.RLock()
            client.manifest = {}
            client.manifest_path = Path(tmp) / 'manifest.json'
            rows = list(extract_year(client, 2020))
            self.assertEqual({r['receivedate'] for r in rows}, {'20200101'})
            self.assertEqual(len(client.manifest['faersPartitions']['2020']['dateRepairs']), 2)

    def year_result(self, rows):
        class FakeClient:
            def get(self, endpoint, params):
                if 'count' in params:
                    return {'results': [{'term': '20200101', 'count': len(rows)}]}, None
                return {'meta': {'results': {'total': len(rows)}}, 'results': rows}, None
        with tempfile.TemporaryDirectory() as tmp:
            client = FakeClient()
            client.lock = threading.RLock()
            client.manifest = {}
            client.manifest_path = Path(tmp) / 'manifest.json'
            result = list(extract_year(client, 2020))
            return result, client.manifest['faersPartitions']['2020']

    def test_conflicting_equal_rank_duplicate_excluded(self):
        first = report([drug()])
        second = copy.deepcopy(first)
        second['patient']['patientsex'] = '1'
        rows, audit = self.year_result([first, second])
        self.assertEqual(rows, [])
        self.assertEqual(audit['downloadedRecords'], 2)
        self.assertEqual(audit['excludedConflictingIds'], 1)

    def test_newest_report_version_selected(self):
        first = report([drug()])
        first['safetyreportversion'] = '1'
        second = copy.deepcopy(first)
        second['safetyreportversion'] = '2'
        second['patient']['patientsex'] = '1'
        rows, audit = self.year_result([first, second])
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['patient']['patientsex'], '1')
        self.assertEqual(audit['duplicateRecords'], 1)

    def test_schema_rejects_boolean_count(self):
        with self.assertRaises(ValueError):
            validate_rows('seriousness-criteria', {'data': [dict(criterion='example', reportCount=True, sourceIds=['s'])]})

    def test_schema_rejects_missing_field(self):
        with self.assertRaises(ValueError):
            validate_rows('seriousness-criteria', {'data': [dict(criterion='example', sourceIds=['s'])]})

    def test_schema_rejects_unknown_enum(self):
        with self.assertRaises(ValueError):
            validate_rows('report-summary', {'data': [dict(reportYear=None, seriousness='assumed', sex='unknown', ageBand=None, country=None, reportCount=1, sourceIds=['s'])]})

    def test_suspect_must_be_same_drug(self):
        result = clean_faers([report([drug(role='2'), drug('other medicine')])])
        self.assertEqual(result[0]['retained'], 0)

    def test_combinations_excluded(self):
        d = drug('spironolactone hydrochlorothiazide')
        self.assertTrue(matching(d))
        self.assertEqual(product_kind(d), 'combination')
        self.assertEqual(clean_faers([report([d])])[0]['excluded-combination'], 1)

    def test_unknown_coingredient_not_guessed(self):
        d = drug('spironolactone and another ingredient')
        self.assertEqual(product_kind(d), 'unresolved')
        d = drug()
        d['openfda'] = {'generic_name': ['spironolactone', 'another ingredient']}
        self.assertEqual(product_kind(d), 'unresolved')

    def test_repeated_reactions_and_indications_count_once_per_report(self):
        r = report([drug(), drug()], [{'reactionmeddrapt': 'Example reaction'}]*2)
        audit, reactions, _, summaries, usage, *_ = clean_faers([r])
        self.assertEqual(audit['retained'], 1)
        self.assertEqual(reactions['example reaction'], 1)
        self.assertEqual(usage['hypertension'], 1)
        self.assertEqual(sum(summaries.values()), 1)

    def test_age_units_and_missing(self):
        self.assertEqual(age_band({'patientonsetage': '120', 'patientonsetageunit': '802'}), '<18')
        self.assertEqual(age_band({'patientonsetage': '65', 'patientonsetageunit': '801'}), '65–74')
        self.assertIsNone(age_band({'patientonsetage': '-1', 'patientonsetageunit': '801'}))
        self.assertIsNone(age_band({}))

    def test_unknown_seriousness_stays_unknown(self):
        r = report([drug()])
        r.pop('serious')
        summary = clean_faers([r])[3]
        self.assertEqual(next(iter(summary))[1], 'unknown')

    def test_overlapping_flags_do_not_duplicate_denominator(self):
        r = report([drug()])
        r.update(seriousnessdeath='1', seriousnesshospitalization='1')
        audit, _, _, _, _, flags, *_ = clean_faers([r])
        self.assertEqual(audit['retained'], 1)
        self.assertEqual(sum(flags.values()), 2)

    def test_cross_partition_duplicate_fails(self):
        r = report([drug()])
        with self.assertRaises(ValueError):
            clean_faers([r, copy.deepcopy(r)])


if __name__ == '__main__':
    unittest.main()
