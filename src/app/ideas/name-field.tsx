import { DEFAULT_NAME, NAME_MAX } from "./limits";
import { fieldClass } from "./styles";

export function NameField({ defaultValue }: { defaultValue: string }) {
  return (
    <input
      name="name"
      maxLength={NAME_MAX}
      aria-label="Your name"
      placeholder={`Your name (blank posts as ${DEFAULT_NAME})`}
      defaultValue={defaultValue}
      className={`${fieldClass} min-w-48 flex-1 sm:max-w-xs`}
    />
  );
}
