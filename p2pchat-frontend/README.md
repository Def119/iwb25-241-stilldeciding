# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

# Whispr - Connected. Unseen

A secure peer-to-peer chat application built with React Native and Expo, featuring end-to-end encryption and Supabase authentication.

## Features

- 🔐 **End-to-End Encryption**: Messages are encrypted using RSA-2048 encryption
- 🔑 **Secure Key Management**: Private keys are stored securely on device using Expo SecureStore
- 👤 **User Authentication**: Email-based authentication powered by Supabase
- 📱 **Cross-Platform**: Built with React Native and Expo for iOS, Android, and Web
- 🎨 **Modern UI**: Beautiful and intuitive interface with dark/light theme support

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- A Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd p2pchat-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Update the Supabase configuration in `lib/supabase.ts`:
     ```typescript
     const supabaseUrl = 'YOUR_SUPABASE_URL';
     const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
     ```

4. Start the development server:
   ```bash
   npm start
   ```

### Supabase Setup

1. **Create a Supabase Project**:
   - Visit [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and enter project details
   - Wait for the project to be ready

2. **Enable Email Authentication**:
   - Go to Authentication > Settings
   - Enable "Enable email confirmations" if you want email verification
   - Configure your email templates under Authentication > Templates

3. **Get Your Credentials**:
   - Go to Settings > API
   - Copy your "Project URL" and "anon public" key
   - Update these values in `lib/supabase.ts`

4. **Optional: Set up Custom Domains**:
   - For production, configure custom domains in Settings > General

## Project Structure

```
app/
├── (tabs)/                 # Tab navigation screens
│   ├── index.tsx          # Chat list screen
│   ├── profile.tsx        # User profile screen
│   └── _layout.tsx        # Tab layout
├── auth/                  # Authentication screens
│   ├── register.tsx       # Registration screen
│   └── login.tsx          # Login screen
├── _layout.tsx            # Root layout
└── index.tsx              # Entry point with auth routing

lib/
├── supabase.ts            # Supabase configuration
└── crypto.ts              # Encryption utilities

contexts/
└── AuthContext.tsx        # Authentication context
```

## Security Features

### End-to-End Encryption
- RSA-2048 key pairs are generated for each user
- Public keys are stored in Supabase user metadata
- Private keys are stored securely on-device using Expo SecureStore
- All messages are encrypted before transmission

### Authentication
- Email/password authentication via Supabase
- Secure token storage using Expo SecureStore
- Automatic session management and refresh

## Development

### Running the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

### Linting

```bash
npm run lint
```

## Building for Production

### iOS
1. Run `expo build:ios` or use EAS Build
2. Follow Expo's documentation for App Store submission

### Android
1. Run `expo build:android` or use EAS Build
2. Follow Expo's documentation for Play Store submission

### Web
1. Run `npm run web`
2. Build for production with `expo export:web`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Considerations

- Never commit your Supabase credentials to version control
- Use environment variables for production deployments
- Regularly rotate your Supabase keys
- Consider implementing additional security measures like rate limiting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
