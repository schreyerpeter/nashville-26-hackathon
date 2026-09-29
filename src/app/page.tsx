import { ForumPreview } from "@/components/community/forum-preview";
import { ArrowRightIcon, LockIcon, MailIcon, PhoneIcon, ShieldCheckIcon, UserIcon } from "@/components/ui/icons";
import { LogoMark } from "@/components/ui/logo";
import { banner, button, card, heading, label, paragraph } from "@/components/ui/styles";
import { TopNav } from "@/components/ui/top-nav";
import { DISCOURSE_URL, pseudonym } from "@/lib/discourse/connect";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const promises = [
  {
    Icon: LockIcon,
    title: "Only patients get in",
    body: "You sign in with your QuickMD account, so everyone here is a QuickMD patient.",
  },
  {
    Icon: UserIcon,
    title: "No real names",
    body: "You show up under a private username like patient-3f9a0c1d. Your name is never shared.",
  },
  {
    Icon: MailIcon,
    title: "Your email stays private",
    body: "Other members never see your email, and we don't look you up on Gravatar.",
  },
];

const spaces = [
  {
    emoji: "👋",
    name: "Introductions",
    body: "New here? Say hello and share as much or as little as you like.",
    accent: "bg-coastal-blue-50",
  },
  {
    emoji: "🎉",
    name: "Wins",
    body: "Milestones, big and small. Show up for each other.",
    accent: "bg-seafoam-50",
  },
  {
    emoji: "💬",
    name: "Visits and refills",
    body: "Tips for video visits, refills, and the pharmacy.",
    accent: "bg-primary-coastal-blue",
  },
  {
    emoji: "🌅",
    name: "Day to day",
    body: "Routines, rough patches, and what helps.",
    accent: "bg-amber-50",
  },
];

