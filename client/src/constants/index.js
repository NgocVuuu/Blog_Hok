// Role types and colors
export const ROLE_TYPES = {
  ASSASSIN: {
    key: 'assassin',
    label: 'Sát thủ',
    color: '#FF0000'
  },
  FIGHTER: {
    key: 'fighter',
    label: 'Đấu sĩ',
    color: '#FFA500'
  },
  MAGE: {
    key: 'mage',
    label: 'Pháp sư',
    color: '#00FFFF'
  },
  MARKSMAN: {
    key: 'marksman',
    label: 'Xạ thủ',
    color: '#FFFF00'
  },
  SUPPORT: {
    key: 'support',
    label: 'Hỗ trợ',
    color: '#00FF00'
  },
  TANK: {
    key: 'tank',
    label: 'Đỡ đòn',
    color: '#808080'
  }
};

// Item types and colors
export const ITEM_TYPES = {
  ATTACK: {
    key: 'attack',
    label: 'Tấn công',
    color: '#FF0000'
  },
  DEFENSE: {
    key: 'defense',
    label: 'Phòng thủ',
    color: '#0000FF'
  },
  MAGIC: {
    key: 'magic',
    label: 'Phép thuật',
    color: '#800080'
  },
  MOVEMENT: {
    key: 'movement',
    label: 'Di chuyển',
    color: '#00FF00'
  },
  CONSUMABLE: {
    key: 'consumable',
    label: 'Tiêu hao',
    color: '#FFA500'
  }
};

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: {
    key: 'easy',
    label: 'Dễ',
    color: '#00FF00'
  },
  MEDIUM: {
    key: 'medium',
    label: 'Trung bình',
    color: '#FFA500'
  },
  HARD: {
    key: 'hard',
    label: 'Khó',
    color: '#FF0000'
  }
};

// Card types
export const CARD_TYPES = {
  CHAMPION: 'champion',
  EQUIPMENT: 'equipment',
  NEWS: 'news'
};

// API endpoints
export const API_ENDPOINTS = {
  CHAMPIONS: '/api/champions',
  EQUIPMENT: '/api/equipment',
  NEWS: '/api/news',
  META: '/api/meta'
};

// Routes
export const ROUTES = {
  HOME: '/',
  CHAMPIONS: '/champions',
  EQUIPMENT: '/equipment',
  RUNES: '/runes',
  META: '/meta',
  NEWS: '/news'
};

// Theme colors
export const THEME = {
  PRIMARY: '#1a1a1a',
  SECONDARY: '#2d2d2d',
  ACCENT: '#ffd700',
  ACCENT_SECONDARY: '#ffa500',
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.8)'
};

// Layout constants
export const LAYOUT = {
  CONTAINER_MAX_WIDTH: 'lg',
  GRID_SPACING: 3,
  CARD_HEIGHT: 120,
  CARD_MEDIA_HEIGHT: 60
}; 