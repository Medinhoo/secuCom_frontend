import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption {
  label: string;
  value: string;
}

export interface Filter {
  name: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filters?: Filter[];
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher...",
  filters,
}: SearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder={placeholder}
          className="pl-9 py-2 border-slate-200 rounded-md bg-white shadow-sm focus-visible:ring-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {filters.map((filter) => (
            <Select
              key={filter.name}
              value={filter.value}
              onValueChange={filter.onChange}
            >
              <SelectTrigger
                className={`w-[140px] border-slate-200 focus:ring-blue-500 bg-white ${
                  filter.className || ""
                }`}
              >
                <SelectValue placeholder={filter.placeholder || filter.name} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
    </div>
  );
}
