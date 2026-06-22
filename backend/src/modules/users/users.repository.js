const users = [];

export function createUser(user) {
  users.push(user);
  return user;
}

export function findUserByEmail(email) {
  return users.find(
    (u) => String(u.email).toLowerCase() === String(email).toLowerCase()
  );
}

export function findUserById(id) {
  return users.find((u) => u.id === id);
}