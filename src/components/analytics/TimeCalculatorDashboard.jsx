import { useEffect, useState } from "react";
import { Form, Table, Badge, Button, Alert, Spinner } from "react-bootstrap";
import UseOrders from "../orders/hooks/UseOrders";
import { useNavigate } from "react-router-dom";
import { GetProductionMetrics } from "./endpoints/Endpoints";

const EMPTY_SESSIONS = [];

const durationToSeconds = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "string" || !value.trim()) return null;

    const duration = value.trim();
    if (/^\d+(\.\d+)?$/.test(duration)) return Number(duration);

    const hasDays = /^\d+\.\d{2}:/.test(duration);
    const [dayPart, rawTime] = hasDays ? duration.split(".", 2) : [null, duration];
    const timePart = rawTime.split(".", 2)[0];
    const parts = timePart.split(":");
    if (parts.length !== 3 || parts.some((part) => !Number.isFinite(Number(part)))) return null;

    const timeSeconds = Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
    return (dayPart ? Number(dayPart) * 86400 : 0) + timeSeconds;
};

const metricNumber = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

const formatMinutes = (seconds) => {
    if (!Number.isFinite(seconds)) return "—";
    const totalMinutes = Math.round(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours ? `${hours}h ${minutes}m` : `${minutes} min`;
};

const formatPercent = (value) =>
    Number.isFinite(value) ? `${value.toFixed(1)}%` : "—";

const getSegmentCategory = (type) => {
    const normalizedType = String(type ?? "").replace(/[^a-z]/gi, "").toLowerCase();
    if (["break", "faultypiece", "threadbreak", "needlebreak", "waitingforbundleorsupplies", "machineissue", "qualityissue", "downtime"].includes(normalizedType)) {
        return "downtime";
    }
    if (["productive", "work", "operation", "production"].includes(normalizedType)) {
        return "productive";
    }
    return null;
};

const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const buildDailyProduction = (sessionRows) => {
    const dailyTotals = new Map();
    let unclassifiedSegmentCount = 0;

    sessionRows.forEach(({ metric }) => {
        metric?.segments?.forEach((segment) => {
            const category = getSegmentCategory(segment.type);
            const start = segment.start ? new Date(segment.start) : null;
            const duration = durationToSeconds(segment.duration);
            const suppliedEnd = segment.end ? new Date(segment.end) : null;
            const end = suppliedEnd && !Number.isNaN(suppliedEnd.getTime())
                ? suppliedEnd
                : start && duration !== null
                    ? new Date(start.getTime() + duration * 1000)
                    : null;

            if (!category || !start || Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime()) || end <= start) {
                if (!category) unclassifiedSegmentCount += 1;
                return;
            }

            let cursor = new Date(start);
            while (cursor < end) {
                const nextDay = new Date(cursor);
                nextDay.setHours(24, 0, 0, 0);
                const sliceEnd = nextDay < end ? nextDay : end;
                const dateKey = getLocalDateKey(cursor);
                const dayTotals = dailyTotals.get(dateKey) ?? { productiveSeconds: 0, downtimeSeconds: 0 };
                dayTotals[category === "productive" ? "productiveSeconds" : "downtimeSeconds"] += (sliceEnd - cursor) / 1000;
                dailyTotals.set(dateKey, dayTotals);
                cursor = sliceEnd;
            }
        });
    });

    return {
        days: [...dailyTotals.entries()].sort(([dateA], [dateB]) => dateA.localeCompare(dateB)),
        unclassifiedSegmentCount,
    };
};

