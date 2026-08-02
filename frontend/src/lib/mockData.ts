export type Platform = 'Instagram' | 'Twitter' | 'LinkedIn' | 'YouTube' | 'Facebook' | 'Threads';

export const platforms: { name: Platform; emoji: string }[] = [
  { name: 'Instagram', emoji: '📸' },
  { name: 'Twitter', emoji: '🐦' },
  { name: 'LinkedIn', emoji: '💼' },
  { name: 'YouTube', emoji: '▶️' },
  { name: 'Facebook', emoji: '👍' },
  { name: 'Threads', emoji: '🧵' },
];

export const niches = [
  'Education',
  'Fitness',
  'Food',
  'Business',
  'Tech',
  'Fashion',
  'Travel',
  'Finance',
  'Health',
  'Lifestyle',
];

export const templates = [
  { emoji: '🔥', label: 'Trending' },
  { emoji: '📚', label: 'Educational' },
  { emoji: '🎯', label: 'Listicle' },
  { emoji: '❓', label: 'Question' },
  { emoji: '🎬', label: 'Story' },
  { emoji: '📊', label: 'Data' },
];

export const tones = [
  'Educational',
  'Friendly',
  'Luxury',
  'Practical',
  'Bold',
  'Funny',
  'Minimal',
  'Professional',
];

export const languages = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Arabic'];
export const goals = ['Awareness', 'Engagement', 'Traffic', 'Sales', 'Followers'];
export const audiences = ['Beginners', 'Pros', 'Students', 'Parents', 'Entrepreneurs', 'Creators'];
export const locations = ['Global', 'India', 'USA', 'UK', 'UAE', 'Canada'];

export const ctaStyles = ['Direct', 'Soft', 'Question', 'None'] as const;

export type Generation = {
  id: string;
  platform: Platform;
  niche: string;
  content: string;
  timeAgo: string;
  provider: string;
  score?: number;
  titles: string[];
  captions: string[];
  hashtags: string[];
  cta: string;
  scores?: { label: string; value: number }[];
};

export const recentGenerations: Generation[] = [
  {
    id: 'g1',
    platform: 'Instagram',
    niche: 'Education',
    content: 'New JEE 2027 batch starting in Patna — limited seats, early bird discount ends Friday.',
    timeAgo: '2h ago',
    provider: 'GPT-4o',
    score: 87,
    titles: [
      '🚀 JEE 2027 Batch Launches in Patna',
      'Crack JEE with our new Patna batch',
      'Early bird ends Friday — enroll now',
    ],
    captions: [
      'Dreaming of IIT? Your journey starts here. 🚀\n\nOur new JEE 2027 batch in Patna is now open for enrollment. Limited seats, expert faculty, and a proven track record.\n\nEarly bird discount ends Friday — do not miss out!',
    ],
    hashtags: ['#JEE2027', '#Patna', '#IITPrep', '#JEECoaching', '#EngineeringDreams'],
    cta: 'Enroll now — link in bio',
    scores: [
      { label: 'Hook', value: 88 },
      { label: 'SEO', value: 82 },
      { label: 'CTA', value: 90 },
      { label: 'Readability', value: 85 },
      { label: 'Virality', value: 79 },
      { label: 'Emotion', value: 84 },
    ],
  },
  {
    id: 'g2',
    platform: 'Twitter',
    niche: 'Tech',
    content: 'Why TypeScript adoption keeps growing in 2026 — a thread.',
    timeAgo: '5h ago',
    provider: 'Claude 3.5',
    score: 92,
    titles: ['TypeScript in 2026: a thread', 'Why TS keeps winning', 'The TS growth story'],
    captions: ['TypeScript adoption is not slowing down. Here is why 🧵'],
    hashtags: ['#TypeScript', '#JavaScript', '#WebDev'],
    cta: 'Follow for more dev content',
    scores: [
      { label: 'Hook', value: 94 },
      { label: 'SEO', value: 78 },
      { label: 'CTA', value: 85 },
      { label: 'Readability', value: 92 },
      { label: 'Virality', value: 95 },
      { label: 'Emotion', value: 70 },
    ],
  },
  {
    id: 'g3',
    platform: 'LinkedIn',
    niche: 'Business',
    content: '3 lessons from scaling a SaaS to $1M ARR.',
    timeAgo: '1d ago',
    provider: 'GPT-4o',
    score: 81,
    titles: ['Scaling to $1M ARR: 3 lessons', 'What I learned scaling SaaS', 'The $1M ARR playbook'],
    captions: ['Scaling to $1M ARR taught me three things...'],
    hashtags: ['#SaaS', '#Startup', '#ARR'],
    cta: 'What is your biggest scaling lesson? Comment below.',
    scores: [
      { label: 'Hook', value: 80 },
      { label: 'SEO', value: 75 },
      { label: 'CTA', value: 88 },
      { label: 'Readability', value: 82 },
      { label: 'Virality', value: 70 },
      { label: 'Emotion', value: 76 },
    ],
  },
  {
    id: 'g4',
    platform: 'Instagram',
    niche: 'Fitness',
    content: '5-minute morning routine for busy professionals.',
    timeAgo: '2d ago',
    provider: 'Gemini 1.5',
    score: 74,
    titles: ['5-min morning routine', 'Busy? Try this morning flow', 'Morning routine for pros'],
    captions: ['No time? No problem. 5 minutes is all you need.'],
    hashtags: ['#MorningRoutine', '#Fitness', '#BusyPros'],
    cta: 'Save this for tomorrow morning!',
    scores: [
      { label: 'Hook', value: 72 },
      { label: 'SEO', value: 68 },
      { label: 'CTA', value: 80 },
      { label: 'Readability', value: 85 },
      { label: 'Virality', value: 65 },
      { label: 'Emotion', value: 70 },
    ],
  },
  {
    id: 'g5',
    platform: 'YouTube',
    niche: 'Tech',
    content: 'Building a full-stack app with Bun and Hono.',
    timeAgo: '3d ago',
    provider: 'Claude 3.5',
    score: 89,
    titles: ['Full-stack with Bun + Hono', 'Bun + Hono tutorial', 'Build fast APIs with Bun'],
    captions: ['In this video we build a full-stack app with Bun and Hono.'],
    hashtags: ['#Bun', '#Hono', '#NodeJS'],
    cta: 'Subscribe for weekly tutorials',
    scores: [
      { label: 'Hook', value: 90 },
      { label: 'SEO', value: 86 },
      { label: 'CTA', value: 88 },
      { label: 'Readability', value: 84 },
      { label: 'Virality', value: 82 },
      { label: 'Emotion', value: 75 },
    ],
  },
];

