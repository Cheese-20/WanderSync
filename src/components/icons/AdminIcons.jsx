import React from 'react';

/**
 * Line icons for the admin screens.
 *
 * These replace the emoji glyphs that were previously used as card and empty-state
 * icons. Emoji render differently on every OS and can't be styled, so they never
 * matched the project palette. Each icon here is an inline SVG that strokes with
 * `currentColor`, meaning the surrounding CSS `color` decides the tint.
 *
 * All icons share a 24x24 viewBox so they stay optically consistent at any size.
 */

function Icon({ size = 24, title, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/** A single person: used for newly created profiles. */
export function UserIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </Icon>
  );
}

/** Warning triangle: used for reported accounts. */
export function AlertTriangleIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.75 2.75 19.75h18.5L12 3.75Z" />
      <path d="M12 9.5v4" />
      <path d="M12 16.75h.01" />
    </Icon>
  );
}

/** Check inside a circle: used for active users. */
export function CheckCircleIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.75 2.75L16.25 9.5" />
    </Icon>
  );
}

/** Five point star: used for top rated experiences. */
export function StarIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.25l2.72 5.51 6.09.89-4.4 4.29 1.04 6.06L12 17.13l-5.45 2.87 1.04-6.06-4.4-4.29 6.09-.89L12 3.25Z" />
    </Icon>
  );
}

/** Trophy: used for top rated local guides. */
export function TrophyIcon(props) {
  return (
    <Icon {...props}>
      <path d="M8 3.75h8v5.5a4 4 0 0 1-8 0v-5.5Z" />
      <path d="M8 5.25H5.6a2.4 2.4 0 0 0 0 4.8H8" />
      <path d="M16 5.25h2.4a2.4 2.4 0 0 1 0 4.8H16" />
      <path d="M12 13.25v3.5" />
      <path d="M9.25 20.25h5.5l-.6-3.5h-4.3l-.6 3.5Z" />
    </Icon>
  );
}

/** Clipboard with lines: used for the empty applications state. */
export function ClipboardIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9.5 4.25h5v2.5h-5v-2.5Z" />
      <path d="M14.5 5.5H17a1.75 1.75 0 0 1 1.75 1.75v11.5A1.75 1.75 0 0 1 17 20.5H7a1.75 1.75 0 0 1-1.75-1.75V7.25A1.75 1.75 0 0 1 7 5.5h2.5" />
      <path d="M9 11.5h6" />
      <path d="M9 15h4" />
    </Icon>
  );
}

/** Shield: used for the empty reported accounts state. */
export function ShieldIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 20.75c4.5-2.1 7-5.6 7-9.75V6L12 3.25 5 6v5c0 4.15 2.5 7.65 7 9.75Z" />
    </Icon>
  );
}

/** Map pin: used for the empty reported spots state. */
export function MapPinIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 20.75s6.75-5.6 6.75-10.5a6.75 6.75 0 1 0-13.5 0c0 4.9 6.75 10.5 6.75 10.5Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  );
}
