export const API_CONFIG = {
  TIMEOUT: 30000,
  BASE_URL: '/api',
};

export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  FILTER: 500,
  INPUT: 200,
};

export const FILE_LIMITS = {
  MAX_PDF_ITEMS: 1000,
  MAX_FILE_SIZE_MB: 10,
};

export const MESSAGES = {
  ERROR: {
    FETCH_VENDORS: 'Failed to fetch vendors. Please try again.',
    FETCH_ITEMS: 'Failed to fetch procurement items. Please try again.',
    GENERATE_PDF: 'Failed to generate PDF. Please try again.',
    NO_ITEMS: 'No items to export. Please adjust your filters.',
    DATE_RANGE: 'End date must be after start date',
  },
  SUCCESS: {
    PDF_DOWNLOADED: 'PDF downloaded successfully',
  },
  INFO: {
    NO_VENDORS: 'No vendors found',
    NO_ITEMS: 'No procurement items found',
    LOADING_VENDORS: 'Loading vendors...',
    LOADING_ITEMS: 'Loading procurement items...',
    GENERATING_PDF: 'Generating PDF...',
  },
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};