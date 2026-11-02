import { useEffect, useRef, useState } from "react";
import GetUserLocation from "./GetUserLocation";
import { FaMapMarkerAlt } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import "./weather.css";
import Bulk from "../db.json";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const WEATHER_KEY = "3347991dc1e65cace7187b19619dcbfc";

const iconUrl = (icon) =>
  icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : "";

const formatClock = (unix) => {
  if (!unix) return "--";
  const date = new Date(unix * 1000);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
};

const formatHour = (unix) => {
  const hours = new Date(unix * 1000).getHours();
  if (hours === 0 || hours === 12) return "12";
  return String(hours % 12);
};

const dayLabel = (unix) => {
  if (!unix) return "";
  const date = new Date(unix * 1000);
  if (date.toDateString() === new Date().toDateString()) return "Today";
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

const windDirection = (deg) => {
  if (deg == null) return "";
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return labels[Math.round(deg / 45) % 8];
};

const formatVisibility = (meters) => {
  if (meters == null) return "--";
  const km = meters / 1000;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
};

const filterCities = (text) => {
  const q = text.trim().toLowerCase();
  if (!q) return Bulk;
  return Bulk.filter(
    (item) =>
      item.city.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q)
  ).sort((a, b) => {
    const aStarts = a.city.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.city.toLowerCase().startsWith(q) ? 0 : 1;
    return aStarts - bStarts || a.city.localeCompare(b.city);
  });
};

const HourTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-desc">
      <div>
        <p>{formatClock(label)}</p>
      </div>
      <div>
        <p>
          Temperature: <strong>{Math.round(payload[0].value)}°C</strong>
        </p>
      </div>
    </div>
  );
};

const SunTooltip = ({ active, payload }) => {
  const label = payload?.[0]?.payload?.sun;
  if (!active || !label || label === "--") return null;
  const isSunrise = label.endsWith("am");
  return (
    <div className="sun-graph">
      <strong>{isSunrise ? "Sunrise" : "Sunset"}</strong>
      <p>{label}</p>
    </div>
  );
};

