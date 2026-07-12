export const THEMES = [
  {
    id: 'pie',
    label: 'Bakery Pie',
    emoji: '🥧',
    filling: '#E8A33D',
    fillingDark: '#C97F1F',
    unshaded: '#F3E7D2'
  },
  {
    id: 'pizza',
    label: 'Pizza',
    emoji: '🍕',
    filling: '#E0592A',
    fillingDark: '#B8431C',
    unshaded: '#F6D68A'
  },
  {
    id: 'cake',
    label: 'Cake',
    emoji: '🍰',
    filling: '#F2A6C1',
    fillingDark: '#D6789E',
    unshaded: '#FCEAF1'
  },
  {
    id: 'watermelon',
    label: 'Watermelon',
    emoji: '🍉',
    filling: '#E23E57',
    fillingDark: '#B72C42',
    unshaded: '#DDF2D1'
  },
  {
    id: 'orange',
    label: 'Orange',
    emoji: '🍊',
    filling: '#F5941F',
    fillingDark: '#CC7412',
    unshaded: '#FDEBD0'
  },
  {
    id: 'planet',
    label: 'Planet',
    emoji: '🌍',
    filling: '#4E9F7D',
    fillingDark: '#357A5D',
    unshaded: '#2B3A55'
  }
];

export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
