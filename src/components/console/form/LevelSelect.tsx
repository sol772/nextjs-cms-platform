import SelectBox from "@/components/console/form/SelectBox";
import { useLevelSelectOptions } from "@/hooks/console/useLevelSelectOptions";

interface LevelSelectProps {
    value: number;
    onChange: (value: number) => void;
    className?: string;
}

export default function LevelSelect({ value, onChange, className }: LevelSelectProps) {
    const { levelOptions } = useLevelSelectOptions();

    return (
        <>
            {levelOptions.length > 0 && (
                <SelectBox
                    list={levelOptions}
                    triggerClassName={className}
                    value={String(value)}
                    onChange={value => onChange(Number(value))}
                    level={true}
                />
            )}
        </>
    );
}
