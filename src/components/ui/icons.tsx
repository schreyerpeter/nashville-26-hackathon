// Small line icons for the community pages. They draw in currentColor, so color them with
// a text-* token (for example `text-coastal-blue-50`).

function Icon({ children, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-6 shrink-0"
      {...props}
    >
      {children}
    </svg>
  );
}

export function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x={5} y={11} width={14} height={10} rx={2} />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
  );
}

export function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx={12} cy={8} r={4} />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
  );
}

export function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x={3} y={5} width={18} height={14} rx={2} />
      <path d="m3 7 9 6 9-6" />
    </Icon>
  );
}

export function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

export function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </Icon>
  );
}

export function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  );
}

export function EyeIcon({ off = false, ...props }: { off?: boolean } & React.SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx={12} cy={12} r={3} />
      {off && <path d="m4 4 16 16" />}
    </Icon>
  );
}
