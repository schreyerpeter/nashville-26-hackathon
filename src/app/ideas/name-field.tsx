import { field } from "@/components/ui/styles";

import { DEFAULT_NAME, NAME_MAX } from "./limits";

export function NameField({ defaultValue }: { defaultValue: string }) {
  return (
    <input
      name="name"
      maxLength={NAME_MAX}
      aria-label="Your name"
      placeholder={`Your name (blank posts as ${DEFAULT_NAME})`}
      defaultValue={defaultValue}
      className={`${field} h-11 min-w-48 flex-1 md:max-w-xs`}
    />
  );
}
