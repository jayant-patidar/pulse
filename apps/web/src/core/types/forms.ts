export interface FormFieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  options?: { label: string; value: string }[];
  required?: boolean;
}
