"use client";

type LearningModeToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
};

export default function LearningModeToggle({
  enabled,
  onChange,
  label,
}: LearningModeToggleProps) {
  return (
    <div className="inline-flex max-w-full items-center gap-2.5 select-none sm:gap-3">
      <span
        className={`text-xs font-medium transition-colors sm:text-sm ${
          enabled ? "text-[#111111]" : "text-[#111111]/45"
        }`}
      >
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 border transition-colors ${
          enabled
            ? "border-[#111111] bg-[#111111]"
            : "border-[#bbbbbb] bg-[#ffffff]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 transition-transform ${
            enabled
              ? "translate-x-5 bg-[#ffffff]"
              : "translate-x-0 bg-[#111111]/25"
          }`}
        />
      </button>
    </div>
  );
}
