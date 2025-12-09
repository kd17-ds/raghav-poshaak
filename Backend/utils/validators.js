function validatePassword(pw) {
  if (typeof pw !== "string")
    return { ok: false, reason: "Password must be a string." };
  if (pw.length < 8)
    return {
      ok: false,
      reason: "Password must be at least 8 characters long.",
    };
  return { ok: true };
}

module.exports = { validatePassword };
