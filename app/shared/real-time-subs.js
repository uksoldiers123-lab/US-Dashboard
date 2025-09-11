import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = (location.origin.includes('localhost'))
  ? "http://localhost:54321" // adjust to your local dev
  : "https://gifguoyqccozlijrxgcf.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZmd1b3lxY2NvemxpanJ4Z2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTg2MzUsImV4cCI6MjA3MjE5NDYzNX0.gwZnr8fKE7qXuLi8B5Merul3cVAXZ1r6SaWEUoAJWX0;

export const SUPABASE = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function subscribeToUserNotifications(userId, onNewNotification) {
  const channel = SUPABASE
    .from(`notifications:user_id=eq.${userId}`)
    .on('INSERT', payload => {
      const n = payload.new;
      onNewNotification(n);
    })
    .subscribe();

  return channel;
}
