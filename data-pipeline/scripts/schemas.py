"""Runtime row contracts paired with src/data/types.ts; no new dependencies."""

COMMON_ADR = {'preferredTerm': str, 'systemOrganClass': (str, type(None)),
              'reportCount': int, 'seriousness': str, 'reactionOutcome': (str, type(None)),
              'sex': str, 'ageBand': (str, type(None)), 'reportYear': (int, type(None)),
              'country': (str, type(None)), 'coSuspectDrugs': (list, type(None)), 'sourceIds': list}
SCHEMAS = {
    'indications': {'id': str, 'condition': str, 'indicationText': str, 'jurisdiction': str,
        'referenceProduct': str, 'formulation': str, 'labelSourceId': (str, type(None)),
        'labelStatus': str, 'classificationRationale': str, 'population': str, 'bodySystem': (str, type(None)),
        'evidenceLevel': (str, type(None)), 'evidenceReviewStatus': str, 'evidenceDirection': str,
        'keyTrialOrGuideline': (str, type(None)), 'sourceIds': list},
    'interactions': {'id': str, 'drugOrClass': str, 'effect': str, 'severity': (str, type(None)),
        'mechanism': (str, type(None)), 'managementNote': (str, type(None)), 'sourceIds': list},
    'adverse-reactions': COMMON_ADR,
    'adverse-reactions-filtered': COMMON_ADR,
    'report-summary': {'reportYear': (int, type(None)), 'seriousness': str, 'sex': str,
                       'ageBand': (str, type(None)), 'country': (str, type(None)), 'reportCount': int, 'sourceIds': list},
    'usage': {'reportedIndication': str, 'condition': (str, type(None)), 'labelStatus': str,
              'jurisdiction': str, 'referenceProduct': str, 'labelSourceId': (str, type(None)), 'reportCount': int, 'sourceIds': list},
    'seriousness-criteria': {'criterion': str, 'reportCount': int, 'sourceIds': list},
    'reaction-outcomes': {'outcome': (str, type(None)), 'reportCount': int, 'sourceIds': list},
    'hyperkalaemia-coreported': {'reportedDrug': str, 'reportCount': int, 'sourceIds': list},
    'trials': {'nctId': str, 'startYear': (int, type(None)), 'status': (str, type(None)), 'phases': list, 'conditions': list, 'countries': list, 'sourceIds': list},
    'research-publications': {'condition': str, 'year': int, 'publicationCount': (int, type(None)),
                              'trialCount': (int, type(None)), 'phase': (str, type(None)),
                              'status': (str, type(None)), 'country': (str, type(None)), 'sourceIds': list},
    'label-sections': {'id': str, 'product': str, 'jurisdiction': str, 'setId': str,
                       'effectiveDate': (str, type(None)), 'section': str, 'text': str, 'sourceIds': list},
}
ENUMS = {'sex': {'male', 'female', 'unknown'}, 'seriousness': {'serious', 'non-serious', 'unknown'},
         'labelStatus': {'labelled', 'off-label', 'unspecified', 'undetermined'},
         'jurisdiction': {'US', 'UK', 'India'},
         'population': {'adult', 'paediatric', 'both', 'unspecified'},
         'evidenceReviewStatus': {'pending', 'reviewed'},
         'evidenceDirection': {'benefit', 'no-clear-benefit', 'mixed', 'harm', 'not-assessed'}}


def validate_rows(name, dataset):
    fields = SCHEMAS[name]
    if type(dataset['data']) is not list:
        raise ValueError('Data must be an array')
    for row in dataset['data']:
        if set(row) != set(fields):
            raise ValueError(f'{name}: unexpected or missing fields')
        for key, expected in fields.items():
            value = row[key]
            types = expected if isinstance(expected, tuple) else (expected,)
            if type(value) not in types:
                raise ValueError(f'{name}: invalid type for {key}')
            if key in ENUMS and value not in ENUMS[key]:
                raise ValueError(f'{name}: invalid enum {key}')
            if isinstance(value, list) and any(type(v) is not str for v in value):
                raise ValueError(f'{name}: expected string array')
        if 'nctId' in row and not row['nctId'].startswith('NCT'):
            raise ValueError('Invalid trial identifier')
