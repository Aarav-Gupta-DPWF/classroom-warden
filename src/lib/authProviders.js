/** OAuth providers enabled in Supabase → Authentication → Providers */
export const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Continue with Google', shortLabel: 'Google', icon: 'G', brandClass: 'oauth-google' },
  { id: 'github', label: 'Continue with GitHub', shortLabel: 'GitHub', icon: '⌘', brandClass: 'oauth-github' },
  { id: 'apple', label: 'Continue with Apple', shortLabel: 'Apple', icon: '', brandClass: 'oauth-apple' },
  { id: 'yahoo', label: 'Continue with Yahoo', shortLabel: 'Yahoo', icon: 'Y', brandClass: 'oauth-yahoo' },
];

export function authRedirectUrl() {
  return `${window.location.origin}/welcome`;
}
