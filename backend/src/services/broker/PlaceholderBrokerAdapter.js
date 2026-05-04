export default {
  async placeOrder(order) {
    return {
      brokerMode: "PARTNER_PENDING",
      brokerOrderId: null,
      brokerStatus: "NOT_CONNECTED",
      executionStatus: "BROKER_API_NOT_ENABLED",
      message: "This broker is available for onboarding, but live API trading requires a signed broker partnership.",
      order
    };
  }
};