const Weather = () => {
  const [data, setData] = useState({});
  const [cordData, setCordData] = useState(null);
  const [query, setQuery] = useState("Delhi");
  const [inputValue, setInputValue] = useState("Delhi");
  const [coords, setCoords] = useState(null);
  const [active, setActive] = useState(0);
  const [display, setDisplay] = useState([]);
  const [displayMode, setDisplayMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchRef = useRef(null);
  const acceptCanonicalName = useRef(true);
  const { location, requestLocation } = GetUserLocation();

  const lat = coords?.lat;
  const lon = coords?.lon;

  useEffect(() => {
    const onPointerDown = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setDisplayMode(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (location.status !== "ready") return;
    acceptCanonicalName.current = true;
    setCoords({
      lat: location.coordinates.lat,
      lon: location.coordinates.lon,
    });
    setDisplayMode(false);
  }, [location]);

  useEffect(() => {
    if ((lat == null || lon == null) && !query.trim()) return;

    const controller = new AbortController();
    let ignore = false;
    const params =
      lat != null && lon != null
        ? `lat=${lat}&lon=${lon}`
        : `q=${encodeURIComponent(query.trim())}`;

    setLoading(true);
    setError("");

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?${params}&units=metric&appid=${WEATHER_KEY}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((res) => {
        if (ignore) return;
        if (String(res.cod) !== "200") {
          const message = res.message
            ? res.message.charAt(0).toUpperCase() + res.message.slice(1)
            : "Couldn't find that city";
          setError(message);
          setData({});
          setCordData(null);
          return;
        }
        setData(res);
        setCordData(null);
        if (acceptCanonicalName.current) setInputValue(res.name || query);
        setActive(0);
        setError("");
      })
      .catch((err) => {
        if (ignore || err.name === "AbortError") return;
        setError("Unable to load weather. Check your connection.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [query, lat, lon]);

  const forecastLat = data.coord?.lat;
  const forecastLon = data.coord?.lon;

  useEffect(() => {
    if (forecastLat == null || forecastLon == null) return;

    const controller = new AbortController();
    let ignore = false;

    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${forecastLat}&lon=${forecastLon}&units=metric&appid=${WEATHER_KEY}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((res) => {
        if (ignore) return;
        const list = Array.isArray(res.list) ? res.list : [];
        if (String(res.cod) !== "200" || !list.length) {
          setCordData({ daily: [] });
          return;
        }

        const byDay = new Map();
        list.forEach((item) => {
          const dayKey = new Date(item.dt * 1000).toDateString();
          if (!byDay.has(dayKey)) byDay.set(dayKey, []);
          byDay.get(dayKey).push(item);
        });

        const daily = Array.from(byDay.values()).map((slots) => {
          const temps = slots.map((slot) => slot.main.temp);
          const midday = slots[Math.floor(slots.length / 2)];
          return {
            dt: slots[0].dt,
            temp: { max: Math.max(...temps), min: Math.min(...temps) },
            weather: midday.weather,
            hours: slots.map((slot) => ({
              dt: slot.dt,
              temp: slot.main.temp,
            })),
          };
        });

        setCordData({ daily });
      })
      .catch((err) => {
        if (ignore || err.name === "AbortError") return;
        setCordData({ daily: [] });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [forecastLat, forecastLon, data.dt]);

  const commitSearch = (city) => {
    const next = (city ?? inputValue).trim();
    if (!next) return;
    acceptCanonicalName.current = true;
    setInputValue(next);
    setCoords(null);
    setQuery(next);
    setDisplayMode(false);
  };

  const handleChange = (event) => {
    const value = event.target.value;
    acceptCanonicalName.current = false;
    setInputValue(value);
    setDisplay(filterCities(value));
    setDisplayMode(true);
  };

  const handleFocus = (event) => {
    setDisplay(filterCities(event.target.value));
    setDisplayMode(true);
    event.target.select();
  };

  const selected = cordData?.daily?.[active] || cordData?.daily?.[0];
  const sunrise = data.sys?.sunrise;
  const sunset = data.sys?.sunset;
  const sunData = [
    { sun: formatClock(sunrise), value: 0 },
    { sun: "", value: 10 },
    { sun: formatClock(sunset), value: 0 },
  ];

  const locationMessage =
    location.status === "error"
      ? location.error?.code === 1
        ? "Location permission denied. Search for a city instead."
        : location.error?.message || "Couldn't read your location."
      : "";

  const windText =
    data.wind?.speed == null
      ? "--"
      : `${Math.round(data.wind.speed * 3.6)} km/h ${windDirection(
          data.wind.deg
        )}`.trim();

  return (
    <main>
      <div className="search-wrap" ref={searchRef}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            commitSearch();
          }}
        >
          <div className="input-box">
            <button
              type="button"
              className="icon-btn map-icon"
              onClick={requestLocation}
              disabled={location.status === "pending"}
              aria-label="Use my location"
              title="Use my location"
            >
              <FaMapMarkerAlt />
            </button>
            <input
              type="text"
              placeholder="Search city"
              onChange={handleChange}
              onFocus={handleFocus}
              onKeyDown={(event) => {
                if (event.key === "Escape") setDisplayMode(false);
              }}
              value={inputValue}
              aria-label="Search city"
              aria-expanded={displayMode}
              aria-controls="city-suggestions"
              autoComplete="off"
            />
            <button type="submit" className="icon-btn search-icon" aria-label="Search">
              <BsSearch />
            </button>
          </div>
        </form>

        {displayMode && (
          <div
            id="city-suggestions"
            className="bulk-data-container"
            role="listbox"
          >
            <div className="bulk-data-meta">
              {display.length
                ? `${display.length} ${display.length === 1 ? "city" : "cities"}`
                : "No matching cities"}
            </div>
            {display.map((item, index) => (
              <div
                key={`${item.city}-${item.state}-${index}`}
                className="bulk-data"
                role="option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commitSearch(item.city)}
              >
                <div className="bulk-data-info">
                  <strong>{item.city}</strong>
                  <p>{item.state}</p>
                </div>
                <div className="bulk-data-icon">
                  <FaMapMarkerAlt />
                </div>
              </div>
            ))}
            {display.length === 0 && (
              <p className="bulk-empty">Press Enter to search this name.</p>
            )}
          </div>
        )}
      </div>

      {loading && !data.main && <p className="status">Loading weather…</p>}
      {location.status === "pending" && (
        <p className="status">Finding your location…</p>
      )}
      {locationMessage && <p className="status">{locationMessage}</p>}
      {error && <p className="status error">{error}</p>}

      {data.main && (
        <>
          <section className="top" aria-label="Daily forecast">
            {cordData?.daily?.length ? (
              cordData.daily.map((day, index) => (
                <div
                  key={day.dt}
                  className={
                    active === index
                      ? "clicked-single-daily-card"
                      : "single-daily-card"
                  }
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActive(index);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active === index}
                  title={day.weather?.[0]?.description || ""}
                >
                  <p>{dayLabel(day.dt)}</p>
                  <div className="daily-temp">
                    <p>{Math.round(day.temp.max)}°</p>
                    <p className="min">{Math.round(day.temp.min)}°</p>
                  </div>
                  <div className="daily-img">
                    <img
                      src={iconUrl(day.weather?.[0]?.icon)}
                      alt={day.weather?.[0]?.description || ""}
                    />
                  </div>
                  <p className="condition">{day.weather?.[0]?.main}</p>
                </div>
              ))
            ) : (
              <p className="forecast-pending">
                {cordData ? "Forecast is unavailable for this city." : "Loading forecast…"}
              </p>
            )}
          </section>

          <section className="bottom">
            <div className="current-head">
              <div className="place">
                <h2>
                  {data.name}
                  {data.sys?.country ? <span> · {data.sys.country}</span> : null}
                </h2>
                <p className="desc">{data.weather?.[0]?.description}</p>
              </div>
              <div className="current-temp-img">
                <strong>{Math.round(data.main.temp)}°C</strong>
                <div className="current-img">
                  <img
                    src={iconUrl(data.weather?.[0]?.icon)}
                    alt={data.weather?.[0]?.description || ""}
                  />
                </div>
              </div>
              <p className="feels">
                Feels like {Math.round(data.main.feels_like)}°C
              </p>
              <p className="updated">Updated {formatClock(data.dt)}</p>
            </div>

            {selected?.hours?.length > 0 && (
              <>
                <p className="chart-title">{dayLabel(selected.dt)} hourly</p>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={selected.hours}>
                      <Area
                        activeDot={{ strokeWidth: 2, r: 6 }}
                        type="monotone"
                        dataKey="temp"
                        stroke="#008ffb"
                        strokeWidth={4}
                        fill="#bbe1fe"
                      />
                      <XAxis
                        interval="preserveStartEnd"
                        axisLine={false}
                        tickLine={false}
                        dataKey="dt"
                        tickFormatter={formatHour}
                      />
                      <Tooltip content={<HourTooltip />} />
                      <CartesianGrid opacity={0.8} vertical={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            <div className="stats">
              <div className="stat">
                <strong>Pressure</strong>
                <p>{data.main.pressure} hPa</p>
              </div>
              <div className="stat">
                <strong>Humidity</strong>
                <p>{data.main.humidity}%</p>
              </div>
              <div className="stat">
                <strong>Wind</strong>
                <p>{windText}</p>
              </div>
              <div className="stat">
                <strong>Visibility</strong>
                <p>{formatVisibility(data.visibility)}</p>
              </div>
            </div>

            <div className="sun-SetRise">
              <div className="sunrise">
                <strong>Sunrise</strong>
                <p>{formatClock(sunrise)}</p>
              </div>
              <div className="sunset">
                <strong>Sunset</strong>
                <p>{formatClock(sunset)}</p>
              </div>
            </div>

            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={sunData}>
                  <defs>
                    <linearGradient id="sun-color" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="20%" stopColor="#f5e3be" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#f5e3be" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="sun"
                    padding={{ left: 30, right: 30 }}
                    tickLine={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#eccb87"
                    fillOpacity={1}
                    fill="url(#sun-color)"
                  />
                  <Tooltip content={<SunTooltip />} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default Weather;
