import { DISCOURSE_URL, isDiscourseConfigured } from "@/lib/discourse/connect";
import { DEMO_PATIENT_EMAIL, QUICKMD_API_URL } from "@/lib/quickmd/api";

import { DevTools } from "./devtools";

export const COMMUNITY_DOC_URL = "https://claude.ai/code/artifact/832f2ffe-0df1-4ac5-a6f9-88f8d3e3ef1b";

/** Server half of DevTools: gathers the environment so the panel never needs secrets. */
export function DevToolsShell() {
  return (
    <DevTools
      environment={{
        App: "nashville-26-hackathon",
        Environment: process.env.VERCEL_ENV ?? "local",
        Commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "",
        "Patient API": QUICKMD_API_URL,
        Discourse: DISCOURSE_URL,
        "DiscourseConnect secret": isDiscourseConfigured() ? "set" : "",
      }}
      forumUrl={DISCOURSE_URL}
      docUrl={COMMUNITY_DOC_URL}
      demoPatientEmail={DEMO_PATIENT_EMAIL || null}
    />
  );
}
