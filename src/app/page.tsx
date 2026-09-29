import { banner, button, card, heading, label, paragraph } from "@/components/ui/styles";
import { PageContent, TopNav } from "@/components/ui/top-nav";
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
  const cta = patient ? "Open QuickMD Together" : "Join with your QuickMD account";
  const notice = banner("informative");
  const setup = banner("warning");

  return (
    <>
      <TopNav>
        {DISCOURSE_URL && (
          <a className={button(patient ? "primary" : "secondary", "s")} href={DISCOURSE_URL}>
            {patient ? "Open QuickMD Together" : "Log in"}
          </a>
        )}
      </TopNav>

      <PageContent className="grid max-w-sp-96 gap-sp-5">
        <section className="grid gap-sp-2">
          <h1 className={heading.h1}>Talk with people on the same path</h1>
          <p className={paragraph.md}>
            A private forum where QuickMD patients share what&apos;s working, ask questions, and
            support each other.
          </p>

          {DISCOURSE_URL ? (
            <div className="grid justify-items-start gap-sp-1 pt-sp-1">
              <a className={`${button()} w-full md:w-auto`} href={DISCOURSE_URL}>
                {cta}
              </a>
              {patient && (
                <p className={paragraph.sm}>
                  Signed in as <span className="font-semibold text-text-dark">{pseudonym(patient.globalKey)}</span>
                </p>
              )}
            </div>
          ) : (
            <div className={setup.box}>
              <p className={setup.title}>QuickMD Together isn&apos;t connected yet</p>
              <p className={setup.text}>Set DISCOURSE_URL to open QuickMD Together.</p>
            </div>
          )}
        </section>

        <section className="grid gap-sp-1">
          <h2 className={heading.h3}>How we keep it private</h2>
          <ul className="grid gap-sp-1 md:grid-cols-3">
            {promises.map(({ title, body }) => (
              <li key={title} className={`${card} grid content-start gap-sp-0.5 p-sp-2`}>
                <span className={label.lg}>{title}</span>
                <span className={paragraph.sm}>{body}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className={notice.box}>
          <p className={notice.title}>Peer support, not medical advice</p>
          <p className={notice.text}>
            For questions about your care, message your provider in the QuickMD app. In a crisis,
            call or text 988.
          </p>
        </aside>
      </PageContent>
    </>
  );
}
