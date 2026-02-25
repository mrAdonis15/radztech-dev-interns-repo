import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
} from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import LanguageIcon from "@material-ui/icons/Language";
import {
  getMachineTimezone,
  getCurrentTimeForTimezone,
  getTimezoneOffset,
  formatInTimezone,
  getGeolocationCoords,
  reverseGeocode,
} from "./timelogUtils";
import { fetchGitHubActivity } from "./githubActivityUtils";
import "./Timelogstest.css";

export default function Timelogstest() {
  const [timezone, setTimezone] = useState("");
  const [location, setLocation] = useState("");
  const [offset, setOffset] = useState("");
  const [now, setNow] = useState(null);
  const [coords, setCoords] = useState(null);
  const PER_PAGE = 10;
  const [pushes, setPushes] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);
  const [githubError, setGithubError] = useState(null);
  const [pushPage, setPushPage] = useState(1);
  const [prPage, setPrPage] = useState(1);

  useEffect(() => {
    const tz = getMachineTimezone();
    setTimezone(tz);
    setOffset(getTimezoneOffset(tz));

    (async () => {
      try {
        const c = await getGeolocationCoords();
        if (c) {
          setCoords(c);
          try {
            const loc = await reverseGeocode(c.lat, c.lng);
            setLocation(loc || `${c.lat.toFixed(2)}°, ${c.lng.toFixed(2)}°`);
          } catch {
            setLocation(`${c.lat.toFixed(2)}°, ${c.lng.toFixed(2)}°`);
          }
        } else {
          setLocation("");
        }
      } catch {
        setLocation("");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { pushes: p, pullRequests: pr, error } = await fetchGitHubActivity();
        setPushes(p || []);
        setPullRequests(pr || []);
        setGithubError(error || null);
        setPushPage(1);
        setPrPage(1);
      } catch (e) {
        setPushes([]);
        setPullRequests([]);
        setGithubError(e.message || "Failed to load");
      }
    })();
  }, []);

  const pushPages = Math.max(1, Math.ceil(pushes.length / PER_PAGE));
  const prPages = Math.max(1, Math.ceil(pullRequests.length / PER_PAGE));
  const pushesOnPage = pushes.slice((pushPage - 1) * PER_PAGE, pushPage * PER_PAGE);
  const prsOnPage = pullRequests.slice((prPage - 1) * PER_PAGE, prPage * PER_PAGE);

  useEffect(() => {
    if (!timezone) return;
    const tick = () => setNow(getCurrentTimeForTimezone(timezone));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  return (
    <Box className="timelogs-root">
      <Paper className="timelogs-panel" elevation={0}>
        <div className="timelogs-header">
          <div className="timelogs-header-left">
            <AccessTimeIcon style={{ fontSize: 28 }} />
            <Typography className="timelogs-title" variant="h6">
              Timelogs Demo
            </Typography>
          </div>
        </div>

        <div className="timelogs-info-bar">
          <span className="timelogs-info-item">
            <LanguageIcon fontSize="small" style={{ color: "#f57c00" }} />
            <span className="timelogs-info-label">Timezone:</span>
            {timezone} {offset && `(${offset})`}
          </span>
          <span className="timelogs-info-item">
            <LocationOnIcon fontSize="small" style={{ color: "#f57c00" }} />
            <span className="timelogs-info-label">Location:</span>
            {location || "Allow location access for accurate location"}
            {coords && location && location.includes("°") === false && ` • ${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`}
          </span>
          {now && (
            <span className="timelogs-info-item timelogs-live-clock">
              <AccessTimeIcon fontSize="small" />
              {now.time} ({now.date})
            </span>
          )}
        </div>

        <div className="timelogs-body">
          <Typography className="timelogs-section-title">
            GitHub Activity (from repo)
          </Typography>
          {githubError && (
            <div className="timelogs-github-error">
              Could not load: {githubError}
            </div>
          )}
          {pushes.length > 0 && (
            <>
              <Typography variant="subtitle2" style={{ marginBottom: 8, color: "#666" }}>
                Push — recent commits
              </Typography>
              {pushesOnPage.map((c) => (
                <div key={c.sha} className="timelogs-github-entry">
                  <div className="timelogs-github-header">
                    <Avatar
                      className="timelogs-github-avatar"
                      src={c.avatarUrl || undefined}
                    >
                      {!c.avatarUrl && (c.author || "?")[0].toUpperCase()}
                    </Avatar>
                    <span className="timelogs-github-author" title={c.author}>
                      {c.author}
                    </span>
                    <span className="timelogs-github-time">
                      {c.date && formatInTimezone(new Date(c.date), timezone, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="timelogs-github-card">
                    <div className="timelogs-github-action">Push</div>
                    <div className="timelogs-github-detail">{c.message}</div>
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="timelogs-github-more"
                      >
                        MORE
                      </a>
                    )}
                  </div>
                </div>
              ))}
              <div className="timelogs-pagination">
                <Button
                  size="small"
                  disabled={pushPage <= 1}
                  onClick={() => setPushPage((p) => p - 1)}
                  startIcon={<ChevronLeftIcon />}
                >
                  Previous
                </Button>
                <span className="timelogs-pagination-label">
                  Page {pushPage} of {pushPages}
                </span>
                <Button
                  size="small"
                  disabled={pushPage >= pushPages}
                  onClick={() => setPushPage((p) => p + 1)}
                  endIcon={<ChevronRightIcon />}
                >
                  Next
                </Button>
              </div>
            </>
          )}
          {pullRequests.length > 0 && (
            <>
              <Typography variant="subtitle2" style={{ marginBottom: 8, marginTop: 16, color: "#666" }}>
                Pull Requests
              </Typography>
              {prsOnPage.map((pr) => (
                <div key={pr.number} className="timelogs-github-entry">
                  <div className="timelogs-github-header">
                    <Avatar
                      className="timelogs-github-avatar"
                      src={pr.avatarUrl || undefined}
                    >
                      {!pr.avatarUrl && (pr.author || "?")[0].toUpperCase()}
                    </Avatar>
                    <span className="timelogs-github-author">{pr.author}</span>
                    <span className="timelogs-github-time">
                      {pr.date && formatInTimezone(new Date(pr.date), timezone, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="timelogs-github-card">
                    <div className="timelogs-github-action">
                      PR {pr.state}
                    </div>
                    <div className="timelogs-github-detail">
                      #{pr.number} {pr.title}
                    </div>
                    {pr.url && (
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="timelogs-github-more"
                      >
                        MORE
                      </a>
                    )}
                  </div>
                </div>
              ))}
              <div className="timelogs-pagination">
                <Button
                  size="small"
                  disabled={prPage <= 1}
                  onClick={() => setPrPage((p) => p - 1)}
                  startIcon={<ChevronLeftIcon />}
                >
                  Previous
                </Button>
                <span className="timelogs-pagination-label">
                  Page {prPage} of {prPages}
                </span>
                <Button
                  size="small"
                  disabled={prPage >= prPages}
                  onClick={() => setPrPage((p) => p + 1)}
                  endIcon={<ChevronRightIcon />}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </Paper>
    </Box>
  );
}
