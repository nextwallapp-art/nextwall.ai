"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function PaymentMethodIcons() {
  const { t } = useLanguage();

  return (
    <div className="mt-8">
      <p className="mb-4 text-center text-xs uppercase tracking-[0.18em] text-[#111111]/35">
        {t.payment.methods}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <PaymentBadge label="Visa">
          <VisaIcon />
        </PaymentBadge>
        <PaymentBadge label="Mastercard">
          <MastercardIcon />
        </PaymentBadge>
        <PaymentBadge label="Google Pay">
          <GooglePayIcon />
        </PaymentBadge>
        <PaymentBadge label="Apple Pay">
          <ApplePayIcon />
        </PaymentBadge>
      </div>
    </div>
  );
}

function PaymentBadge({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-label={label}
      className="flex h-10 min-w-[5rem] items-center justify-center rounded-md border border-[#bbbbbb] bg-[#ffffff] px-3"
    >
      {children}
    </div>
  );
}

function VisaIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-auto"
      viewBox="0 0 780 500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#1434CB"
        d="M489.15 0 451.5 500h-56.05L433.05 0h56.1Zm-186.9 0-89.85 343.65L175.5 36.9C169.05 12.3 149.4 0 126.6 0H0l2.55 16.65C39.6 24.6 68.25 42.75 87.9 66.6L152.25 500h58.65L489.15 0Z"
      />
      <path
        fill="#1434CB"
        d="M645.75 0c-28.05 0-48.9 15.15-61.5 35.1L424.8 500h58.8s27.45-72.6 33.75-88.35h83.1c6.6 24.45 25.8 88.35 25.8 88.35H675L645.75 0Zm-9.75 225.75h-63.45c4.05-10.35 19.8-48.3 19.8-48.3s10.65 27.75 19.05 48.3h24.6Z"
      />
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-auto"
      viewBox="0 0 152 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="55" cy="50" r="45" fill="#EB001B" />
      <circle cx="97" cy="50" r="45" fill="#F79E1B" />
      <path
        fill="#FF5F00"
        d="M76 14.5c-11.8 8.5-19.5 22.3-19.5 35.5s7.7 27 19.5 35.5c11.8-8.5 19.5-22.3 19.5-35.5S87.8 23 76 14.5Z"
      />
    </svg>
  );
}

function GooglePayIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-auto"
      viewBox="0 0 96 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M11.5 12.1V9.4h2.7c1.3 0 2.3 1 2.3 2.3 0 1.3-1 2.3-2.3 2.3h-1.1v-1.9h1.1c.3 0 .6-.2.6-.6 0-.3-.3-.6-.6-.6h-1.1V9.4H11.5v2.7Z"
      />
      <path
        fill="#EA4335"
        d="M18.2 9.4h1.7v5.4h-1.7V9.4Zm6.1 3.3c0 1-.8 1.8-1.9 1.8-1.1 0-1.9-.8-1.9-1.8s.8-1.8 1.9-1.8c1.1 0 1.9.8 1.9 1.8Zm-1.7 0c0-.4-.3-.7-.7-.7-.4 0-.7.3-.7.7 0 .4.3.7.7.7.4 0 .7-.3.7-.7Z"
      />
      <path
        fill="#FBBC04"
        d="M24.6 9.4h1.7l2.3 5.4h-1.7l-.4-1h-2.3l-.4 1h-1.7l2.5-5.4Zm1.4 3.2-.8-2.1-.8 2.1h1.6Z"
      />
      <path fill="#34A853" d="M30.2 12.1h3.2v1.4h-4.9V9.4h4.7v1.4h-3v1.3Z" />
      <path
        fill="#3C4043"
        d="M38.2 14.8V9.4h1.5v5.4h-1.5Zm8.2-5.4h1.5l2.2 5.4h-1.5l-.4-1h-2.2l-.4 1h-1.5l2.4-5.4Zm1.3 3.2-.7-1.8-.7 1.8h1.4Z"
      />
      <path
        fill="#3C4043"
        d="M52.2 12.1c0-1 .8-1.8 1.9-1.8.6 0 1.1.2 1.5.6l-1 .9c-.2-.2-.4-.3-.7-.3-.4 0-.7.3-.7.7 0 .4.3.7.7.7.2 0 .5-.1.6-.3l1 .9c-.4.4-.9.6-1.5.6-1.1 0-1.9-.8-1.9-1.8Z"
      />
      <path fill="#3C4043" d="M57.6 9.4h1.5v5.4h-1.5V9.4Z" />
      <path
        fill="#3C4043"
        d="M61.2 9.4h3.8c1.1 0 1.9.7 1.9 1.7 0 1-.8 1.7-1.9 1.7h-2.4v2h-1.4V9.4Zm3.7 2.8c.4 0 .7-.3.7-.6 0-.3-.3-.6-.7-.6h-2.3v1.2h2.3Z"
      />
    </svg>
  );
}

function ApplePayIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-auto"
      viewBox="0 0 72 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#000000"
        d="M10.2 4.1c-.5.6-1.3 1.1-2.1 1-.1-.8.3-1.6.8-2.1.5-.6 1.4-1 2.1-1 .1.8-.2 1.6-.8 2.1Zm.8 1.3c-1.1-.1-2 .6-2.5.6-.5 0-1.3-.6-2.1-.6-1.1 0-2.1.6-2.6 1.6-1.1 2-.3 4.9.8 6.5.5.8 1.1 1.6 1.9 1.6.8 0 1-.5 2-.5s1.2.5 2 .5c.8 0 1.3-.7 1.8-1.4.6-.8.8-1.6.8-1.7-.1 0-1.6-.6-1.6-2.5 0-1.6 1.2-2.3 1.3-2.4-1-.9-2.3-1-2.8-1Z"
      />
      <path
        fill="#000000"
        d="M21.2 6.2h2.1l2.4 6.6h-1.5l-.5-1.4h-2.8l-.5 1.4h-1.5l2.8-6.6Zm2 4-.9-2.5-.9 2.5h1.8ZM28.5 6.2h1.4v6.6h-1.4V6.2Zm4.2 0h3.9c1.2 0 2 .8 2 1.9 0 1.1-.8 1.9-2 1.9h-2.5v2.8h-1.4V6.2Zm3.8 3.1c.5 0 .8-.3.8-.7 0-.4-.3-.7-.8-.7h-2.4v1.4h2.4Z"
      />
    </svg>
  );
}
