type FormControlProps = {
  label: string;
  value: string;
};

export function FormControl({ label, value }: FormControlProps) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-slate-700">
      {label}
      <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10">
        <option>{value}</option>
      </select>
    </label>
  );
}
