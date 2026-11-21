import { Search } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <label className="search-bar">
      <Search size={20} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by ZIP code, city, or location"
        aria-label="Search alerts"
      />
    </label>
  );
}
