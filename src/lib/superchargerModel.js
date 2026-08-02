/**
 * Supercharger ROI model for Hallelujah ONE (site: 3548 5th Ave S, St. Petersburg).
 *
 * Pure, deterministic calculation so it can be unit-tested and reused by the
 * calculator page. All monetary values are USD. Every input has a sensible,
 * clearly-labeled DEFAULT — these are illustrative assumptions, NOT quoted
 * figures. Replace them with real numbers before using the output anywhere.
 *
 * computeRoi(inputs) -> derived metrics (annual revenue, costs, payback, NPV).
 */

// Defaults reflect the Hallelujah ONE stated infrastructure figures for 3548 5th Ave S:
// 4 stalls, ~$180K capex, ~$272K/yr target revenue. Usage is a busy-urban-site
// assumption tuned to that revenue target — still an ASSUMPTION, not a quote.
const DEFAULTS = {
  stalls: 4,                 // number of charging stalls (stated)
  installPerStall: 35000,    // $ hardware + install per stall (assumption)
  siteFixedCost: 40000,      // $ make-ready / switchgear / trenching (assumption)
  pricePerKwh: 0.42,         // $ charged to the driver, per kWh
  costPerKwh: 0.14,          // $ utility energy cost, per kWh
  demandChargeMonthly: 800,  // $ utility demand charge per month
  energyPerSession: 40,      // kWh delivered per charging session
  sessionsPerStallDay: 12,   // sessions per stall per day (busy-urban assumption)
  uptime: 0.95,              // fraction of time the site is available (0-1)
  omPctOfCapex: 0.05,        // annual operations & maintenance, as % of capex
  analysisYears: 10,         // horizon for cumulative / NPV
  discountRate: 0.08,        // annual discount rate for NPV (0-1)
};

function num(v, fallback) {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function computeRoi(input = {}) {
  // Merge with defaults, coercing everything to finite numbers.
  const i = {};
  for (const k of Object.keys(DEFAULTS)) i[k] = num(input[k], DEFAULTS[k]);

  const capex = i.stalls * i.installPerStall + i.siteFixedCost;

  const annualEnergyKwh =
    i.stalls * i.sessionsPerStallDay * i.energyPerSession * 365 * i.uptime;

  const grossRevenue = annualEnergyKwh * i.pricePerKwh;
  const energyCost = annualEnergyKwh * i.costPerKwh;
  const demandCostAnnual = i.demandChargeMonthly * 12;
  const omAnnual = capex * i.omPctOfCapex;

  const operatingCost = energyCost + demandCostAnnual + omAnnual;
  const netOperatingIncome = grossRevenue - operatingCost;

  const grossMargin = grossRevenue > 0 ? (grossRevenue - energyCost) / grossRevenue : 0;

  // Simple payback (years). Null when the project never pays back.
  const simplePaybackYears =
    netOperatingIncome > 0 ? capex / netOperatingIncome : null;

  // Undiscounted cumulative net over the horizon.
  const cumulativeNet = netOperatingIncome * i.analysisYears - capex;

  // NPV of level annual net operating income, less upfront capex.
  let npv = -capex;
  for (let t = 1; t <= i.analysisYears; t++) {
    npv += netOperatingIncome / Math.pow(1 + i.discountRate, t);
  }

  // Return on the horizon (undiscounted), as a fraction of capex.
  const roiOverHorizon = capex > 0 ? cumulativeNet / capex : 0;

  return {
    inputs: i,
    capex,
    annualEnergyKwh,
    grossRevenue,
    energyCost,
    demandCostAnnual,
    omAnnual,
    operatingCost,
    netOperatingIncome,
    grossMargin,
    simplePaybackYears,
    cumulativeNet,
    npv,
    roiOverHorizon,
  };
}

// CommonJS export for Node/tests; browser global for the calculator page.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { computeRoi, DEFAULTS };
}
if (typeof window !== "undefined") {
  window.HallelujahSupercharger = { computeRoi, DEFAULTS };
}
