# 🎓 BTech Internals Calculator

A beautiful, modern React Native mobile application for calculating BTech internal marks with Material Design principles and smooth animations.

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-~54.0-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

### 🎨 Beautiful UI/UX
- **Material Design** principles throughout
- **Smooth animations** using React Native Animated API
- **Spring physics** for natural motion
- **Gradient effects** and elevation shadows
- **SafeArea** handling for all devices (notches, home indicators)

### 📱 Core Functionality
- **R23 Regulation Calculator** - Calculate internal marks based on assignments and mid exams
- **Preset Management** - Save and load calculations for different subjects
- **Quick Preview** - View final marks in the sidebar without opening presets
- **Smart Override** - Confirmation dialog when overwriting existing presets
- **Local Storage** - All data persists locally using AsyncStorage

### 🎭 Animations
- **Staggered card entrance** with spring bounce
- **Smooth drawer slide** with overlay fade
- **Pulsing save button** to draw attention
- **Modal spring animation** from bottom
- **List item cascade** with back-easing
- **Scale feedback** on button press

### 📊 Calculation Features
- Automatic calculation of halved assignment marks
- Mid-term assignments average (different for Mid 1 and Mid 2)
- Weighted final internal marks (80% best mid + 20% other mid)
- Real-time calculation updates
- Clear result visualization with color coding

## 🏗️ Project Structure

```
BTechInternalsCalculator/
├── frontend/                 # React Native Expo application
│   ├── app/                 # Application screens and components
│   │   ├── components/      # Reusable components
│   │   ├── utils/          # Utility functions (storage)
│   │   ├── index.tsx       # Home screen
│   │   ├── R23Page.tsx     # R23 calculator
│   │   └── _layout.tsx     # Navigation layout
│   ├── assets/             # Images and static assets
│   ├── package.json        # Dependencies
│   └── README.md          # Frontend documentation
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **iOS Simulator** (macOS) or **Android Emulator**
- **Expo Go** app (for physical device testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BTechInternalsCalculator
   ```

2. **Navigate to frontend**
   ```bash
   cd frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on device/emulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## 📖 How to Use

### Home Screen
1. Launch the app to see the regulation selection screen
2. Tap on **R23** to access the calculator
3. Enjoy the smooth entrance animations!

### Calculating Marks
1. Enter your **Assignment marks** (1-5)
2. Enter your **Mid exam marks** (short questions and main exam)
3. View **real-time calculations** in the Final Calculation card
4. Tap the pulsing **Save Preset** button to save your marks

### Managing Presets
1. Tap the **menu button** (☰) in the top-left corner
2. View all saved subjects with their final marks
3. Tap a preset to **load** it instantly
4. Tap the **trash icon** to delete a preset
5. **Swipe or tap outside** to close the drawer

### Formula Explanation

**For Mid 1:**
- Each assignment mark is halved and rounded up
- Average of (Assignment 1/2) and (Assignment 2/2)
- Mid 1 Internals = Short Q + Assignments Avg + (Mid 1 Marks/2)

**For Mid 2:**
- Each assignment mark is halved and rounded up
- Average of (Assignment 3/2), (Assignment 4/2), and (Assignment 5/2)
- Mid 2 Internals = Short Q + Assignments Avg + (Mid 2 Marks/2)

**Final Calculation:**
- Final = (Best Mid × 0.8) + (Other Mid × 0.2)
- Result is rounded up to nearest integer

## 🎨 Design System

### Colors
- **Primary**: `#FF6347` (Tomato Red) - Energy and action
- **Success**: `#FFD700` (Gold) - Achievement
- **Background**: `#f8f9fa` (Light Gray) - Reduced eye strain
- **Surface**: `#ffffff` (White) - Clean cards
- **Accent**: `#FFE5E0` (Pale Pink) - Icon backgrounds

### Typography
- **Headings**: 22-28px, weight 700-900
- **Body**: 15-16px, weight 600
- **Secondary**: 13-14px, weight 500-600

### Spacing
- **Grid**: 8px base unit
- **Padding**: 12-24px
- **Gaps**: 8-16px
- **Card Margins**: 20px

## 📦 Key Dependencies

- **@react-navigation/drawer** - Slide-out navigation
- **@react-native-async-storage/async-storage** - Local data persistence
- **@expo/vector-icons** - Icon library
- **react-native-safe-area-context** - Safe area handling
- **react-native-toast-message** - Toast notifications
- **expo-router** - File-based routing

## 🔧 Development

### Project Commands

```bash
# Start development server
npm start

# Start with cache clear
npm start -- --clear

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run linter
npm run lint

# Build for production
expo build:android
expo build:ios
```

### Adding New Regulations

1. Create a new page file in `app/` directory
2. Implement the calculation logic
3. Add route in `app/index.tsx`
4. Update the items array with new regulation

## 🐛 Troubleshooting

### Common Issues

**Issue**: Animations are choppy
- **Solution**: Enable `useNativeDriver: true` for all animations (already done)

**Issue**: SafeArea not working
- **Solution**: Ensure device has proper safe area (use physical device or simulator)

**Issue**: AsyncStorage not persisting
- **Solution**: Check app permissions and clear cache: `expo start --clear`

**Issue**: Drawer not closing on Android back button
- **Solution**: This is by design - use overlay tap or swipe gesture

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use **TypeScript** for type safety
- Follow **React hooks** conventions
- Use **functional components** over class components
- Maintain **Material Design** principles
- Add **animations** for delightful UX

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created with ❤️ by Avinash

## 🙏 Acknowledgments

- **React Native** team for the amazing framework
- **Expo** team for simplifying development
- **Material Design** for design guidelines
- **Ionicons** for beautiful icons

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Made with React Native + Expo** | **Designed for BTech Students** | **Built with Modern UX Principles**
