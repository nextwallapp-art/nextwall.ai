const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function getOnboardingBannerDismissKey(userId: string): string {
  return `nextwall-onboarding-banner-dismissed-${userId}`;
}

export function shouldShowOnboardingBanner(
  lastOnboardingDate: string | null | undefined,
  userId: string,
): boolean {
  if (!lastOnboardingDate) return false;

  const elapsed = Date.now() - new Date(lastOnboardingDate).getTime();
  if (elapsed < WEEK_MS) return false;

  if (typeof window === "undefined") return false;

  const dismissedUntil = localStorage.getItem(
    getOnboardingBannerDismissKey(userId),
  );
  if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
    return false;
  }

  return true;
}

export function dismissOnboardingBanner(userId: string): void {
  localStorage.setItem(
    getOnboardingBannerDismissKey(userId),
    String(Date.now() + WEEK_MS),
  );
}

export function clearOnboardingBannerDismiss(userId: string): void {
  localStorage.removeItem(getOnboardingBannerDismissKey(userId));
}
