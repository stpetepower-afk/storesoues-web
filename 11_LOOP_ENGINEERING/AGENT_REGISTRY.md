# Agent Registry — Loop Engineering

Index of AI agents / loops and whether each is a running loop or a design.

| Loop | Owner module | Observation source | State |
|---|---|---|---|
| AI Chief of Staff briefing | Command Center | dashboard data files | 🟡 Running (reads data), no learning capture yet |
| Resident Journey | 01_MAC_HOUSE | intake / case management | ⚪ Design |
| Stability Metrics | 01_MAC_HOUSE | retention tracking | ⚪ Design |
| Fleet Efficiency | 02_MOBILITY | trip logs | ⚪ Design |
| Route Optimization | 02_MOBILITY | route data | ⚪ Design |
| Production Economics | 03_H3O | production/sales | ⚪ Design |
| Grant Success | 06_FUNDING | application outcomes | ⚪ Design |
| Funding Pipeline | 06_FUNDING | pipeline stage changes | ⚪ Design |
| Partner Engagement | 07_PARTNERS | CRM activity | ⚪ Design |

**To move a loop from Design → Running:** define its data source, wire real
collection (the Observation step), then record the first measured cycle in
`IMPROVEMENT_LOG.md`.
