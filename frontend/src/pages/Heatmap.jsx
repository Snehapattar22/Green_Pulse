import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { getGlobalLiveData } from "../services/api";
import "../styles/AppPages.css";

function MapFocus({ city }) {
  const map = useMap();

  useEffect(() => {
    if (!city?.lat || !city?.lon) {
      return;
    }
    map.flyTo([Number(city.lat), Number(city.lon)], Math.max(map.getZoom(), 3), {
      duration: 0.9,
    });
  }, [city, map]);

  return null;
}

function Heatmap() {
  const [globalLive, setGlobalLive] = useState(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const response = await getGlobalLiveData();
        const live = response.data;
        setGlobalLive(live);
        const defaultCity = live?.cities?.[0]?.city ?? "";
        setSelectedCity((prev) => prev || defaultCity);
        setLastUpdated(new Date().toLocaleString());
      } catch (error) {
        console.log("Unable to load global heatmap:", error);
      }
    };

    fetchHeatmap();
    const interval = setInterval(fetchHeatmap, 60000);
    return () => clearInterval(interval);
  }, []);

  const cityData = useMemo(() => globalLive?.cities ?? [], [globalLive]);

  const activeCity = useMemo(
    () => cityData.find((item) => item.city === selectedCity) ?? cityData[0],
    [cityData, selectedCity]
  );

  const toneForAqi = (aqi) => {
    const value = Number(aqi) || 0;
    if (value <= 50) {
      return "good";
    }
    if (value <= 100) {
      return "warn";
    }
    return "high";
  };

  const colorForAqi = (aqi) => {
    const tone = toneForAqi(aqi);
    if (tone === "good") {
      return "#5ef0b8";
    }
    if (tone === "warn") {
      return "#ffc867";
    }
    return "#ff7f7f";
  };

  const markerRadius = (city) => {
    const aqi = Number(city.aqi_us) || 0;
    return Math.max(7, Math.min(16, 7 + aqi * 0.05));
  };

  return (
    <section className="module-page heatmap-page">
      <div className="module-hero">
        <h1>Global Environmental Heatmap</h1>
        <p>
          Dynamic real-world hotspots with AQI, PM2.5, and CO2 across {cityData.length || 0} places.
        </p>
      </div>

      <div className="heatmap-layout">
        <article className="module-card heatmap-map-card">
          <div className="heatmap-meta">
            <span>Live map</span>
            <small>Updated: {lastUpdated || "--"}</small>
          </div>

          <div className="leaflet-world-map">
            <MapContainer
              center={[20, 10]}
              zoom={2}
              minZoom={2}
              maxZoom={6}
              worldCopyJump
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFocus city={activeCity} />
            {cityData.map((city) => (
              <CircleMarker
                key={`${city.city}-${city.country}`}
                center={[Number(city.lat), Number(city.lon)]}
                radius={markerRadius(city)}
                pathOptions={{
                  color: selectedCity === city.city ? "#ffffff" : colorForAqi(city.aqi_us),
                  fillColor: colorForAqi(city.aqi_us),
                  fillOpacity: 0.78,
                  weight: selectedCity === city.city ? 2.5 : 1.3,
                }}
                eventHandlers={{ click: () => setSelectedCity(city.city) }}
              >
                <Popup>
                  <strong>{city.city}, {city.country}</strong>
                  <br />
                  AQI: {city.aqi_us}
                  <br />
                  CO2: {city.co2_estimate_ppm} ppm
                </Popup>
              </CircleMarker>
            ))}
            </MapContainer>
          </div>
        </article>

        <article className="module-card heatmap-detail-card">
          <h3>{activeCity?.city ?? "Select a city"}</h3>
          <ul className="simple-list">
            <li>AQI (US): {activeCity?.aqi_us ?? "--"}</li>
            <li>PM2.5: {activeCity?.pm2_5 ?? "--"} ug/m3</li>
            <li>CO: {activeCity?.co ?? "--"}</li>
            <li>CO2: {activeCity?.co2_estimate_ppm ?? "--"} ppm</li>
            <li>Country: {activeCity?.country ?? "--"}</li>
          </ul>
          <div className="aqi-scale">
            <span>Good</span>
            <span>Moderate</span>
            <span>High</span>
          </div>
          <div className="aqi-track">
            <span
              style={{ width: `${Math.min(100, (Number(activeCity?.aqi_us) || 0) / 2)}%` }}
              className={toneForAqi(activeCity?.aqi_us)}
            />
          </div>
        </article>
      </div>

      <article className="module-card heatmap-places-card">
        <h3>Tracked Places and CO2</h3>
        <div className="heatmap-place-grid">
          {cityData.map((city) => (
            <button
              type="button"
              className={`heatmap-place-item${selectedCity === city.city ? " active" : ""}`}
              key={`${city.city}-${city.country}`}
              onClick={() => setSelectedCity(city.city)}
            >
              <strong>{city.city}, {city.country}</strong>
              <span>AQI: {city.aqi_us}</span>
              <span>CO2: {city.co2_estimate_ppm} ppm</span>
            </button>
          ))}
        </div>
      </article>
    </section>
  );
}

export default Heatmap;
