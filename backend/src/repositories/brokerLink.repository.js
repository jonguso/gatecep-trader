import { query } from "../database/db.js";
import { normalizeBroker } from "../utils/normalizeBroker.js";

export async function saveBrokerLink(input = {}) {
  const broker = normalizeBroker(input.broker);

  const result = await query(
    `INSERT INTO broker_links
      (broker, client_number, cds_number, email, source, recommended_broker, customer_profile, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (user_id, broker)
DO UPDATE SET
  client_number = EXCLUDED.client_number,
  cds_number = EXCLUDED.cds_number,
  email = EXCLUDED.email,
  status = 'ACTIVE',
  updated_at = NOW()
RETURNING *`,
    [
      broker,
      input.clientNumber || "",
      input.cdsNumber || "",
      input.email || "",
      input.source || "EXISTING_INVESTOR",
      input.recommendedBroker || null,
      input.customerProfile || null,
      input.status || "LINKED_PENDING_UPLOAD"
    ]
  );

  return mapBrokerLink(result.rows[0]);
}

export async function findBrokerLink({ broker, clientNumber, cdsNumber }) {
  const result = await query(
    `SELECT * FROM broker_links WHERE broker=$1 AND client_number=$2 AND cds_number=$3 LIMIT 1`,
    [normalizeBroker(broker), clientNumber || "", cdsNumber || ""]
  );
  return result.rows[0] ? mapBrokerLink(result.rows[0]) : null;
}

function mapBrokerLink(row) {
  return {
    id: row.id,
    broker: row.broker,
    clientNumber: row.client_number,
    cdsNumber: row.cds_number,
    email: row.email,
    source: row.source,
    recommendedBroker: row.recommended_broker,
    customerProfile: row.customer_profile,
    status: row.status,
    createdAt: row.created_at
  };
}
