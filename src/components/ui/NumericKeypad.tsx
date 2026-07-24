interface Props {
  value: string;
  onChange: (value: string) => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

export default function NumericKeypad({ value, onChange }: Props) {
  function press(key: string) {
    if (key === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "." && value.includes(".")) return;
    onChange(value + key);
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          onClick={() => press(key)}
          className="touch-target rounded-lg bg-slate-100 py-2.5 text-lg font-semibold text-slate-700 hover:bg-slate-200 active:bg-slate-300"
        >
          {key}
        </button>
      ))}
    </div>
  );
}
