import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsField {
  label: string;
  type: 'text' | 'password' | 'number' | 'select' | 'color';
  value: any;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}

interface SettingsSectionProps {
  title: string;
  description: string;
  fields: SettingsField[];
}

export function SettingsSection({ title, description, fields }: SettingsSectionProps) {
  const renderField = (field: SettingsField) => {
    switch (field.type) {
      case 'select':
        return (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              className="h-10 w-20 rounded border border-input cursor-pointer"
            />
            <span className="text-sm text-muted-foreground">{field.value}</span>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.placeholder}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        );

      default:
        return (
          <input
            type={field.type}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={field.placeholder}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.label}>
            <label className="text-sm font-medium mb-2 block">{field.label}</label>
            {renderField(field)}
            {field.description && (
              <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
