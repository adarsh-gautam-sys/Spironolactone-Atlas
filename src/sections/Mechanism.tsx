import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    title: 'A hormone signal',
    text: 'Aldosterone acts at receptors involved in sodium and potassium handling in the kidney.',
  },
  {
    title: 'A competing molecule',
    text: 'Spironolactone and its active metabolites compete with aldosterone at these receptors.',
  },
  {
    title: 'A different balance',
    text: 'More sodium and water are excreted while potassium is retained. This helps explain both the diuretic effect and potassium-related cautions.',
  },
];
export function Mechanism() {
  const [step, setStep] = useState(0);
  const reduced = useReducedMotion();
  return (
    <div className="mechanism">
      <div className="section-intro">
        <h2>
          A medicine,
          <br />
          in context.
        </h2>
        <p>
          Spironolactone is an aldosterone antagonist. Its effects begin with a
          hormone receptor—and extend into several different clinical questions.
        </p>
        <p className="source-note">
          <a href="https://labeling.pfizer.com/showlabeling.aspx?id=520#S12.1">
            Aldactone US label, §12.1
          </a>{' '}
          · Revised November 2025 · Reviewed 3 Nov 2026
        </p>
      </div>
      <div>
        <div
          className="mechanism-diagram"
          role="img"
          aria-label="Simplified kidney receptor schematic: spironolactone competes with aldosterone, increasing sodium and water excretion while retaining potassium. Not an anatomical diagram."
        >
          <div className="signal-row">
            <span>Aldosterone</span>
            <ArrowRight />
            <span className={step > 0 ? 'receptor blocked' : 'receptor'}>
              Kidney receptor
            </span>
          </div>
          <motion.div
            className="medicine-node"
            initial={false}
            animate={{
              color:
                step > 0
                  ? 'var(--color-accent-ink)'
                  : 'var(--color-foreground)',
            }}
            transition={{ duration: reduced ? 0 : 0.35 }}
          >
            Spironolactone{' '}
            <span>
              {step > 0 ? 'Competes for binding' : 'Select the next step'}
            </span>
          </motion.div>
          <motion.div
            className="handling-row"
            initial={false}
            animate={{
              backgroundColor:
                step === 2
                  ? 'var(--color-positive-surface)'
                  : 'var(--color-surface)',
            }}
            transition={{ duration: reduced ? 0 : 0.35 }}
          >
            <span>
              Na⁺ + water
              <br />
              <strong>Excreted</strong>
            </span>
            <span>
              K⁺
              <br />
              <strong>Retained</strong>
            </span>
          </motion.div>
        </div>
        <div className="step-controls" aria-label="Mechanism steps">
          {steps.map((item, index) => (
            <button
              key={item.title}
              onClick={() => setStep(index)}
              aria-pressed={step === index}
            >
              {index + 1}
              <span>{item.title}</span>
            </button>
          ))}
        </div>
        <div className="step-copy" aria-live="polite">
          <h3>{steps[step]?.title}</h3>
          <p>{steps[step]?.text}</p>
        </div>
        <details>
          <summary>And the androgen-related effects?</summary>
          <p>
            Spironolactone also binds to the androgen receptor. Clinical
            outcomes depend on the population and endpoint; use the evidence
            explorer below rather than inferring benefit from a mechanism alone.
          </p>
          <p className="source-note">
            <a href="https://labeling.pfizer.com/showlabeling.aspx?id=520#S7.7">
              Aldactone US label, §7.7
            </a>{' '}
            · Reviewed 3 Nov 2026. See the topic-specific appraisal for clinical
            evidence.
          </p>
        </details>
        <p className="caption">
          Simplified receptor schematic, not anatomical scale. The controls step
          through the explanation; no treatment advice is provided.
        </p>
      </div>
    </div>
  );
}