const steps = [
  { title: "Log in with QuickMD", body: "Use the same email and password as the QuickMD app." },
  { title: "Get a private username", body: "We create one for you. Your name and email never show." },
  { title: "Say hello", body: "Read along, reply when you feel like it, or post your own." },
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

      <main>
        <section className="relative overflow-hidden bg-linear-to-b from-coastal-blue-10 via-frost-20 to-app-background">
          <LogoMark
            aria-hidden="true"
            className="pointer-events-none absolute -right-sp-6 top-sp-2 hidden h-sp-64 w-auto opacity-10 lg:block"
          />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-sp-5 px-sp-2 py-sp-6 md:px-sp-4 md:py-sp-8 lg:grid-cols-2 lg:gap-sp-8 lg:px-sp-6 lg:py-sp-10">
            <div className="grid content-start justify-items-start gap-sp-3">
              <span className="inline-flex items-center gap-sp-1 rounded-full border border-coastal-blue-30 bg-surface-default px-sp-1.5 py-sp-0.5 text-scale-2 font-semibold text-text-highlight shadow-hover-small">
                <ShieldCheckIcon className="size-4" />
                Private, and only for QuickMD patients
              </span>

              <div className="grid gap-sp-2">
                <h1 className="text-scale-8 font-semibold text-text-dark md:text-scale-9 lg:text-scale-10">
                  You don&rsquo;t have to do this alone
                </h1>
                <p className="text-scale-5 text-text-medium">
                  A community where QuickMD patients share what&apos;s working, ask questions, and
                  cheer each other on.
                </p>
              </div>

              {DISCOURSE_URL ? (
                <div className="grid justify-items-start gap-sp-1.5">
                  <a className={`${button("primary", "m")} group w-full gap-sp-1 md:w-auto`} href={DISCOURSE_URL}>
                    {cta}
                    <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-sp-0.5" />
                  </a>
                  <p className={paragraph.sm}>
                    {patient ? (
                      <>
                        Signed in as{" "}
                        <span className="font-semibold text-text-dark">{pseudonym(patient.globalKey)}</span>
                      </>
                    ) : (
                      "It takes about a minute. No new password to remember."
                    )}
                  </p>
                </div>
              ) : (
                <div className={`${setup.box} w-full`}>
                  <p className={setup.title}>QuickMD Together isn&apos;t connected yet</p>
                  <p className={setup.text}>Set DISCOURSE_URL to open QuickMD Together.</p>
                </div>
              )}
            </div>

            <ForumPreview />
          </div>
        </section>

        <div className="mx-auto grid w-full max-w-6xl gap-sp-8 px-sp-2 py-sp-6 md:px-sp-4 md:py-sp-8 lg:px-sp-6">
          <section className="grid gap-sp-3" aria-labelledby="spaces-heading">
            <div className="grid gap-sp-0.5">
              <h2 id="spaces-heading" className={heading.h2}>
                Find your corner
              </h2>
              <p className={paragraph.md}>Four spaces to start, each with its own kind of conversation.</p>
            </div>
            <ul className="grid gap-sp-2 md:grid-cols-2 lg:grid-cols-4">
              {spaces.map(({ emoji, name, body, accent }) => (
                <li
                  key={name}
                  className={`${card} group relative grid content-start gap-sp-1 overflow-hidden p-sp-3 transition-shadow hover:shadow-hover-large`}
                >
                  <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-sp-0.5 ${accent}`} />
                  <span aria-hidden="true" className="text-scale-7">
                    {emoji}
                  </span>
                  <span className={heading.h3}>{name}</span>
                  <span className={paragraph.sm}>{body}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-sp-3" aria-labelledby="private-heading">
            <div className="grid gap-sp-0.5">
              <h2 id="private-heading" className={heading.h2}>
                How we keep it private
              </h2>
              <p className={paragraph.md}>You decide what to share. Here&apos;s what we never do.</p>
            </div>
            <ul className="grid gap-sp-2 md:grid-cols-3">
              {promises.map(({ Icon, title, body }) => (
                <li key={title} className={`${card} grid content-start justify-items-start gap-sp-1.5 p-sp-3`}>
                  <span className="grid size-12 place-items-center rounded-full bg-coastal-blue-10 text-coastal-blue-50">
                    <Icon />
                  </span>
                  <span className={label.lg}>{title}</span>
                  <span className={paragraph.sm}>{body}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-sp-3" aria-labelledby="steps-heading">
            <h2 id="steps-heading" className={heading.h2}>
              Joining takes three steps
            </h2>
            <ol className="grid gap-sp-2 md:grid-cols-3">
              {steps.map(({ title, body }, i) => (
                <li key={title} className="flex items-start gap-sp-2">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-coastal-blue-50 text-scale-4 font-semibold text-text-inverse">
                    {i + 1}
                  </span>
                  <span className="grid gap-sp-0.5">
                    <span className={label.lg}>{title}</span>
                    <span className={paragraph.sm}>{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <aside className={`${notice.box} md:grid-cols-[1fr_auto] md:items-center md:gap-sp-3`}>
            <div className="grid gap-sp-0.5">
              <p className={notice.title}>Peer support, not medical advice</p>
              <p className={notice.text}>
                For questions about your care, message your provider in the QuickMD app. If you&apos;re in
                a crisis, call or text 988.
              </p>
            </div>
            <a className={`${button("secondary", "s")} w-fit gap-sp-1`} href="tel:988">
              <PhoneIcon className="size-4" />
              Call or text 988
            </a>
          </aside>
        </div>
      </main>

      <footer className="border-t border-border-medium bg-surface-default">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-sp-2 px-sp-2 py-sp-3 md:px-sp-4 lg:px-sp-6">
          <span className="flex items-center gap-sp-1.5 text-scale-3 text-text-medium">
            <LogoMark className="h-sp-3 w-auto" />
            QuickMD Together, a private community for QuickMD patients
          </span>
          <span className="text-scale-2 text-text-light">In an emergency, call 911.</span>
        </div>
      </footer>
    </>
  );
}
