
export const LEVELS = [
 
  { denom: 2, target: 1, tier: 'beginner' },
  { denom: 3, target: 1, tier: 'beginner' },
  { denom: 3, target: 2, tier: 'beginner' },
  { denom: 4, target: 1, tier: 'beginner' },
  { denom: 4, target: 3, tier: 'beginner' },
  
  { denom: 5, target: 2, tier: 'intermediate' },
  { denom: 5, target: 4, tier: 'intermediate' },
  { denom: 6, target: 1, tier: 'intermediate' },
  { denom: 6, target: 5, tier: 'intermediate' },
  { denom: 6, target: 2, tier: 'intermediate' },
 
  { denom: 7, target: 3, tier: 'advanced' },
  { denom: 7, target: 5, tier: 'advanced' },
  { denom: 8, target: 3, tier: 'advanced' },
  { denom: 8, target: 5, tier: 'advanced' },
  { denom: 8, target: 7, tier: 'advanced' },

  { denom: 9, target: 4, tier: 'master' },
  { denom: 9, target: 7, tier: 'master' },
  { denom: 10, target: 3, tier: 'master' },
  { denom: 11, target: 8, tier: 'master' },
  { denom: 12, target: 5, tier: 'master' }
];

export const TIERS = [
  { id: 'beginner', label: 'Beginner', color: '#4E9F7D' },
  { id: 'intermediate', label: 'Intermediate', color: '#E8A33D' },
  { id: 'advanced', label: 'Advanced', color: '#C1447E' },
  { id: 'master', label: 'Master', color: '#7A4FC9' }
];

export const BASE_POINTS = 10;
export const BONUS_PER_STAR = 5; 

export const PIE_GEOMETRY = {
  viewBoxSize: 200,
  centerX: 100,
  centerY: 100,
  radius: 92
};
