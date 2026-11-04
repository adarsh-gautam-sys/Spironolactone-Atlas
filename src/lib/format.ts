export const number = (value: number) =>
  new Intl.NumberFormat('en-GB').format(value);
export const percent = (value: number, total: number) =>
  total ? `${((value / total) * 100).toFixed(1)}%` : 'Not available';
export const title = (value: string) =>
  value
    ? value.charAt(0).toUpperCase() +
      value.slice(1).replaceAll('_', ' ').replaceAll('-', ' ')
    : 'Unknown';
export const date = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
export const topicName = (topic: string) =>
  ({
    acne: 'Acne',
    'central-serous': 'Central serous chorioretinopathy',
    'gender-affirming': 'Gender-affirming therapy',
    'hair-loss': 'Female pattern hair loss',
    hfpef: 'Heart failure with preserved EF',
    hidradenitis: 'Hidradenitis suppurativa',
    'hirsutism-pcos': 'Hirsutism / PCOS',
    'pms-pmdd': 'Premenstrual syndrome (PMS)',
    'proteinuria-ckd': 'Proteinuria / CKD',
    'resistant-hypertension': 'Resistant hypertension',
  })[topic] ?? title(topic);
export const sourcePath = (name: string, extension = 'csv') =>
  `${import.meta.env.BASE_URL}data/${name}.${extension}`;
