export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://YOUR_SUPABASE_PROJECT_ID.supabase.co";
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

export const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || "https://eyestrain-screening-app.onrender.com";


export const COLORS = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',
  secondary: '#0284c7',
  secondaryLight: '#e0f2fe',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  
  riskLow: '#16a34a',
  riskLowBg: '#dcfce7',
  riskModerate: '#d97706',
  riskModerateBg: '#fef3c7',
  riskHigh: '#dc2626',
  riskHighBg: '#fee2e2',
};

export const QUESTIONS = [
  {
    id: 'gender',
    questionNumber: 1,
    title: 'Gender',
    type: 'select',
    options: ['Male', 'Female'],
    helpText: 'Select your biological gender.'
  },
  {
    id: 'age',
    questionNumber: 2,
    title: 'Age',
    type: 'number',
    placeholder: 'e.g. 21',
    helpText: 'Enter your current age in years.'
  },
  {
    id: 'study_year',
    questionNumber: 3,
    title: 'Current Year of Study',
    type: 'select',
    options: ['1st year', '2nd year', '3rd year', '4th year'],
    helpText: 'Select your current academic level.'
  },
  {
    id: 'screen_time',
    questionNumber: 4,
    title: 'Daily Screen Time',
    type: 'select',
    options: ['Less than 4 hours', '4 to 7 hours', 'More than 7 hours'],
    helpText: 'Total hours spent looking at digital screens each day.'
  },
  {
    id: 'device',
    questionNumber: 5,
    title: 'Which device do you use most frequently?',
    type: 'select',
    options: ['Smartphone', 'Laptop', 'Tablet', 'Desktop'],
    helpText: 'Primary device used for study or leisure.'
  },
  {
    id: 'blue_light',
    questionNumber: 6,
    title: 'Do you use blue-light filter / night mode?',
    type: 'select',
    options: ['Never', 'Sometimes', 'Always'],
    helpText: 'Built-in software feature to reduce display blue-light emissions.'
  },
  {
    id: 'screen_distance',
    questionNumber: 7,
    title: 'Do you maintain at least 20 inches (one arm\'s distance) from the screen?',
    type: 'select',
    options: ['Never', 'Sometimes', 'Always'],
    helpText: 'Recommended ergonomic viewing distance.'
  },
  {
    id: 'rule_20_20_20',
    questionNumber: 8,
    title: 'Do you follow the 20-20-20 rule (look 20 feet away for 20 seconds every 20 minutes)?',
    type: 'select',
    options: ['Never', 'Sometimes', 'Always'],
    helpText: 'Standard optical relaxation interval.'
  },
  {
    id: 'dark_room',
    questionNumber: 9,
    title: 'Do you use your device in a dark room frequently?',
    type: 'select',
    options: ['Never', 'Sometimes', 'Always'],
    helpText: 'Using screens in dark ambient environments.'
  },
  {
    id: 'poor_posture',
    questionNumber: 10,
    title: 'Do you use devices while lying down or in a poor posture?',
    type: 'select',
    options: ['Never', 'Sometimes', 'Always'],
    helpText: 'Slouching, lying in bed, or neck bending during use.'
  },
  {
    id: 'glasses',
    questionNumber: 11,
    title: 'Do you wear medical glasses or contact lenses?',
    type: 'select',
    options: ['Yes', 'No'],
    helpText: 'Prescription corrective vision lenses.'
  },
  {
    id: 'continuous_use',
    questionNumber: 12,
    title: 'How long do you usually use a digital screen without taking a break?',
    type: 'select',
    options: ['<30 min', '30–60 min', '1–2 hrs', '2+ hrs'],
    helpText: 'Continuous screen viewing duration per session.'
  }
];
