import React, { useEffect, useState } from "react";
import GetUserLocation from "./GetUserLocation";
import myImg from "../graph.PNG";
import { FaMapMarkerAlt } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import "./weather.css";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const Weather = () => {
  const [data, setData] = useState([]);
  const [cordData, setCordData] = useState([]);
  const [query, setQuery] = useState("delhi");
  const [lan, setLan] = useState({});
  const [active, setActive] = useState(0);
  const local = GetUserLocation();
  const [inputStyle, setInputStyle] = useState(false);
  const [hourly, setHourly] = useState([]);

  let weatherAPI = {
    key: "3347991dc1e65cace7187b19619dcbfc",
    baseUrl: "https://api.openweathermap.org/data/2.5/weather?",
  };

  // Getting Onecall Data
  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lan?.lat}&lon=${lan?.lon}&units=metric&exclude=minutely&appid=${weatherAPI.key}`
    )
      .then((res) => res.json())
      .then((res) => {
        setCordData(res);
        console.log("onecall:", res);
        setHourly(res.hourly);
        console.log("hourly:", res.hourly);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [lan?.lat, lan?.lon]);

  // For Lattitude and Longitude
  useEffect(() => {
    fetch(`${weatherAPI.baseUrl}q=${query}&appid=${weatherAPI.key}`)
      .then((res) => res.json())
      .then((res) => {
        console.log("latAndLon:", res.coord);
        setLan(res.coord);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [query]);

  //  For getting One CallData;
  useEffect(() => {
    fetch(
      `${weatherAPI.baseUrl}q=${query}&units=metric&exclude=hourly,minutely&appid=${weatherAPI.key}`
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        console.log("details", res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [query]);

  // Display Date
  function displayDate(d) {
    let date = new Date(d * 1000);
    let day = date.getDay();

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

  function CustomTooltip({ active, payload, label }) {
    if (active) {
      return (
        <div className="chart-desc">
          <div>
            <p>
              {new Date(label * 1000).getHours() === 0
                ? `${12} am`
                : new Date(label * 1000).getHours() === 12
                ? `${12} pm`
                : new Date(label * 1000).getHours() > 0 &&
                  new Date(label * 1000).getHours() < 12
                ? `${new Date(label * 1000).getHours() % 12} am`
                : `${new Date(label * 1000).getHours() % 12} pm`}
            </p>
          </div>
          <div>
            <p>
              Tempreture: <strong>{Math.round(payload[0].value)}°C</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <>
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <BsSearch className="search-icon" />
          </div>
        </form>
        {local.loaded ? (
          <>
            {lan && cordData.daily !== undefined ? (
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

                  <div className="chart">
                    <ResponsiveContainer>
                      <AreaChart data={hourly.slice(0, 24)}>
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
                            if (
                              new Date(dt * 1000).getHours() === 12 ||
                              new Date(dt * 1000).getHours() === 0
                            ) {
                              return 12;
                            }

                            return new Date(dt * 1000).getHours() % 12;
                          }}
                        />

                        <Tooltip
                          content={<CustomTooltip />}
                          viewBox={{ x: 0, y: 0, width: 400, height: 400 }}
                        />
                        <CartesianGrid opacity={0.8} vertical={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

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
                        {new Date(cordData.current.sunrise * 1e3)
                          .toLocaleTimeString()
                          .slice(0, -6) + "am"}
                      </p>
                    </div>
                    <div className="sunset">
                      <strong>Sunset</strong>
                      <p>
                        {new Date(cordData.current.sunset * 1e3)
                          .toLocaleTimeString()
                          .slice(0, -6) + "pm"}
                      </p>
                    </div>
                  </div>

                  <div className="img-graph">
                    <img src={myImg} alt="" />
                  </div>
                </section>
              </>
            ) : (
              ""
            )}
          </>
        ) : (
          ""
        )}
      </main>
    </>
  );
};

export default Weather;
