# Health Nutrition App

A mobile application built with React Native and Expo that helps users manage their health and nutrition by scanning food barcodes and receiving personalized recipe recommendations.

## Features

- **Barcode Scanning**: Scan food products to retrieve nutritional information
- **Health Tags**: Filter and search products by health conditions and dietary preferences
- **Recipe Recommendations**: Get personalized recipe suggestions based on health conditions
- **User Profiles**: Create and manage personalized health profiles
- **Firebase Integration**: Cloud-based user authentication and data storage
- **AI-Powered Recommendations**: Leverages AI to provide intelligent recipe and product suggestions

## Tech Stack

- **Frontend**: React Native with Expo
- **Language**: JavaScript/TypeScript
- **Backend**: Firebase (Authentication & Firestore)
- **Build System**: Gradle (Android), EAS Build
- **AI Integration**: OpenAI API

## Project Structure

```
├── src/
│   ├── components/          # Reusable React components
│   ├── screens/             # Application screens
│   ├── navigation/          # Navigation configuration
│   ├── services/            # API and service integrations
│   ├── config/              # Configuration files
│   ├── context/             # React Context state management
│   ├── data/                # Static data and constants
│   └── styles/              # Theme and styling
├── scripts/                 # Utility scripts
├── android/                 # Android native code
├── assets/                  # Static assets
└── package.json             # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Firebase project setup

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd health-nutrition-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Update `src/config/firebase.js` with your Firebase credentials

4. Start the development server:
```bash
expo start
```

5. Run on Android:
```bash
expo run:android
```

## Scripts

- `npm start` - Start the Expo development server
- `fixBarcodes.js` - Utility to process and fix barcode data
- `uploadBarcodes.js` - Upload barcode data to the system
- `stripOpenAIKey.js` - Remove API keys from code before committing

## Key Components

- **HomeScreen**: Main dashboard for users
- **ScanScreen**: Barcode scanning interface
- **RecipesScreen**: Browse and search recipes
- **ProfileScreen**: User profile management
- **BarcodeScanner**: Barcode scanning functionality

## Services

- **aiService.js**: AI-powered recommendations using OpenAI
- **firebaseService.js**: Firebase authentication and database operations

## Data

- `barcodes.js`: Barcode database
- `healthConditions.js`: Health conditions and dietary preferences

## Development

### Building for Android

```bash
eas build --platform android
```

### Building for iOS (if applicable)

```bash
eas build --platform ios
```

## Configuration Files

- `app.json` - Expo application configuration
- `tsconfig.json` - TypeScript configuration
- `eas.json` - EAS Build configuration
- `build.gradle` - Android build configuration

## Environment Variables

Ensure the following are set up:
- Firebase API credentials
- OpenAI API key (used in aiService)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test on both iOS and Android (if applicable)
4. Submit a pull request

## License

[Add your license information here]

## Contact

For questions or support, please contact [your contact information]

## Troubleshooting

- **Barcode scanning issues**: Ensure camera permissions are granted
- **Build errors**: Clear cache with `expo prebuild --clean`
- **Firebase connection issues**: Verify Firebase configuration in `src/config/firebase.js`