export type Prompt = {
  id: string;
  title: string;
  description: string;
  body: string;
  category: string;
  visibility: 'Public' | 'Private';
  uses: number;
  rating: number;
  owner: boolean;
};

export const promptList: Prompt[] = [
  {
    id: 'p1',
    title: 'Viral hook generator',
    description: 'Generate scroll-stopping first lines for any niche.',
    body: 'Write 5 viral hooks for a {topic} post targeting {audience}. Use curiosity, urgency, or a bold claim.',
    category: 'Trending',
    visibility: 'Public',
    uses: 1240,
    rating: 4.8,
    owner: false,
  },
  {
    id: 'p2',
    title: 'Edu thread builder',
    description: 'Turn any topic into a 7-part educational thread.',
    body: 'Create a 7-tweet educational thread about {topic}. Start with a hook, end with a CTA.',
    category: 'Education',
    visibility: 'Public',
    uses: 890,
    rating: 4.6,
    owner: false,
  },
  {
    id: 'p3',
    title: 'Product launch caption',
    description: 'High-converting launch captions with urgency.',
    body: 'Write a launch caption for {topic}. Include scarcity, social proof, and a clear CTA.',
    category: 'Business',
    visibility: 'Private',
    uses: 56,
    rating: 4.9,
    owner: true,
  },
  {
    id: 'p4',
    title: 'Recipe post pack',
    description: 'Caption + hashtags + hook for food creators.',
    body: 'Generate an Instagram food post for {topic}. Include a hook, recipe caption, and 15 hashtags.',
    category: 'Food',
    visibility: 'Public',
    uses: 2100,
    rating: 4.7,
    owner: false,
  },
  {
    id: 'p5',
    title: 'Workout motivation',
    description: 'Punchy fitness captions that drive saves.',
    body: 'Write a motivational fitness caption about {topic}. End with a save-worthy tip.',
    category: 'Fitness',
    visibility: 'Public',
    uses: 670,
    rating: 4.5,
    owner: false,
  },
  {
    id: 'p6',
    title: 'Carousel outline',
    description: 'Plan a 10-slide educational carousel.',
    body: 'Outline a 10-slide Instagram carousel about {topic}. Slide 1 = hook, slide 10 = CTA.',
    category: 'Education',
    visibility: 'Private',
    uses: 34,
    rating: 4.8,
    owner: true,
  },
];

export type MemoryGroup = {
  key: string;
  label: string;
  icon: string;
  items: { value: string; uses: number }[];
};

