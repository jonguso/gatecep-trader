/**
 * ============================================================================
 * STATUS: ACTIVE
 * MODULE: Broker Links Repository
 * LAYER: Backend Repository
 * DOMAIN: Broker Integration
 *
 * PURPOSE:
 * Handles persistence of user broker links. Creates, updates and retrieves
 * broker accounts connected to a GateCEP user.
 *
 * DATABASE:
 * - user_broker_links
 *
 * USED BY:
 * - brokerLinks.routes.js
 * - Broker Profile
 * - Broker Account Center
 * - Onboarding Broker Connection
 * - Dashboard
 * - Mobile App
 * - Web App
 *
 * DEPENDS ON:
 * - PostgreSQL
 * - UUID
 *
 * SHARED WITH:
 * - shared/constants/brokers.js
 * - shared/utils/normalizeBroker.js
 *
 * LAST VERIFIED:
 * 2026-06-29
 *
 * VERSION:
 * GateCEP 3.0 Foundation
 *
 * OWNER:
 * Broker Services
 * ============================================================================
 */

import { v4 as uuid } from "uuid";
import { pool } from "../../database/db.js";
import { normalizeBroker } from "../../../../shared/utils/normalizeBroker.js";

export async function getUserBrokerLinks(userId) {
  const result = await pool.query(
    `
    SELECT
      id,
      user_id AS "userId",
      broker,
      client_number AS "clientNumber",
      cds_number AS "cdsNumber",
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM user_broker_links
    WHERE user_id = $1
    ORDER BY broker
    `,
    [userId]
  );

  return result.rows;
}

export async function createBrokerLink(userId, payload = {}) {
  const result = await pool.query(
    `
    INSERT INTO user_broker_links (
      id,
      user_id,
      broker,
      client_number,
      cds_number,
      status,
      created_at,
      updated_at
    )
    VALUES ($1,$2,$3,$4,$5,'ACTIVE',NOW(),NOW())
    ON CONFLICT (user_id, broker)
    DO UPDATE SET
      client_number = EXCLUDED.client_number,
      cds_number = EXCLUDED.cds_number,
      status = 'ACTIVE',
      updated_at = NOW()
    RETURNING
      id,
      user_id AS "userId",
      broker,
      client_number AS "clientNumber",
      cds_number AS "cdsNumber",
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `,
    [
      uuid(),
      userId,
      normalizeBroker(payload.broker || "GATECEP-DEMO"),
      payload.clientNumber || "",
      payload.cdsNumber || ""
    ]
  );

  return result.rows[0];
}