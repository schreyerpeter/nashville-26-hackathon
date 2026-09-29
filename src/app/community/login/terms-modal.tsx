"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { Popup } from "@/components/ui/popup";
import { button, link } from "@/components/ui/styles";
import { TERMS_PDF_URL } from "@/lib/terms";

import { agreeToTerms, declineTerms } from "./actions";

// Each section's body is one or more paragraphs.
const sections: { title: string; body: string[] }[] = [
  {
    title: "If you join",
    body: [
      "Other QuickMD patients will be able to see that you are getting treatment for substance use. You can't take that back once it's done.",
    ],
  },
  {
    title: "Joining is your choice",
    body: [
      "You do not have to join. Your treatment, your prescriptions, your appointments, and what you pay are exactly the same either way. Nobody at QuickMD will treat you differently if you say no, and you can leave at any time.",
    ],
  },
  {
    title: "What other patients will see",
    body: [
      "Having an account will inform other community members that you are a patient of QuickMD. They will also see the name you pick, your badges, and everything you write.",
    ],
  },
  {
    title: "You can't unshare it",
    body: [
      "Other members can screenshot or copy what you post. We forbid it, and we enforce it, but we can't stop it or get it back.",
    ],
  },
  {
    title: "You can pick an anonymous username",
    body: [
      "If you do not want your personal information shared, avoid using your real name or any other indicators of your personal life.",
    ],
  },
  {
    title: "Never post these",
    body: [
      "Your address, phone number, email, last name, workplace, school, or social media.",
      "A request to talk privately, or your contact info — there are no private messages here, on purpose.",
    ],
  },
  {
    title: "Offering, asking for, selling, or trading any medication",
    body: [
      "Telling another member what to do with their medication or their dose will permanently ban you from the community.",
    ],
  },
  {
    title: "No medical advice",
    body: [
      "Nothing here is medical advice, and QuickMD Together is not how you reach your care team. Questions about your medication, your dose, or your appointments go to your clinician. Your clinician does not read QuickMD Together.",
    ],
  },
  {
    title: "QuickMD Together is not for emergencies",
    body: [
      "If you are in danger right now, call or text 988, or call 911. If you post something that suggests you're in crisis, we will remove it from public view right away and our 24/7 Support team will try to reach you. That's to protect you and other members. It is not a punishment and it does not affect your treatment.",
    ],
  },
  {
    title: "Badges",
    body: [
      "Badges are for taking part. They have no cash value, can't be traded or redeemed, and are not a measure of how you're doing in treatment.",
    ],
  },
  {
    title: "What we won't do",
    body: [
      "We will not use your posts in our advertising, publish them anywhere else, sell them, or use them to train AI. If we ever wanted to, we would have to ask you separately, and you could say no.",
    ],
  },
  {
    title: "Next steps",
    body: [
      "Next you'll be asked to agree to the full Terms of Use, and then to sign a separate form giving us permission to share information about you with other members. You can read both in full, and you can download them. You can change your mind and cancel that permission at any time, though canceling can't undo what was already shared.",
    ],
  },
];

/** First-time consent. Patients can only agree once they've scrolled to the end. */
export function TermsModal({ sso, sig }: { sso: string; sig: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);

  // Open after the first paint, so the popup fades and scales in like it does in patient-web.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <Popup
      isOpen={isOpen}
      // Agreeing or declining are the only ways out.
      lockOpen
      onScrolledToEnd={() => setReachedEnd(true)}
      header="Welcome to QuickMD Together"
      body={
        <div className="flex flex-col gap-sp-3">
          <p className="text-scale-4 font-semibold text-text-dark">
            Before you join QuickMD Together, please read this all the way through.
          </p>
          <ul className="flex flex-col gap-sp-2">
            {sections.map(({ title, body }) => (
              <li key={title} className="flex flex-col gap-sp-0.5">
                <span className="text-scale-4 font-semibold text-text-dark">{title}</span>
                {body.map((paragraph) => (
                  <span key={paragraph} className="text-scale-4 text-text-medium">
                    {paragraph}
                  </span>
                ))}
              </li>
            ))}
          </ul>
          <a href={TERMS_PDF_URL} target="_blank" rel="noopener" className={`${link} text-scale-4 font-semibold`}>
            Read or download the Terms of Use and authorization (PDF)
          </a>
        </div>
      }
      footer={
        <form action={agreeToTerms} className="flex flex-col gap-sp-1">
          <input type="hidden" name="sso" value={sso} />
          <input type="hidden" name="sig" value={sig} />
          <Actions reachedEnd={reachedEnd} />
        </form>
      }
    />
  );
}

function Actions({ reachedEnd }: { reachedEnd: boolean }) {
  const { pending } = useFormStatus();

  return (
    <>
      <button type="submit" disabled={!reachedEnd || pending} className={`${button()} w-full`}>
        {pending ? "Joining…" : "I agree"}
      </button>
      {!reachedEnd && (
        <p className="text-center text-scale-2 text-text-light">Scroll to the end to continue.</p>
      )}
      <button
        type="submit"
        formAction={declineTerms}
        disabled={pending}
        className={`${button("tertiary")} w-full`}
      >
        Decline and sign out
      </button>
    </>
  );
}
