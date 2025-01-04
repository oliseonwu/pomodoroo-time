"use client";
const getGlobalSeconds = () => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - startOfDay.getTime()) / 1000);
};

// Send updates every second
setInterval(() => {
  postMessage({
    type: "tick",
    seconds: getGlobalSeconds(),
  });
}, 1000);

// Initial time on worker start
postMessage({
  type: "tick",
  seconds: getGlobalSeconds(),
});