export const memoryGroups: MemoryGroup[] = [
  {
    key: 'hashtags',
    label: 'Hashtags',
    icon: '#',
    items: [
      { value: '#JEE2027', uses: 12 },
      { value: '#PatnaCoaching', uses: 8 },
      { value: '#IITPrep', uses: 15 },
      { value: '#StudyTips', uses: 6 },
    ],
  },
  {
    key: 'tones',
    label: 'Tones',
    icon: 'T',
    items: [
      { value: 'Educational', uses: 22 },
      { value: 'Motivational', uses: 9 },
    ],
  },
  {
    key: 'niches',
    label: 'Niches',
    icon: 'N',
    items: [
      { value: 'Education', uses: 18 },
      { value: 'Tech', uses: 11 },
    ],
  },
  {
    key: 'audiences',
    label: 'Audiences',
    icon: 'A',
    items: [
      { value: 'Students', uses: 14 },
      { value: 'Parents', uses: 5 },
    ],
  },
  {
    key: 'platforms',
    label: 'Platforms',
    icon: 'P',
    items: [
      { value: 'Instagram', uses: 20 },
      { value: 'Twitter', uses: 10 },
    ],
  },
  {
    key: 'ctas',
    label: 'CTAs',
    icon: 'C',
    items: [
      { value: 'Link in bio', uses: 16 },
      { value: 'Save this post', uses: 7 },
    ],
  },
];

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
};

export const apiKeysList: ApiKey[] = [
  { id: 'k1', name: 'Chrome Extension', prefix: 'pk_live_4f2a', created: 'Mar 12, 2026', lastUsed: '2h ago' },
  { id: 'k2', name: 'Zapier Integration', prefix: 'pk_live_9b8c', created: 'Feb 28, 2026', lastUsed: '1d ago' },
];

export type Schedule = {
  id: string;
  platform: Platform;
  content: string;
  date: string;
  created: string;
  status: 'planned' | 'posted' | 'cancelled';
};

export const scheduleList: Schedule[] = [
  {
    id: 's1',
    platform: 'Instagram',
    content: 'JEE 2027 batch announcement carousel',
    date: 'Aug 5, 2026 · 9:00 AM',
    created: '2d ago',
    status: 'planned',
  },
  {
    id: 's2',
    platform: 'Twitter',
    content: 'TypeScript thread — why it keeps winning',
    date: 'Aug 6, 2026 · 11:00 AM',
    created: '1d ago',
    status: 'planned',
  },
  {
    id: 's3',
    platform: 'LinkedIn',
    content: 'SaaS scaling lessons post',
    date: 'Aug 3, 2026 · 8:00 AM',
    created: '4d ago',
    status: 'posted',
  },
];

export const plans = [
  {
    name: 'Free',
    price: 0,
    credits: '3 credits / month',
    icon: '🆓',
    features: ['3 AI generations / mo', '1 platform', 'Basic templates', 'Community support'],
    cta: 'Get started',
    featured: false,
  },
  {
    name: 'Creator',
    price: 19,
    credits: '100 credits / month',
    icon: '⭐',
    features: [
      '100 AI generations / mo',
      'All platforms',
      'All templates',
      'Brand Brain + Memory',
      'Image analysis',
      'Priority support',
    ],
    cta: 'Upgrade to Creator',
    featured: true,
  },
  {
    name: 'Pro',
    price: 49,
    credits: '500 credits / month',
    icon: '🚀',
    features: [
      '500 AI generations / mo',
      'All platforms',
      'All templates + custom',
      'Document to content',
      'Campaign builder',
      'API access',
    ],
    cta: 'Upgrade to Pro',
    featured: false,
  },
  {
    name: 'Team',
    price: 149,
    credits: 'Unlimited credits',
    icon: '👥',
    features: [
      'Unlimited generations',
      '5 team seats',
      'Shared Brand Brain',
      'Advanced analytics',
      'SSO + audit logs',
      'Dedicated support',
    ],
    cta: 'Upgrade to Team',
    featured: false,
  },
];

export const brandHealth = {
  total: 78,
  scores: [
    { label: 'Consistency', value: 82, icon: 'Calendar' },
    { label: 'Tone', value: 75, icon: 'MessageSquare' },
    { label: 'Frequency', value: 68, icon: 'Clock' },
    { label: 'Engagement', value: 85, icon: 'Heart' },
  ],
  stats: [
    { label: 'Total Generations', value: '142' },
    { label: 'Last 30 days', value: '38' },
    { label: 'Scheduled', value: '12' },
    { label: 'Avg Content Score', value: '83' },
  ],
  insights: {
    strengths: ['Consistent posting cadence on Instagram', 'Strong educational tone match', 'High CTA clarity'],
    weaknesses: ['Twitter posting frequency is low', 'Captions occasionally exceed optimal length', 'Hashtag diversity could improve'],
    recommendations: [
      'Schedule 3 Twitter posts per week to balance platform mix',
      'Aim for captions under 150 words for better readability',
      'Add 5-10 niche-specific hashtags per post',
    ],
  },
};

export const user = {
  firstName: 'Aarav',
  lastName: 'Sharma',
  email: 'aarav@postready.ai',
  plan: 'Creator',
  credits: 7,
  creditsTotal: 100,
  generations: 142,
  aiMode: 'GPT-4o',
  brandName: 'EduTech Patna',
  tagline: 'Crack JEE with confidence',
  niche: 'Education',
  audience: 'Students',
  tone: 'Educational',
};
