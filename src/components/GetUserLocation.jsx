import { useState } from "react";

const GetUserLocation = () => {
  const [location, setLocation] = useState({
    status: "idle",
    coordinates: { lon: "", lat: "" },
  });

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocation({
        status: "error",
        coordinates: { lon: "", lat: "" },
        error: { message: "Location is not supported in this browser." },
      });
      return;
    }

    setLocation((prev) => ({
      ...prev,
      status: "pending",
      error: undefined,
    }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          status: "ready",
          coordinates: {
            lon: pos.coords.longitude,
            lat: pos.coords.latitude,
          },
        });
      },
      (error) => {
        setLocation({
          status: "error",
          coordinates: { lon: "", lat: "" },
          error,
        });
      }
    );
  };

  return { location, requestLocation };
};

export default GetUserLocation;
