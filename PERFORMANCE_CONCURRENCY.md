# Performance & Concurrency Policy

Web code should remain responsive: use asynchronous browser APIs and bounded server-side concurrency for independent work. Avoid blocking the main UI thread, unbounded task creation, and shared mutable state. Measure latency and throughput before changing concurrency defaults.
