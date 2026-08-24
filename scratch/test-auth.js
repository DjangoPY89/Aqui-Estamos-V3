const { getUserByEmail, seedInitialData, createUser, getDb } = require("../src/lib/db.ts");
const bcrypt = require("bcryptjs");

try {
  seedInitialData();
  console.log("DB seeded successfully.");
  
  const admin = getUserByEmail("admin@aquiestamos.com");
  console.log("Admin user:", admin ? { email: admin.email, role: admin.role } : null);

  const customer = getUserByEmail("cliente@ejemplo.com");
  console.log("Customer user:", customer ? { email: customer.email, role: customer.role } : null);

  if (customer && customer.passwordHash) {
    const isMatch = bcrypt.compareSync("clientepassword", customer.passwordHash);
    console.log("Customer password match test:", isMatch);
  }
} catch (e) {
  console.error("Test error:", e);
}
