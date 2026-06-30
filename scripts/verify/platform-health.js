#!/usr/bin/env node

/**
 * ============================================================================
 * STATUS: ACTIVE
 * MODULE: Platform Health Verification
 * PURPOSE:
 * Verifies that GateCEP's core platform components are available.
 * ============================================================================
 */

import fs from "fs";

const checks = [];

function check(name, fn) {
  try {
    fn();
    checks.push({ name, status: "PASS" });
  } catch (err) {
    checks.push({ name, status: "FAIL", error: err.message });
  }
}

check("Architecture Folder", () => {
  if (!fs.existsSync("architecture")) {
    throw new Error("architecture/ missing");
  }
});

check("Docs Folder", () => {
  if (!fs.existsSync("docs")) {
    throw new Error("docs/ missing");
  }
});

check("Shared Folder", () => {
  if (!fs.existsSync("shared")) {
    throw new Error("shared/ missing");
  }
});

check("Backend Folder", () => {
  if (!fs.existsSync("backend")) {
    throw new Error("backend/ missing");
  }
});

console.log("\nGateCEP Platform Health\n");

checks.forEach(c => {
  console.log(
    `${c.status === "PASS" ? "✅" : "❌"} ${c.name}`
  );
});

const passed = checks.filter(c => c.status === "PASS").length;
const percent = Math.round((passed / checks.length) * 100);

console.log(`\nOverall Health: ${percent}%`);