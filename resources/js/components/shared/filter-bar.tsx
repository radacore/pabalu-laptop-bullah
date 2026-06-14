import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
}

interface FilterBarProps {
    filters: FilterConfig[];
}

export default function FilterBar({ filters }: FilterBarProps) {
    if (filters.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end">
            {filters.map((filter) => (
                <div key={filter.key} className="grid gap-2 sm:min-w-44">
                    <Label htmlFor={`filter-${filter.key}`}>
                        {filter.label}
                    </Label>
                    <Select
                        value={filter.value}
                        onValueChange={filter.onChange}
                    >
                        <SelectTrigger
                            id={`filter-${filter.key}`}
                            className="w-full sm:w-44"
                        >
                            <SelectValue placeholder={filter.label} />
                        </SelectTrigger>
                        <SelectContent>
                            {filter.options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ))}
        </div>
    );
}
