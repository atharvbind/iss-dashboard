import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchAstronauts,
  fetchIssPosition,
  fetchNearestPlace,
} from "../services/issService";
import { fetchNews } from "../services/newsService";
import { calculateDistanceKm } from "../utils/haversine";
import { DashboardContext } from "./dashboardContextObject";

export function DashboardProvider({ children }) {
  const [iss, setIss] = useState({
    current: null,
    path: [],
    speed: 0,
    speedTrend: [],
    loading: true,
    locationName: "Locating...",
    error: "",
  });
  const [astronauts, setAstronauts] = useState({
    people: [],
    loading: true,
    error: "",
  });
  const [news, setNews] = useState({
    articles: [],
    loading: true,
    fromCache: false,
    error: "",
  });
  const [selectedCategory, setSelectedCategory] = useState("");

  async function refreshIss({ notify = true } = {}) {
    console.log("🔄 Refreshing ISS data...");
    setIss((current) => ({ ...current, loading: true, error: "" }));

    try {
      const point = await fetchIssPosition();
      console.log("✅ ISS position fetched:", point);

      setIss((current) => {
        const previousPoint = current.current;

        // Compute speed without enforcing a minimum value
        let speed = 0;
        let elapsedHours = null;
        let distanceKm = null;

        if (previousPoint && previousPoint.timestamp && point.timestamp) {
          elapsedHours = (point.timestamp - previousPoint.timestamp) / 3600;
          distanceKm = calculateDistanceKm(previousPoint, point);
          if (elapsedHours > 0) speed = distanceKm / elapsedHours;
        }

        if (!Number.isFinite(speed) || speed <= 0) speed = 0;
        speed = Math.round(speed);

        const path = [...current.path, point].slice(-15);
        const speedTrend = [
          ...current.speedTrend,
          {
            time: new Date(point.timestamp * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            speed,
          },
        ].slice(-30);

        console.log("📊 Speed details:", {
          previousTs: previousPoint?.timestamp,
          currentTs: point.timestamp,
          elapsedHours,
          distanceKm,
          speed,
          trendLen: speedTrend.length,
        });

        return {
          ...current,
          current: point,
          path,
          speed,
          speedTrend,
          loading: false,
          error: "",
        };
      });

      fetchNearestPlace(point)
        .then((locationName) => {
          console.log("📍 Location found:", locationName);
          setIss((current) => ({ ...current, locationName }));
        })
        .catch(() => {
          setIss((current) => ({
            ...current,
            locationName: "Over ocean or remote region",
          }));
        });

      if (notify) toast.success("ISS telemetry refreshed.");
    } catch {
      setIss((current) => ({
        ...current,
        loading: false,
        error: "ISS position feed is unavailable. Try again in a moment.",
      }));
      if (notify) toast.error("ISS position feed is unavailable.");
    }
  }

  async function refreshAstronauts({ notify = true } = {}) {
    console.log("👥 Refreshing astronauts...");
    setAstronauts((current) => ({ ...current, loading: true, error: "" }));

    try {
      const people = await fetchAstronauts();
      console.log("✅ Astronauts fetched:", people.length, "people");
      setAstronauts({ people, loading: false, error: "" });
      if (notify) toast.success("People in space refreshed.");
    } catch (error) {
      console.error("❌ Astronauts refresh failed:", error);
      setAstronauts((current) => ({
        ...current,
        loading: false,
        error: "Astronaut roster could not be loaded.",
      }));
      if (notify) toast.error("Astronaut roster could not be loaded.");
    }
  }

  async function refreshNews(options = {}) {
    setNews((current) => ({ ...current, loading: true, error: "" }));

    try {
      const result = await fetchNews(options);
      setNews({
        articles: result.articles,
        loading: false,
        fromCache: result.fromCache,
        error: "",
      });
      toast.success(
        result.fromCache ? "Loaded cached news." : "News refreshed.",
      );
    } catch (error) {
      setNews({
        articles: [],
        loading: false,
        fromCache: false,
        error: error.message || "GNews request failed. Please retry.",
      });
      toast.error(error.message || "GNews request failed.");
    }
  }

  useEffect(() => {
    let active = true;

    async function loadIss() {
      if (active) await refreshIss({ notify: false });
    }

    loadIss();
    const interval = window.setInterval(loadIss, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAstronauts() {
      if (active) await refreshAstronauts({ notify: false });
    }

    loadAstronauts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    console.log("📰 Loading news...");
    fetchNews()
      .then((result) => {
        if (!active) return;
        console.log(
          "✅ News loaded:",
          result.articles.length,
          "articles, fromCache:",
          result.fromCache,
        );
        setNews({
          articles: result.articles,
          loading: false,
          fromCache: result.fromCache,
          error: "",
        });
      })
      .catch((error) => {
        if (!active) return;
        console.error("❌ News loading failed:", error);
        setNews({
          articles: [],
          loading: false,
          fromCache: false,
          error: error.message || "GNews request failed. Please retry.",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      iss,
      astronauts,
      news,
      selectedCategory,
      refreshIss,
      refreshAstronauts,
      refreshNews,
      setSelectedCategory,
    }),
    [iss, astronauts, news, selectedCategory],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
