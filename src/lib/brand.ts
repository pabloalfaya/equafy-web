/**
 * Centralized brand configuration.
 * Change these values to rebrand the application.
 */
export const BRAND = {
  name: "Equafy",
  nameUppercase: "EQUAFY",
  email: "info@getequafy.com",
  supportEmail: "support@getequafy.com",
  /** Fallback email for audit log when user is not authenticated */
  auditFallbackEmail: "admin@getequafy.com",
  baseUrl: "https://www.getequafy.com",
  tagline: "Dynamic Equity Management for Startups & Growing Companies",
  /** Logo for navbar and footer (replace file in /public) */
  logoPath: "/logo-web.png",
  /** Favicon (replace file in /public) */
  iconPath: "/equafy-mark.png",
} as const;
