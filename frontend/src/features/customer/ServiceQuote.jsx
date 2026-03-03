import React, { useCallback, useMemo, useRef, useState } from "react";
import Layout from "../../components/Layout";
import "./ServiceQuote.css";

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
    supportItemName:
      "Assistance With Self-Care Activities - Standard - Sunday",
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
  },
];

// ─── Utility helpers ─────────────────────────────────────────────────────
const getRatio = (serviceType) => {
  const m = serviceType.match(/\((\d+):(\d+)\)/);
  if (!m) return 1; // 1:1
  return parseInt(m[2]) / parseInt(m[1]); // e.g. "Group (2:45)" → 45/2
};

const fmt = (n) =>
  n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtOr = (n) => (n === 0 ? "-" : fmt(n));

// ─── Component ───────────────────────────────────────────────────────────
export default function ServiceQuote() {
  const [activeTab, setActiveTab] = useState("schedule");
  const [clientName, setClientName] = useState("");
  const [planNumber, setPlanNumber] = useState("");
  const [planPeriod, setPlanPeriod] = useState("TBA");

  // Schedule data
  const [scheduleRows, setScheduleRows] = useState(DEFAULT_SCHEDULE_ROWS);
  const [schedule115Rows, setSchedule115Rows] = useState(DEFAULT_SCHEDULE_115);
  const [schedule107DomRows, setSchedule107DomRows] = useState(
    DEFAULT_SCHEDULE_107_DOMESTIC,
  );

  // Rates data
  const [rateItems, setRateItems] = useState(DEFAULT_RATES);
  const [rateTable, setRateTable] = useState(DEFAULT_RATE_TABLE);

  // Public holiday & irregular
  const [publicHolidayRate, setPublicHolidayRate] = useState(150.10);
  const [publicHolidayHours, setPublicHolidayHours] = useState(5.0);
  const [irregularRate, setIrregularRate] = useState(150.10);
  const [irregularHours, setIrregularHours] = useState(5.0);

  // Print ref
  const quoteRef = useRef(null);

  // ─── Schedule row helpers ────────────────────────────────────────
  const updateScheduleRow = useCallback((idx, field, value) => {
    setScheduleRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const addScheduleRow = useCallback(() => {
    setScheduleRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        regis: "107/115",
        description: "",
        timeOfDay: "Day",
        timeFrame: "",
        staff: 1,
        hoursPerDay: 0,
        shared: false,
        serviceType: "1:1",
      },
    ]);
  }, []);

  const removeScheduleRow = useCallback((idx) => {
    setScheduleRows((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ─── Rate item helpers ───────────────────────────────────────────
  const updateRateItem = useCallback((idx, field, value) => {
    setRateItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const addRateItem = useCallback(() => {
    setRateItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        supportItemNumber: "",
        supportItemName: "",
        regGroupNumber: "0107",
        rate: 0,
      },
    ]);
  }, []);

  const removeRateItem = useCallback((idx) => {
    setRateItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ─── Rate table helpers ──────────────────────────────────────────
  const updateRateTable = useCallback((idx, field, value) => {
    setRateTable((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const addRateTableRow = useCallback(() => {
    setRateTable((prev) => [
      ...prev,
      {
        id: Date.now(),
        regGroupNo: "107",
        supportCategory: "",
        supportItemName: "",
        dailyHours: 0,
        weekdayRate: 0,
        saturdayRate: 0,
        sundayRate: 0,
        phRate: 0,
      },
    ]);
  }, []);

  const removeRateTableRow = useCallback((idx) => {
    setRateTable((prev) => prev.filter((_, i) => i !== idx));
  }, []);

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
    // Get rates from rateTable
    const getRate = (regGroup, timeOfDay) => {
      // Find matching rate row
      for (const rt of rateTable) {
        if (rt.regGroupNo !== String(regGroup)) continue;
        const name = (rt.supportItemName || "").toLowerCase();
        if (timeOfDay === "Overnight" && name.includes("night-time sleepover")) {
          return rt;
        }
        if (
          timeOfDay === "Evening" &&
          (name.includes("evening") || name.includes("weekday evening"))
        ) {
          return rt;
        }
        if (
          timeOfDay === "Day" &&
          !name.includes("night-time sleepover") &&
          !name.includes("evening") &&
          !name.includes("domestic")
        ) {
          return rt;
        }
      }
      return rateTable.find((rt) => rt.regGroupNo === String(regGroup)) || null;
    };

    // Group schedule rows by serviceType
    const grouped = {};
    SERVICE_TYPES.forEach((st) => {
      grouped[st] = { rows: [], totalHrsWeek: 0, totalCost: 0 };
    });

    scheduleRows.forEach((sr) => {
      const st = sr.serviceType;
      if (!grouped[st]) return;

      const hours = parseFloat(sr.hoursPerDay) || 0;
      const ratio = getRatio(st);
      const rateRow = getRate("107", sr.timeOfDay);

      if (!rateRow) return;

      const weekdayPricePerHour = rateRow.weekdayRate;
      const saturdayPricePerHour = rateRow.saturdayRate;
      const sundayPricePerHour = rateRow.sundayRate;

      const priceHourRatio = (price) => parseFloat((price / ratio).toFixed(2));

      const dayData = DAYS.map((day) => {
        const isWeekend =
          day === "Saturday" || day === "Sunday";
        let pricePerHour;
        if (day === "Saturday") pricePerHour = saturdayPricePerHour;
        else if (day === "Sunday") pricePerHour = sundayPricePerHour;
        else pricePerHour = weekdayPricePerHour;

        const ratioPrice = priceHourRatio(pricePerHour);
        const cost = ratioPrice * hours;

        return {
          day,
          pricePerHour,
          pricePerHourRatio: ratioPrice,
          hours,
          cost,
        };
      });

      const weekTotal = dayData.reduce((sum, d) => sum + d.cost, 0);
      grouped[st].rows.push({
        ...sr,
        dayData,
        weekTotal,
      });
      grouped[st].totalHrsWeek += hours * 7;
      grouped[st].totalCost += weekTotal;
    });

    // Sleepover section
    const sleepoverRate = rateTable.find(
      (rt) =>
        rt.regGroupNo === "107" &&
        (rt.supportItemName || "").toLowerCase().includes("night-time sleepover"),
    );

    const sleepover = {
      rate: sleepoverRate,
      nightsPerWeek: 7,
      costPerNight: sleepoverRate?.weekdayRate || 0,
      weekTotal: (sleepoverRate?.weekdayRate || 0) * 7,
    };

    // 115 section
    const rate115 = rateTable.find((rt) => rt.regGroupNo === "115");

    // Public holiday / Irregular
    const phTotal = publicHolidayRate * publicHolidayHours;
    const irrTotal = irregularRate * irregularHours;

    // Grand totals
    let totalWeeklyDay = 0;
    let totalWeeklyEvening = 0;
    Object.values(grouped).forEach((g) => {
      totalWeeklyDay += g.totalCost;
    });

    const estimatedWeekly = totalWeeklyDay;
    const estimatedSleepoverWeekly = sleepover.weekTotal;
    const estimatedFortnightly = (estimatedWeekly + estimatedSleepoverWeekly) * 2;
    const estimatedAnnual = (estimatedWeekly + estimatedSleepoverWeekly) * 52;
    const estimatedIrregularAnnual = phTotal + irrTotal;

    return {
      grouped,
      sleepover,
      rate115,
      phTotal,
      irrTotal,
      estimatedWeekly,
      estimatedSleepoverWeekly,
      estimatedFortnightly,
      estimatedAnnual,
      estimatedIrregularAnnual,
      grandTotal: estimatedAnnual + estimatedIrregularAnnual,
    };
  }, [scheduleRows, rateTable, publicHolidayRate, publicHolidayHours, irregularRate, irregularHours]);

  // ─── Print ───────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

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
            className={`sq-tab ${activeTab === "rates" ? "active" : ""}`}
            onClick={() => setActiveTab("rates")}
          >
            <i className="fas fa-dollar-sign"></i> Price / Rates
          </button>
          <button
            className={`sq-tab ${activeTab === "quote" ? "active" : ""}`}
            onClick={() => setActiveTab("quote")}
          >
            <i className="fas fa-file-invoice-dollar"></i> Service Quote
          </button>
        </div>

        {/* ═══ TAB 1: Daily Service Schedule ═══ */}
        {activeTab === "schedule" && (
          <div className="sq-panel">
            <h3>Daily Service Schedule</h3>

            <div className="sq-table-wrap">
              <table className="sq-table">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}>#</th>
                    <th>Regis</th>
                    <th>Item Description</th>
                    <th>Time of Day</th>
                    <th>Time Frame</th>
                    <th style={{ width: 55 }}>Staff</th>
                    <th style={{ width: 70 }}>Hrs/Day</th>
                    <th style={{ width: 55 }}>Shared</th>
                    <th>Service Type</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleRows.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="sq-center">
                        {String.fromCharCode(97 + idx)}.
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.regis}
                          onChange={(e) =>
                            updateScheduleRow(idx, "regis", e.target.value)
                          }
                          style={{ width: 70 }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) =>
                            updateScheduleRow(
                              idx,
                              "description",
                              e.target.value,
                            )
                          }
                          className="sq-wide-input"
                        />
                      </td>
                      <td>
                        <select
                          value={row.timeOfDay}
                          onChange={(e) =>
                            updateScheduleRow(idx, "timeOfDay", e.target.value)
                          }
                        >
                          {TIME_OF_DAY_OPTIONS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.timeFrame}
                          onChange={(e) =>
                            updateScheduleRow(idx, "timeFrame", e.target.value)
                          }
                          style={{ width: 130 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={row.staff}
                          onChange={(e) =>
                            updateScheduleRow(
                              idx,
                              "staff",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          style={{ width: 50 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={row.hoursPerDay}
                          onChange={(e) =>
                            updateScheduleRow(
                              idx,
                              "hoursPerDay",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          style={{ width: 60 }}
                        />
                      </td>
                      <td className="sq-center">
                        <input
                          type="checkbox"
                          checked={row.shared}
                          onChange={(e) =>
                            updateScheduleRow(idx, "shared", e.target.checked)
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={row.serviceType}
                          onChange={(e) =>
                            updateScheduleRow(
                              idx,
                              "serviceType",
                              e.target.value,
                            )
                          }
                        >
                          {SERVICE_TYPES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="sq-btn-icon sq-btn-danger"
                          onClick={() => removeScheduleRow(idx)}
                          title="Remove"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="sq-btn sq-btn-add" onClick={addScheduleRow}>
              <i className="fas fa-plus"></i> Add Row
            </button>

            {/* Summary hours */}
            <div className="sq-summary-box">
              <h4>Summary Hours</h4>
              <table className="sq-table sq-summary-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Total</th>
                    <th>1:1</th>
                    {SERVICE_TYPES.filter((st) => st !== "1:1").map((st) => (
                      <th key={st}>{st}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Estimated avg daily hours (day)</td>
                    <td>
                      {fmt(
                        SERVICE_TYPES.reduce(
                          (s, st) => s + (summaryHours.byType[st]?.day || 0),
                          0,
                        ),
                      )}
                    </td>
                    {SERVICE_TYPES.map((st) => (
                      <td key={st}>
                        {fmt(summaryHours.byType[st]?.day || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Estimated avg daily hours (evening)</td>
                    <td>
                      {fmt(
                        SERVICE_TYPES.reduce(
                          (s, st) =>
                            s + (summaryHours.byType[st]?.evening || 0),
                          0,
                        ),
                      )}
                    </td>
                    {SERVICE_TYPES.map((st) => (
                      <td key={st}>
                        {fmt(summaryHours.byType[st]?.evening || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Estimated avg daily hours (overnight)</td>
                    <td>
                      {fmt(
                        SERVICE_TYPES.reduce(
                          (s, st) =>
                            s + (summaryHours.byType[st]?.overnight || 0),
                          0,
                        ),
                      )}
                    </td>
                    {SERVICE_TYPES.map((st) => (
                      <td key={st}>
                        {fmt(summaryHours.byType[st]?.overnight || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr className="sq-total-row">
                    <td>Estimated avg daily hours</td>
                    <td>{fmt(summaryHours.totalDay)}</td>
                    {SERVICE_TYPES.map((st) => {
                      const t = summaryHours.byType[st];
                      return (
                        <td key={st}>
                          {fmt((t?.day || 0) + (t?.evening || 0) + (t?.overnight || 0))}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="sq-total-row">
                    <td>Estimated avg weekly hours</td>
                    <td>{fmt(summaryHours.totalDay * 7)}</td>
                    {SERVICE_TYPES.map((st) => {
                      const t = summaryHours.byType[st];
                      const daily =
                        (t?.day || 0) + (t?.evening || 0) + (t?.overnight || 0);
                      return <td key={st}>{fmt(daily * 7)}</td>;
                    })}
                  </tr>
                  <tr className="sq-total-row">
                    <td>Estimated avg yearly hours</td>
                    <td>{fmt(summaryHours.totalDay * 365)}</td>
                    {SERVICE_TYPES.map((st) => {
                      const t = summaryHours.byType[st];
                      const daily =
                        (t?.day || 0) + (t?.evening || 0) + (t?.overnight || 0);
                      return <td key={st}>{fmt(daily * 365)}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: Price / Rates ═══ */}
        {activeTab === "rates" && (
          <div className="sq-panel">
            <h3>Support Item Rates (VIC)</h3>

            <div className="sq-table-wrap">
              <table className="sq-table">
                <thead>
                  <tr>
                    <th>Support Item Number</th>
                    <th>Support Item Name</th>
                    <th>Reg. Group</th>
                    <th>VIC Rate ($)</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rateItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="text"
                          value={item.supportItemNumber}
                          onChange={(e) =>
                            updateRateItem(
                              idx,
                              "supportItemNumber",
                              e.target.value,
                            )
                          }
                          style={{ width: 160 }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.supportItemName}
                          onChange={(e) =>
                            updateRateItem(
                              idx,
                              "supportItemName",
                              e.target.value,
                            )
                          }
                          className="sq-wide-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.regGroupNumber}
                          onChange={(e) =>
                            updateRateItem(
                              idx,
                              "regGroupNumber",
                              e.target.value,
                            )
                          }
                          style={{ width: 70 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            updateRateItem(
                              idx,
                              "rate",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          style={{ width: 90 }}
                        />
                      </td>
                      <td>
                        <button
                          className="sq-btn-icon sq-btn-danger"
                          onClick={() => removeRateItem(idx)}
                          title="Remove"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="sq-btn sq-btn-add" onClick={addRateItem}>
              <i className="fas fa-plus"></i> Add Rate Item
            </button>

            <h3 style={{ marginTop: 24 }}>Rate Table (by Day Type)</h3>
            <div className="sq-table-wrap">
              <table className="sq-table">
                <thead>
                  <tr>
                    <th>Reg Group</th>
                    <th>Support Category</th>
                    <th>Support Item Name</th>
                    <th>Daily Hrs</th>
                    <th>Weekday ($)</th>
                    <th>Saturday ($)</th>
                    <th>Sunday ($)</th>
                    <th>PH ($)</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rateTable.map((row, idx) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="text"
                          value={row.regGroupNo}
                          onChange={(e) =>
                            updateRateTable(idx, "regGroupNo", e.target.value)
                          }
                          style={{ width: 50 }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.supportCategory}
                          onChange={(e) =>
                            updateRateTable(
                              idx,
                              "supportCategory",
                              e.target.value,
                            )
                          }
                          className="sq-wide-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.supportItemName}
                          onChange={(e) =>
                            updateRateTable(
                              idx,
                              "supportItemName",
                              e.target.value,
                            )
                          }
                          className="sq-wide-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          value={row.dailyHours}
                          onChange={(e) =>
                            updateRateTable(
                              idx,
                              "dailyHours",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          style={{ width: 60 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={row.weekdayRate}
                          onChange={(e) =>
                            updateRateTable(
                              idx,
                              "weekdayRate",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          style={{ width: 80 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={row.saturdayRate}
                          onChange={(e) =>
                            updateRateTable(
                              idx,
                              "saturdayRate",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          style={{ width: 80 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={row.sundayRate}
                          onChange={(e) =>
                            updateRateTable(
                              idx,
                              "sundayRate",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          style={{ width: 80 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={row.phRate}
                          onChange={(e) =>
                            updateRateTable(
                              idx,
                              "phRate",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          style={{ width: 80 }}
                        />
                      </td>
                      <td>
                        <button
                          className="sq-btn-icon sq-btn-danger"
                          onClick={() => removeRateTableRow(idx)}
                          title="Remove"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="sq-btn sq-btn-add" onClick={addRateTableRow}>
              <i className="fas fa-plus"></i> Add Rate Row
            </button>

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

              {/* Quote sections by service type */}
              {SERVICE_TYPES.map((st) => {
                const group = quoteData.grouped[st];
                if (!group || group.rows.length === 0) return null;

                return (
                  <div key={st} className="sq-quote-section">
                    <div className="sq-quote-section-header">
                      <span className="sq-section-regis">107</span>
                      <span>
                        Assistance With Self-Care Activities (
                        {st === "1:1"
                          ? "DAY"
                          : st.includes("Evening")
                            ? "EVENING"
                            : "DAY"}
                        )
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
                          // Sum hours and cost for all rows in this group for this day
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
                              <td className="sq-right">
                                {fmt(totalHrs)}
                              </td>
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
              })}

              {/* Sleepover section */}
              {quoteData.sleepover.rate && (
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
                            $
                            {fmt(
                              quoteData.sleepover.rate?.weekdayRate || 0,
                            )}
                          </td>
                          <td className="sq-money">
                            $
                            {fmt(
                              quoteData.sleepover.rate?.weekdayRate || 0,
                            )}
                          </td>
                          <td>per night</td>
                          <td className="sq-right">1.00</td>
                          <td className="sq-money">$</td>
                          <td className="sq-money">
                            {fmt(
                              quoteData.sleepover.rate?.weekdayRate || 0,
                            )}
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
                  <tbody>
                    <tr>
                      <td>
                        Estimated weekly services amount (Day &amp; Evening)
                      </td>
                      <td>$ / week</td>
                      <td className="sq-money">
                        ${fmt(quoteData.estimatedWeekly)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Estimated weekly inactive sleepover (No. of Nights)
                      </td>
                      <td>$ / week</td>
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
                      <td className="sq-money">
                        ${fmt(quoteData.estimatedFortnightly)}
                      </td>
                    </tr>
                    <tr>
                      <td>Estimated annual amount</td>
                      <td>$ / year</td>
                      <td className="sq-money">
                        ${fmt(quoteData.estimatedAnnual)}
                      </td>
                    </tr>
                    <tr>
                      <td>Estimated annual Irregular Supports amount</td>
                      <td>$ / year</td>
                      <td className="sq-money">
                        ${fmt(quoteData.estimatedIrregularAnnual)}
                      </td>
                    </tr>
                    <tr className="sq-grand-total">
                      <td></td>
                      <td></td>
                      <td className="sq-money">
                        ${fmt(quoteData.grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