const TimeCalculatorDashboard = () => {
    const [currentOrderId, setCurrentOrderId] = useState("");
    const [metricsBySession, setMetricsBySession] = useState({});
    const [loadingMetrics, setLoadingMetrics] = useState(false);
    const { orders } = UseOrders();
    const navigate = useNavigate();

    const selectedOrder = orders?.find(
        (o) => o.orderId === Number(currentOrderId)
    );
    const sessions = selectedOrder?.machineSessions ?? EMPTY_SESSIONS;

    useEffect(() => {
        let isCurrent = true;
        setMetricsBySession({});

        if (!sessions.length) {
            setLoadingMetrics(false);
            return () => { isCurrent = false; };
        }

        setLoadingMetrics(true);
        Promise.all(
            sessions.map(async (session) => {
                try {
                    const metric = await GetProductionMetrics(session.machineSessionId);
                    return [session.machineSessionId, { metric, error: false }];
                } catch (error) {
                    console.error(`Error loading metrics for session ${session.machineSessionId}:`, error);
                    return [session.machineSessionId, { metric: null, error: true }];
                }
            })
        ).then((results) => {
            if (isCurrent) setMetricsBySession(Object.fromEntries(results));
        }).finally(() => {
            if (isCurrent) setLoadingMetrics(false);
        });

        return () => { isCurrent = false; };
    }, [sessions]);

    const sessionRows = sessions.map((session) => ({
        session,
        ...metricsBySession[session.machineSessionId],
    }));
    const dailyProduction = buildDailyProduction(sessionRows);

    const orderTotals = sessionRows.reduce((totals, { metric }) => {
        if (!metric) return totals;

        const productiveSeconds = durationToSeconds(metric.productiveTime);
        if (productiveSeconds !== null) totals.productiveSeconds += productiveSeconds;

        const downtimeSeconds = durationToSeconds(metric.downtimeTime);
        const machineIssueSeconds = durationToSeconds(metric.machineIssueTime);
        const qualityIssueSeconds = durationToSeconds(metric.qualityIssueTime);
        const breakSeconds = durationToSeconds(metric.breakTime);
        if (downtimeSeconds !== null) totals.downtimeSeconds += downtimeSeconds;
        if (machineIssueSeconds !== null) totals.machineIssueSeconds += machineIssueSeconds;
        if (qualityIssueSeconds !== null) totals.qualityIssueSeconds += qualityIssueSeconds;
        if (breakSeconds !== null) totals.breakSeconds += breakSeconds;

        const expectedUnits = metricNumber(metric.expectedUnits);
        const baseTime = metricNumber(metric.baseTime);
        const expectedSeconds = expectedUnits !== null && baseTime !== null
            ? expectedUnits * baseTime
            : null;
        const completion = metricNumber(metric.completionPercentage);
        const efficiency = metricNumber(metric.efficiencyPercentage);

        if (expectedSeconds !== null && expectedSeconds >= 0) {
            totals.plannedSeconds += expectedSeconds;
            if (completion !== null) {
                const completedSeconds = expectedSeconds * Math.min(100, Math.max(0, completion)) / 100;
                totals.completedStandardSeconds += completedSeconds;
                if (efficiency !== null && efficiency > 0) {
                    totals.efficiencyWeightedSeconds += completedSeconds * efficiency;
                    totals.efficiencyWeight += completedSeconds;
                }
            }
        }

        return totals;
    }, {
        productiveSeconds: 0,
        downtimeSeconds: 0,
        machineIssueSeconds: 0,
        qualityIssueSeconds: 0,
        breakSeconds: 0,
        plannedSeconds: 0,
        completedStandardSeconds: 0,
        efficiencyWeightedSeconds: 0,
        efficiencyWeight: 0,
    });

    const orderCompletion = orderTotals.plannedSeconds > 0
        ? orderTotals.completedStandardSeconds / orderTotals.plannedSeconds * 100
        : null;
    const remainingStandardSeconds = orderTotals.plannedSeconds > 0
        ? Math.max(0, orderTotals.plannedSeconds - orderTotals.completedStandardSeconds)
        : null;
    const currentEfficiency = orderTotals.efficiencyWeight > 0
        ? orderTotals.efficiencyWeightedSeconds / orderTotals.efficiencyWeight
        : null;
    const estimatedRemainingSeconds = remainingStandardSeconds !== null && currentEfficiency > 0
        ? remainingStandardSeconds / (currentEfficiency / 100)
        : null;

    return (
        <div>
            <h3>Production Time Dashboard</h3>

            <Form.Group className="mb-3">
                <Form.Label>Select Order</Form.Label>
                <Form.Select
                    value={currentOrderId}
                    onChange={(e) => setCurrentOrderId(e.target.value)}
                >
                    <option value="">Select order</option>
                    {orders?.map((order) => (
                        <option
                            key={order.orderId}
                            value={order.orderId}
                        >
                            {order.orderId} - {order.description}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {selectedOrder && (
                <>
                    <div className="row g-3 mb-4">
                        <div className="col-6 col-lg">
                            <div className="border rounded p-3 h-100">
                                <div className="text-muted small">Order completion</div>
                                <strong>{formatPercent(orderCompletion)}</strong>
                            </div>
                        </div>
                        <div className="col-6 col-lg">
                            <div className="border rounded p-3 h-100">
                                <div className="text-muted small">Productive time logged</div>
                                <strong>{formatMinutes(orderTotals.productiveSeconds)}</strong>
                            </div>
                        </div>
                        <div className="col-6 col-lg">
                            <div className="border rounded p-3 h-100">
                                <div className="text-muted small">Planned work</div>
                                <strong>{orderTotals.plannedSeconds > 0 ? formatMinutes(orderTotals.plannedSeconds) : "—"}</strong>
                            </div>
                        </div>
                        <div className="col-6 col-lg">
                            <div className="border rounded p-3 h-100">
                                <div className="text-muted small">Standard time remaining</div>
                                <strong>{remainingStandardSeconds !== null ? formatMinutes(remainingStandardSeconds) : "—"}</strong>
                            </div>
                        </div>
                        <div className="col-12 col-lg">
                            <div className="border rounded p-3 h-100">
                                <div className="text-muted small">Estimated time remaining at current efficiency</div>
                                <strong>{estimatedRemainingSeconds !== null ? formatMinutes(estimatedRemainingSeconds) : "—"}</strong>
                                {currentEfficiency !== null && (
                                    <div className="text-muted small">Based on {formatPercent(currentEfficiency)} efficiency</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <h5>Order Downtime details</h5>
                    <div className="row g-3 mb-4">
                        <div className="col-6 col-lg-3">
                            <div className="border rounded p-3 h-100">
                                <div className="text-muted small">Total downtime</div>
                                <strong>{formatMinutes(orderTotals.downtimeSeconds)}</strong>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="border rounded p-3 h-100">
                                <div className="text-muted small">Machine issues</div>
                                <strong>{formatMinutes(orderTotals.machineIssueSeconds)}</strong>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="border rounded p-3 h-100">
                                <div className="text-muted small">Quality issues</div>
                                <strong>{formatMinutes(orderTotals.qualityIssueSeconds)}</strong>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="border rounded p-3 h-100">
                                <div className="text-muted small">Breaks</div>
                                <strong>{formatMinutes(orderTotals.breakSeconds)}</strong>
                            </div>
                        </div>
                    </div>

                    <h5>Production by Day</h5>
                    {dailyProduction.days.length ? (
                        <Table striped bordered hover responsive className="mb-2">
                            <thead>
                                <tr>
                                    <th>Production date</th>
                                    <th>Productive work</th>
                                    <th>Downtime</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyProduction.days.map(([date, totals]) => (
                                    <tr key={date}>
                                        <td>{new Date(`${date}T00:00:00`).toLocaleDateString()}</td>
                                        <td>{formatMinutes(totals.productiveSeconds)}</td>
                                        <td>{formatMinutes(totals.downtimeSeconds)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert variant="secondary">No dated production segments are available for this order.</Alert>
                    )}
                    {dailyProduction.unclassifiedSegmentCount > 0 && (
                        <Alert variant="warning">
                            {dailyProduction.unclassifiedSegmentCount} segment(s) have unrecognized types and are excluded from the daily totals.
                        </Alert>
                    )}

                    <h5>Machine Sessions</h5>

                    {loadingMetrics && <div className="mb-2"><Spinner animation="border" size="sm" /> Loading session metrics...</div>}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Machine</th>
                                <th>Garment</th>
                                <th>Operation</th>
                                <th>Productive time</th>
                                <th>Completion</th>
                                <th>Efficiency</th>
                                <th>Started</th>
                                <th>Ended</th>
                                <th>Status</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessionRows.map(({ session, metric, error }) => (
                                <tr key={session.machineSessionId}>
                                    <td>{session.machineId ?? "—"}</td>
                                    <td>{session.garmentName || "—"}</td>
                                    <td>{session.operationName || "—"}</td>
                                    <td>{metric ? formatMinutes(durationToSeconds(metric.productiveTime)) : error ? "Unavailable" : "—"}</td>
                                    <td>{metric ? formatPercent(metricNumber(metric.completionPercentage)) : error ? "Unavailable" : "—"}</td>
                                    <td>{metric ? formatPercent(metricNumber(metric.efficiencyPercentage)) : error ? "Unavailable" : "—"}</td>
                                    <td>
                                        {session.startedAt ? new Date(session.startedAt).toLocaleString() : "—"}
                                    </td>
                                    <td>
                                        {session.endedAt
                                            ? new Date(session.endedAt).toLocaleString()
                                            : "—"}
                                    </td>
                                    <td>
                                        {session.status === 'Pending' && <Badge bg="warning">Pending</Badge>}
                                        {session.status === 'InProgress' && <Badge bg="success">In Progress</Badge>}
                                        {session.status === 'Completed' && <Badge bg="secondary">Completed</Badge>}
                                        {session.status === 'Paused' && <Badge bg="info">Paused</Badge>}
                                    </td>
                                    <td>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={() => navigate(`/MachineSessionMetrics/${session.machineSessionId}`)}
                                        >
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {sessionRows.length === 0 && <Alert variant="secondary">No machine sessions are assigned to this order.</Alert>}
                </>
            )}
        </div>
    );
};

export default TimeCalculatorDashboard;
