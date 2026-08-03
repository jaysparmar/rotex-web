import { apiSuccess, apiError } from "@/lib/api-response";
import { verifyPartnerToolsPassword } from "@/lib/partner-tools";

/*
  Verifies the Partner Sales Tools gate password server-side, so the value is
  never shipped in the client bundle.
*/
export async function POST(request: Request) {
  let password: unknown;

  try {
    ({ password } = await request.json());
  } catch {
    return apiError("BAD_REQUEST", "Expected a JSON body.", 400);
  }

  if (typeof password !== "string" || password.length === 0) {
    return apiError("BAD_REQUEST", "Please enter a password.", 400);
  }

  if (!(await verifyPartnerToolsPassword(password))) {
    return apiError("UNAUTHORIZED", "Incorrect password. Please try again.", 401);
  }

  return apiSuccess({ authorized: true }, new Date());
}
