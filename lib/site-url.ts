const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ??
  (productionHost
    ? `https://${productionHost}`
    : "https://strategyapp-hisab.vercel.app")
).replace(/\/$/, "");
