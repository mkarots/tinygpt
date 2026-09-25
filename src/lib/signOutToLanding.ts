export async function signOutToLanding(options: {
  signOut: () => Promise<unknown>;
  goToLanding: () => void;
}): Promise<void> {
  await options.signOut();
  options.goToLanding();
}
