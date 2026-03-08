import { Form, FieldTemplate, Submission } from '../types';

export const mockForms: Form[] = [];

export const fieldTemplates: FieldTemplate[] = [
  /* ── Basic Info ─────────────────────────────────── */
  { id: 'name', type: 'name', label: 'Name', icon: 'User', category: 'Basic Info', color: 'text-teal-500' },
  { id: 'address', type: 'address', label: 'Address', icon: 'BookUser', category: 'Basic Info', color: 'text-teal-500' },
  { id: 'phone', type: 'phone', label: 'Phone', icon: 'Smartphone', category: 'Basic Info', color: 'text-teal-500', placeholder: '(555) 000-0000', defaultCountryCode: 'US' },
  { id: 'email', type: 'email', label: 'Email', icon: 'Mail', category: 'Basic Info', color: 'text-teal-500', placeholder: 'example@email.com' },
  { id: 'website', type: 'website', label: 'Website', icon: 'Globe', category: 'Basic Info', color: 'text-teal-500', placeholder: 'https://' },
  { id: 'geo_complete', type: 'geo_complete', label: 'GeoComplete', icon: 'MapPin', category: 'Basic Info', color: 'text-teal-500', isNew: true, placeholder: 'Search location...' },

  /* ── Textbox ─────────────────────────────────────── */
  { id: 'textbox', type: 'textbox', label: 'Single Line', icon: 'AlignLeft', category: 'Textbox', color: 'text-violet-500', placeholder: 'Enter text...' },
  { id: 'multiline', type: 'multiline', label: 'Multi Line', icon: 'AlignJustify', category: 'Textbox', color: 'text-violet-500', placeholder: 'Enter description...' },

  /* ── Number ──────────────────────────────────────── */
  { id: 'number', type: 'number', label: 'Number', icon: 'Hash', category: 'Number', color: 'text-violet-500', placeholder: '0' },
  { id: 'decimal', type: 'decimal', label: 'Decimal', icon: 'Percent', category: 'Number', color: 'text-violet-500', placeholder: '0.00' },
  { id: 'formula', type: 'formula', label: 'Formula', icon: 'FunctionSquare', category: 'Number', color: 'text-violet-500' },
  { id: 'currency', type: 'currency', label: 'Currency', icon: 'DollarSign', category: 'Number', color: 'text-violet-500', prefix: '$', currencyType: 'USD' },

  /* ── Choice ──────────────────────────────────────── */
  { id: 'dropdown', type: 'dropdown', label: 'Dropdown', icon: 'ChevronDown', category: 'Choice', color: 'text-sky-500' },
  { id: 'radio', type: 'radio', label: 'Radio', icon: 'CircleDot', category: 'Choice', color: 'text-sky-500' },
  { id: 'checkbox', type: 'checkbox', label: 'Checkbox', icon: 'CheckSquare', category: 'Choice', color: 'text-sky-500' },
  { id: 'multiple_choice', type: 'multiple_choice', label: 'Multiple Choice', icon: 'ListChecks', category: 'Choice', color: 'text-sky-500' },
  { id: 'image_choices', type: 'image_choices', label: 'Image Choices', icon: 'ImagePlus', category: 'Choice', color: 'text-sky-500' },

  /* ── Matrix Choices ──────────────────────────────── */
  { id: 'matrix_radio', type: 'matrix_radio', label: 'Radio', icon: 'LayoutGrid', category: 'Matrix Choices', color: 'text-pink-500' },
  { id: 'matrix_checkbox', type: 'matrix_checkbox', label: 'Checkbox', icon: 'Table2', category: 'Matrix Choices', color: 'text-pink-500' },
  { id: 'matrix_dropdown', type: 'matrix_dropdown', label: 'Dropdown', icon: 'TableProperties', category: 'Matrix Choices', color: 'text-pink-500' },
  { id: 'matrix_textbox', type: 'matrix_textbox', label: 'Textbox', icon: 'Rows4', category: 'Matrix Choices', color: 'text-pink-500' },
  { id: 'matrix_number', type: 'matrix_number', label: 'Number', icon: 'TableColumnsSplit', category: 'Matrix Choices', color: 'text-pink-500' },
  { id: 'matrix_currency', type: 'matrix_currency', label: 'Currency', icon: 'Columns', category: 'Matrix Choices', color: 'text-pink-500' },

  /* ── Date & Time ─────────────────────────────────── */
  { id: 'date', type: 'date', label: 'Date', icon: 'CalendarDays', category: 'Date & Time', color: 'text-amber-500' },
  { id: 'time', type: 'time', label: 'Time', icon: 'Clock', category: 'Date & Time', color: 'text-amber-500' },
  { id: 'datetime', type: 'datetime', label: 'Date-Time', icon: 'CalendarClock', category: 'Date & Time', color: 'text-amber-500' },
  { id: 'month_year', type: 'month_year', label: 'Month-Year', icon: 'Calendar', category: 'Date & Time', color: 'text-amber-500' },

  /* ── Uploads ─────────────────────────────────────── */
  { id: 'file', type: 'file', label: 'File Upload', icon: 'FileUp', category: 'Uploads', color: 'text-teal-500' },
  { id: 'image_upload', type: 'image_upload', label: 'Image Upload', icon: 'ImageUp', category: 'Uploads', color: 'text-teal-500' },
  { id: 'audio_video_upload', type: 'audio_video_upload', label: 'Audio/Video Upload', icon: 'VideoIcon', category: 'Uploads', color: 'text-teal-500' },

  /* ── Rating Scales ───────────────────────────────── */
  { id: 'rating', type: 'rating', label: 'Rating', icon: 'Star', category: 'Rating Scales', color: 'text-pink-500', ratingScale: 5, ratingShape: 'star' },
  { id: 'slider', type: 'slider', label: 'Slider', icon: 'SlidersHorizontal', category: 'Rating Scales', color: 'text-pink-500', minLimit: 0, maxLimit: 100, step: 1 },

  /* ── Instructions ────────────────────────────────── */
  { id: 'instructions', type: 'instructions', label: 'Description', icon: 'AlignLeft2', category: 'Instructions', color: 'text-rose-500' },
  { id: 'av_embed', type: 'av_embed', label: 'Audio/Video Embed', icon: 'Code2', category: 'Instructions', color: 'text-rose-500' },
  { id: 'map_location', type: 'map_location', label: 'Map Location', icon: 'Map', category: 'Instructions', color: 'text-rose-500', isNew: true },

  /* ── Identifier ──────────────────────────────────── */
  { id: 'unique_id', type: 'unique_id', label: 'Unique ID', icon: 'ListOrdered', category: 'Identifier', color: 'text-rose-500' },
  { id: 'random_id', type: 'random_id', label: 'Random ID', icon: 'Shuffle', category: 'Identifier', color: 'text-rose-500' },

  /* ── Legal & Consent ─────────────────────────────── */
  { id: 'terms', type: 'terms', label: 'Terms & Conditions', icon: 'FileCheck', category: 'Legal & Consent', color: 'text-pink-500', termsText: 'I agree to the terms and conditions' },
  { id: 'signature', type: 'signature', label: 'Signature', icon: 'PenLine', category: 'Legal & Consent', color: 'text-pink-500' },
  { id: 'decision_box', type: 'decision_box', label: 'Decision Box', icon: 'SquareCheck', category: 'Legal & Consent', color: 'text-pink-500', termsText: 'I agree' },
  { id: 'yes_no', type: 'yes_no', label: 'Yes/No', icon: 'ToggleLeft', category: 'Legal & Consent', color: 'text-pink-500', isNew: true },

  /* ── Prefill ─────────────────────────────────────── */
  { id: 'webhook', type: 'webhook', label: 'Webhook', icon: 'Webhook', category: 'Prefill', color: 'text-sky-500' },

  /* ── Advanced ────────────────────────────────────── */
  { id: 'subform', type: 'subform', label: 'Subform', icon: 'LayoutTemplate', category: 'Advanced', color: 'text-sky-500' },
  { id: 'payment', type: 'payment', label: 'Payment', icon: 'CreditCard', category: 'Advanced', color: 'text-sky-500' },

  /* ── AI ──────────────────────────────────────────── */
  { id: 'smart_scan', type: 'smart_scan', label: 'Smart Scan', icon: 'ScanSearch', category: 'AI', color: 'text-teal-500', isNew: true },
];


export const mockSubmissions: Submission[] = [];
