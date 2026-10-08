import { Button, Modal } from "react-bootstrap";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AddOperationLog, AddMachineExceptionLog } from "./endpoints/Endpoints";
import { UpdateMachineSession } from "../machines/endpoints/Endpoints";
import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../services/authentication/AuthContext";

// Three presses within this gap open exception reporting instead of recording operations.
const EXCEPTION_TAP_INTERVAL_MS = 500;
// Gives the operator time to finish the gesture before exception choices appear.
const EXCEPTION_MODAL_DELAY_MS = 600;
// These values control the informal recent-pace feedback shown to operators.
const RECENT_PACE_INTERVAL_COUNT = 5;
const ON_PACE_EFFICIENCY_THRESHOLD = 80;
const BEHIND_EFFICIENCY_THRESHOLD = 50;
const PAUSE_FEEDBACK_EXCEPTION_TYPES = [
  "Break",
  "FaultyPiece",
  "NeedleBreak",
  "ThreadBreak",
  "WaitingForBundleOrSupplies",
];

const clickSound = new Audio("/sounds/click.mp3");

const OperationLog = () => {
  const { machineSessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const operationName = location.state?.operationName ?? location.state?.OperationName;
  const { user } = useContext(AuthContext);
  const pressTimer = useRef(null);
  const exceptionModalTimer = useRef(null);
  const flashTimer = useRef(null);
  const isSubmitting = useRef(false);
  const pendingOperationTaps = useRef([]);
  const tapFlushPromise = useRef(null);
  // Pace feedback is approximate and frontend-only; tune its window and thresholds here.
  const baseTimeSeconds = useRef(null);
  const lastSuccessfulPressAt = useRef(null);
  const recentIntervalsSeconds = useRef([]);

  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [confirmException, setConfirmException] = useState(null); // 'EndOfDay' or 'EndOfProduction' or null
  const [productionStarted, setProductionStarted] = useState(false);
  const [flashPace, setFlashPace] = useState(null);
  const [paceFeedback, setPaceFeedback] = useState(null);
  const [paceUnavailable, setPaceUnavailable] = useState(false);
  const [awaitingSuccessfulOperation, setAwaitingSuccessfulOperation] = useState(false);

  // Use the assigned session snapshot passed by MachineSelectScreen; no database request is needed here.
  useEffect(() => {
    const baseTime = Number(location.state?.baseTime ?? location.state?.BaseTime);
    baseTimeSeconds.current = Number.isFinite(baseTime) && baseTime > 0 ? baseTime : null;
    setPaceUnavailable(baseTimeSeconds.current === null);

    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
      if (exceptionModalTimer.current) clearTimeout(exceptionModalTimer.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [location.state]);

  // Compare the average recent click interval against BaseTime and choose a rough pace cue.
  const updatePaceFeedback = (intervals) => {
    const averageInterval = intervals.reduce((total, interval) => total + interval, 0) / intervals.length;
    const efficiency = (baseTimeSeconds.current / averageInterval) * 100;
    let feedback;

    if (efficiency >= ON_PACE_EFFICIENCY_THRESHOLD) {
      feedback = { label: "On pace", efficiency, color: "green" };
    } else if (efficiency >= BEHIND_EFFICIENCY_THRESHOLD) {
      feedback = { label: "A bit behind", efficiency, color: "yellow" };
    } else {
      feedback = { label: "Well behind", efficiency, color: "orange" };
    }

    setPaceFeedback(feedback);
    return feedback;
  };

  // ---------- NORMAL OPERATION ----------
  const handleNormalOperation = async (currentPressAt) => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    try {
      if (!machineSessionId) return;
      let flashColor = paceFeedback?.color ?? "green";

      clickSound.currentTime = 0;
      clickSound.play();

      if (!productionStarted) {
        if (!user?.userId) {
          alert("Unable to identify the logged-in operator. Please log in again.");
          return;
        }

        await UpdateMachineSession(Number(machineSessionId), {
          status: "InProgress",
          UserId: Number(user.userId),
        });
      }
      await AddOperationLog(Number(machineSessionId));
      setProductionStarted(true);
      setAwaitingSuccessfulOperation(false);
      if (baseTimeSeconds.current !== null) {
        if (lastSuccessfulPressAt.current !== null) {
          const intervalSeconds = (currentPressAt - lastSuccessfulPressAt.current) / 1000;
          if (intervalSeconds > 0) {
            recentIntervalsSeconds.current = [
              ...recentIntervalsSeconds.current,
              intervalSeconds,
            ].slice(-RECENT_PACE_INTERVAL_COUNT);
            flashColor = updatePaceFeedback(recentIntervalsSeconds.current).color;
          }
        }
        lastSuccessfulPressAt.current = currentPressAt;
      }

      setFlashPace(flashColor);
      if (flashTimer.current) {
        clearTimeout(flashTimer.current);
      }
      flashTimer.current = setTimeout(() => {
        setFlashPace(null);
        flashTimer.current = null;
      }, 400);
    } catch (err) {
      console.error("Error recording operation log:", err);
    } finally {
      isSubmitting.current = false;
    }
  };

  // Briefly buffer normal taps so a three-tap exception gesture won't create operation logs.
  const flushPendingOperationTaps = async () => {
    if (tapFlushPromise.current) {
      await tapFlushPromise.current;
      if (pendingOperationTaps.current.length > 0) {
        await flushPendingOperationTaps();
      }
      return;
    }

    const pressTimes = pendingOperationTaps.current.splice(0);
    if (pressTimes.length === 0) return;

    tapFlushPromise.current = (async () => {
      for (const pressTime of pressTimes) {
        await handleNormalOperation(pressTime);
      }
    })();

    try {
      await tapFlushPromise.current;
    } finally {
      tapFlushPromise.current = null;
    }
  };

  // Resolve a single/double tap as operation logs, or consume three quick taps as an exception gesture.
  const handleOperationTap = () => {
    if (showExceptionModal || exceptionModalTimer.current) return;

    const tapTime = performance.now();
    const previousTapTime = pendingOperationTaps.current[pendingOperationTaps.current.length - 1];

    if (
      previousTapTime !== undefined &&
      tapTime - previousTapTime > EXCEPTION_TAP_INTERVAL_MS
    ) {
      if (pressTimer.current) clearTimeout(pressTimer.current);
      void flushPendingOperationTaps();
    }

    pendingOperationTaps.current.push(tapTime);

    if (pendingOperationTaps.current.length === 3) {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
      pendingOperationTaps.current = [];
      exceptionModalTimer.current = setTimeout(() => {
        exceptionModalTimer.current = null;
        setShowExceptionModal(true);
      }, EXCEPTION_MODAL_DELAY_MS);
      return;
    }

    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      pressTimer.current = null;
      void flushPendingOperationTaps();
    }, EXCEPTION_TAP_INTERVAL_MS);
  };

  // ---------- EXCEPTION ----------
  const submitException = async (exceptionType) => {
    try {
      if (!machineSessionId) return;
      await AddMachineExceptionLog(
        Number(machineSessionId),
        exceptionType
      );
      // Do not count time spent handling an exception as time spent performing an operation.
      lastSuccessfulPressAt.current = null;
      recentIntervalsSeconds.current = [];
      setPaceFeedback(null);
      if (PAUSE_FEEDBACK_EXCEPTION_TYPES.includes(exceptionType)) {
        setAwaitingSuccessfulOperation(true);
        setFlashPace(null);
        if (flashTimer.current) {
          clearTimeout(flashTimer.current);
          flashTimer.current = null;
        }
      }
      setShowExceptionModal(false);
      setConfirmException(null);

      if (exceptionType === "EndOfDay" || exceptionType === "EndOfProduction") {
        navigate("/MachineSelectScreen");
      }
    } catch (err) {
      console.error("Error recording exception log:", err);
    }
  };

  // ---------- TAP GESTURE ----------
  const endPress = () => {
    handleOperationTap();
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: '100vh', padding: '1rem' }}
    >
      <Button
        onPointerUp={endPress}
        variant={awaitingSuccessfulOperation ? "secondary" : flashPace ? "success" : "primary"}
        size="lg"
        style={{
          borderRadius: 0,
          width: '100%',
          maxWidth: 680,
          height: 'calc(100vh - 5rem)',
          minHeight: 240,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          transition: 'background-color 120ms ease, color 120ms ease',
          ...(awaitingSuccessfulOperation && {
            backgroundColor: "#6c757d",
            borderColor: "#6c757d",
            color: "#fff",
          }),
          ...(flashPace && {
            backgroundColor: {
              green: "#198754",
              yellow: "#ffc107",
              orange: "#fd7e14",
            }[flashPace],
            borderColor: {
              green: "#198754",
              yellow: "#ffc107",
              orange: "#fd7e14",
            }[flashPace],
            color: flashPace === "yellow" ? "#212529" : "#fff",
          }),
        }}
        className="w-100"
      >
        <span style={{ fontSize: '1.5rem', textTransform: 'uppercase' }}>
          {productionStarted ? "Log operation" : "tap to start!"}
        </span>
        <span style={{ fontSize: '1.25rem', textTransform: 'none' }}>
          {operationName || "Operation"}
        </span>
        <span
          className="text-center"
          aria-live="polite"
          style={{ fontSize: '1.25rem', textTransform: 'none' }}
        >
          {awaitingSuccessfulOperation ? (
            <span style={{ color: '#f20000' }}>
      Tap after completing your next successful operation
    </span>
          ) : paceFeedback ? (
            <>
              Recent pace: <strong>{paceFeedback.label}</strong>
              <br />
              {Math.round(paceFeedback.efficiency)}% of target
            </>
          ) : paceUnavailable ? (
            "Pace feedback unavailable"
          ) : (
            "Pace feedback starts after a few operations"
          )}
        </span>
        <span style={{ fontSize: '0.9rem', textTransform: 'none' }}>
          Tap 3 times quickly to report an exception
        </span>
      </Button>

      {/* ---------- EXCEPTION MODAL ---------- */}
      <Modal
        show={showExceptionModal}
        onHide={() => setShowExceptionModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Report Exception</Modal.Title>
        </Modal.Header>

        <Modal.Body className="d-grid gap-3">
          <Button
            variant="warning"
            size="lg"
            onClick={() => submitException("FaultyPiece")}
          >
            Faulty piece
          </Button>

          <Button
            variant="danger"
            size="lg"
            onClick={() => submitException("ThreadBreak")}
          >
            Thread Break
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={() => submitException("NeedleBreak")}
          >
            Needle Break
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => submitException("WaitingForBundleOrSupplies")}
          >
            Waiting for Bundle / Supplies
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => submitException("OperationDeferred")}
          >
            Operation deferred
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => submitException("Break")}
          >
            Break
          </Button>

          <Button
            variant="info"
            size="lg"
            onClick={() => setConfirmException("EndOfDay")}
          >
            End of day
          </Button>

          <Button
            variant="dark"
            size="lg"
            onClick={() => setConfirmException("EndOfProduction")}
          >
            End of production
          </Button>
          {/* ---------- CONFIRMATION MODAL ---------- */}
          <Modal
            show={!!confirmException}
            onHide={() => setConfirmException(null)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Exception</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to log the exception: <b>{confirmException === 'EndOfDay' ? 'End of day' : confirmException === 'EndOfProduction' ? 'End of production' : ''}</b>?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setConfirmException(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => { submitException(confirmException); }}>
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>
        </Modal.Body>
      </Modal>
    </div >
  );
};

export default OperationLog;
