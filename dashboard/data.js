/**
 * Hallelujah ONE™ — Command Center Dashboard · data (v1.0)
 *
 * JSON-backed state. This is the single place to edit the dashboard's numbers;
 * the UI in dashboard.js renders entirely from this object, so updating a
 * metric, adding a funding target, or moving a partner along the pipeline never
 * requires touching the rendering code.
 *
 * Deadlines are expressed as ISO dates and the countdowns are computed live
 * against the current date, so the "days remaining" numbers stay honest.
 */

export const data = {
  meta: {
    principal: "Larry",
    version: "v1.0",
  },

  system_status: {
    active_residents: 37,
    housing_stability_rate: 82,
    h3o_revenue: 8420,
    funding_pipeline_total: 2400000,
  },

  // Executive briefing — the AI Chief of Staff's opening feed.
  briefing: [
    { icon: "📌", text: "3 grant applications due this week" },
    { icon: "📌", text: "Partner meeting with Pinellas County today" },
    { icon: "📌", text: "12 residents ready for employment placement" },
    { icon: "📌", text: "H3O™ production target: 150 units" },
    { icon: "📌", text: "Fleet maintenance scheduled for tomorrow" },
  ],
  briefing_alert: {
    level: "urgent",
    text: "HUD CoC deadline approaching — contact your local CoC coordinator",
  },

  // Countdown clocks. days_left is derived from `deadline` at render time.
  deadlines: [
    { id: "DL-001", name: "HUD CoC FY2026", deadline: "2026-08-27", window: 90, action: "Contact local CoC coordinator" },
    { id: "DL-002", name: "USDA REAP Q4",   deadline: "2026-11-01", window: 180, action: "Contact Florida USDA Rural Development" },
  ],

  // Capital War Room — scored funding targets.
  war_room_targets: [
    { id: "WR-001", funder: "HUD",        opportunity: "CoC FY2026",              amount: 500000, status: "In Progress", deadline: "2026-08-27", next_action: "Contact local CoC coordinator" },
    { id: "WR-002", funder: "USDA",       opportunity: "REAP Q4",                 amount: 250000, status: "Identified",  deadline: "2026-11-01", next_action: "Contact Florida USDA Rural Development" },
    { id: "WR-003", funder: "FDOT / CTD", opportunity: "Mobility Access Grant",   amount: 320000, status: "In Progress", deadline: "2026-09-15", next_action: "Submit fleet utilization data" },
    { id: "WR-004", funder: "HHS SAMHSA", opportunity: "Recovery Housing",        amount: 400000, status: "Drafting",    deadline: "2026-10-10", next_action: "Finalize narrative + budget" },
    { id: "WR-005", funder: "DOL",        opportunity: "Workforce Pathways",      amount: 275000, status: "Identified",  deadline: "2026-12-01", next_action: "Confirm CareerSource partnership letter" },
    { id: "WR-006", funder: "Community Foundation Tampa Bay", opportunity: "Capacity Building", amount: 75000, status: "Submitted", deadline: "2026-08-05", next_action: "Await review committee" },
    { id: "WR-007", funder: "VA",         opportunity: "SSVF Renewal",            amount: 600000, status: "In Progress", deadline: "2026-09-30", next_action: "Reconcile prior-year outcomes" },
    { id: "WR-008", funder: "Jabil Foundation", opportunity: "Tech Access",       amount: 50000,  status: "Awarded",     deadline: "2026-07-15", next_action: "Execute grant agreement" },
  ],

  // Partner CRM — grouped by sector at render time.
  partners: [
    { id: "PRT-001", name: "Pinellas County",        sector: "Government",  contact: "County Administration", status: "Active" },
    { id: "PRT-002", name: "City of St. Petersburg", sector: "Government",  contact: "Housing & CD",          status: "Active" },
    { id: "PRT-003", name: "HUD",                    sector: "Government",  contact: "Field Office",          status: "In Progress" },
    { id: "PRT-004", name: "FDOT / CTD",             sector: "Government",  contact: "Transit Coordination",  status: "Initial Outreach" },
    { id: "PRT-005", name: "Bay Pines VA",           sector: "Healthcare",  contact: "Homeless Programs",     status: "Active" },
    { id: "PRT-006", name: "Tampa VA",               sector: "Healthcare",  contact: "SSVF Liaison",          status: "In Progress" },
    { id: "PRT-007", name: "Moffitt Cancer Center",  sector: "Healthcare",  contact: "Community Benefit",     status: "Opportunity Identified" },
    { id: "PRT-008", name: "BayCare",                sector: "Healthcare",  contact: "Community Health",      status: "Initial Outreach" },
    { id: "PRT-009", name: "Jabil",                  sector: "Corporate",   contact: "Corporate Giving",      status: "Active" },
    { id: "PRT-010", name: "Honeywell",              sector: "Corporate",   contact: "ESG Office",            status: "Initial Outreach" },
    { id: "PRT-011", name: "Tesla",                  sector: "Corporate",   contact: "Fleet Sales",           status: "Opportunity Identified" },
    { id: "PRT-012", name: "ChargePoint",            sector: "Corporate",   contact: "Infrastructure",        status: "Opportunity Identified" },
    { id: "PRT-013", name: "ARK Invest",             sector: "Technology",  contact: "Impact Team",           status: "Initial Outreach" },
    { id: "PRT-014", name: "Collective Form",        sector: "Technology",  contact: "Design Partnership",    status: "Active" },
    { id: "PRT-015", name: "CareerSource Pinellas",  sector: "Community",   contact: "Employer Services",     status: "Active" },
    { id: "PRT-016", name: "PSTA",                   sector: "Community",   contact: "Mobility Partnerships",  status: "In Progress" },
    { id: "PRT-017", name: "United Way Suncoast",    sector: "Community",   contact: "Grants",                status: "Initial Outreach" },
  ],

  // Impact & operations metrics.
  impact_metrics: {
    mac_house:  { active_residents: 37, stability_rate: 82, capacity: 45 },
    workforce:  { active_paths: 24, certifications: 16, cert_target: 30 },
    mobility:   { total_trips: 143, fleet_status: "Active", fleet_uptime: 96 },
    h3o:        { revenue: 8420, units: 124, unit_target: 150 },
  },
};
