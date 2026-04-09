"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

type StoredNotes = Record<string, string>;

function getMonthKey(date: Date) {
  return format(date, "yyyy-MM");
}

function getRangeKey(start: Date | null, end: Date | null) {
  if (!start || !end) return "";
  return `${format(start, "yyyy-MM-dd")}__${format(end, "yyyy-MM-dd")}`;
}

export default function Page() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [monthNotes, setMonthNotes] = useState<StoredNotes>({});
  const [rangeNotes, setRangeNotes] = useState<StoredNotes>({});
  const [mounted, setMounted] = useState(false);

  const monthKey = getMonthKey(currentMonth);
  const rangeKey = getRangeKey(startDate, endDate);

  useEffect(() => {
    setMounted(true);

    const savedMonthNotes = localStorage.getItem("wall-calendar-month-notes");
    const savedRangeNotes = localStorage.getItem("wall-calendar-range-notes");
    const savedStart = localStorage.getItem("wall-calendar-start-date");
    const savedEnd = localStorage.getItem("wall-calendar-end-date");
    const savedMonth = localStorage.getItem("wall-calendar-current-month");

    if (savedMonthNotes) {
      setMonthNotes(JSON.parse(savedMonthNotes));
    }

    if (savedRangeNotes) {
      setRangeNotes(JSON.parse(savedRangeNotes));
    }

    if (savedStart) {
      setStartDate(parseISO(savedStart));
    }

    if (savedEnd) {
      setEndDate(parseISO(savedEnd));
    }

    if (savedMonth) {
      setCurrentMonth(parseISO(savedMonth));
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("wall-calendar-month-notes", JSON.stringify(monthNotes));
  }, [monthNotes, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("wall-calendar-range-notes", JSON.stringify(rangeNotes));
  }, [rangeNotes, mounted]);

  useEffect(() => {
    if (!mounted) return;

    if (startDate) {
      localStorage.setItem("wall-calendar-start-date", startDate.toISOString());
    } else {
      localStorage.removeItem("wall-calendar-start-date");
    }

    if (endDate) {
      localStorage.setItem("wall-calendar-end-date", endDate.toISOString());
    } else {
      localStorage.removeItem("wall-calendar-end-date");
    }
  }, [startDate, endDate, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("wall-calendar-current-month", currentMonth.toISOString());
  }, [currentMonth, mounted]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({
      start: gridStart,
      end: gridEnd,
    });
  }, [currentMonth]);

  function handleDayClick(day: Date) {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
      return;
    }

    if (isBefore(day, startDate)) {
      setEndDate(startDate);
      setStartDate(day);
      return;
    }

    if (isSameDay(day, startDate)) {
      setEndDate(day);
      return;
    }

    setEndDate(day);
  }

  function isInRange(day: Date) {
    if (!startDate || !endDate) return false;
    return isAfter(day, startDate) && isBefore(day, endDate);
  }

  function clearSelection() {
    setStartDate(null);
    setEndDate(null);
  }

  function updateMonthNote(value: string) {
    setMonthNotes((prev) => ({
      ...prev,
      [monthKey]: value,
    }));
  }

  function updateRangeNote(value: string) {
    if (!rangeKey) return;
    setRangeNotes((prev) => ({
      ...prev,
      [rangeKey]: value,
    }));
  }

  const currentMonthNote = monthNotes[monthKey] || "";
  const currentRangeNote = rangeNotes[rangeKey] || "";

  const selectedSummary = startDate && endDate
    ? `${format(startDate, "dd MMM yyyy")} → ${format(endDate, "dd MMM yyyy")}`
    : startDate
    ? `${format(startDate, "dd MMM yyyy")} selected`
    : "No date range selected";

  const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <main className="pageShell">
      <div className="calendarFrame">
        <div className="spiralBar" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="spiralRing" />
          ))}
        </div>

        <section className="calendarCard">
          <div className="heroPanel">
            <div className="heroImageWrap">
              <div className="heroImageOverlay" />
              <div className="heroContent">
                <p className="heroYear">{format(currentMonth, "yyyy")}</p>
                <h1 className="heroMonth">{format(currentMonth, "MMMM")}</h1>
                <p className="heroTag">Interactive Wall Calendar</p>
              </div>
            </div>

            <div className="heroActions">
              <button
                className="navBtn"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                ← Prev
              </button>
              <button
                className="todayBtn"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </button>
              <button
                className="navBtn"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                Next →
              </button>
            </div>
          </div>

          <div className="bottomSection">
            <aside className="notesPanel">
              <div className="notesBlock">
                <h2>Notes</h2>
                <p className="mutedText">
                  General notes for {format(currentMonth, "MMMM yyyy")}
                </p>
                <textarea
                  className="notesTextarea"
                  placeholder="Write monthly notes here..."
                  value={currentMonthNote}
                  onChange={(e) => updateMonthNote(e.target.value)}
                />
              </div>

              <div className="notesBlock">
                <h2>Selected Range</h2>
                <p className="selectionLabel">{selectedSummary}</p>

                <textarea
                  className="notesTextarea"
                  placeholder="Add a note for the selected date range..."
                  value={currentRangeNote}
                  onChange={(e) => updateRangeNote(e.target.value)}
                  disabled={!rangeKey}
                />

                <div className="metaActions">
                  <button className="clearBtn" onClick={clearSelection}>
                    Clear Selection
                  </button>
                </div>
              </div>
            </aside>

            <section className="gridPanel">
              <div className="monthHeader">
                <div>
                  <p className="monthLabel">{format(currentMonth, "yyyy")}</p>
                  <h2>{format(currentMonth, "MMMM")}</h2>
                </div>
                <div className="legend">
                  <span><i className="dot startDot" /> Start</span>
                  <span><i className="dot rangeDot" /> In range</span>
                  <span><i className="dot endDot" /> End</span>
                </div>
              </div>

              <div className="weekdaysRow">
                {weekdays.map((day) => (
                  <div key={day} className="weekdayCell">
                    {day}
                  </div>
                ))}
              </div>

              <div className="daysGrid">
                {calendarDays.map((day) => {
                  const sameMonth = isSameMonth(day, currentMonth);
                  const isStart = !!startDate && isSameDay(day, startDate);
                  const isEnd = !!endDate && isSameDay(day, endDate);
                  const between = isInRange(day);

                  let className = "dayCell";
                  if (!sameMonth) className += " mutedDay";
                  if (between) className += " inRangeDay";
                  if (isStart) className += " startDay";
                  if (isEnd) className += " endDay";
                  if (isStart && isEnd) className += " singleDay";

                  return (
                    <button
                      key={day.toISOString()}
                      className={className}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className="dayNumber">{format(day, "d")}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}