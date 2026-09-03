import connectMongoDB from "@/libs/mongodb";
import LoginAttempt from "@/models/login-attempt";

const MAX_ATTEMPTS = 3;

export async function isLockedOut(ip) {
  await connectMongoDB();
  return (await LoginAttempt.countDocuments({ ip })) >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(ip) {
  await connectMongoDB();
  await LoginAttempt.create({ ip });
}

export async function clearFailedAttempts(ip) {
  await connectMongoDB();
  await LoginAttempt.deleteMany({ ip });
}
