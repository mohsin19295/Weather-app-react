import React, { useState } from "react";

const Weather = () => {
  const [data, setData] = useState([]);
  const [cordData, setCordData] = useState([]);
  const [query, setQuery] = useState("");
  const [lan, setLan] = useState({});

  let weatherAPI = {
    key: "3347991dc1e65cace7187b19619dcbfc",
    baseUrl: "https://api.openweathermap.org/data/2.5/weather?",
  };

  function gettingOneCallData() {
    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lan?.lat}&lon=${lan?.lon}&units=metric&exclude=hourly,minutely&appid=${weatherAPI.key}`
    )
      .then((res) => res.json())
      .then((res) => {
        setCordData(res);
        console.log("cordData:", res);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function xyz() {
    fetch(`${weatherAPI.baseUrl}q=${query}&appid=${weatherAPI.key}`)
      .then((res) => res.json())
      .then((res) => {
        console.log("cord:", res.coord);
        setLan(res.coord);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //   gettingOneCallData();
  function gettingDetails() {
    fetch(`${weatherAPI.baseUrl}q=${query}&appid=${weatherAPI.key}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const handleChange = (e) => {
    e.preventDefault();
    gettingOneCallData();
    gettingDetails();
    xyz();
  };

  return (
    <>
      <form onSubmit={handleChange}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button>click</button>
      </form>

      {lan !== undefined && cordData.daily !== undefined ? (
        <>
          <h1>
            {lan.lon} {lan.lat}
          </h1>
          <h1>
            {data.name} {data.sys?.country}
          </h1>
          <p>Temp: {cordData.current.feels_like}</p>
          <p>Humidity: {cordData.current.humidity}%</p>
          <p>Pressure: {cordData.current.pressure}pha</p>
          <p>{new Date(cordData.current.sunset * 1e3).toLocaleTimeString()}</p>
          <p>{new Date(cordData.current.sunrise * 1e3).toLocaleTimeString()}</p>

          {cordData.daily.map((e) => (
            <div key={e.feels_like.day}>
              <p>Min: {e.temp.min}°C</p>
              <p>Max: {e.temp.max}°C</p>
              <p>Status: {e.weather[0]?.main}</p>
              <p>Day: {e.dt}</p>
              <img
                src={`https://openweathermap.org/img/wn/${e?.weather[0]?.icon}@2x.png`}
                alt=""
              />
            </div>
          ))}
        </>
      ) : (
        "Not Found"
      )}
    </>
  );
};

export default Weather;
