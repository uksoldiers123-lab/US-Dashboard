// supabase/functions/stripe-webhook-public/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.1.0?target=deno&deno-std=0.177.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15', // Ensure this matches your Stripe account's API version if necessary
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    console.error('Error: Stripe-Signature header is missing.')
    return new Response(JSON.stringify({ error: 'Stripe-Signature header is missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // --- THIS IS THE CRITICAL PART ---
  // Must get the raw body as text *before* verification.
  const rawBody = await req.text() 
  
  console.log('Received raw body (first 100 chars):', rawBody.substring(0,100)); // Debugging
  console.log('Received signature:', signature); // Debugging

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody, // Pass the raw body here
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')! // The secret from your Supabase secrets
    )
  } catch (err) {
    // Handle verification failure
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(JSON.stringify({ error: 'Webhook signature verification failed', message: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // --- If verification is successful, handle the event ---
  console.log(`Successfully verified and received event: ${event.id} (Type: ${event.type})`)

  switch (event.type) {
    case 'v2.core.event_destination.ping':
      console.log('Stripe ping event received and verified.');
      break;
    // ... handle other event types as needed ...
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  // Acknowledge receipt to Stripe with a 200 OK
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
