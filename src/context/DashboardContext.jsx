import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchAstronauts,
  fetchIssPosition,
  fetchNearestPlace,
} from "../services/issService";
import { fetchNews } from "../services/newsService";
import { calculateSpeedKmh } from "../utils/haversine";
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
    setIss((current) => ({ ...current, loading: true, error: "" }));

    try {
      const point = await fetchIssPosition();

      setIss((current) => {
        const previousPoint = current.current;
        const speed = previousPoint
          ? calculateSpeedKmh(previousPoint, point)
          : 27600; // Default ISS orbital speed
        const path = [...current.path, point].slice(-15);
        const speedTrend = [
          ...current.speedTrend,
          {
            time: new Date(point.timestamp * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            speed: Math.round(speed),
          },
        ].slice(-30);

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
    setAstronauts((current) => ({ ...current, loading: true, error: "" }));

    try {
      const people = await fetchAstronauts();
      setAstronauts({ people, loading: false, error: "" });
      if (notify) toast.success("People in space refreshed.");
    } catch {
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

    fetchNews()
      .then((result) => {
        if (!active) return;
        console.log('News loaded:', result.articles.length, 'articles');
        setNews({
          articles: result.articles,
          loading: false,
          fromCache: result.fromCache,
          error: "",
        });
      })
      .catch((error) => {
        if (!active) return;
        console.error('News loading error:', error);
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
