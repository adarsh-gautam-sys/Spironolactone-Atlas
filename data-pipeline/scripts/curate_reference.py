"""Reproducible manual label extraction, scoped to the Phase 1 reviewed sections."""
from datetime import datetime, timezone

from pipeline import PIPE, export
from schemas import SCHEMAS


def main():
    now = datetime.now(timezone.utc).isoformat()
    sources = [
        dict(id='US-ALDACTONE', name='Aldactone US prescribing information', url='https://labeling.pfizer.com/showlabeling.aspx?id=520', retrievedAt='2026-11-03', documentVersion='11/2025', reviewedSection='1'),
        dict(id='US-CAROSPIR', name='Carospir US label', url='https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c4f70a04-7d89-4b73-8b02-17d43471bf08', retrievedAt='2026-11-03', documentVersion='9/2023', reviewedSection='1; 7'),
        dict(id='UK-ALDACTONE', name='Aldactone 25 mg UK SmPC', url='https://www.medicines.org.uk/emc/product/1619/smpc', retrievedAt='2026-11-03', documentVersion='01/2026', reviewedSection='4.1'),
    ]
    rows = []
    entries = {
        'US-ALDACTONE': [('heart-failure-reduced-ef', 'NYHA class III–IV heart failure with reduced ejection fraction'),
                         ('hypertension', 'Add-on hypertension treatment when other agents provide inadequate control'),
                         ('cirrhotic-edema', 'Cirrhosis-associated edema not responsive to fluid and sodium restriction'),
                         ('nephrotic-edema', 'Nephrotic-syndrome edema after inadequate response to underlying-disease treatment, fluid/sodium restriction and other diuretics'),
                         ('primary-hyperaldosteronism', 'Specified preoperative and long-term maintenance settings in primary hyperaldosteronism')],
        'US-CAROSPIR': [('heart-failure-reduced-ef', 'Adult NYHA class III–IV heart failure with reduced ejection fraction'),
                       ('hypertension', 'Adult add-on hypertension treatment when other agents provide inadequate control'),
                       ('cirrhotic-edema', 'Adult cirrhosis-associated edema not responsive to fluid and sodium restriction')],
        'UK-ALDACTONE': [('heart-failure-unspecified', 'Congestive cardiac failure'),
                        ('cirrhotic-edema', 'Hepatic cirrhosis with ascites and edema'),
                        ('malignant-ascites', 'Malignant ascites'),
                        ('nephrotic-syndrome', 'Nephrotic syndrome'),
                        ('primary-aldosteronism', 'Diagnosis and treatment of primary aldosteronism')],
    }
    for source, conditions in entries.items():
        for condition, wording in conditions:
            rows.append(dict(id=f'{source}:{condition}', condition=condition, indicationText=wording,
                jurisdiction='UK' if source.startswith('UK') else 'US',
                referenceProduct={'US-ALDACTONE': 'Aldactone tablets', 'US-CAROSPIR': 'Carospir suspension', 'UK-ALDACTONE': 'Aldactone 25 mg tablets'}[source],
                formulation='suspension' if source == 'US-CAROSPIR' else 'tablet',
                labelSourceId=source, labelStatus='labelled', classificationRationale='Paraphrase of the cited indication section; retain population and qualifying conditions.',
                population='adult' if source == 'US-CAROSPIR' or condition in ('cirrhotic-edema', 'nephrotic-edema') and source == 'US-ALDACTONE' else 'unspecified',
                bodySystem=None, evidenceLevel=None, evidenceReviewStatus='pending', evidenceDirection='not-assessed', keyTrialOrGuideline=None, sourceIds=[source]))
    base = dict(schemaVersion='1.0', generatedAt=now, sources=sources, queries=[],
        limitations=['Manual source review, not independent regulatory advice. Qualifiers are abbreviated; consult full label.',
                     'UK entries refer only to Aldactone 25 mg. Indian product label unresolved; no India approval classification.',
                     'Evidence grades remain pending Phase 3. Source review logged in docs/RESEARCH_FOUNDATION.md.'],
        recordUnit='label-entry', cohortDefinition='Indication sections of the three specific reviewed product documents.',
        coverage=dict(start=None, end=None, dateBasis='document version and review date', extractionComplete=True),
        dimensions=['referenceProduct', 'jurisdiction', 'condition'], categoriesOverlap=False, data=rows)
    output = PIPE / 'clean' / 'exports' / '2026-11-03-reference'
    export(output, 'indications', base)
    interactions = [
        ('potassium-increasing-agents', 'Potassium supplements and potassium-increasing drugs', 'May increase the risk of severe hyperkalemia.', 'Monitor potassium; consult the label for drug-specific precautions.'),
        ('lithium', 'Lithium', 'Reduced lithium clearance may increase lithium toxicity risk.', 'Monitor lithium levels as specified in the source label.'),
        ('nsaids', 'NSAIDs', 'May reduce diuretic and antihypertensive effects.', 'Monitor the desired clinical effect as specified in the source label.'),
        ('digoxin', 'Digoxin', 'Spironolactone and metabolites can affect apparent digoxin exposure and assay interpretation.', 'Use an assay without interference and follow the full label.'),
        ('cholestyramine', 'Cholestyramine', 'Hyperkalemic metabolic acidosis has been reported with concomitant use.', None),
        ('asa', 'Acetylsalicylic acid', 'May reduce spironolactone efficacy.', 'Observe clinical response; consult the full label.'),
        ('cyp-substrates', 'CYP2C8 and CYP3A substrates', 'Exposure to coadministered substrates may increase.', 'Consult the label for substrate-specific considerations.'),
    ]
    base['data'] = [dict(id=key, drugOrClass=name, effect=effect, severity=None, mechanism=None,
                         managementNote=note, sourceIds=['US-CAROSPIR']) for key, name, effect, note in interactions]
    base['recordUnit'] = 'interaction'
    base['cohortDefinition'] = 'Carospir label section 7; paraphrased interaction groups.'
    base['dimensions'] = ['drugOrClass']
    base['limitations'].append('No independent severity grading or inferred mechanism. These educational excerpts are not prescribing instructions.')
    export(output, 'interactions', base)
    print('Curated 13 product-specific indications and 7 interaction groups with sources.')


if __name__ == '__main__':
    main()
