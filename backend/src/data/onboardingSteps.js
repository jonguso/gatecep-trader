export const BROKER_ONBOARDING_STEPS = [
  { key: "BROKER_SELECTED", title: "Choose Broker", required: true },
  { key: "PERSONAL_DETAILS", title: "Personal Details", required: true },
  { key: "CDS_DETAILS", title: "CDS Account / Opening", required: true },
  { key: "KYC_DOCUMENTS", title: "KYC Documents", required: true },
  { key: "RISK_PROFILE", title: "Risk Profile", required: true },
  { key: "TERMS_ACCEPTED", title: "Terms & Risk Disclosure", required: true },
  { key: "BROKER_REVIEW", title: "Broker Review", required: true },
  { key: "VERIFIED", title: "Trading Enabled", required: true }
];

export function initialOnboardingState({ userId, brokerId }) {
  return {
    userId,
    brokerId,
    status: "IN_PROGRESS",
    currentStep: "BROKER_SELECTED",
    completedSteps: ["BROKER_SELECTED"],
    personalDetails: null,
    cdsDetails: null,
    documents: [],
    riskProfile: null,
    termsAccepted: false,
    brokerReview: {
      status: "NOT_SUBMITTED",
      submittedAt: null,
      reviewedAt: null,
      reviewerNotes: null
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
