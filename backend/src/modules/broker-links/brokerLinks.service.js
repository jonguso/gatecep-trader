import {
  getUserBrokerLinks,
  createBrokerLink
} from "./brokerLinks.repository.js";

export async function getBrokerLinks(userId) {
  return await getUserBrokerLinks(userId);
}

export async function addBrokerLink(userId, payload) {
  return await createBrokerLink(userId, payload);
}