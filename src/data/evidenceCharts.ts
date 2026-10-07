/** Copied from local generated reports; values are recorded evidence, never synthetic plot points. */
export const modelCandidates = [
    {
        "name":  "mean baseline",
        "error":  0.9605240409748688,
        "artifact":  0.000701,
        "rejected":  false
    },
    {
        "name":  "ridge onehot",
        "error":  0.4295530339928773,
        "artifact":  0.003576,
        "rejected":  false
    },
    {
        "name":  "decision tree",
        "error":  0.030720769901819794,
        "artifact":  0.891693,
        "rejected":  false
    },
    {
        "name":  "random forest",
        "error":  0.022874756276491954,
        "artifact":  184.446589,
        "rejected":  true
    },
    {
        "name":  "hist gradient boosting",
        "error":  0.050291253502996215,
        "artifact":  0.590607,
        "rejected":  false
    }
];
export const swiftScaling = [
    {
        "loops":  1,
        "throughput":  62346.8,
        "iqr":  2755.1,
        "connections":  128,
        "repeats":  5,
        "persistence":  "off"
    },
    {
        "loops":  2,
        "throughput":  114599.8,
        "iqr":  2953.4,
        "connections":  128,
        "repeats":  5,
        "persistence":  "off"
    },
    {
        "loops":  4,
        "throughput":  223078,
        "iqr":  36670,
        "connections":  128,
        "repeats":  5,
        "persistence":  "off"
    },
    {
        "loops":  8,
        "throughput":  483013.4,
        "iqr":  18202.2,
        "connections":  128,
        "repeats":  5,
        "persistence":  "off"
    },
    {
        "loops":  16,
        "throughput":  924688.1,
        "iqr":  54787.2,
        "connections":  128,
        "repeats":  5,
        "persistence":  "off"
    },
    {
        "loops":  32,
        "throughput":  1463263.8,
        "iqr":  173191.8,
        "connections":  128,
        "repeats":  5,
        "persistence":  "off"
    }
];
export const chartCopy = {
  swiftkv: {
    title: "Event-loop scaling",
    description: "Median throughput from the io_threads sweep: five repeats, 128 connections, 90% reads, persistence off. Loopback on a shared Linux host.",
    source: "Source: docs/results/perf_summary.csv · closed-loop client benchmark. Tail latency is subject to coordinated omission.",
  },
  smartlab: {
    title: "Validation error meets the artifact budget",
    description: "Untuned candidates. Lower MAE(log) is better; the artifact budget is 50 MB. The tuned model's test result is reported separately below.",
    source: "Recorded candidate evaluation · reports/results.json",
  },
};
