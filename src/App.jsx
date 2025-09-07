import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function signUp() {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) return setMessage(error.message);
    setMessage(`Check ${email} for confirmation, ${user?.email ?? ''}`);
  }

  async function signIn() {
    const { user, session, error } = await supabase.auth.signIn({ email, password });
    if (error) return setMessage(error.message);
    // Save token for API calls
    localStorage.setItem('sb_token', session.access_token);
    setMessage(`Signed in as ${user.email}`);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login to Dashboard</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <br />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <br />
      <button onClick={signIn}>Sign In</button>
      <button onClick={signUp} style={{ marginLeft: 8 }}>Sign Up</button>
      <p>{message}</p>
    </div>
  )
}

