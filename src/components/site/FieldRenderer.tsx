"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { FieldSchema } from "@/lib/calculators/types";

interface Props {
  field: FieldSchema;
  value: number | string | boolean | undefined;
  onChange: (v: number | string | boolean) => void;
}

export function FieldRenderer({ field, value, onChange }: Props) {
  const required = field.required !== false;
  const helpId = `${field.name}-help`;

  if (field.type === "select") {
    const current = value === undefined ? String(field.default ?? "") : String(value);
    return (
      <div className="space-y-1.5">
        <Label htmlFor={field.name}>{field.label}</Label>
        <Select value={current} onValueChange={(v) => onChange(v)}>
          <SelectTrigger id={field.name}>
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {field.help && <p id={helpId} className="text-xs text-muted-foreground">{field.help}</p>}
      </div>
    );
  }

  if (field.type === "checkbox") {
    const checked = Boolean(value);
    return (
      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id={field.name}
          checked={checked}
          onCheckedChange={(v) => onChange(Boolean(v))}
        />
        <Label htmlFor={field.name} className="cursor-pointer">{field.label}</Label>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={field.name}>{field.label}</Label>
        <Textarea
          id={field.name}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          aria-describedby={field.help ? helpId : undefined}
        />
        {field.help && <p id={helpId} className="text-xs text-muted-foreground">{field.help}</p>}
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={field.name}>{field.label}</Label>
        <Input
          id={field.name}
          type="date"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.help && <p id={helpId} className="text-xs text-muted-foreground">{field.help}</p>}
      </div>
    );
  }

  // number + text
  const isNumber = field.type === "number";
  const unitId = `${field.name}-unit`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name}>{field.label}</Label>
      <div className="relative">
        <Input
          id={field.name}
          type={isNumber ? "number" : "text"}
          inputMode={isNumber ? "decimal" : undefined}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => {
            const v = e.target.value;
            if (isNumber) {
              onChange(v === "" ? "" : Number(v));
            } else {
              onChange(v);
            }
          }}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step}
          required={required}
          aria-describedby={`${field.help ? helpId + " " : ""}${field.unit ? unitId : ""}`.trim() || undefined}
          className={field.unit ? "pr-12" : ""}
        />
        {field.unit && (
          <span id={unitId} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {field.unit}
          </span>
        )}
      </div>
      {field.help && <p id={helpId} className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}
