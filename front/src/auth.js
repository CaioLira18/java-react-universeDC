export const AUTH_KEY = 'dc_auth';
export const AUTH_CHANGED_EVENT = 'dc-auth-changed';

export const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};
