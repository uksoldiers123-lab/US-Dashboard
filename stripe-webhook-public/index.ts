// Import necessary libraries
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.1.0?target=deno&deno-std=0.177.0'

// Initialize the Stripe client with your secret key and configure it for Deno
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15', // Use your desired Stripe API version
  httpClient: Stripe.createFetchHttpClient(),
})

// Define your GitHub repository details
const GITHUB_REPO_OWNER = 'YOUR_GITHUB_USERNAME'; // e.g., 'johndoe'
const GITHUB_REPO_NAME = 'YOUR_REPO_NAME'; // e.g., 'my-supabase-functions' or 'my-website'
const GITHUB_BRANCH = 'main'; // The branch you want to commit to

// Helper function to interact with GitHub API
async function updateGitHubRepo(filePath: string, content: string, commitMessage: string) {
  const GITHUB_PAT = Deno.env.get('GITHUB_PAT');
  if (!GITHUB_PAT) {
    console.error('GitHub PAT not found in environment variables.');
    return { success: false, error: 'GitHub PAT missing' };
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`;

  // GitHub requires content to be Base64 encoded
  const encodedContent = btoa(content); // btoa is available in Deno

  // Try to get the existing file's SHA to update it
  let sha = undefined;
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'User-Agent': 'Supabase-Edge-Function', // Required User-Agent
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      sha = data.sha;
      console.log(`Found existing file SHA for ${filePath}: ${sha}`);
    } else if (response.status !== 404) { // 404 is okay, means file doesn't exist yet
      console.error(`Error fetching existing file ${filePath}: ${response.status} ${response.statusText}`);
      return { success: false, error: `Error fetching existing file: ${response.statusText}` };
    }
  } catch (err) {
    console.error(`Network error fetching file ${filePath}: ${err.message}`);
    return { success: false, error: `Network error fetching file: ${err.message}` };
  }

  // Create/Update file payload
  const payload = {
    message: commitMessage,
    content: encodedContent,
    sha: sha, // Include SHA if updating an existing file
    branch: GITHUB_BRANCH,
  };

  try {
    const response = await fetch(url, {
      method: 'PUT', // PUT for creating or updating files
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'User-Agent': 'Supabase-Edge-Function',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`Successfully updated/created file ${filePath} on GitHub.`);
      const responseData = await response.json();
      return { success: true, commitSha: responseData.commit.sha };
    } else {
      const errorText = await response.text();
      console.error(`Failed to update/create file ${filePath} on GitHub: ${response.status} ${response.statusText} - ${errorText}`);
      return { success: false, error: `GitHub API error: ${response.statusText} - ${errorText}` };
    }
  } catch (err) {
    console.error(`Network error updating/creating file ${filePath}: ${err.message}`);
    return { success: false, error: `Network error: ${err.message}` };
  }
}


// The main function that handles requests
serve(async (req: Request) => {
  // 1. Check for the correct HTTP method
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    })
  }

  // 2. Get the Stripe signature from the request headers
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    console.error('Error: Stripe-Signature header is missing.')
    return new Response(JSON.stringify({ error: 'Stripe-Signature header is missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 3. Get the raw request body as text (this is crucial for verification)
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    // 4. Verify the webhook signature
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')! // Your webhook signing secret
    )
  } catch (err) {
    // Handle verification failure
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(JSON.stringify({ error: 'Webhook signature verification failed', message: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 5. If verification is successful, handle the event
  console.log(`Successfully verified and received event: ${event.id} (Type: ${event.type})`)

  let githubUpdateResult = { success: false, error: 'No GitHub action performed' };

  // Use a switch statement to handle the specific event types you care about
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      console.log(`Checkout session completed for customer: ${session.customer_details?.email}`)

      // Example: Create a new file in your GitHub repo with session details
      const fileName = `checkout_sessions/${session.id}.json`;
      const fileContent = JSON.stringify({
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency,
        status: session.status,
        createdAt: new Date().toISOString(),
      }, null, 2); // Pretty print JSON

      const commitMessage = `Add checkout session data for ${session.id}`;

      githubUpdateResult = await updateGitHubRepo(fileName, fileContent, commitMessage);
      if (githubUpdateResult.success) {
        console.log(`GitHub file created: ${fileName}`);
      } else {
        console.error(`Failed to create GitHub file: ${githubUpdateResult.error}`);
      }

      // --- YOUR OTHER BUSINESS LOGIC HERE ---
      // e.g., Update your Supabase database as well.
      break
    }

    // Add other event types you want to handle and how they interact with GitHub
    // case 'customer.created': {
    //   const customer = event.data.object as Stripe.Customer;
    //   const fileName = `customers/${customer.id}.json`;
    //   const fileContent = JSON.stringify(customer, null, 2);
    //   githubUpdateResult = await updateGitHubRepo(fileName, fileContent, `Add customer data for ${customer.id}`);
    //   break;
    // }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  // 6. Return a 200 OK response to Stripe to acknowledge receipt
  if (!githubUpdateResult.success) {
      // If GitHub interaction failed, return a 500 so Stripe might retry (depending on their retry policy)
      return new Response(JSON.stringify({ received: true, github_action_status: 'failed', error: githubUpdateResult.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
  }
  return new Response(JSON.stringify({ received: true, github_action_status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
