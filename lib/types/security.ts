export type PasswordCompromiseCheckResult = {
  compromised: boolean;
  count?: number;
  checkFailed?: boolean;
};
