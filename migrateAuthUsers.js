

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateAuthUsers() {
    try {
        // Fetch all users from the Supabase authentication system
        const { data: authUsers, error: fetchError } = await supabase.auth.api.listUsers();

        if (fetchError) {
            throw fetchError;
        }

        // Insert each user into the new users table
        for (const user of authUsers) {
            const { data, error: insertError } = await supabase
                .from('users') // Your custom users table
                .insert([
                    {
                        id: user.id, // Use the Supabase user ID
                        email: user.email,
                        password: user.password, // Ensure this is hashed before storage
                        display_name: user.user_metadata.display_name || '',
                        bank: user.user_metadata.bank || '',
                        account_number: user.user_metadata.account_number || '',
                        phone: user.user_metadata.phone || '',
                        business_id: user.user_metadata.business_id || '', // If applicable
                        created_at: new Date(), // Set created at to now
                        updated_at: new Date()  // Set updated at to now
                    }
                ]);

            if (insertError) {
                console.error('Error inserting user:', insertError);
            } else {
                console.log(`User ${user.email} migrated successfully.`);
            }
        }
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Run the migration
migrateAuthUsers();
