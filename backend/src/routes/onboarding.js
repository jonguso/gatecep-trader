import { v4 as uuidv4 } from "uuid";
import { state, getUser, audit } from "../store/state.js";
import { getBroker } from "../data/brokers.js";
import { BROKER_ONBOARDING_STEPS, initialOnboardingState } from "../data/onboardingSteps.js";

function getFlow(userId, brokerId) {
  return state.brokerOnboarding.find(x => x.userId === userId && x.brokerId === brokerId);
}

function completeStep(flow, step) {
  if (!flow.completedSteps.includes(step)) flow.completedSteps.push(step);
  flow.currentStep = step;
  flow.updatedAt = new Date().toISOString();
}

export function getOnboardingSteps(req, res) { res.json(BROKER_ONBOARDING_STEPS); }

export function startOnboarding(req, res) {
  const { userId, brokerId } = req.body;
  const user = getUser(userId);
  const broker = getBroker(brokerId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!broker) return res.status(404).json({ error: "Broker not found" });

  let flow = getFlow(userId, brokerId);
  if (!flow) {
    flow = { id: uuidv4(), ...initialOnboardingState({ userId, brokerId }) };
    state.brokerOnboarding.unshift(flow);
  }

  user.selectedBrokerId = brokerId;
  audit("BROKER_ONBOARDING_STARTED", `Started onboarding for ${broker.name}`, userId, { brokerId });
  res.json(flow);
}

export function getOnboarding(req, res) {
  const { userId, brokerId } = req.query;
  const flow = getFlow(userId, brokerId);
  if (!flow) return res.status(404).json({ error: "Onboarding flow not found" });
  res.json(flow);
}

export function updatePersonalDetails(req, res) {
  const { userId, brokerId, personalDetails } = req.body;
  const flow = getFlow(userId, brokerId);
  if (!flow) return res.status(404).json({ error: "Onboarding flow not found" });
  flow.personalDetails = personalDetails;
  completeStep(flow, "PERSONAL_DETAILS");
  audit("ONBOARDING_PERSONAL_DETAILS", "Personal details updated", userId);
  res.json(flow);
}

export function updateCdsDetails(req, res) {
  const { userId, brokerId, cdsDetails } = req.body;
  const flow = getFlow(userId, brokerId);
  if (!flow) return res.status(404).json({ error: "Onboarding flow not found" });
  flow.cdsDetails = cdsDetails;
  completeStep(flow, "CDS_DETAILS");
  audit("ONBOARDING_CDS_DETAILS", "CDS details updated", userId);
  res.json(flow);
}

export function addDocument(req, res) {
  const { userId, brokerId, documentType, fileName, reference } = req.body;
  const flow = getFlow(userId, brokerId);
  if (!flow) return res.status(404).json({ error: "Onboarding flow not found" });
  flow.documents.push({ id: uuidv4(), documentType, fileName, reference, status: "UPLOADED", uploadedAt: new Date().toISOString() });
  completeStep(flow, "KYC_DOCUMENTS");
  audit("ONBOARDING_DOCUMENT_UPLOADED", `Uploaded ${documentType}`, userId);
  res.json(flow);
}

export function updateRiskProfile(req, res) {
  const { userId, brokerId, riskProfile } = req.body;
  const flow = getFlow(userId, brokerId);
  const user = getUser(userId);
  if (!flow) return res.status(404).json({ error: "Onboarding flow not found" });
  flow.riskProfile = riskProfile;
  if (user) user.riskProfile = riskProfile?.profile || riskProfile || "BALANCED";
  completeStep(flow, "RISK_PROFILE");
  audit("ONBOARDING_RISK_PROFILE", "Risk profile updated", userId, riskProfile);
  res.json(flow);
}

export function acceptTerms(req, res) {
  const { userId, brokerId, accepted } = req.body;
  const flow = getFlow(userId, brokerId);
  if (!flow) return res.status(404).json({ error: "Onboarding flow not found" });
  flow.termsAccepted = !!accepted;
  if (accepted) completeStep(flow, "TERMS_ACCEPTED");
  audit("ONBOARDING_TERMS_ACCEPTED", "Terms and risk disclosure accepted", userId);
  res.json(flow);
}

export function submitForReview(req, res) {
  const { userId, brokerId } = req.body;
  const flow = getFlow(userId, brokerId);
  if (!flow) return res.status(404).json({ error: "Onboarding flow not found" });

  const required = ["BROKER_SELECTED", "PERSONAL_DETAILS", "CDS_DETAILS", "KYC_DOCUMENTS", "RISK_PROFILE", "TERMS_ACCEPTED"];
  const missing = required.filter(x => !flow.completedSteps.includes(x));
  if (missing.length) return res.status(400).json({ error: "Missing onboarding steps", missing });

  flow.status = "PENDING_BROKER_REVIEW";
  flow.brokerReview.status = "PENDING";
  flow.brokerReview.submittedAt = new Date().toISOString();
  completeStep(flow, "BROKER_REVIEW");
  audit("ONBOARDING_SUBMITTED_FOR_REVIEW", "Submitted broker onboarding for review", userId);
  res.json(flow);
}

export function approveOnboarding(req, res) {
  const { userId, brokerId, brokerCustomerId, cdsAccount, reviewerNotes } = req.body;
  const flow = getFlow(userId, brokerId);
  const user = getUser(userId);
  const broker = getBroker(brokerId);
  if (!flow) return res.status(404).json({ error: "Onboarding flow not found" });
  if (!user) return res.status(404).json({ error: "User not found" });

  flow.status = "VERIFIED";
  flow.brokerReview.status = "APPROVED";
  flow.brokerReview.reviewedAt = new Date().toISOString();
  flow.brokerReview.reviewerNotes = reviewerNotes || "Approved";
  completeStep(flow, "VERIFIED");

  user.selectedBrokerId = brokerId;
  user.brokerCustomerId = brokerCustomerId || `BRK-${brokerId}-${userId}`;
  user.cdsAccount = cdsAccount || flow.cdsDetails?.cdsAccount || `CDS-${brokerId}-${userId}`;

  state.brokerLinks.unshift({
    id: uuidv4(),
    userId,
    brokerId,
    brokerCustomerId: user.brokerCustomerId,
    cdsAccount: user.cdsAccount,
    status: "VERIFIED",
    createdAt: new Date().toISOString()
  });

  audit("BROKER_ONBOARDING_APPROVED", `Broker onboarding approved for ${broker?.name}`, userId);
  res.json(flow);
}
