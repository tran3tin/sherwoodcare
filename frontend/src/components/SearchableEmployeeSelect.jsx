import React, { useEffect, useMemo, useRef, useState } from "react";
import "./SearchableEmployeeSelect.css";

const normalizeText = (value) => String(value ?? "").trim();

export const getEmployeeFullName = (emp) =>
  normalizeText(`${emp?.first_name || ""} ${emp?.last_name || ""}`);

/**
 * Searchable employee dropdown.
 * value / onChange use employee_id (string|number|"").
 */
export default function SearchableEmployeeSelect({
  employees = [],
  value,
  onChange,
  placeholder = "Select...",
  className = "",
}) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) =>
      getEmployeeFullName(a).localeCompare(getEmployeeFullName(b)),
    );
  }, [employees]);

  const selected = useMemo(
    () =>
      sortedEmployees.find((e) => String(e.employee_id) === String(value)) ||
      null,
    [sortedEmployees, value],
  );

  const selectedLabel = selected ? getEmployeeFullName(selected) : "";

  useEffect(() => {
    if (!open) setQuery(selectedLabel);
  }, [open, selectedLabel, value]);

  useEffect(() => {
    if (!open) return undefined;

    const onDocMouseDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery(selectedLabel);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery(selectedLabel);
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, selectedLabel]);

  const filtered = useMemo(() => {
    const term = normalizeText(query).toLowerCase();
    if (!term) return sortedEmployees;
    return sortedEmployees.filter((emp) =>
      getEmployeeFullName(emp).toLowerCase().includes(term),
    );
  }, [sortedEmployees, query]);

  const handleSelect = (emp) => {
    onChange(emp?.employee_id ?? "");
    setQuery(getEmployeeFullName(emp));
    setOpen(false);
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onChange("");
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div
      className={`employee-combobox${className ? ` ${className}` : ""}`}
      ref={rootRef}
    >
      <div className="employee-combobox-control">
        <input
          ref={inputRef}
          type="text"
          className="employee-combobox-input"
          value={open ? query : selectedLabel}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);
            setQuery(selectedLabel);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!open) setOpen(true);
          }}
          onClick={() => setOpen(true)}
          autoComplete="off"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        {(selected || query) && (
          <button
            type="button"
            className="employee-combobox-clear"
            onClick={handleClear}
            title="Clear"
            aria-label="Clear selected employee"
          >
            ×
          </button>
        )}
        <button
          type="button"
          className="employee-combobox-toggle"
          onClick={() => {
            setOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          tabIndex={-1}
          aria-label="Toggle employee list"
        >
          ▾
        </button>
      </div>

      {open && (
        <div className="employee-combobox-menu" role="listbox">
          {filtered.length === 0 ? (
            <div className="employee-combobox-empty">No matches</div>
          ) : (
            filtered.map((emp) => {
              const label = getEmployeeFullName(emp);
              const isActive =
                String(emp.employee_id) === String(selected?.employee_id || "");
              return (
                <button
                  key={emp.employee_id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`employee-combobox-option${
                    isActive ? " is-active" : ""
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(emp)}
                >
                  {label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
