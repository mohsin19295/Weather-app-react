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
    // navigator.geolocation.getCurrentPosition((lan) => {
    //   //   console.log(success);
    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lan.lat}&lon=${lan.lon}&units=metric&exclude=hourly,minutely&appid=${weatherAPI.key}`
    )
      .then((res) => res.json())
      .then((res) => {
        // console.log(res);
        //   console.log(res.daily.map((e)=> e.feels_like.day));
        setCordData(res);
      })
      .catch((error) => {
        console.log(error);
      });
    // });
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
        // console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

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
          // onKeyPress={(e) => handlePressKey(e)}
        />
        <button>click</button>
      </form>

      {lan !== undefined ? (
        <h1>
          {lan.lon} {lan.lat}
        </h1>
      ) : (
        ""
      )}

      {data.main !== undefined ? (
        <>
          <h1>
            {data.name}, {data.sys?.country}
          </h1>
          {/* <p>{Math.floor(data.main?.temp) - (273.15).toFixed()}°C</p> */}
        </>
      ) : (
        ""
      )}

      {cordData.daily !== undefined ? (
        <>
          <div key={cordData.current.feels_like}>
            <p>Temp: {cordData.current.feels_like}</p>
            {/* <img
              src={`https://openweathermap.org/img/wn/${cordData.current?.weather[0]?.icon}@2x.png`}
              alt=""
            />
            <p>
              Sunrise:{" "}
              {new Date(cordData.current.sunrise * 1e3).toLocaleTimeString()}
            </p>
            <p>
              Sunset:{" "}
              {new Date(cordData.current.sunset * 1e3).toLocaleTimeString()}
            </p> */}
            <p>Humidity: {cordData.current.humidity}%</p>
            <p>Pressure: {cordData.current.pressure}pha</p>
          </div>

          {cordData.daily.map((e) => (
            <div key={e.feels_like.day}>
              <p>Min: {e.temp.min}°C</p>
              <p>Max: {e.temp.max}°C</p>
              {/* <p>Status: {e.weather[0]?.main}</p>
              <p>Day: {displayDate(e.dt)}</p>
              <img
                src={`https://openweathermap.org/img/wn/${e?.weather[0]?.icon}@2x.png`}
                alt=""
              /> */}
            </div>
          ))}
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default Weather;
