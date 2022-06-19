import React, { useEffect, useState } from "react";
import GetUserLocation from "./GetUserLocation";
import myImg from "../graph.PNG";
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

const Weather = () => {
  const [data, setData] = useState([]);
  const [cordData, setCordData] = useState([]);
  const [query, setQuery] = useState("Delhi");
  const [active, setActive] = useState(0);
  const [inputStyle, setInputStyle] = useState(false);
  const [display, setDisplay] = useState([]);
  const [displayMode, setDisplayMode] = useState(true);
  const local = GetUserLocation();

  let weatherAPI = {
    key: "3347991dc1e65cace7187b19619dcbfc",
    baseUrl: "https://api.openweathermap.org/data/2.5/weather?",
  };

  // Getting Onecall Data
  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord?.lat}&lon=${data.coord?.lon}&units=metric&exclude=minutely&appid=${weatherAPI.key}`
    )
      .then((res) => res.json())
      .then((res) => {
        setCordData(res);
        console.log("onecall:", res);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [data.coord?.lat, data.coord?.lon]);

  //  For getting One CallData;
  useEffect(() => {
    fetch(
      `${weatherAPI.baseUrl}q=${query}&units=metric&exclude=hourly,minutely&appid=${weatherAPI.key}`
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        console.log("data", res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [query]);

  // Display Date
  function displayDate(d) {
    let day = new Date(d * 1000).getDay();

    switch (day) {
      case 0:
        return "Sun";
      case 1:
        return "Mon";
      case 2:
        return "Tue";
      case 3:
        return "Wed";
      case 4:
        return "Thu";
      case 5:
        return "Fri";
      case 6:
        return "Sat";
    }
    return day;
  }

  // Convert String to Hour
  function convertString(d) {
    return new Date(d * 1000).getHours();
  }

  const dailyCardClick = (index) => {
    setActive(index);
  };

  // Handeling form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("click");
  };

  const inPutBox = () => {
    setInputStyle((current) => !current);
  };

  const filterBulkData = (text) => {
    let matches = Bulk.filter((x) => {
      const regex = new RegExp(`${text}`, "gi");
      return x.city.match(regex) || x.state.match(regex);
    });
    setDisplay(matches);
  };

  function CustomTooltip({ active, payload, label }) {
    if (active) {
      return (
        <div className="chart-desc">
          <div>
            <p>
              {convertString(label) === 0
                ? `${12} am`
                : convertString(label) === 12
                ? `${12} pm`
                : convertString(label) > 0 && convertString(label) < 12
                ? `${convertString(label) % 12} am`
                : `${convertString(label) % 12} pm`}
            </p>
          </div>
          <div>
            <p>
              Temperature: <strong>{Math.round(payload[0].value)}°C</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  const handleChange = (e) => {
    filterBulkData(e.target.value);
    setQuery(e.target.value);
    setDisplayMode((current) => !current);
  };

  const setSearch = (city) => {
    const edit = Bulk.filter((item) => {
      return item.city === city;
    });
    setQuery(edit[0].city);
    setDisplayMode((current) => !current);
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <div
          className="input-box"
          onClick={inPutBox}
          style={{
            border: inputStyle ? "2px solid #131313" : "none",
          }}
        >
          <FaMapMarkerAlt className="map-icon" />
          <input
            type="text"
            placeholder="...Search"
            onChange={handleChange}
            value={query}
          />
          <BsSearch className="search-icon" />
        </div>
      </form>

      <div className="bulk-data-container">
        {displayMode &&
          display.map((e, i) => (
            <div
              key={i}
              className="bulk-data"
              onClick={() => setSearch(e.city)}
            >
              <div className="bulk-data-info">
                <strong>{e.city},</strong>
                <p>{e.state}</p>
              </div>
              <div className="bulk-data-icon">
                <FaMapMarkerAlt />
              </div>
            </div>
          ))}
      </div>

      {local.loaded && data.sys?.country === "IN" && cordData.daily && (
        <>
          <section className="top">
            {cordData.daily.map((e, i) => (
              <div
                key={e.dt}
                className={
                  active === i
                    ? "clicked-single-daily-card"
                    : "single-daily-card"
                }
                onClick={() => dailyCardClick(i)}
              >
                <p>{displayDate(e.dt)}</p>
                <div className="daily-temp">
                  <p>{Math.round(e.temp.max)}°</p>
                  <p>{Math.round(e.temp.min)}°</p>
                </div>
                <div className="daily-img">
                  <img
                    src={`https://openweathermap.org/img/wn/${e?.weather[0]?.icon}@2x.png`}
                    alt=""
                  />
                </div>
                <p>{e.weather[0]?.main}</p>
              </div>
            ))}
          </section>

          <section className="bottom">
            <div className="current-temp-img">
              <strong>{Math.round(data.main?.temp)}°C</strong>
              <div className="current-img">
                <img
                  src={`https://openweathermap.org/img/wn/${cordData.current?.weather[0]?.icon}@2x.png`}
                  alt=""
                />
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cordData?.hourly.slice(0, 12)}>
                <Area
                  activeDot={{ strokeWidth: 2, r: 7 }}
                  type="monotone"
                  dataKey="temp"
                  stroke="#008ffb"
                  strokeWidth="5"
                  fill="#bbe1fe"
                />
                <XAxis
                  axisLine={false}
                  tickLine={false}
                  dataKey="dt"
                  tickFormatter={(dt) => {
                    if (convertString(dt) === 12 || convertString(dt) === 0) {
                      return 12;
                    }

                    return convertString(dt) % 12;
                  }}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  viewBox={{ x: 0, y: 0, width: 400, height: 400 }}
                />
                <CartesianGrid opacity={0.8} vertical={false} />
              </AreaChart>
            </ResponsiveContainer>

            <div className="hum-Pre">
              <div className="pressure">
                <strong>Pressure</strong>
                <p>{cordData.current.pressure}pha</p>
              </div>
              <div className="humidity">
                <strong>Humidity</strong>
                <p>{cordData.current.humidity}%</p>
              </div>
            </div>

            <div className="sun-SetRise">
              <div className="sunrise">
                <strong>Sunrise</strong>
                <p>
                  {`${convertString(data.sys?.sunrise)}:${new Date(
                    data.sys?.sunrise
                  ).getMinutes()} am`}
                </p>
              </div>
              <div className="sunset">
                <strong>Sunset</strong>
                <p>
                  {`${convertString(data.sys?.sunset) - 12}:${new Date(
                    data.sys?.sunrise
                  ).getMinutes()} pm`}
                </p>
              </div>
            </div>

            <div className="img-graph">
              <img src={myImg} alt="myImg" />
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default Weather;
