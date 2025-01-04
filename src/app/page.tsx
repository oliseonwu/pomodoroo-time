"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import ProgressBar from "./components/ProgressBar";
import useSound from "use-sound";
import Ding from "../../public/sounds/ding.mp3";
import ClockTicking from "../../public/sounds/clockTicking.mp3";
import ThemeToggle from "./components/ThemeToggle";

const WORK_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK = 5 * 60; // 5 minutes
const LONG_BREAK = 15 * 60; // 15 minute

// const WORK_DURATION = 20; // 25 minutes
// const SHORT_BREAK = 15; // 5 minutes
// const LONG_BREAK = 15; // 15 minute

const WORK_BREAK_PAIR = WORK_DURATION + SHORT_BREAK; // 30 minutes
const TOTAL_CYCLE = WORK_BREAK_PAIR * 3 + WORK_DURATION + LONG_BREAK;

export default function PomodoroTimer() {
  const [cycle, setCycle] = useState(1); // Keep track of the current cycle
  const [isWorking, setIsWorking] = useState(true); // Keep track of whether the user is working or on a break
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION); // Keep track of the time left in the current cycle
  const [progress, setProgress] = useState(0);
  const [sound, setSound] = useState("");

  const [dingSound] = useSound(Ding, {
    volume: 0.03,
  });

  const [clockTicking] = useSound(ClockTicking, {
    volume: 0.15,
  });

  useLayoutEffect(() => {
    // Create worker
    const worker = new Worker(new URL("../worker.ts", import.meta.url));

    // Handle messages from worker
    worker.onmessage = (event) => {
      if (event.data.type === "tick") {
        runPomodoro(event.data.seconds);
      }
    };

    // Cleanup
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    selectSound();
  }, [sound]);

  const runPomodoro = (currentGlobalSeconds: number) => {
    const tcPosition = currentGlobalSeconds % TOTAL_CYCLE; // Time cycle position. The position within the TOTAL_CYCLE from 0 to 1799
    const currentCycle = Math.min(
      Math.floor(tcPosition / WORK_BREAK_PAIR) + 1,
      4
    );

    // A cycle is 30 minutes long. Except 4th cycle which is 45 minutes long.
    const timeInCurrentCycle =
      currentCycle === 4
        ? tcPosition - WORK_BREAK_PAIR * 3 // Offset for 4th cycle
        : tcPosition % WORK_BREAK_PAIR;

    const working = timeInCurrentCycle < WORK_DURATION;

    // A period is work or break.
    const timeInPeriod = working
      ? timeInCurrentCycle
      : timeInCurrentCycle - WORK_DURATION;

    // select period duration
    const periodDuration = working
      ? WORK_DURATION
      : currentCycle === 4
      ? LONG_BREAK
      : SHORT_BREAK;

    const remainingTimeInPeriod = periodDuration - timeInPeriod;

    if (remainingTimeInPeriod <= 9) {
      setSoundHandler(remainingTimeInPeriod, currentCycle);
    }

    setCycle(currentCycle);
    setIsWorking(working);
    setTimeLeft(remainingTimeInPeriod);
    setProgress(timeInPeriod / periodDuration);
  };

  const setSoundHandler = (remaining: number, currentCycle: number) => {
    if (remaining <= 1 && currentCycle != 4) {
      setSound("ding");
    }
    if (remaining <= 1 && currentCycle === 4) {
      setSound("dingDing");
    }
    if (remaining === 9) {
      setSound("clockTicking");
    }
  };

  const selectSound = () => {
    switch (sound) {
      case "ding":
        dingSound();
        break;
      case "clockTicking":
        clockTicking();
        break;
      case "dingDing":
        dingSound();
        setTimeout(() => {
          dingSound();
        }, 300);
        break;
    }
    setSound("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <ThemeToggle />
      <div className="text-4xl font-light mb-4 text-gray-600 dark:text-gray-300">
        {isWorking ? "Work Mode" : "Break"}
      </div>
      <div className="text-2xl font-light mb-8 text-gray-600 dark:text-gray-300">
        Cycle: {cycle}/4
      </div>
      <ProgressBar progress={progress} />
      <div className="text-xl font-light mt-8 text-gray-600 dark:text-gray-300">
        {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </div>
    </div>
  );
}
