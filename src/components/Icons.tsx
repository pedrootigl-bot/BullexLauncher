type IconProps = {
  size?: number
  className?: string
}

/** Silhueta limpa do touro (marca BullVerse) */
export function BullMark({ size = 28, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 22c0-1.4.4-2.8 1.2-4l3.6-5.2c.7-1 1.9-1.5 3.1-1.4l5.3.5c1.5.1 3-.5 4.1-1.7L32 4l6.7 6.2c1.1 1.2 2.6 1.8 4.1 1.7l5.3-.5c1.2-.1 2.4.4 3.1 1.4L55 18c.8 1.2 1.2 2.6 1.2 4v4.6c0 1.1-.5 2.2-1.4 2.9l-3.2 2.4c-.7.5-1.1 1.3-1.1 2.2v3.3c0 .9.3 1.7.9 2.4l2.8 3.1c.8.9.9 2.2.3 3.2L50 53.2c-.7 1.1-1.9 1.8-3.2 1.8H17.2c-1.3 0-2.5-.7-3.2-1.8L9.5 45.7c-.6-1-.5-2.3.3-3.2l2.8-3.1c.6-.7.9-1.5.9-2.4v-3.3c0-.9-.4-1.7-1.1-2.2l-3.2-2.4c-.9-.7-1.4-1.8-1.4-2.9V22Z" />
      <path
        fill="#050505"
        d="M22.5 28.5c1.8 5.2 5.4 8.5 9.5 8.5s7.7-3.3 9.5-8.5c-1.4.8-3.1 1.3-4.8 1.3-2 0-3.8-.7-5-2-1.2 1.3-3 2-5 2-1.7 0-3.4-.5-4.8-1.3Z"
      />
      <path
        fill="#050505"
        d="M26.2 25.2c.6 1.8 1.8 3.1 3.3 3.6-.1-1.3.3-2.7 1.1-3.8-.8-.3-1.7-.3-2.5 0h-.1c-.7.2-1.3.7-1.8 1.4Zm11.6 0c-.5-.7-1.1-1.2-1.8-1.4h-.1c-.8-.3-1.7-.3-2.5 0 .8 1.1 1.2 2.5 1.1 3.8 1.5-.5 2.7-1.8 3.3-3.6Z"
      />
    </svg>
  )
}

export function TargetIcon({ size = 22, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
    </svg>
  )
}

export function ChartIcon({ size = 22, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15V11" />
      <path d="M12 15V8" />
      <path d="M16 15v-4" />
      <path d="M7.5 9.5 12 6l3.5 2.5L20 5" />
      <circle cx="20" cy="5" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PeopleIcon({ size = 22, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="7.5" r="2.75" />
      <path d="M3.5 18.5c.8-3 3-4.75 5.5-4.75s4.7 1.75 5.5 4.75" />
      <circle cx="16.5" cy="8.25" r="2.15" />
      <path d="M13.25 18.5c.4-1.85 1.55-3.15 3.25-3.5 1.9.25 3.2 1.55 3.6 3.5" />
    </svg>
  )
}

export function MailIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

export function LockIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function EyeIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  )
}

export function EyeOffIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 3 18 18" />
      <path d="M9.9 5.2A10 10 0 0 1 12 5c6 0 9.5 7 9.5 7a16 16 0 0 1-3.4 4.1" />
      <path d="M6.5 6.6A16 16 0 0 0 2.5 12s3.5 7 9.5 7c1.5 0 2.9-.3 4.1-.9" />
      <path d="M10.5 10.6a2.75 2.75 0 0 0 3.2 3.2" />
    </svg>
  )
}

export function ArrowIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 12h15" />
      <path d="m13.5 6.5 6 5.5-6 5.5" />
    </svg>
  )
}

export function GoogleIcon({ size = 20, className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  )
}

export function DiscordIcon({ size = 20, className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        fill="#5865F2"
        d="M20.32 4.37A19.8 19.8 0 0 0 15.89 3l-.2.36a13.3 13.3 0 0 1 3.55 1.36 13.1 13.1 0 0 0-12.48 0A13.3 13.3 0 0 1 10.3 3.36L10.1 3a19.8 19.8 0 0 0-4.43 1.37C2.73 8.05 2 11.5 2.2 14.9a19.9 19.9 0 0 0 6.02 3.05l.84-1.4c-.7-.26-1.36-.58-1.98-.96l.4-.31c3.34 1.55 6.96 1.55 10.26 0l.4.31c-.62.38-1.28.7-1.98.96l.84 1.4a19.9 19.9 0 0 0 6.02-3.05c.4-3.74-.55-7.15-2.9-10.53ZM9.2 13.55c-.9 0-1.64-.83-1.64-1.85s.73-1.85 1.64-1.85 1.66.83 1.64 1.85-.74 1.85-1.64 1.85Zm5.6 0c-.9 0-1.64-.83-1.64-1.85s.73-1.85 1.64-1.85 1.66.83 1.64 1.85-.74 1.85-1.64 1.85Z"
      />
    </svg>
  )
}

export function AppleIcon({ size = 20, className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        fill="#F5F5F7"
        d="M16.65 12.84c0-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.72-1.35-.14-2.64.8-3.32.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.54 2.66-.39 6.6 1.1 8.76.73 1.05 1.6 2.23 2.74 2.19 1.1-.05 1.51-.7 2.84-.7 1.32 0 1.7.7 2.86.68 1.19-.02 1.93-1.06 2.65-2.12.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.27-.87-2.3-3.56ZM14.5 6.5c.59-.72 1-1.72.89-2.72-1.02.04-2.18.68-2.87 1.48-.62.7-1.17 1.74-.97 2.76 1.09.08 2.2-.55 2.95-1.52Z"
      />
    </svg>
  )
}
