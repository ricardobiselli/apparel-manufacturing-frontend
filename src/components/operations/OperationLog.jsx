import { Button, Modal } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { AddOperationLog, AddMachineExceptionLog } from "./endpoints/Endpoints";
import { useRef, useState } from "react";

const LONG_PRESS_DURATION = 1000;

const clickSound = new Audio("/sounds/click.mp3");

const OperationLog = () => {
  const { machineSessionId } = useParams();
  const navigate = useNavigate();
  const pressTimer = useRef(null);
  const flashTimer = useRef(null);
  const isLongPress = useRef(false);
  const isSubmitting = useRef(false);

  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [confirmException, setConfirmException] = useState(null); // 'EndOfDay' or 'EndOfProduction' or null
  const [productionStarted, setProductionStarted] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState(false);

  // ---------- NORMAL OPERATION ----------
  const handleNormalOperation = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    try {
      if (!machineSessionId) return;

      clickSound.currentTime = 0;
      clickSound.play();

      await AddOperationLog(Number(machineSessionId));
      setProductionStarted(true);
      setFlashSuccess(true);
      if (flashTimer.current) {
        clearTimeout(flashTimer.current);
      }
      flashTimer.current = setTimeout(() => {
        setFlashSuccess(false);
        flashTimer.current = null;
      }, 250);
    } catch (err) {
      console.error("Error recording operation log:", err);
    } finally {
      isSubmitting.current = false;
    }
  };

  // ---------- EXCEPTION ----------
  const submitException = async (exceptionType) => {
    try {
      if (!machineSessionId) return;
      await AddMachineExceptionLog(
        Number(machineSessionId),
        exceptionType
      );
      setShowExceptionModal(false);
      setConfirmException(null);

      if (exceptionType === "EndOfDay" || exceptionType === "EndOfProduction") {
        navigate("/MachineSelectScreen");
      }
    } catch (err) {
      console.error("Error recording exception log:", err);
    }
  };

  // ---------- PRESS LOGIC ----------
  const startPress = () => {
    isLongPress.current = false;

    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowExceptionModal(true);
    }, LONG_PRESS_DURATION);
  };

  const endPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    if (!isLongPress.current) {
      if (!isSubmitting.current) {
        handleNormalOperation();
      }
    }
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    isLongPress.current = false;
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', padding: '1rem' }}
    >
      <Button
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        variant={flashSuccess ? "success" : "primary"}
        size="lg"
        style={{
          borderRadius: 0,
          width: '100%',
          maxWidth: 680,
          height: 'calc(100vh - 2rem)',
          minHeight: 240,
          padding: '1rem',
          fontSize: '1.5rem',
          textTransform: 'uppercase',
          transition: 'background-color 120ms ease, color 120ms ease',
        }}
        className="w-100"
      >
        {productionStarted ? "Log operation" : "tap to start!"}
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
