import { LogoMark } from "@/components/ui/logo";
import { button, card } from "@/components/ui/styles";
import { DISCOURSE_URL, pseudonym } from "@/lib/discourse/connect";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const promises = [
  {
    title: "Only patients get in",
    body: "You sign in with your QuickMD account, so everyone here is a QuickMD patient.",
  },
  {
    title: "No real names",
    body: "You show up under a private username like patient-3f9a0c1d. Your name is never shared.",
  },
  {
    title: "Your email stays private",
    body: "Other members never see your email, and we don't look you up on Gravatar.",
  },
];

export default async function Home() {
  const patient = await getSession();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-sp-5 px-sp-2 py-sp-8">
      <header className="space-y-sp-1.5">
        <LogoMark className="mb-sp-3 h-12 w-auto" />
        <p className="text-scale-2 font-semibold uppercase text-text-light">QuickMD Community</p>
        <h1 className="text-scale-8 font-semibold">Talk with people on the same path</h1>
        <p className="text-scale-4 text-text-medium">
          A private forum where QuickMD patients share what&apos;s working, ask questions, and
          support each other.
        </p>
      </header>

      {DISCOURSE_URL ? (
        <div className="space-y-sp-1">
          <a className={`${button()} w-full md:w-auto`} href={DISCOURSE_URL}>
            {patient ? "Open the community" : "Join with your QuickMD account"}
          </a>
          {patient && (
            <p className="text-scale-3 text-text-light">Signed in as {pseudonym(patient.globalKey)}</p>
          )}
        </div>
      ) : (
        <p className={`${card} px-sp-2.5 py-sp-2 text-scale-3 text-text-medium`}>
          Set DISCOURSE_URL to open the community.
        </p>
      )}

      <ul className="grid gap-sp-2 md:grid-cols-3">
        {promises.map(({ title, body }) => (
          <li key={title} className={`${card} space-y-sp-0.5 px-sp-2.5 py-sp-2`}>
            <span className="block text-scale-4 font-semibold">{title}</span>
            <span className="block text-scale-3 text-text-medium">{body}</span>
          </li>
        ))}
      </ul>

      <p className="text-scale-3 text-text-light">
        The community is for peer support, not medical advice. For questions about your care,
        message your provider in the QuickMD app.
      </p>
    </main>
  );
}
