const dns = require("dns").promises;

/**
 * List of common disposable email domains
 */
const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "temp-mail.org",
  "dispostable.com",
  "getnada.com",
  "sharklasers.com",
  "guerrillamailblock.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "grr.la",
  "yopmail.com",
  "disposable.com",
  "fakeinbox.com",
  "throwawaymail.com",
  "mailmap.com",
  "trashmail.com",
];

/**
 * Validates email syntax, checks for disposable domains, and verifies domain existence.
 * @param {string} email
 * @returns {Promise<{valid: boolean, message?: string}>}
 */
const validateEmail = async (email) => {
  if (!email || typeof email !== "string") {
    return { valid: false, message: "Email is required" };
  }

  // 1. Syntax Check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Invalid email format" };
  }

  const [localPart, domain] = email.split("@");

  // 2. Disposable Domain Check
  if (DISPOSABLE_DOMAINS.includes(domain.toLowerCase())) {
    return { valid: false, message: "Disposable email addresses are not allowed" };
  }

  // 3. Domain Existence Check
  try {
    // dns.lookup is the most reliable way to check if a domain exists 
    // it uses the underlying OS's getaddrinfo
    await dns.lookup(domain);
    return { valid: true };
  } catch (error) {
    console.log(`[VALIDATOR] Domain lookup failed for ${domain}:`, error.code);
    return { valid: false, message: "Email domain does not exist" };
  }
};

module.exports = { validateEmail };
