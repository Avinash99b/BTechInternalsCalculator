# 📱 BTech Internals Calculator - Frontend

Modern React Native Expo application with beautiful animations and Material Design principles.

## 🎯 Overview

This is the frontend mobile application for the BTech Internals Calculator. Built with React Native and Expo, it provides a smooth, animated experience for calculating and managing internal marks.

## 🛠️ Tech Stack

### Core
- **React Native**: 0.81.5
- **Expo**: ~54.0.20
- **TypeScript**: ~5.9.2
- **Expo Router**: ~6.0.13 (File-based routing)

### UI & Animations
- **React Native Animated API**: Native driver animations
- **Ionicons**: Vector icons (@expo/vector-icons)
- **Safe Area Context**: Device-safe layouts
- **Toast Messages**: User feedback notifications

### State & Storage
- **React Hooks**: useState, useEffect, useRef
- **AsyncStorage**: Local data persistence (@react-native-async-storage/async-storage)

### Navigation
- **React Navigation Drawer**: ~7.7.0
- **React Navigation Native**: ~7.1.8

## 📂 Directory Structure

```
frontend/
├── app/                          # Application code
│   ├── components/              # Reusable components
│   │   ├── Card.tsx            # Elevated card component
│   │   └── RegulationItem.tsx  # Regulation selection item
│   ├── utils/                   # Utility functions
│   │   └── storage.ts          # AsyncStorage helpers
│   ├── index.tsx               # Home screen (regulation selection)
│   ├── R23Page.tsx             # R23 calculator with drawer
│   └── _layout.tsx             # Root navigation layout
├── assets/                      # Static assets
│   └── images/                 # Image files
├── app.json                     # Expo configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── eslint.config.js            # ESLint configuration
└── README.md                   # This file
```

## 🎨 Component Architecture

### Main Components

#### `index.tsx` - Home Screen
- Regulation selection with animated cards
- Staggered entrance animations
- Material Design cards with elevation
- Responsive 2-column grid layout

**Key Features:**
- Parallel animations (fade, scale, slide)
- Back-easing for bounce effect
- Disabled state for coming soon items
- Toast notifications

#### `R23Page.tsx` - Calculator Screen
- Three animated cards (Mid 1, Mid 2, Final)
- Custom side drawer navigation
- Real-time calculation updates
- Preset save/load functionality

**Key Features:**
- Spring animations with tension/friction
- Staggered card entrance (150ms delay)
- Pulsing save button (continuous loop)
- Modal with scale animation

#### `SideDrawer` - Navigation Drawer
- Custom animated drawer (no library component)
- Preset management with animations
- Quick preview of final marks
- Delete with confirmation

**Key Features:**
- Spring slide animation (tension: 65, friction: 11)
- Overlay fade synchronization
- Staggered list items (100ms delay)
- Icon containers with circular backgrounds

### Reusable Components

#### `Card.tsx`
- Elevated surface with shadow
- Configurable elevation (Android & iOS)
- Rounded corners
- Optional show/hide animation

#### `RegulationItem.tsx`
- Pressable regulation button
- Scale animation on press
- Disabled state styling

## 🎭 Animation System

### Animation Types Used

1. **Timing Animations**
   - Smooth linear/easing transitions
   - Used for fades and slides
   - Duration: 300-800ms

2. **Spring Animations**
   - Physics-based motion
   - Natural bounce effect
   - Tension: 50-65, Friction: 7-11

3. **Staggered Animations**
   - Cascade effect for multiple items
   - Delay between items: 100-200ms
   - Creates visual flow

4. **Loop Animations**
   - Continuous pulsing
   - Used for save button
   - Sequence: expand → contract

### Native Driver

All animations use `useNativeDriver: true` for:
- 60 FPS performance
- Offloading to native thread
- Smooth animations on lower-end devices

**Supported properties:**
- `opacity`
- `transform` (translateX, translateY, scale, rotate)

**Not supported:**
- `width`, `height` (use scale instead)
- `backgroundColor` (use overlay instead)

## 💾 Storage System

### AsyncStorage Structure

```typescript
// Storage Key: '@internals_presets'
{
  presets: [
    {
      subjectName: "Mathematics",
      as1Marks: "20",
      as2Marks: "18",
      as3Marks: "19",
      as4Marks: "20",
      as5Marks: "17",
      mid1Marks: "48",
      mid1SQMarks: "5",
      mid2Marks: "45",
      mid2SQMarks: "4",
      finalInternals: 28.5
    }
  ]
}
```

### Storage Functions

- `savePreset(preset)`: Add or update preset
- `getPresets()`: Retrieve all presets
- `deletePreset(subjectName)`: Remove preset by name
- `presetExists(subjectName)`: Check if preset exists

## 🎨 Styling Guide

### StyleSheet Organization

Styles are organized by component sections:
- Drawer styles
- Header styles
- ScrollView styles
- Card styles
- Input styles
- Result styles
- Button styles
- Modal styles

