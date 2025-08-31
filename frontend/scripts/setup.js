#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Welcome to Whispr Setup!\n');
console.log('This script will help you configure your Supabase credentials.\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  try {
    console.log('First, you need to create a Supabase project:');
    console.log('1. Go to https://supabase.com');
    console.log('2. Sign up or log in');
    console.log('3. Create a new project');
    console.log('4. Wait for it to be ready');
    console.log('5. Go to Settings > API\n');

    const supabaseUrl = await question('Enter your Supabase Project URL: ');
    const supabaseKey = await question('Enter your Supabase Anon Key: ');

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Both URL and Key are required!');
      process.exit(1);
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch {
      console.log('❌ Invalid URL format!');
      process.exit(1);
    }

    // Create .env file
    const envContent = `# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}
`;

    fs.writeFileSync('.env', envContent);

    console.log('\n✅ Configuration saved to .env file!');
    console.log('\nNext steps:');
    console.log('1. Run "npm start" to start the development server');
    console.log('2. Open the app in Expo Go or simulator');
    console.log('3. Create an account and start chatting securely!\n');
    console.log('🔐 Your messages will be end-to-end encrypted!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup();
