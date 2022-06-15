import React, { useState } from "react";
import "./weather.css";

const Weather = () => {
  const [data, setData] = useState([]);
  const [cordData, setCordData] = useState([]);
  const [query, setQuery] = useState("");
  const [lan, setLan] = useState({});
  const [active, setActive] = useState(0);

  let weatherAPI = {
    key: "3347991dc1e65cace7187b19619dcbfc",
    baseUrl: "https://api.openweathermap.org/data/2.5/weather?",
  };

  // Getting Onecall Data
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

  // For Lattitude and Longitude
  function gettingLanLon() {
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
  const handleChange = (e) => {
    e.preventDefault();
    gettingOneCallData();
    gettingDetails();
    gettingLanLon();
    console.log("click");
  };

  return (
    <>
      <main>
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
            {/* <h1>{lan.lon} {lan.lat}</h1> */}
            <section className="top">
              {/* <h1>
            {data.name + ","} {data.sys?.country} 
          </h1> */}
              {cordData.daily.map((e, i) => (
                // onClick={this.handleOnClick.bind(this, index, this.props)}
                // className = {this.state.activeIndex === index ? "active" : "unactive"}
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
                    <p>{Math.round(e.temp.min)}°</p>
                    <p>{Math.round(e.temp.max)}°</p>
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
                <strong>{Math.round(cordData.current.feels_like)}°C</strong>
                <div className="current-img">
                  <img
                    src={`https://openweathermap.org/img/wn/${cordData.current?.weather[0]?.icon}@2x.png`}
                    alt=""
                  />
                </div>
              </div>

              <div>
                <h1>Graph</h1>
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

              <div>
                <p>Graph</p>
              </div>
            </section>
          </>
        ) : (
          "Not Found"
        )}
      </main>
    </>
  );
};

export default Weather;
