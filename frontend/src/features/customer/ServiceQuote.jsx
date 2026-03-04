import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Layout from "../../components/Layout";
import "./ServiceQuote.css";
import "../../assets/styles/list.css";

// ─── Constants ───────────────────────────────────────────────────────────
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SERVICE_TYPES = [
  "1:1",
  "Group (1:45)",
  "Group (2:45)",
  "Group (3:45)",
  "Group (4:45)",
];

const TIME_OF_DAY_OPTIONS = ["Day", "Evening", "Overnight"];

const DEFAULT_SCHEDULE_ROWS = [
  {
    id: "a",
    regis: "107/115",
    description:
      "Personal Hygiene - bathing, showering, grooming, dressing and undressing and toileting",
    timeOfDay: "Day",
    timeFrame: "7am - 8am",
    staff: 2,
    hoursPerDay: 0,
    shared: false,
    serviceType: "1:1",
  },
  {
    id: "b",
    regis: "107/115",
    description: "Breakfast - Preparation, cook, setup and tidy up",
    timeOfDay: "Day",
    timeFrame: "8am - 9.30am",
    staff: 3,
    hoursPerDay: 1.5,
    shared: true,
    serviceType: "Group (3:45)",
  },
  {
    id: "c",
    regis: "107/115",
    description: "Medication Administration (Morning round)",
    timeOfDay: "Day",
    timeFrame: "8am - 9.30am",
    staff: 2,
    hoursPerDay: 0,
    shared: false,
    serviceType: "1:1",
  },
  {
    id: "d",
    regis: "107/115",
    description: "Morning tea - Preparation, cook, setup and tidy up",
    timeOfDay: "Day",
    timeFrame: "9.30am - 10.45am",
    staff: 2,
    hoursPerDay: 0,
    shared: false,
    serviceType: "Group (2:45)",
  },
  {
    id: "e",
    regis: "107/115",
    description: "Cleaning - Facility and communal area cleaning",
    timeOfDay: "Day",
    timeFrame: "9am - 1pm",
    staff: 1,
    hoursPerDay: 4,
    shared: true,
    serviceType: "Group (1:45)",
  },
  {
    id: "f",
    regis: "107/115",
    description: "Cleaning - Change of linen and room clean",
    timeOfDay: "Day",
    timeFrame: "9.30am - 11am & 1pm - 2pm",
    staff: 2,
    hoursPerDay: 0.3,
    shared: true,
    serviceType: "1:1",
  },
  {
    id: "g",
    regis: "107/115",
    description: "Lunch - Preparation, cook, setup and tidy up",
    timeOfDay: "Day",
    timeFrame: "11am - 1.30pm",
    staff: 4,
    hoursPerDay: 2.5,
    shared: true,
    serviceType: "Group (4:45)",
  },
  {
    id: "h",
    regis: "107/115",
    description: "Medication Administration (Mid day round)",
    timeOfDay: "Day",
    timeFrame: "11.30am - 1pm",
    staff: 2,
    hoursPerDay: 0,
    shared: false,
    serviceType: "1:1",
  },
  {
    id: "i",
    regis: "107/115",
    description: "Afternoon tea - Preparation, cook, setup and tidy up",
    timeOfDay: "Day",
    timeFrame: "2pm - 3pm",
    staff: 2,
    hoursPerDay: 0,
    shared: false,
    serviceType: "Group (2:45)",
  },
  {
    id: "j",
    regis: "107/115",
    description: "Laundry service",
    timeOfDay: "Day",
    timeFrame: "1pm - 3pm & 3pm - 5pm",
    staff: 2,
    hoursPerDay: 4,
    shared: true,
    serviceType: "Group (2:45)",
  },
  {
    id: "k",
    regis: "107/115",
    description: "Medication Administration (Afternoon round)",
    timeOfDay: "Day",
    timeFrame: "4pm - 5.30pm",
    staff: 2,
    hoursPerDay: 0,
    shared: false,
    serviceType: "1:1",
  },
  {
    id: "l",
    regis: "107/115",
    description: "Dinner - Preparation, cook, setup and tidy up",
    timeOfDay: "Day",
    timeFrame: "4pm - 6.30pm",
    staff: 3,
    hoursPerDay: 2.5,
    shared: true,
    serviceType: "Group (3:45)",
  },
  {
    id: "m",
    regis: "107/115",
    description: "Supper - Preparation, cook, setup and tidy up",
    timeOfDay: "Day",
    timeFrame: "7pm - 8pm",
    staff: 2,
    hoursPerDay: 0,
    shared: false,
    serviceType: "Group (2:45)",
  },
  {
    id: "n",
    regis: "107/115",
    description: "Medication Administration (Evening round)",
    timeOfDay: "Evening",
    timeFrame: "8pm - 9pm",
    staff: 2,
    hoursPerDay: 0,
    shared: false,
    serviceType: "1:1",
  },
  {
    id: "o",
    regis: "107/115",
    description: "Cleaning - Floor clean at communal area",
    timeOfDay: "Evening",
    timeFrame: "9pm - 9.30pm",
    staff: 2,
    hoursPerDay: 0.5,
    shared: true,
    serviceType: "Group (2:45)",
  },
  {
    id: "p",
    regis: "107/115",
    description: "Overnight Care",
    timeOfDay: "Overnight",
    timeFrame: "9pm - 7am next day",
    staff: 2,
    hoursPerDay: 0,
    shared: false,
    serviceType: "Group (2:45)",
  },
];

const DEFAULT_SCHEDULE_115 = [
  {
    id: "a-115",
    regis: "115",
    description: "Grooming & Hairdressing Services",
    timeOfDay: "Day",
    timeFrame: "1-1.5 hour per month",
    staff: 1,
    hoursPerDay: 0,
    shared: false,
    serviceType: "1:1",
  },
];

const DEFAULT_SCHEDULE_107_DOMESTIC = [
  {
    id: "q-dom",
    regis: "107",
    description:
      "Doctor appointment services (booking, drop, pickup or setup long distance facility)",
    timeOfDay: "Day",
    timeFrame: "",
    staff: 1,
    hoursPerDay: 0,
    shared: false,
    serviceType: "1:1",
  },
  {
    id: "r-dom",
    regis: "107",
    description:
      "Shopping for personal belongs or personal matter (eg: cigarette, bank, family gathering)",
    timeOfDay: "Day",
    timeFrame: "approx. 2 hrs per week",
    staff: 1,
    hoursPerDay: 0,
    shared: false,
    serviceType: "1:1",
  },
];

const DEFAULT_RATES = [
  {
    id: 1,
    supportItemNumber: "01_011_0107_1_1",
    supportItemName:
      "Assistance With Self-Care Activities - Standard - Weekday Daytime",
    regGroupNumber: "0107",
    rate: 70.23,
  },
  {
    id: 2,
    supportItemNumber: "01_012_0107_1_1",
    supportItemName:
      "Assistance With Self-Care Activities - Standard - Public Holiday",
    regGroupNumber: "0107",
    rate: 156.03,
  },
  {
    id: 3,
    supportItemNumber: "01_013_0107_1_1",
    supportItemName:
      "Assistance With Self-Care Activities - Standard - Saturday",
    regGroupNumber: "0107",
    rate: 98.83,
  },
  {
    id: 4,
    supportItemNumber: "01_014_0107_1_1",
    supportItemName: "Assistance With Self-Care Activities - Standard - Sunday",
    regGroupNumber: "0107",
    rate: 127.43,
  },
  {
    id: 5,
    supportItemNumber: "01_010_0107_1_1",
    supportItemName:
      "Assistance With Self-Care Activities - Night-Time Sleepover",
    regGroupNumber: "0107",
    rate: 297.6,
  },
  {
    id: 6,
    supportItemNumber: "01_015_0107_1_1",
    supportItemName:
      "Assistance With Self-Care Activities - Standard - Weekday Evening",
    regGroupNumber: "0107",
    rate: 77.38,
  },
];

const DEFAULT_RATE_TABLE = [
  {
    id: 1,
    regGroupNo: "107",
    supportCategory: "Assistance with daily Personal Activities/Personal life",
    supportItemName:
      "Assistance With Self-Care Activities - Standard - Weekday Daytime, Public Holiday, Sunday and Saturday",
    dailyHours: 18.3,
    weekdayRate: 65.47,
    saturdayRate: 92.12,
    sundayRate: 118.78,
    phRate: 145.44,
    weekdayCode: "01_011_0107_1_1",
    saturdayCode: "01_013_0107_1_1",
    sundayCode: "01_014_0107_1_1",
    phCode: "01_012_0107_1_1",
  },
  {
    id: 2,
    regGroupNo: "107",
    supportCategory: "Assistance with daily Personal Activities/Personal life",
    supportItemName:
      "Assistance With Self-Care Activities - Standard - Weekday Evening, NightTime Sleepover, Public Holiday, Sunday and Saturday",
    dailyHours: 0.6,
    weekdayRate: 72.13,
    saturdayRate: 92.12,
    sundayRate: 118.78,
    phRate: 145.44,
    weekdayCode: "01_015_0107_1_1",
    saturdayCode: "01_013_0107_1_1",
    sundayCode: "01_014_0107_1_1",
    phCode: "01_012_0107_1_1",
  },
  {
    id: 3,
    regGroupNo: "107",
    supportCategory: "Assistance with daily Personal Activities/Personal life",
    supportItemName:
      "Assistance With Self-Care Activities - Night-Time Sleepover",
    dailyHours: 10,
    weekdayRate: 276.27,
    saturdayRate: 277.27,
    sundayRate: 278.27,
    phRate: 279.27,
    weekdayCode: "01_010_0107_1_1",
    saturdayCode: "01_010_0107_1_2",
    sundayCode: "01_010_0107_1_3",
    phCode: "01_010_0107_1_4",
  },
  {
    id: 4,
    regGroupNo: "107",
    supportCategory: "Assistance with daily Personal Activities/Personal life",
    supportItemName: "Assistance With Personal Domestic Activities",
    dailyHours: 0,
    weekdayRate: 55.03,
    saturdayRate: 55.03,
    sundayRate: 55.03,
    phRate: 55.03,
    weekdayCode: "01_004_0107_1_1",
    saturdayCode: "01_004_0107_1_1",
    sundayCode: "01_004_0107_1_1",
    phCode: "01_004_0107_1_1",
  },
  {
    id: 5,
    regGroupNo: "115",
    supportCategory:
      "Assistance With Daily Life Tasks In A Group Or Shared Living Arrangement",
    supportItemName: "Assistance In A Shared Living Arrangement",
    dailyHours: 0.75,
    weekdayRate: 65.47,
    saturdayRate: 92.12,
    sundayRate: 118.78,
    phRate: 145.44,
    weekdayCode: "01_801_0115_1_1",
    saturdayCode: "01_804_0115_1_1",
    sundayCode: "01_805_0115_1_1",
    phCode: "01_806_0115_1_1",
  },
];

