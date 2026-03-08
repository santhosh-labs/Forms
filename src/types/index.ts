export interface FormSettings {
  description?: string;
  submitText?: string;
  successMessage?: string;
  redirectUrl?: string;
  isClosed?: boolean;
}

export interface FormTheme {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  textColor?: string;
}

export interface FormRule {
  id: string;
  condition: {
    fieldId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string;
  };
  action: {
    type: 'show' | 'hide';
    targetFieldId: string;
  };
}

export interface WelcomePageConfig {
  enabled: boolean;
  layout: 'center' | 'left';
  mediaUrl?: string; // image or video
  content?: string; // rich text
}

export interface Form {
  id: string;
  name: string;
  type: 'standard' | 'card';
  createdAt: string;
  fields: FormField[];
  gridRows?: GridRow[];
  submissions: number;
  settings?: FormSettings;
  theme?: FormTheme;
  rules?: FormRule[];
  isDeleted?: boolean;
  isDisabled?: boolean;
  folder?: string;
  owner?: string;
  welcomePage?: WelcomePageConfig;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
  position: number;
  subFields?: FormField[]; // only used by 'subform' type

  // Common properties
  hideLabel?: boolean;
  hoverText?: string;
  fieldSize?: 'small' | 'medium' | 'large';

  // Specific properties
  characterLimit?: number; // textbox, multiline
  minLimit?: number; // number, decimal, slider
  maxLimit?: number; // number, decimal, slider
  prefix?: string; // number, currency
  suffix?: string; // number
  currencyType?: string; // currency
  dateFormat?: string; // date

  // time
  timeFormat?: '12h' | '24h';
  minuteInterval?: number;
  initialTime?: string;
  autofillTime?: boolean;

  // file
  allowedFileTypes?: string;
  uploadLimitMin?: number | 'N/A';
  uploadLimitMax?: number;
  fileSizeMin?: number;
  fileSizeMinUnit?: 'KB' | 'MB' | 'GB';
  fileSizeMax?: number;
  fileSizeMaxUnit?: 'KB' | 'MB' | 'GB';
  fileNamePrefix?: string;
  allowMultipleFiles?: boolean;
  maxFileSizeMB?: number; // legacy

  // other
  ratingScale?: number; // rating
  ratingShape?: 'star' | 'heart' | 'smile'; // rating
  step?: number; // slider
  matrixRows?: string[]; // matrix types
  matrixColumns?: string[]; // matrix types
  matrixRowsRequired?: boolean; // matrix types
  matrixColsRequired?: boolean; // matrix types
  noDuplicates?: boolean; // validation

  // address
  mapService?: 'none' | 'google';
  mapInputMethod?: 'text' | 'auto';
  addressElements?: { label: string; visible: boolean; mandatory: boolean }[];
  showAddressLabels?: boolean;
  allowedCountries?: string[];
  defaultCountry?: string;

  // legal
  yesLabel?: string;
  noLabel?: string;

  // phone
  phoneFormat?: string;
  defaultCountryCode?: string;

  // validation
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  customErrorMessage?: string;
  allowedExtensions?: string[];

  // Terms & Conditions
  termsText?: string;
  termsLink?: string;

  // image choices
  imageChoices?: { id: string; url?: string; label: string; value: string | number }[];
  imageChoiceType?: 'single' | 'multiple';
  imageValueType?: 'text' | 'numeric' | 'none';
  imageDecimalPlaces?: number;

  // other
  allowMultipleChoices?: boolean; // for dropdown multiselect
  showSearch?: boolean; // for dropdown search
  defaultValue?: string | number | boolean | string[];
}

export interface GridSlot {
  id: string;
  field?: FormField;
}

export interface GridRow {
  id: string;
  columns: 1 | 2 | 3;
  slots: GridSlot[];
}

export type FieldType =
  // Basic Info
  | 'name' | 'address' | 'phone' | 'email' | 'website' | 'geo_complete'
  // Textbox
  | 'textbox' | 'multiline'
  // Number
  | 'number' | 'decimal' | 'formula' | 'currency'
  // Choice
  | 'dropdown' | 'radio' | 'checkbox' | 'multiple_choice' | 'image_choices'
  // Matrix
  | 'matrix_radio' | 'matrix_checkbox' | 'matrix_dropdown' | 'matrix_textbox' | 'matrix_number' | 'matrix_currency'
  // Date & Time
  | 'date' | 'time' | 'datetime' | 'month_year'
  // Uploads
  | 'file' | 'image_upload' | 'audio_video_upload'
  // Rating
  | 'rating' | 'slider'
  // Instructions
  | 'instructions' | 'av_embed' | 'map_location'
  // Identifier
  | 'unique_id' | 'random_id'
  // Legal
  | 'terms' | 'signature' | 'decision_box' | 'yes_no'
  // Prefill
  | 'webhook'
  // Advanced
  | 'subform' | 'payment'
  // AI
  | 'smart_scan';

export interface FieldTemplate extends Partial<FormField> {
  id: string;
  type: FieldType;
  label: string;
  icon: string;
  category: string;
  isNew?: boolean;
  color?: string; // icon accent color class
}

export interface Submission {
  id: string;
  formId: string;
  submittedAt: string;
  data: Record<string, unknown>;
}

export interface FolderItem {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  isShared: boolean;
  sharedWith: string[];
  sharedBy?: string;
}