### Design Tokens

```typescript
// Colors
Primary: '#FF6347'      // Tomato Red
Gold: '#FFD700'         // Achievement
Background: '#f8f9fa'   // Light Gray
Surface: '#ffffff'      // White
Border: '#e0e0e0'       // Light Border
Text: '#333333'         // Dark Text
Secondary: '#666666'    // Medium Text
Tertiary: '#999999'     // Light Text

// Spacing
base: 8px
small: 12px
medium: 16px
large: 20px
xlarge: 24px

// Border Radius
small: 8px
medium: 12px
large: 16px
xlarge: 20px

// Shadows (elevation)
small: elevation 3-4
medium: elevation 6-8
large: elevation 10
```

### Typography Scale

```typescript
// Font Sizes
xs: 10px   // Badge text
sm: 13px   // Secondary info
md: 14px   // Body text
base: 15px // Labels
lg: 16px   // Important text
xl: 18px   // Button text
2xl: 22px  // Card titles
3xl: 24px  // Modal titles
4xl: 28px  // Page titles
5xl: 32px  // Large display

// Font Weights
normal: '500'
semibold: '600'
bold: '700'
extrabold: '900'
```

## 🧪 Testing Locally

### Development Server

```bash
# Start Expo dev server
npm start

# Start with cache clear
npm start -- --clear

# Start with specific platform
npm start -- --android
npm start -- --ios
```

### Device Testing

1. **Physical Device (Recommended)**
   ```bash
   # Install Expo Go from App Store/Play Store
   # Scan QR code from terminal
   ```

2. **iOS Simulator (macOS only)**
   ```bash
   # Press 'i' in terminal
   # or
   npm run ios
   ```

3. **Android Emulator**
   ```bash
   # Press 'a' in terminal
   # or
   npm run android
   ```

### Testing Features

- **Animations**: Use physical device for 60 FPS
- **SafeArea**: Test on devices with notches (iPhone X+)
- **AsyncStorage**: Clear app data between tests
- **Drawer**: Test swipe gestures and overlay tap
- **Presets**: Save, load, and delete operations

## 🐛 Common Issues

### Animation Performance

**Problem**: Choppy animations
**Solution**: 
- Ensure `useNativeDriver: true`
- Test on physical device
- Reduce animation complexity

### Storage Issues

**Problem**: Data not persisting
**Solution**:
```bash
# Clear AsyncStorage
npx expo start --clear
```

### Layout Issues

**Problem**: Content under notch/status bar
**Solution**:
- Wrap in `SafeAreaView`
- Set correct `edges` prop
- Use parent View for background color

### TypeScript Errors

**Problem**: Type errors in components
**Solution**:
```bash
# Restart TypeScript server
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

## 🚀 Building for Production

### Android APK

```bash
# Build APK
eas build --platform android

# Build AAB (for Play Store)
eas build --platform android --profile production
```

### iOS IPA

```bash
# Build for TestFlight/App Store
eas build --platform ios

# Build for simulator
eas build --platform ios --profile preview
```

### Configuration

Update `app.json` before building:
```json
{
  "expo": {
    "name": "BTech Internals Calculator",
    "slug": "btech-internals-calculator",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "package": "com.yourcompany.btechinternals",
      "versionCode": 1
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.btechinternals",
      "buildNumber": "1.0.0"
    }
  }
}
```

## 📊 Performance Optimization

### Best Practices Implemented

1. **Native Driver Animations**
   - All animations use native driver
   - 60 FPS on most devices

2. **Memoization**
   - Calculations only run when inputs change
   - useRef for animation values

3. **Lazy Loading**
   - Components render only when visible
   - Drawer loads presets on open

4. **Optimized Re-renders**
   - Minimal state updates
   - Proper key props in lists

## 🎓 Learning Resources

### React Native
- [Official Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)

### Animations
- [Animated API](https://reactnative.dev/docs/animated)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/)

### Navigation
- [React Navigation](https://reactnavigation.org/)
- [Expo Router](https://expo.github.io/router/docs/)

## 🤝 Contributing to Frontend

### Setup Development Environment

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start dev server: `npm start`
4. Make changes and test thoroughly
5. Follow code style guidelines
6. Submit pull request

### Code Style

- Use TypeScript for all new code
- Follow functional component pattern
- Use hooks (no class components)
- Add animations for UI changes
- Maintain Material Design principles
- Comment complex logic

### Commit Messages

```
feat: Add new preset preview feature
fix: Resolve drawer animation glitch
style: Update color scheme
refactor: Simplify calculation logic
docs: Update component documentation
```

## 📞 Support

For frontend-specific issues:
1. Check this README
2. Review component code
3. Check React Native docs
4. Open an issue on GitHub

---

**Built with React Native + Expo** | **Designed for Performance** | **Optimized for UX**