// ─── Utility helpers ─────────────────────────────────────────────────────
const getRatio = (serviceType) => {
  const m = serviceType.match(/\((\d+):(\d+)\)/);
  if (!m) return 1; // 1:1
  return parseInt(m[2]) / parseInt(m[1]); // e.g. "Group (2:45)" → 45/2
};

const fmt = (n) =>
  n.toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtOr = (n) => (n === 0 ? "-" : fmt(n));

const getMondayToSunday = (baseDate = new Date()) => {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const fmtDate = (date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// ─── Spreadsheet helpers ─────────────────────────────────────────────────
const parseClipboard = (str) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuote = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    const next = str[i + 1];
    if (inQuote) {
      if (c === '"') {
        if (next === '"') {
          cell += '"';
          i++;
        } else inQuote = false;
      } else cell += c;
    } else {
      if (c === '"') inQuote = true;
      else if (c === "\t") {
        row.push(cell);
        cell = "";
      } else if (c === "\n" || (c === "\r" && next === "\n")) {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
        if (c === "\r") i++;
      } else if (c === "\r") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else cell += c;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  if (rows.length && rows[rows.length - 1].every((v) => v === "")) rows.pop();
  return rows;
};

const autoResize = (el) => {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
};

// Fixed paste-column keys for schedule and rate table
const SCH_FIXED_KEYS = [
  "regis",
  "description",
  "timeOfDay",
  "timeFrame",
  "staff",
  "hoursPerDay",
  "shared",
  "serviceType",
];
const BPH_FIXED_KEYS = [
  "supportItemNumber",
  "supportItemName",
  "regGroupNumber",
  "rate",
];
const RT_FIXED_KEYS = [
  "regGroupNo",
  "supportCategory",
  "supportItemName",
  "dailyHours",
  "weekdayRate",
  "weekdayCode",
  "saturdayRate",
  "saturdayCode",
  "sundayRate",
  "sundayCode",
  "phRate",
  "phCode",
];

// ─── Column rendering definitions ────────────────────────────────────────
const SCH_COL_DEFS = [
  { key: "regis", label: "Regis", type: "text", width: "80px", align: "left" },
  {
    key: "description",
    label: "Item Description",
    type: "text",
    width: "250px",
    align: "left",
  },
  {
    key: "timeOfDay",
    label: "Time of Day",
    type: "select",
    options: TIME_OF_DAY_OPTIONS,
    width: "100px",
  },
  {
    key: "timeFrame",
    label: "Time Frame",
    type: "text",
    width: "140px",
    align: "left",
  },
  {
    key: "staff",
    label: "Staff",
    type: "number",
    width: "55px",
    align: "right",
  },
  {
    key: "hoursPerDay",
    label: "Hrs/Day",
    type: "number",
    width: "70px",
    align: "right",
  },
  {
    key: "shared",
    label: "Shared",
    type: "checkbox",
    width: "55px",
    align: "center",
  },
  {
    key: "serviceType",
    label: "Service Type",
    type: "select",
    options: SERVICE_TYPES,
    width: "120px",
  },
];

const BPH_COL_DEFS = [
  {
    key: "supportItemNumber",
    label: "Support Item Number",
    type: "text",
    width: "220px",
    align: "left",
  },
  {
    key: "supportItemName",
    label: "Support Item Name",
    type: "text",
    width: "560px",
    align: "left",
  },
  {
    key: "regGroupNumber",
    label: "Registration Group Number",
    type: "text",
    width: "180px",
    align: "center",
  },
  {
    key: "rate",
    label: "Price per hours",
    type: "number",
    width: "150px",
    align: "right",
  },
];

const RT_COL_DEFS = [
  {
    key: "regGroupNo",
    label: "Reg Group",
    type: "text",
    width: "70px",
    align: "left",
  },
  {
    key: "supportCategory",
    label: "Support Category",
    type: "text",
    width: "220px",
    align: "left",
  },
  {
    key: "supportItemName",
    label: "Support Item Name",
    type: "text",
    width: "250px",
    align: "left",
  },
  {
    key: "dailyHours",
    label: "Daily Hrs",
    type: "number",
    width: "70px",
    align: "right",
  },
  {
    key: "weekdayRate",
    label: "Weekday ($)",
    type: "number",
    width: "90px",
    align: "right",
    codeKey: "weekdayCode",
  },
  {
    key: "saturdayRate",
    label: "Saturday ($)",
    type: "number",
    width: "90px",
    align: "right",
    codeKey: "saturdayCode",
  },
  {
    key: "sundayRate",
    label: "Sunday ($)",
    type: "number",
    width: "90px",
    align: "right",
    codeKey: "sundayCode",
  },
  {
    key: "phRate",
    label: "PH ($)",
    type: "number",
    width: "90px",
    align: "right",
    codeKey: "phCode",
  },
];

const TH_STYLE = {
  border: "1px solid #ccc",
  background: "#2c3e7a",
  color: "#fff",
  padding: "6px 4px",
  textAlign: "center",
  fontSize: "12px",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const TD_STYLE = {
  border: "1px solid #ddd",
  padding: "1px",
};

const CELL_STYLE = {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  padding: "3px 5px",
  fontSize: "13px",
  boxSizing: "border-box",
  resize: "none",
  overflow: "hidden",
  lineHeight: "1.5",
  minHeight: "26px",
  fontFamily: "inherit",
  display: "block",
};

// ─── Component ───────────────────────────────────────────────────────────
export default function ServiceQuote() {
  const [activeTab, setActiveTab] = useState("schedule");
  const [clientName, setClientName] = useState("");
  const [planNumber, setPlanNumber] = useState("");
  const [planPeriod, setPlanPeriod] = useState("TBA");

  // ── Schedule ──────────────────────────────────────────────────────────────
  const [scheduleRows, setScheduleRows] = useState(() =>
    DEFAULT_SCHEDULE_ROWS.map((r) => ({ ...r, _extra: {} })),
  );
  const [scheduleExtraCols, setScheduleExtraCols] = useState([]);

  // ── Base rate items (Price per hours) ───────────────────────────────────
  const [baseRateItems, setBaseRateItems] = useState(() =>
    DEFAULT_RATES.map((r) => ({ ...r })),
  );

  // ── Rate Table ────────────────────────────────────────────────────────────
  const [rateTable, setRateTable] = useState(() =>
    DEFAULT_RATE_TABLE.map((r) => ({ ...r, _extra: {} })),
  );

  const [rateTableExtraCols, setRateTableExtraCols] = useState([]);

  // Public holiday & irregular
  const [publicHolidayRate, setPublicHolidayRate] = useState(150.1);
  const [publicHolidayHours, setPublicHolidayHours] = useState(5.0);
  const [irregularRate, setIrregularRate] = useState(150.1);
  const [irregularHours, setIrregularHours] = useState(5.0);

  useEffect(() => {
    const findBaseRate = (keyword) => {
      const row = baseRateItems.find((item) =>
        (item.supportItemName || "").toLowerCase().includes(keyword),
      );
      return parseFloat(row?.rate) || 0;
    };

    const weekdayDayRate = findBaseRate("weekday daytime");
    const weekdayEveningRate = findBaseRate("weekday evening");
    const saturdayRate = findBaseRate("saturday");
    const sundayRate = findBaseRate("sunday");
    const publicHolidayRateFromBase = findBaseRate("public holiday");
    const sleepoverRate = findBaseRate("night-time sleepover");

    setRateTable((prev) =>
      prev.map((row) => {
        const name = (row.supportItemName || "").toLowerCase();

        if (name.includes("night-time sleepover")) {
          return {
            ...row,
            weekdayRate: sleepoverRate,
            saturdayRate: sleepoverRate,
            sundayRate: sleepoverRate,
            phRate: sleepoverRate,
          };
        }

        const weekdayRate = name.includes("weekday evening")
          ? weekdayEveningRate || weekdayDayRate
          : weekdayDayRate;

        return {
          ...row,
          weekdayRate,
          saturdayRate,
          sundayRate,
          phRate: publicHolidayRateFromBase,
        };
      }),
    );
  }, [baseRateItems]);

  // Add Column modal: null | 'schedule' | 'rate'
  const [addColTarget, setAddColTarget] = useState(null);
  const [newColLabel, setNewColLabel] = useState("");

  const quoteRef = useRef(null);

  // ── Empty row factories ──────────────────────────────────────────────────
  const emptyScheduleRow = useCallback(
    () => ({
      id: `row-${Date.now()}-${Math.random()}`,
      regis: "107/115",
      description: "",
      timeOfDay: "Day",
      timeFrame: "",
      staff: 1,
      hoursPerDay: 0,
      shared: false,
      serviceType: "1:1",
      _extra: {},
    }),
    [],
  );

  const emptyRateRow = useCallback(
    () => ({
      id: Date.now() + Math.random(),
      regGroupNo: "107",
      supportCategory: "",
      supportItemName: "",
      dailyHours: 0,
      weekdayRate: 0,
      weekdayCode: "",
      saturdayRate: 0,
      saturdayCode: "",
      sundayRate: 0,
      sundayCode: "",
      phRate: 0,
      phCode: "",
      _extra: {},
    }),
    [],
  );

  const emptyBaseRateItem = useCallback(
    () => ({
      id: Date.now() + Math.random(),
      supportItemNumber: "",
      supportItemName: "",
      regGroupNumber: "0107",
      rate: 0,
    }),
    [],
  );

  // ── Schedule helpers ─────────────────────────────────────────────────────
  const updateScheduleCell = useCallback((rowIdx, key, value) => {
    setScheduleRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r;
        if (key.startsWith("extra_")) {
          return { ...r, _extra: { ...r._extra, [key]: value } };
        }
        return { ...r, [key]: value };
      }),
    );
  }, []);

  const addScheduleRows = useCallback(
    (n = 1) => {
      setScheduleRows((prev) => [
        ...prev,
        ...Array.from({ length: n }, emptyScheduleRow),
      ]);
    },
    [emptyScheduleRow],
  );

  const removeScheduleRow = useCallback((idx) => {
    setScheduleRows((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const clearSchedule = useCallback(() => {
    if (!window.confirm("Clear Hrs/Day and Shared for all rows?")) return;
    setScheduleRows((prev) =>
      prev.map((r) => ({
        ...r,
        hoursPerDay: 0,
        shared: false,
      })),
    );
  }, []);

  // ── Base rate item helpers ──────────────────────────────────────────────
  const updateBaseRateCell = useCallback((rowIdx, key, value) => {
    setBaseRateItems((prev) =>
      prev.map((r, i) => (i === rowIdx ? { ...r, [key]: value } : r)),
    );
  }, []);

  const addBaseRateRows = useCallback(
    (n = 1) => {
      setBaseRateItems((prev) => [
        ...prev,
        ...Array.from({ length: n }, emptyBaseRateItem),
      ]);
    },
    [emptyBaseRateItem],
  );

  const removeBaseRateRow = useCallback((idx) => {
    setBaseRateItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const clearBaseRate = useCallback(() => {
    if (!window.confirm("Clear Price per hours for all rows?")) return;
    setBaseRateItems((prev) => prev.map((r) => ({ ...r, rate: "" })));
  }, []);

  // ── Rate table helpers ───────────────────────────────────────────────────
  const updateRateCell = useCallback((rowIdx, key, value) => {
    setRateTable((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r;
        if (key.startsWith("extra_")) {
          return { ...r, _extra: { ...r._extra, [key]: value } };
        }
        return { ...r, [key]: value };
      }),
    );
  }, []);

  const addRateRows = useCallback(
    (n = 1) => {
      setRateTable((prev) => [
        ...prev,
        ...Array.from({ length: n }, emptyRateRow),
      ]);
    },
    [emptyRateRow],
  );

  const removeRateRow = useCallback((idx) => {
    setRateTable((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const clearRateTable = useCallback(() => {
    if (!window.confirm("Clear all rows and reset to default data?")) return;
    setRateTable(DEFAULT_RATE_TABLE.map((r) => ({ ...r, _extra: {} })));
    setRateTableExtraCols([]);
  }, []);

  // ── Add / remove dynamic column ──────────────────────────────────────────
  const confirmAddCol = useCallback(() => {
    const label = newColLabel.trim();
    if (!label) return;
    const key = `extra_${Date.now()}`;
    if (addColTarget === "schedule") {
      setScheduleExtraCols((prev) => [...prev, { key, label }]);
    } else if (addColTarget === "rate") {
      setRateTableExtraCols((prev) => [...prev, { key, label }]);
    }
    setNewColLabel("");
    setAddColTarget(null);
  }, [newColLabel, addColTarget]);

  const removeScheduleCol = useCallback((key) => {
    setScheduleExtraCols((prev) => prev.filter((c) => c.key !== key));
  }, []);

  const removeRateCol = useCallback((key) => {
    setRateTableExtraCols((prev) => prev.filter((c) => c.key !== key));
  }, []);

  // ── Direct-cell paste ────────────────────────────────────────────────────
  const handleSchedulePaste = useCallback(
    (e, startRow, startColIdx) => {
      e.preventDefault();
      const parsed = parseClipboard(e.clipboardData.getData("text"));
      if (!parsed.length) return;
      const allKeys = [
        ...SCH_FIXED_KEYS,
        ...scheduleExtraCols.map((c) => c.key),
      ];
      setScheduleRows((prev) => {
        const next = prev.map((r) => ({ ...r }));
        while (next.length < startRow + parsed.length)
          next.push(emptyScheduleRow());
        parsed.forEach((cells, ri) => {
          cells.forEach((val, ci) => {
            const key = allKeys[startColIdx + ci];
            if (!key) return;
            const v = (val ?? "").trim();
            const row = next[startRow + ri];
            if (key === "staff") row.staff = parseInt(v) || 0;
            else if (key === "hoursPerDay")
              row.hoursPerDay = parseFloat(v) || 0;
            else if (key === "shared")
              row.shared = ["true", "yes", "1", "x"].includes(v.toLowerCase());
            else if (key === "timeOfDay")
              row.timeOfDay = TIME_OF_DAY_OPTIONS.includes(v) ? v : "Day";
            else if (key === "serviceType")
              row.serviceType = SERVICE_TYPES.includes(v) ? v : "1:1";
            else if (key.startsWith("extra_"))
              row._extra = { ...row._extra, [key]: v };
            else row[key] = v;
          });
        });
        return next;
      });
    },
    [scheduleExtraCols, emptyScheduleRow],
  );

  const handleRatePaste = useCallback(
    (e, startRow, startColIdx) => {
      e.preventDefault();
      const parsed = parseClipboard(e.clipboardData.getData("text"));
      if (!parsed.length) return;
      const allKeys = [
        ...RT_FIXED_KEYS,
        ...rateTableExtraCols.map((c) => c.key),
      ];
      setRateTable((prev) => {
        const next = prev.map((r) => ({ ...r }));
        while (next.length < startRow + parsed.length)
          next.push(emptyRateRow());
        parsed.forEach((cells, ri) => {
          cells.forEach((val, ci) => {
            const key = allKeys[startColIdx + ci];
            if (!key) return;
            const v = (val ?? "").trim();
            const row = next[startRow + ri];
            if (
              [
                "dailyHours",
                "weekdayRate",
                "saturdayRate",
                "sundayRate",
                "phRate",
              ].includes(key)
            )
              row[key] = parseFloat(v) || 0;
            else if (key.startsWith("extra_"))
              row._extra = { ...row._extra, [key]: v };
            else row[key] = v;
          });
        });
        return next;
      });
    },
    [rateTableExtraCols, emptyRateRow],
  );

  const handleBaseRatePaste = useCallback(
    (e, startRow, startColIdx) => {
      e.preventDefault();
      const parsed = parseClipboard(e.clipboardData.getData("text"));
      if (!parsed.length) return;

      setBaseRateItems((prev) => {
        const next = prev.map((r) => ({ ...r }));
        while (next.length < startRow + parsed.length) {
          next.push(emptyBaseRateItem());
        }

        parsed.forEach((cells, ri) => {
          cells.forEach((val, ci) => {
            const key = BPH_FIXED_KEYS[startColIdx + ci];
            if (!key) return;
            const raw = (val ?? "").trim();
            next[startRow + ri][key] =
              key === "rate" ? parseFloat(raw) || 0 : raw;
          });
        });

        return next;
      });
    },
    [emptyBaseRateItem],
  );

  // ── Keyboard navigation ──────────────────────────────────────────────────
  const handleCellKeyDown = useCallback(
    (e, prefix, rowIdx, colIdx, totalCols, totalRows, addMore) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (rowIdx < totalRows - 1)
          document.getElementById(`${prefix}-${rowIdx + 1}-${colIdx}`)?.focus();
        else {
          addMore(10);
          setTimeout(
            () =>
              document
                .getElementById(`${prefix}-${rowIdx + 1}-${colIdx}`)
                ?.focus(),
            30,
          );
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (rowIdx > 0)
          document.getElementById(`${prefix}-${rowIdx - 1}-${colIdx}`)?.focus();
      } else if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        if (colIdx < totalCols - 1)
          document.getElementById(`${prefix}-${rowIdx}-${colIdx + 1}`)?.focus();
        else if (rowIdx < totalRows - 1)
          document.getElementById(`${prefix}-${rowIdx + 1}-0`)?.focus();
      } else if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        if (colIdx > 0)
          document.getElementById(`${prefix}-${rowIdx}-${colIdx - 1}`)?.focus();
        else if (rowIdx > 0)
          document
            .getElementById(`${prefix}-${rowIdx - 1}-${totalCols - 1}`)
            ?.focus();
      }
    },
    [],
  );

  // ─── Computed: summary hours ─────────────────────────────────────
  const summaryHours = useMemo(() => {
    const byType = {};
    SERVICE_TYPES.forEach((st) => {
      byType[st] = { day: 0, evening: 0, overnight: 0 };
    });
    let totalDay = 0;

    scheduleRows.forEach((r) => {
      const h = parseFloat(r.hoursPerDay) || 0;
      totalDay += h;
      if (byType[r.serviceType]) {
        if (r.timeOfDay === "Day") byType[r.serviceType].day += h;
        else if (r.timeOfDay === "Evening") byType[r.serviceType].evening += h;
        else byType[r.serviceType].overnight += h;
      }
    });

    return { byType, totalDay };
  }, [scheduleRows]);

  // ─── Computed: Service Quote data ────────────────────────────────
  const quoteData = useMemo(() => {
    const findBaseRate = (keyword) => {
      const row = baseRateItems.find((item) =>
        (item.supportItemName || "").toLowerCase().includes(keyword),
      );
      return parseFloat(row?.rate) || 0;
    };

    const weekdayDayRate = findBaseRate("weekday daytime");
    const weekdayEveningRate = findBaseRate("weekday evening");
    const saturdayRate = findBaseRate("saturday");
    const sundayRate = findBaseRate("sunday");
    const sleepoverRate = findBaseRate("night-time sleepover");

    const getPricePerHour = (timeOfDay, day) => {
      if (timeOfDay === "Overnight") return sleepoverRate;
      if (day === "Saturday") return saturdayRate;
      if (day === "Sunday") return sundayRate;
      if (timeOfDay === "Evening") return weekdayEveningRate || weekdayDayRate;
      return weekdayDayRate;
    };

    // Group schedule rows by serviceType + time bucket (day/evening)
    const grouped = {};
    SERVICE_TYPES.forEach((st) => {
      grouped[st] = {
        day: { rows: [], totalHrsWeek: 0, totalCost: 0 },
        evening: { rows: [], totalHrsWeek: 0, totalCost: 0 },
      };
    });

    scheduleRows.forEach((sr) => {
      const st = sr.serviceType;
      if (!grouped[st]) return;
      if (sr.timeOfDay === "Overnight") return;

      const hours = parseFloat(sr.hoursPerDay) || 0;
      const ratioMultiplier = 1 / getRatio(st);
      if (!hours) return;
      const period = sr.timeOfDay === "Evening" ? "evening" : "day";

      const dayData = DAYS.map((day) => {
        const pricePerHour = getPricePerHour(sr.timeOfDay, day);

        const ratioPrice = pricePerHour * ratioMultiplier;
        const cost = pricePerHour * ratioMultiplier * hours;

        return {
          day,
          pricePerHour,
          pricePerHourRatio: ratioPrice,
          hours,
          cost,
        };
      });

      const weekTotal = dayData.reduce((sum, d) => sum + d.cost, 0);
      grouped[st][period].rows.push({
        ...sr,
        dayData,
        weekTotal,
      });
      grouped[st][period].totalHrsWeek += hours * 7;
      grouped[st][period].totalCost += weekTotal;
    });

    const sleepoverRatio = getRatio("Group (2:45)");
    const sleepoverConvertedRate = parseFloat(
      (sleepoverRate / sleepoverRatio).toFixed(2),
    );

    const sleepover = {
      pricePerNight: sleepoverRate,
      rate: sleepoverConvertedRate,
      nightsPerWeek: 7,
      costPerNight: sleepoverConvertedRate,
      weekTotal: sleepoverConvertedRate * 7,
    };

    // Public holiday / Irregular
    const phTotal = publicHolidayRate * publicHolidayHours;
    const irrTotal = irregularRate * irregularHours;

    // Grand totals
    let totalWeekly = 0;
    let totalWeeklyHours = 0;
    Object.values(grouped).forEach((g) => {
      totalWeekly += (g.day?.totalCost || 0) + (g.evening?.totalCost || 0);
      totalWeeklyHours +=
        (g.day?.totalHrsWeek || 0) + (g.evening?.totalHrsWeek || 0);
    });

    const estimatedWeekly = totalWeekly;
    const estimatedSleepoverWeekly = sleepover.weekTotal;
    const estimatedFortnightly =
      (estimatedWeekly + estimatedSleepoverWeekly) * 2;
    const estimatedAnnual = (estimatedWeekly + estimatedSleepoverWeekly) * 52;
    const estimatedIrregularAnnual = phTotal + irrTotal;

    const weeklyHrsNights = totalWeeklyHours;
    const sleepoverHrsNights = sleepover.nightsPerWeek;
    const fortnightlyHrsNights = (weeklyHrsNights + sleepoverHrsNights) * 2;
    const annualHrsNights = (weeklyHrsNights + sleepoverHrsNights) * 52;
    const irregularHrsNights = publicHolidayHours + irregularHours;
    const totalHrsNights = annualHrsNights + irregularHrsNights;

    return {
      grouped,
      sleepover,
      phTotal,
      irrTotal,
      estimatedWeekly,
      estimatedSleepoverWeekly,
      estimatedFortnightly,
      estimatedAnnual,
      estimatedIrregularAnnual,
      weeklyHrsNights,
      sleepoverHrsNights,
      fortnightlyHrsNights,
      annualHrsNights,
      irregularHrsNights,
      totalHrsNights,
      grandTotal: estimatedAnnual + estimatedIrregularAnnual,
    };
  }, [
    scheduleRows,
    baseRateItems,
    publicHolidayRate,
    publicHolidayHours,
    irregularRate,
    irregularHours,
  ]);

  // ─── Computed: Invoice rows (Mon-Sun) ───────────────────────────────
  const invoiceData = useMemo(() => {
    const findBaseItem = (keyword) =>
      baseRateItems.find((item) =>
        (item.supportItemName || "").toLowerCase().includes(keyword),
      );

    const weekdayDayItem = findBaseItem("weekday daytime");
    const weekdayEveningItem = findBaseItem("weekday evening");
    const saturdayItem = findBaseItem("saturday");
    const sundayItem = findBaseItem("sunday");
    const sleepoverItem = findBaseItem("night-time sleepover");

    const getItemByDay = (timeOfDay, dayName) => {
      if (timeOfDay === "Overnight") return sleepoverItem;
      if (dayName === "Saturday") return saturdayItem;
      if (dayName === "Sunday") return sundayItem;
      if (timeOfDay === "Evening") return weekdayEveningItem || weekdayDayItem;
      return weekdayDayItem;
    };

    const getSortRank = (row) => {
      if (row.timeOfDay === "Overnight") return 5;
      const orderMap = {
        "1:1": 0,
        "Group (1:45)": 1,
        "Group (2:45)": 2,
        "Group (3:45)": 3,
        "Group (4:45)": 4,
      };
      return orderMap[row.serviceType] ?? 4;
    };

    const weekDates = getMondayToSunday();
    const rows = [];

    weekDates.forEach((date, dayIdx) => {
      const dayName = DAYS[dayIdx];
      const dayRows = [];

      scheduleRows.forEach((row) => {
        const isOvernight = row.timeOfDay === "Overnight";
        const units = isOvernight
          ? parseFloat(row.hoursPerDay) || 1
          : parseFloat(row.hoursPerDay) || 0;

        if (units <= 0) return;

        const baseItem = getItemByDay(row.timeOfDay, dayName);
        const baseRate = parseFloat(baseItem?.rate) || 0;
        const ratio = getRatio(row.serviceType || "1:1");
        const unitPrice = ratio ? baseRate / ratio : 0;
        const amount = units * unitPrice;

        dayRows.push({
          sortRank: getSortRank(row),
          date,
          dateLabel: fmtDate(date),
          units,
          itemCode: baseItem?.supportItemNumber || "",
          description:
            `${baseItem?.supportItemName || row.description || ""} (${row.serviceType || "1:1"})`.trim(),
          unitPrice,
          taxCode: "FRE",
          amount,
        });
      });

      dayRows
        .sort(
          (a, b) =>
            a.sortRank - b.sortRank ||
            (a.description || "").localeCompare(b.description || ""),
        )
        .forEach(({ sortRank, ...item }) => rows.push(item));
    });

    return {
      weekDates,
      rows,
      totalAmount: rows.reduce((sum, r) => sum + r.amount, 0),
    };
  }, [scheduleRows, baseRateItems]);

  // ─── Computed: column arrays ───────────────────────────────────────
  const schAllCols = useMemo(
    () => [
      ...SCH_COL_DEFS,
      ...scheduleExtraCols.map((c) => ({
        key: c.key,
        label: c.label,
        type: "text",
        width: "120px",
        align: "left",
      })),
    ],
    [scheduleExtraCols],
  );

  const rtAllCols = useMemo(
    () => [
      ...RT_COL_DEFS,
      ...rateTableExtraCols.map((c) => ({
        key: c.key,
        label: c.label,
        type: "text",
        width: "120px",
        align: "left",
      })),
    ],
    [rateTableExtraCols],
  );

  // ─── Export Excel ─────────────────────────────────────────────────────
  const handleExportExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    const summaryRows = [
      {
        Metric: "Client",
        Unit: "",
        Value: clientName || "-",
      },
      {
        Metric: "Plan Number",
        Unit: "",
        Value: planNumber || "-",
      },
      {
        Metric: "Plan Period",
        Unit: "",
        Value: planPeriod || "TBA",
      },
      {
        Metric: "Estimated weekly services amount (Day & Evening)",
        Unit: "$/week",
        "Hrs/Nights": Number((quoteData.weeklyHrsNights || 0).toFixed(2)),
        Amount: Number((quoteData.estimatedWeekly || 0).toFixed(2)),
      },
      {
        Metric: "Estimated weekly inactive sleepover",
        Unit: "$/week",
        "Hrs/Nights": Number((quoteData.sleepoverHrsNights || 0).toFixed(2)),
        Amount: Number((quoteData.estimatedSleepoverWeekly || 0).toFixed(2)),
      },
      {
        Metric: "Estimated fortnightly amount",
        Unit: "$/fortnight",
        "Hrs/Nights": Number((quoteData.fortnightlyHrsNights || 0).toFixed(2)),
        Amount: Number((quoteData.estimatedFortnightly || 0).toFixed(2)),
      },
      {
        Metric: "Estimated annual amount",
        Unit: "$/year",
        "Hrs/Nights": Number((quoteData.annualHrsNights || 0).toFixed(2)),
        Amount: Number((quoteData.estimatedAnnual || 0).toFixed(2)),
      },
      {
        Metric: "Estimated annual irregular supports amount",
        Unit: "$/year",
        "Hrs/Nights": Number((quoteData.irregularHrsNights || 0).toFixed(2)),
        Amount: Number((quoteData.estimatedIrregularAnnual || 0).toFixed(2)),
      },
      {
        Metric: "Grand Total",
        Unit: "",
        "Hrs/Nights": Number((quoteData.totalHrsNights || 0).toFixed(2)),
        Amount: Number((quoteData.grandTotal || 0).toFixed(2)),
      },
      {
        Metric: "Public holiday rate",
        Unit: "$/hr",
        Value: Number((publicHolidayRate || 0).toFixed(2)),
      },
      {
        Metric: "Public holiday hours/year",
        Unit: "hrs/year",
        Value: Number((publicHolidayHours || 0).toFixed(2)),
      },
      {
        Metric: "Irregular supports rate",
        Unit: "$/hr",
        Value: Number((irregularRate || 0).toFixed(2)),
      },
      {
        Metric: "Irregular supports hours/year",
        Unit: "hrs/year",
        Value: Number((irregularHours || 0).toFixed(2)),
      },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Quote Summary");

    const breakdownRows = [];
    SERVICE_TYPES.forEach((st) => {
      ["day", "evening"].forEach((period) => {
        const group = quoteData.grouped?.[st]?.[period];
        if (!group?.rows?.length) return;

        DAYS.forEach((day, dayIdx) => {
          let totalHrs = 0;
          let totalCost = 0;
          let pricePerHour = 0;
          let pricePerHourRatio = 0;

          group.rows.forEach((row) => {
            const dd = row.dayData?.[dayIdx];
            if (!dd) return;
            totalHrs += dd.hours || 0;
            totalCost += dd.cost || 0;
            pricePerHour = dd.pricePerHour || 0;
            pricePerHourRatio = dd.pricePerHourRatio || 0;
          });

          breakdownRows.push({
            Regis: "107",
            "Service Type": st,
            Period: period === "evening" ? "Evening" : "Day",
            Day: day,
            "Price/Hour": Number(pricePerHour.toFixed(2)),
            "Price/Hour/Ratio": Number(pricePerHourRatio.toFixed(2)),
            "Hours/Day": Number(totalHrs.toFixed(2)),
            Cost: Number(totalCost.toFixed(2)),
          });
        });

        breakdownRows.push({
          Regis: "107",
          "Service Type": st,
          Period: period === "evening" ? "Evening" : "Day",
          Day: "Subtotal",
          "Price/Hour": "",
          "Price/Hour/Ratio": "",
          "Hours/Day": Number((group.totalHrsWeek || 0).toFixed(2)),
          Cost: Number((group.totalCost || 0).toFixed(2)),
        });
      });
    });

    breakdownRows.push({
      Regis: "107",
      "Service Type": "Group (2:45)",
      Period: "Overnight",
      Day: "Sleepover weekly",
      "Price/Hour": Number(
        (quoteData.sleepover?.pricePerNight || 0).toFixed(2),
      ),
      "Price/Hour/Ratio": Number((quoteData.sleepover?.rate || 0).toFixed(2)),
      "Hours/Day": Number((quoteData.sleepover?.nightsPerWeek || 0).toFixed(2)),
      Cost: Number((quoteData.sleepover?.weekTotal || 0).toFixed(2)),
    });

    breakdownRows.push({
      Regis: "",
      "Service Type": "Public holiday",
      Period: "Irregular",
      Day: "Yearly",
      "Price/Hour": Number((publicHolidayRate || 0).toFixed(2)),
      "Price/Hour/Ratio": "",
      "Hours/Day": Number((publicHolidayHours || 0).toFixed(2)),
      Cost: Number((quoteData.phTotal || 0).toFixed(2)),
    });

    breakdownRows.push({
      Regis: "",
      "Service Type": "Irregular supports",
      Period: "Irregular",
      Day: "Yearly",
      "Price/Hour": Number((irregularRate || 0).toFixed(2)),
      "Price/Hour/Ratio": "",
      "Hours/Day": Number((irregularHours || 0).toFixed(2)),
      Cost: Number((quoteData.irrTotal || 0).toFixed(2)),
    });

    const wsBreakdown = XLSX.utils.json_to_sheet(breakdownRows);
    XLSX.utils.book_append_sheet(wb, wsBreakdown, "Quote Breakdown");

    const scheduleExport = scheduleRows.map((row) => {
      const out = {};
      schAllCols.forEach((col) => {
        out[col.label] = col.key.startsWith("extra_")
          ? (row._extra?.[col.key] ?? "")
          : (row[col.key] ?? "");
      });
      return out;
    });
    const wsSchedule = XLSX.utils.json_to_sheet(scheduleExport);
    XLSX.utils.book_append_sheet(wb, wsSchedule, "Daily Schedule");

    const baseRateExport = baseRateItems.map((item) => ({
      "Support Item Number": item.supportItemNumber || "",
      "Support Item Name": item.supportItemName || "",
      "Registration Group Number": item.regGroupNumber || "",
      "Price per hours": Number((parseFloat(item.rate) || 0).toFixed(2)),
    }));
    const wsBaseRate = XLSX.utils.json_to_sheet(baseRateExport);
    XLSX.utils.book_append_sheet(wb, wsBaseRate, "Price per hours");

    const rateTableExport = rateTable.map((row) => {
      const out = {};
      rtAllCols.forEach((col) => {
        out[col.label] = col.key.startsWith("extra_")
          ? (row._extra?.[col.key] ?? "")
          : (row[col.key] ?? "");
        if (col.codeKey) {
          out[`${col.label} Code`] = row[col.codeKey] ?? "";
        }
      });
      return out;
    });
    const wsRateTable = XLSX.utils.json_to_sheet(rateTableExport);
    XLSX.utils.book_append_sheet(wb, wsRateTable, "Price Rates");

    const datePart = new Date().toISOString().slice(0, 10);
    const safeClient = (clientName || "client").replace(/[^a-z0-9_-]/gi, "_");
    XLSX.writeFile(wb, `Service_Quote_${safeClient}_${datePart}.xlsx`);
  }, [
    clientName,
    planNumber,
    planPeriod,
    quoteData,
    publicHolidayRate,
    publicHolidayHours,
    irregularRate,
    irregularHours,
    scheduleRows,
    schAllCols,
    baseRateItems,
    rateTable,
    rtAllCols,
  ]);

  // ─── Print ───────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExportInvoicePdf = useCallback(() => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Service Invoice (Monday - Sunday)", 40, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const periodText = invoiceData.weekDates.length
      ? `${fmtDate(invoiceData.weekDates[0])} - ${fmtDate(invoiceData.weekDates[6])}`
      : "-";
    doc.text(`Client: ${clientName || "-"}`, 40, 60);
    doc.text(`Plan: ${planNumber || "-"}`, 40, 74);
    doc.text(`Period: ${periodText}`, 40, 88);

    const body = invoiceData.rows.map((row) => [
      row.dateLabel,
      Number(row.units.toFixed(2)).toString(),
      row.itemCode,
      row.description,
      fmt(row.unitPrice),
      row.taxCode,
      `$${fmt(row.amount)}`,
    ]);

    autoTable(doc, {
      startY: 102,
      head: [
        [
          "DATE",
          "HRS/KM",
          "ITEM CODE",
          "DESCRIPTIONS",
          "UNIT PRICE",
          "TAX CODE",
          "AMOUNT",
        ],
      ],
      body,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineColor: [160, 160, 160],
        lineWidth: 0.4,
      },
      headStyles: {
        fillColor: [212, 212, 212],
        textColor: [31, 41, 55],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 45, halign: "right" },
        2: { cellWidth: 70 },
        3: { cellWidth: 190 },
        4: { cellWidth: 55, halign: "right" },
        5: { cellWidth: 45, halign: "center" },
        6: { cellWidth: 60, halign: "right" },
      },
      margin: { left: 40, right: 40 },
    });

    const y = (doc.lastAutoTable?.finalY || 120) + 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Balance Due: $${fmt(invoiceData.totalAmount)}`, 555, y, {
      align: "right",
    });

    const datePart = new Date().toISOString().slice(0, 10);
    const safeClient = (clientName || "client").replace(/[^a-z0-9_-]/gi, "_");
    doc.save(`Service_Invoice_${safeClient}_${datePart}.pdf`);
  }, [invoiceData, clientName, planNumber]);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <Layout
      title="Service Quote"
      breadcrumb={["Home", "Customer", "Service Quote"]}
    >
      <div className="sq-container">
        {/* Client info */}
        <div className="sq-client-bar">
          <div className="sq-field">
            <label>Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name"
            />
          </div>
          <div className="sq-field">
            <label>Plan Number</label>
            <input
              type="text"
              value={planNumber}
              onChange={(e) => setPlanNumber(e.target.value)}
              placeholder="Plan number"
            />
          </div>
          <div className="sq-field">
            <label>Plan Period</label>
            <input
              type="text"
              value={planPeriod}
              onChange={(e) => setPlanPeriod(e.target.value)}
              placeholder="TBA"
            />
          </div>
        </div>

        {/* Tab navigation */}
        <div className="sq-tabs">
          <button
            className={`sq-tab ${activeTab === "schedule" ? "active" : ""}`}
            onClick={() => setActiveTab("schedule")}
          >
            <i className="fas fa-calendar-alt"></i> Daily Service Schedule
          </button>
          <button
            className={`sq-tab ${activeTab === "baseRates" ? "active" : ""}`}
            onClick={() => setActiveTab("baseRates")}
          >
            <i className="fas fa-table"></i> Price per hours
          </button>
          <button
            className={`sq-tab ${activeTab === "quote" ? "active" : ""}`}
            onClick={() => setActiveTab("quote")}
          >
            <i className="fas fa-file-invoice-dollar"></i> Service Quote
          </button>
          <button
            className={`sq-tab ${activeTab === "rates" ? "active" : ""}`}
            onClick={() => setActiveTab("rates")}
          >
            <i className="fas fa-dollar-sign"></i> Price / Rates
          </button>
          <button
            className={`sq-tab ${activeTab === "invoice" ? "active" : ""}`}
            onClick={() => setActiveTab("invoice")}
          >
            <i className="fas fa-file-invoice"></i> Invoice
          </button>
        </div>

        {/* ═══ TAB 1: Daily Service Schedule ═══ */}
        {activeTab === "schedule" && (
          <div className="sq-panel">
            {/* Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ margin: 0, flex: 1 }}>Daily Service Schedule</h3>
              <button
                type="button"
                className="btn-action btn-save"
                title="Add 10 rows"
                onClick={() => addScheduleRows(10)}
              >
                <i className="fas fa-plus"></i>
              </button>
              <button
                type="button"
                className="btn-action"
                title="Add column"
                onClick={() => setAddColTarget("schedule")}
                style={{ background: "#2c3e7a", color: "#fff" }}
              >
                <i className="fas fa-columns"></i>
              </button>
              <button
                type="button"
                className="btn-action btn-delete"
                title="Clear all"
                onClick={clearSchedule}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
              Tip: Copy cells from Excel and paste directly into any cell. Arrow
              keys and Tab navigate between cells.
            </p>

            {/* Schedule table */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ ...TH_STYLE, width: "36px" }}>#</th>
                    {schAllCols.map((col) => (
                      <th
                        key={col.key}
                        style={{ ...TH_STYLE, minWidth: col.width }}
                      >
                        {col.label}
                        {col.key.startsWith("extra_") && (
                          <span
                            onClick={() => removeScheduleCol(col.key)}
                            style={{
                              cursor: "pointer",
                              marginLeft: 6,
                              opacity: 0.7,
                              fontWeight: 400,
                            }}
                            title="Remove column"
                          >
                            {" \u00d7"}
                          </span>
                        )}
                      </th>
                    ))}
                    <th style={{ ...TH_STYLE, width: "36px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleRows.map((row, rowIdx) => (
                    <tr
                      key={row.id}
                      style={{
                        background: rowIdx % 2 === 0 ? "#fff" : "#f7f9ff",
                      }}
                    >
                      <td
                        style={{
                          ...TD_STYLE,
                          textAlign: "center",
                          color: "#aaa",
                          fontSize: "11px",
                          padding: "1px 2px",
                          userSelect: "none",
                        }}
                      >
                        {String.fromCharCode(97 + (rowIdx % 26))}
                        {rowIdx >= 26 ? Math.floor(rowIdx / 26) : ""}.
                      </td>
                      {schAllCols.map((col, colIdx) => {
                        const val = col.key.startsWith("extra_")
                          ? (row._extra?.[col.key] ?? "")
                          : row[col.key];

                        if (col.type === "select") {
                          return (
                            <td key={col.key} style={TD_STYLE}>
                              <select
                                value={val}
                                onChange={(e) =>
                                  updateScheduleCell(
                                    rowIdx,
                                    col.key,
                                    e.target.value,
                                  )
                                }
                                style={{
                                  width: "100%",
                                  border: "none",
                                  outline: "none",
                                  background: "transparent",
                                  padding: "3px 4px",
                                  fontSize: "13px",
                                }}
                              >
                                {col.options.map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                            </td>
                          );
                        }

                        if (col.type === "checkbox") {
                          return (
                            <td
                              key={col.key}
                              style={{ ...TD_STYLE, textAlign: "center" }}
                            >
                              <input
                                type="checkbox"
                                checked={!!val}
                                onChange={(e) =>
                                  updateScheduleCell(
                                    rowIdx,
                                    col.key,
                                    e.target.checked,
                                  )
                                }
                              />
                            </td>
                          );
                        }

                        return (
                          <td key={col.key} style={TD_STYLE}>
                            <textarea
                              id={`sch-${rowIdx}-${colIdx}`}
                              value={val ?? ""}
                              rows={1}
                              onChange={(e) => {
                                updateScheduleCell(
                                  rowIdx,
                                  col.key,
                                  e.target.value,
                                );
                                autoResize(e.target);
                              }}
                              onBlur={(e) => {
                                if (col.type === "number") {
                                  updateScheduleCell(
                                    rowIdx,
                                    col.key,
                                    parseFloat(e.target.value) || 0,
                                  );
                                }
                              }}
                              onPaste={(e) =>
                                handleSchedulePaste(e, rowIdx, colIdx)
                              }
                              onKeyDown={(e) =>
                                handleCellKeyDown(
                                  e,
                                  "sch",
                                  rowIdx,
                                  colIdx,
                                  schAllCols.length,
                                  scheduleRows.length,
                                  addScheduleRows,
                                )
                              }
                              style={{
                                ...CELL_STYLE,
                                textAlign: col.align || "left",
                              }}
                            />
                          </td>
                        );
                      })}
                      <td style={TD_STYLE}>
                        <button
                          type="button"
                          onClick={() => removeScheduleRow(rowIdx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#e74c3c",
                            cursor: "pointer",
                            fontSize: "13px",
                            padding: "2px 6px",
                          }}
                          title="Remove row"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary hours */}
            <div className="sq-summary-box">
              <h4>Summary Hours</h4>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr>
                    <th style={TH_STYLE}></th>
                    <th style={TH_STYLE}>Total</th>
                    {SERVICE_TYPES.map((st) => (
                      <th key={st} style={TH_STYLE}>
                        {st}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "Estimated avg daily hours (day)",
                      key: "day",
                    },
                    {
                      label: "Estimated avg daily hours (evening)",
                      key: "evening",
                    },
                    {
                      label: "Estimated avg daily hours (overnight)",
                      key: "overnight",
                    },
                  ].map((item) => (
                    <tr key={item.key} style={{ background: "#fff" }}>
                      <td
                        style={{
                          ...TD_STYLE,
                          fontWeight: 600,
                          minWidth: 260,
                        }}
                      >
                        {item.label}
                      </td>
                      <td style={TD_STYLE}>
                        {fmt(
                          SERVICE_TYPES.reduce(
                            (s, st) =>
                              s + (summaryHours.byType[st]?.[item.key] || 0),
                            0,
                          ),
                        )}
                      </td>
                      {SERVICE_TYPES.map((st) => (
                        <td key={st} style={TD_STYLE}>
                          {fmt(summaryHours.byType[st]?.[item.key] || 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr
                    style={{
                      background: "#e8ecf7",
                      fontWeight: 700,
                    }}
                  >
                    <td style={{ ...TD_STYLE, fontWeight: 700 }}>
                      Estimated avg daily hours
                    </td>
                    <td style={TD_STYLE}>{fmt(summaryHours.totalDay)}</td>
                    {SERVICE_TYPES.map((st) => {
                      const t = summaryHours.byType[st];
                      return (
                        <td key={st} style={TD_STYLE}>
                          {fmt(
                            (t?.day || 0) +
                              (t?.evening || 0) +
                              (t?.overnight || 0),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr
                    style={{
                      background: "#e8ecf7",
                      fontWeight: 700,
                    }}
                  >
                    <td style={{ ...TD_STYLE, fontWeight: 700 }}>
                      Estimated avg weekly hours
                    </td>
                    <td style={TD_STYLE}>{fmt(summaryHours.totalDay * 7)}</td>
                    {SERVICE_TYPES.map((st) => {
                      const t = summaryHours.byType[st];
                      const daily =
                        (t?.day || 0) + (t?.evening || 0) + (t?.overnight || 0);
                      return (
                        <td key={st} style={TD_STYLE}>
                          {fmt(daily * 7)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr
                    style={{
                      background: "#e8ecf7",
                      fontWeight: 700,
                    }}
                  >
                    <td style={{ ...TD_STYLE, fontWeight: 700 }}>
                      Estimated avg yearly hours
                    </td>
                    <td style={TD_STYLE}>
                      {fmt(summaryHours.totalDay * 7 * 52)}
                    </td>
                    {SERVICE_TYPES.map((st) => {
                      const t = summaryHours.byType[st];
                      const daily =
                        (t?.day || 0) + (t?.evening || 0) + (t?.overnight || 0);
                      return (
                        <td key={st} style={TD_STYLE}>
                          {fmt(daily * 7 * 52)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: Price per hours ═══ */}
        {activeTab === "baseRates" && (
          <div className="sq-panel">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ margin: 0, flex: 1 }}>Price per hours</h3>
              <button
                type="button"
                className="btn-action btn-save"
                title="Add 10 rows"
                onClick={() => addBaseRateRows(10)}
              >
                <i className="fas fa-plus"></i>
              </button>
              <button
                type="button"
                className="btn-action btn-delete"
                title="Clear all"
                onClick={clearBaseRate}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
              Tip: Copy cells from Excel and paste directly into any cell. Arrow
              keys and Tab navigate between cells.
            </p>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ ...TH_STYLE, width: "36px" }}>#</th>
                    {BPH_COL_DEFS.map((col) => (
                      <th
                        key={col.key}
                        style={{ ...TH_STYLE, minWidth: col.width }}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th style={{ ...TH_STYLE, width: "36px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {baseRateItems.map((row, rowIdx) => (
                    <tr
                      key={row.id}
                      style={{
                        background: rowIdx % 2 === 0 ? "#fff" : "#f7f9ff",
                      }}
                    >
                      <td
                        style={{
                          ...TD_STYLE,
                          textAlign: "center",
                          color: "#aaa",
                          fontSize: "11px",
                          padding: "1px 2px",
                          userSelect: "none",
                        }}
                      >
                        {rowIdx + 1}
                      </td>

                      {BPH_COL_DEFS.map((col, colIdx) => (
                        <td key={col.key} style={TD_STYLE}>
                          <textarea
                            id={`bph-${rowIdx}-${colIdx}`}
                            value={row[col.key] ?? ""}
                            rows={1}
                            onChange={(e) => {
                              updateBaseRateCell(
                                rowIdx,
                                col.key,
                                e.target.value,
                              );
                              autoResize(e.target);
                            }}
                            onBlur={(e) => {
                              if (col.type === "number") {
                                updateBaseRateCell(
                                  rowIdx,
                                  col.key,
                                  parseFloat(e.target.value) || 0,
                                );
                              }
                            }}
                            onPaste={(e) =>
                              handleBaseRatePaste(e, rowIdx, colIdx)
                            }
                            onKeyDown={(e) =>
                              handleCellKeyDown(
                                e,
                                "bph",
                                rowIdx,
                                colIdx,
                                BPH_COL_DEFS.length,
                                baseRateItems.length,
                                addBaseRateRows,
                              )
                            }
                            style={{
                              ...CELL_STYLE,
                              textAlign: col.align || "left",
                            }}
                          />
                        </td>
                      ))}

                      <td style={TD_STYLE}>
                        <button
                          type="button"
                          onClick={() => removeBaseRateRow(rowIdx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#e74c3c",
                            cursor: "pointer",
                            fontSize: "13px",
                            padding: "2px 6px",
                          }}
                          title="Remove row"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: Price / Rates ═══ */}
        {activeTab === "rates" && (
          <div className="sq-panel">
            {/* Rate Table toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ margin: 0, flex: 1 }}>Rate Table (by Day Type)</h3>
              <button
                type="button"
                className="btn-action btn-save"
                title="Add 10 rows"
                onClick={() => addRateRows(10)}
              >
                <i className="fas fa-plus"></i>
              </button>
              <button
                type="button"
                className="btn-action"
                title="Add column"
                onClick={() => setAddColTarget("rate")}
                style={{ background: "#2c3e7a", color: "#fff" }}
              >
                <i className="fas fa-columns"></i>
              </button>
              <button
                type="button"
                className="btn-action btn-delete"
                title="Clear all"
                onClick={clearRateTable}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
              Tip: Copy cells from Excel and paste directly into any cell. Arrow
              keys and Tab navigate between cells.
            </p>

            {/* Rate table */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ ...TH_STYLE, width: "36px" }}>#</th>
                    {rtAllCols.map((col) => (
                      <th
                        key={col.key}
                        style={{ ...TH_STYLE, minWidth: col.width }}
                      >
                        {col.label}
                        {col.key.startsWith("extra_") && (
                          <span
                            onClick={() => removeRateCol(col.key)}
                            style={{
                              cursor: "pointer",
                              marginLeft: 6,
                              opacity: 0.7,
                              fontWeight: 400,
                            }}
                            title="Remove column"
                          >
                            {" \u00d7"}
                          </span>
                        )}
                      </th>
                    ))}
                    <th style={{ ...TH_STYLE, width: "36px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rateTable.map((row, rowIdx) => (
                    <tr
                      key={row.id}
                      style={{
                        background: rowIdx % 2 === 0 ? "#fff" : "#f7f9ff",
                      }}
                    >
                      <td
                        style={{
                          ...TD_STYLE,
                          textAlign: "center",
                          color: "#aaa",
                          fontSize: "11px",
                          padding: "1px 2px",
                          userSelect: "none",
                        }}
                      >
                        {rowIdx + 1}
                      </td>
                      {rtAllCols.map((col, colIdx) => {
                        const val = col.key.startsWith("extra_")
                          ? (row._extra?.[col.key] ?? "")
                          : row[col.key];

                        if (col.codeKey) {
                          return (
                            <td key={col.key} style={TD_STYLE}>
                              <textarea
                                id={`rt-${rowIdx}-${colIdx}`}
                                value={val ?? ""}
                                rows={1}
                                onChange={(e) => {
                                  updateRateCell(
                                    rowIdx,
                                    col.key,
                                    e.target.value,
                                  );
                                  autoResize(e.target);
                                }}
                                onBlur={(e) => {
                                  updateRateCell(
                                    rowIdx,
                                    col.key,
                                    parseFloat(e.target.value) || 0,
                                  );
                                }}
                                onPaste={(e) =>
                                  handleRatePaste(e, rowIdx, colIdx)
                                }
                                onKeyDown={(e) =>
                                  handleCellKeyDown(
                                    e,
                                    "rt",
                                    rowIdx,
                                    colIdx,
                                    rtAllCols.length,
                                    rateTable.length,
                                    addRateRows,
                                  )
                                }
                                style={{
                                  ...CELL_STYLE,
                                  textAlign: col.align || "right",
                                  fontWeight: 600,
                                  color: "#1f2937",
                                }}
                              />
                              <textarea
                                value={row[col.codeKey] ?? ""}
                                rows={2}
                                onChange={(e) => {
                                  updateRateCell(
                                    rowIdx,
                                    col.codeKey,
                                    e.target.value,
                                  );
                                  autoResize(e.target);
                                }}
                                style={{
                                  ...CELL_STYLE,
                                  marginTop: 2,
                                  minHeight: "34px",
                                  textAlign: "left",
                                }}
                              />
                            </td>
                          );
                        }

                        return (
                          <td key={col.key} style={TD_STYLE}>
                            <textarea
                              id={`rt-${rowIdx}-${colIdx}`}
                              value={val ?? ""}
                              rows={1}
                              onChange={(e) => {
                                updateRateCell(rowIdx, col.key, e.target.value);
                                autoResize(e.target);
                              }}
                              onBlur={(e) => {
                                if (col.type === "number") {
                                  updateRateCell(
                                    rowIdx,
                                    col.key,
                                    parseFloat(e.target.value) || 0,
                                  );
                                }
                              }}
                              onPaste={(e) =>
                                handleRatePaste(e, rowIdx, colIdx)
                              }
                              onKeyDown={(e) =>
                                handleCellKeyDown(
                                  e,
                                  "rt",
                                  rowIdx,
                                  colIdx,
                                  rtAllCols.length,
                                  rateTable.length,
                                  addRateRows,
                                )
                              }
                              style={{
                                ...CELL_STYLE,
                                textAlign: col.align || "left",
                              }}
                            />
                          </td>
                        );
                      })}
                      <td style={TD_STYLE}>
                        <button
                          type="button"
                          onClick={() => removeRateRow(rowIdx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#e74c3c",
                            cursor: "pointer",
                            fontSize: "13px",
                            padding: "2px 6px",
                          }}
                          title="Remove row"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Public Holidays & Irregular */}
            <h3 style={{ marginTop: 24 }}>
              Public Holidays &amp; Irregular Supports
            </h3>
            <div className="sq-ph-grid">
              <div className="sq-field">
                <label>Public Holiday Rate ($/hr)</label>
                <input
                  type="number"
                  step="0.01"
                  value={publicHolidayRate}
                  onChange={(e) =>
                    setPublicHolidayRate(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="sq-field">
                <label>Public Holiday Hours/Year</label>
                <input
                  type="number"
                  step="0.5"
                  value={publicHolidayHours}
                  onChange={(e) =>
                    setPublicHolidayHours(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="sq-field">
                <label>Irregular Rate ($/hr)</label>
                <input
                  type="number"
                  step="0.01"
                  value={irregularRate}
                  onChange={(e) =>
                    setIrregularRate(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="sq-field">
                <label>Irregular Hours/Year</label>
                <input
                  type="number"
                  step="0.5"
                  value={irregularHours}
                  onChange={(e) =>
                    setIrregularHours(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: Generated Quote ═══ */}
        {activeTab === "quote" && (
          <div className="sq-panel">
            <div className="sq-quote-actions">
              <button
                className="sq-btn sq-btn-export"
                onClick={handleExportExcel}
              >
                <i className="fas fa-file-excel"></i> Export Excel
              </button>
              <button className="sq-btn sq-btn-print" onClick={handlePrint}>
                <i className="fas fa-print"></i> Print / PDF
              </button>
            </div>

            <div className="sq-quote" ref={quoteRef} id="service-quote-print">
              {/* Header */}
              <div className="sq-quote-header">
                <div className="sq-quote-title">
                  NDIS Provider - Daily Assistance &amp; Social Activity
                </div>
                <div className="sq-quote-meta">
                  <span>
                    <strong>Plan Number:</strong> {planNumber || "—"}
                  </span>
                  <span>
                    <strong>Plan Period:</strong> {planPeriod || "TBA"}
                  </span>
                  <span>
                    <strong>Client:</strong> {clientName || "—"}
                  </span>
                </div>
              </div>

              {/* Quote sections by service type + day/evening */}
              {SERVICE_TYPES.flatMap((st) =>
                ["day", "evening"].map((period) => {
                  const group = quoteData.grouped[st]?.[period];
                  if (!group || group.rows.length === 0) return null;

                  return (
                    <div key={`${st}-${period}`} className="sq-quote-section">
                      <div className="sq-quote-section-header">
                        <span className="sq-section-regis">107</span>
                        <span>
                          Assistance With Self-Care Activities (
                          {period === "evening" ? "EVENING" : "DAY"})
                        </span>
                        <span className="sq-section-type">{st}</span>
                      </div>

                      <table className="sq-quote-table">
                        <thead>
                          <tr>
                            <th></th>
                            <th>Price/hour</th>
                            <th>Price/hour/ratio</th>
                            <th>Units</th>
                            <th>Category</th>
                            <th></th>
                            <th>$</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DAYS.map((day) => {
                            const dayIdx = DAYS.indexOf(day);
                            let totalHrs = 0;
                            let totalCost = 0;
                            let pricePerHour = 0;
                            let priceRatio = 0;

                            group.rows.forEach((r) => {
                              const dd = r.dayData[dayIdx];
                              totalHrs += dd.hours;
                              totalCost += dd.cost;
                              pricePerHour = dd.pricePerHour;
                              priceRatio = dd.pricePerHourRatio;
                            });

                            return (
                              <tr key={day}>
                                <td className="sq-day-cell">{day}</td>
                                <td className="sq-money">
                                  ${fmt(pricePerHour)}
                                </td>
                                <td className="sq-money">${fmt(priceRatio)}</td>
                                <td>hrs / Day</td>
                                <td className="sq-right">{fmt(totalHrs)}</td>
                                <td className="sq-money">$</td>
                                <td className="sq-money">{fmt(totalCost)}</td>
                              </tr>
                            );
                          })}
                          <tr className="sq-subtotal-row">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Hrs/ week</td>
                            <td className="sq-right">
                              {fmt(group.totalHrsWeek)}
                            </td>
                            <td className="sq-money">$</td>
                            <td className="sq-money">{fmt(group.totalCost)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                }),
              )}

              {/* Sleepover section */}
              {quoteData.sleepover.rate > 0 && (
                <div className="sq-quote-section">
                  <div className="sq-quote-section-header sq-sleepover-header">
                    <span className="sq-section-regis">107</span>
                    <span>
                      Assistance With Self-Care Activities (INACTIVE SLEEPOVER)
                    </span>
                    <span className="sq-section-type">Group (2:45)</span>
                  </div>

                  <table className="sq-quote-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Price/night</th>
                        <th>Rate</th>
                        <th>Units</th>
                        <th></th>
                        <th>$</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day) => (
                        <tr key={day}>
                          <td className="sq-day-cell">{day}</td>
                          <td className="sq-money">
                            ${fmt(quoteData.sleepover.pricePerNight || 0)}
                          </td>
                          <td className="sq-money">
                            ${fmt(quoteData.sleepover.rate || 0)}
                          </td>
                          <td>per night</td>
                          <td className="sq-right">1.00</td>
                          <td className="sq-money">$</td>
                          <td className="sq-money">
                            {fmt(quoteData.sleepover.rate || 0)}
                          </td>
                        </tr>
                      ))}
                      <tr className="sq-subtotal-row">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>Hrs/ week</td>
                        <td className="sq-right">7.00</td>
                        <td className="sq-money">$</td>
                        <td className="sq-money">
                          {fmt(quoteData.sleepover.weekTotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Public Holidays & Irregular */}
              <div className="sq-quote-section">
                <div className="sq-quote-section-header sq-ph-header">
                  <span>Public holidays and irregular supports:</span>
                </div>
                <table className="sq-quote-table">
                  <tbody>
                    <tr>
                      <td>Public holiday</td>
                      <td className="sq-money">${fmt(publicHolidayRate)}</td>
                      <td>Hrs / year</td>
                      <td className="sq-right">{fmt(publicHolidayHours)}</td>
                      <td className="sq-money">$</td>
                      <td className="sq-money">{fmt(quoteData.phTotal)}</td>
                    </tr>
                    <tr>
                      <td>Irregular supports</td>
                      <td className="sq-money">${fmt(irregularRate)}</td>
                      <td>Hrs / year</td>
                      <td className="sq-right">{fmt(irregularHours)}</td>
                      <td className="sq-money">$</td>
                      <td className="sq-money">{fmt(quoteData.irrTotal)}</td>
                    </tr>
                    <tr className="sq-subtotal-row">
                      <td></td>
                      <td></td>
                      <td>Hrs/ year</td>
                      <td className="sq-right">
                        {fmt(publicHolidayHours + irregularHours)}
                      </td>
                      <td className="sq-money">$</td>
                      <td className="sq-money">
                        {fmt(quoteData.phTotal + quoteData.irrTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="sq-quote-section sq-quote-summary">
                <div className="sq-quote-section-header sq-summary-header">
                  <span>
                    Summary hours &amp; Service Quote for{" "}
                    {clientName || "Client"}
                  </span>
                </div>
                <table className="sq-quote-table sq-summary-table-final">
                  <thead>
                    <tr>
                      <th></th>
                      <th></th>
                      <th className="sq-right">Hrs / nights</th>
                      <th className="sq-right">Quote Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        Estimated weekly services amount (Day &amp; Evening)
                      </td>
                      <td>$ / week</td>
                      <td className="sq-right">
                        {fmt(quoteData.weeklyHrsNights)}
                      </td>
                      <td className="sq-money">
                        ${fmt(quoteData.estimatedWeekly)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Estimated weekly inactive sleepover (No. of Nights)
                      </td>
                      <td>$ / week</td>
                      <td className="sq-right">
                        {fmt(quoteData.sleepoverHrsNights)}
                      </td>
                      <td className="sq-money">
                        ${fmt(quoteData.estimatedSleepoverWeekly)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Estimated fortnightly amount (Day, Evening &amp;
                        Overnight)
                      </td>
                      <td>$ / fortnight</td>
                      <td className="sq-right">
                        {fmt(quoteData.fortnightlyHrsNights)}
                      </td>
                      <td className="sq-money">
                        ${fmt(quoteData.estimatedFortnightly)}
                      </td>
                    </tr>
                    <tr>
                      <td>Estimated annual amount</td>
                      <td>$ / year</td>
                      <td className="sq-right">
                        {fmt(quoteData.annualHrsNights)}
                      </td>
                      <td className="sq-money">
                        ${fmt(quoteData.estimatedAnnual)}
                      </td>
                    </tr>
                    <tr>
                      <td>Estimated annual Irregular Supports amount</td>
                      <td>$ / year</td>
                      <td className="sq-right">
                        {fmt(quoteData.irregularHrsNights)}
                      </td>
                      <td className="sq-money">
                        ${fmt(quoteData.estimatedIrregularAnnual)}
                      </td>
                    </tr>
                    <tr className="sq-grand-total">
                      <td></td>
                      <td></td>
                      <td className="sq-right">
                        {fmt(quoteData.totalHrsNights)}
                      </td>
                      <td className="sq-money">${fmt(quoteData.grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 5: Invoice ═══ */}
        {activeTab === "invoice" && (
          <div className="sq-panel">
            <div className="sq-invoice-actions">
              <button className="sq-btn sq-btn-export" onClick={handleExportInvoicePdf}>
                <i className="fas fa-file-pdf"></i> Export PDF
              </button>
            </div>

            <div className="sq-invoice-head">
              <h3 style={{ marginBottom: 6 }}>Service Invoice (Monday - Sunday)</h3>
              <p className="sq-invoice-sub">
                Client: {clientName || "—"} | Plan: {planNumber || "—"} | Period:
                {" "}
                {invoiceData.weekDates.length
                  ? `${fmtDate(invoiceData.weekDates[0])} - ${fmtDate(invoiceData.weekDates[6])}`
                  : "—"}
              </p>
            </div>

            <div className="sq-invoice-wrap">
              <table className="sq-invoice-table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>HRS/KM</th>
                    <th>ITEM CODE</th>
                    <th>DESCRIPTIONS</th>
                    <th>UNIT PRICE</th>
                    <th>TAX CODE</th>
                    <th>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="sq-invoice-empty">
                        No invoice rows. Please enter Hrs/Day values in Daily Service Schedule.
                      </td>
                    </tr>
                  ) : (
                    invoiceData.rows.map((r, i) => (
                      <tr key={`${r.dateLabel}-${r.itemCode}-${i}`}>
                        <td>{r.dateLabel}</td>
                        <td className="sq-right">{Number(r.units.toFixed(2))}</td>
                        <td>{r.itemCode}</td>
                        <td>{r.description}</td>
                        <td className="sq-right">{fmt(r.unitPrice)}</td>
                        <td className="sq-center">{r.taxCode}</td>
                        <td className="sq-right sq-money">${fmt(r.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={6} className="sq-right sq-invoice-total-label">
                      Balance Due
                    </td>
                    <td className="sq-right sq-money sq-invoice-total-value">
                      ${fmt(invoiceData.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ═══ Add Column Modal ═══ */}
        {addColTarget && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
            onClick={() => {
              setAddColTarget(null);
              setNewColLabel("");
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "24px",
                borderRadius: "10px",
                minWidth: "320px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: "0 0 16px" }}>
                Add Column (
                {addColTarget === "schedule" ? "Schedule" : "Rate Table"})
              </h3>
              <input
                type="text"
                value={newColLabel}
                onChange={(e) => setNewColLabel(e.target.value)}
                placeholder="Column name"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  marginBottom: "16px",
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmAddCol();
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setAddColTarget(null);
                    setNewColLabel("");
                  }}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    background: "#f1f5f9",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddCol}
                  disabled={!newColLabel.trim()}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#2c3e7a",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                    opacity: newColLabel.trim() ? 1 : 0.5,
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
