import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Table, Spinner, Alert } from "react-bootstrap";
import { GetProductionMetrics } from "./endpoints/Endpoints";

const formatPercent = (value) => {
    if (value === null || value === undefined) return "-";
    return `${Number(value).toFixed(2)}%`;
};

const formatTimeSpan = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "number") {
        const seconds = Math.floor(value);
        const hours = Math.floor(seconds / 3600)
            .toString()
            .padStart(2, "0");
        const minutes = Math.floor((seconds % 3600) / 60)
            .toString()
            .padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0");
        return `${hours}:${minutes}:${secs}`;
    }
    if (typeof value === "string") {
        if (value.includes('.')) {
            const [time, fraction] = value.split('.');
            return `${time}.${fraction.substring(0, 2)}`;
        }
        return value;
    };
}

const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
};

const MachineSessionMetrics = () => {
    const { machineSessionId } = useParams();
    const [metric, setMetric] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await GetProductionMetrics(machineSessionId);
                setMetric(response ?? null);
                console.log("Fetched production metrics:", response);
            } catch (err) {
                setError("Error loading production metrics");
                console.error("Error fetching production metrics:", err);
            } finally {
                setLoading(false);
            }
        };

        if (machineSessionId) {
            fetchMetrics();
        }
    }, [machineSessionId]);

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!metric) return <Alert variant="warning">No production metrics found for this session.</Alert>;

    return (
        <>
            <Alert variant="info">
                <div><strong>Session ID:</strong> {machineSessionId}</div>
                <div className="mt-2">
                    {metric.sessionCreateTime && (
                        <span><strong>Created:</strong> {formatDateTime(metric.sessionCreateTime)} </span>
                    )}
                    {metric.sessionStartTime && (
                        <span>• <strong>Started:</strong> {formatDateTime(metric.sessionStartTime)} </span>
                    )}
                    {metric.sessionEndTime && (
                        <span>• <strong>Ended:</strong> {formatDateTime(metric.sessionEndTime)}</span>
                    )}
                </div>
            </Alert>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Operation ID</th>
                        <th>Operation Name</th>
                        <th>Base Time</th>
                        <th>Units / Garment</th>
                        <th>Productive Time</th>
                        <th>Downtime</th>
                        <th>Machine Issue</th>
                        <th>Quality Issue</th>
                        <th>Break Time</th>
                        <th>Produced Units</th>
                        <th>Expected Units</th>
                        <th>Completion</th>
                        <th>Avg Sec / Unit</th>
                        <th>Efficiency</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{metric.operationId ?? "-"}</td>
                        <td>{metric.operationName ?? "-"}</td>
                        <td>{metric.baseTime ?? "-"}</td>
                        <td>{metric.unitsPerGarment ?? "-"}</td>
                        <td>{formatTimeSpan(metric.productiveTime)}</td>
                        <td>{formatTimeSpan(metric.downtimeTime)}</td>
                        <td>{formatTimeSpan(metric.machineIssueTime)}</td>
                        <td>{formatTimeSpan(metric.qualityIssueTime)}</td>
                        <td>{formatTimeSpan(metric.breakTime)}</td>
                        <td>{metric.producedUnits ?? "-"}</td>
                        <td>{metric.expectedUnits ?? "-"}</td>
                        <td>{formatPercent(metric.completionPercentage)}</td>
                        <td>{metric.averageSecondsPerUnit?.toFixed(2) ?? "-"}</td>
                        <td>{formatPercent(metric.efficiencyPercentage)}</td>
                    </tr>
                </tbody>
            </Table>

            <div className="mt-4">
                <h5>Time Segments</h5>
                {metric.segments?.length ? (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Start</th>
                                <th>End</th>
                                <th>Duration</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metric.segments.map((segment, segmentIndex) => (
                                <tr key={`${segmentIndex}`}>
                                    <td>{formatDateTime(segment.start)}</td>
                                    <td>{formatDateTime(segment.end)}</td>
                                    <td>{formatTimeSpan(segment.duration)}</td>
                                    <td>{segment.type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <Alert variant="secondary">No segments available for this operation.</Alert>
                )}
            </div>
        </>
    );
};

export default MachineSessionMetrics;
