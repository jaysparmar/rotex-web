// Pushes leads from our forms into Salesforce (createLeadAPI apex rest endpoint).
// Dev org creds today — Salesforce team swaps SALESFORCE_AUTH_URL/API_URL to the
// live org once this is verified against their sandbox.

type SalesforceLead = {
  formSource: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  designation?: string;
  city: string;
  country: string;
  industry?: string;
  productType?: string;
  enquiryType: string;
  quantity?: string;
  message: string;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const authUrl = process.env.SALESFORCE_AUTH_URL;
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
  if (!authUrl || !clientId || !clientSecret) {
    throw new Error("Salesforce credentials are not configured");
  }

  const res = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    throw new Error(`Salesforce auth failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; issued_at?: string };
  // Salesforce client_credentials tokens don't return an expiry — refresh every 25m to be safe.
  cachedToken = { value: data.access_token, expiresAt: Date.now() + 25 * 60 * 1000 };
  return data.access_token;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

export function toSalesforceLead(enquiry: {
  source: string;
  industryName: string;
  fullName: string;
  enquiryType: string;
  product: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  company?: string | null;
  designation?: string | null;
  quantity?: string | null;
  message: string;
}): SalesforceLead {
  const { firstName, lastName } = splitName(enquiry.fullName);
  return {
    formSource: enquiry.source,
    firstName,
    lastName,
    email: enquiry.email,
    phone: enquiry.phone,
    companyName: enquiry.company ?? undefined,
    designation: enquiry.designation ?? undefined,
    city: enquiry.city,
    country: enquiry.country,
    industry: enquiry.industryName,
    productType: enquiry.product,
    enquiryType: enquiry.enquiryType,
    quantity: enquiry.quantity ?? undefined,
    message: enquiry.message,
  };
}

export async function createSalesforceLead(lead: SalesforceLead): Promise<void> {
  const apiUrl = process.env.SALESFORCE_API_URL;
  if (!apiUrl) throw new Error("SALESFORCE_API_URL is not configured");

  const token = await getAccessToken();

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify([lead]),
  });

  if (!res.ok) {
    throw new Error(`Salesforce createLeadAPI failed: ${res.status} ${await res.text()}`);
  }
}
