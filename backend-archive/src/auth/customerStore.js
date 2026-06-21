export const customersByEmail = new Map();

export function saveCustomer(customer) {
  const key = String(customer.email || "").toLowerCase();
  customersByEmail.set(key, customer);
  return customer;
}

export function findCustomerByEmail(email) {
  return customersByEmail.get(String(email || "").toLowerCase());
}
