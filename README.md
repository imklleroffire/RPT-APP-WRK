# 🏥 RPT App - Physical Therapy & Rehabilitation Platform

> **Status:** 🚀 Published to Apple App Store Ecosystem (TestFlight Beta)

A comprehensive mobile application connecting physical therapists with patients for personalized rehabilitation programs, exercise tracking, and progress monitoring.

---

## 📱 **Platform Availability**

- **iOS:** Available on TestFlight (App Store Beta Program)
- **App Store Connect ID:** `6754540261`
- **Bundle Identifier:** `com.amtkumar.rptapp`
- **Version:** 1.0.0
- **Status:** In Beta Testing, Pending Public Release

**TestFlight Link:** https://appstoreconnect.apple.com/apps/6754540261/testflight/ios

---

## ✨ **Key Features**

### For Therapists:
- 👥 **Patient Management** - Create and manage patient profiles
- 💪 **Custom Exercise Bundles** - Build personalized rehabilitation programs
- 📊 **Progress Tracking** - Monitor patient completion rates and streaks
- 🏥 **Clinic Management** - Invite therapists and organize your practice
- 📧 **Real-time Notifications** - Stay connected with patients

### For Patients:
- 📱 **Exercise Programs** - View assigned exercises from your therapist
- 🔥 **Streak Calendar** - Track daily progress with visual calendars
- ✅ **Completion Tracking** - Mark exercises as complete
- 📈 **Progress Metrics** - See your improvement over time
- 🔔 **Therapist Connection** - Accept invitations and communicate

---

## 🛠️ **Technical Stack**

- **Framework:** React Native (v0.81.5) + Expo (SDK 54)
- **Navigation:** Expo Router
- **Backend:** Firebase (v11.10.0)
  - Authentication
  - Firestore Database
  - Cloud Storage
- **UI/UX:** Custom themed components with dark mode support
- **State Management:** React Context API
- **Calendar:** react-native-calendars
- **Animations:** React Native Reanimated

---

## 🔐 **Security & Privacy**

- **Authentication:** Secure email/password with Firebase Auth
- **Data Storage:** Encrypted Firebase Firestore
- **Privacy Compliant:** HIPAA-considerate data handling
- **Role-Based Access:** Separate therapist and patient permissions

---

## 🚀 **Deployment Information**

### **Production Build**
- **Build System:** EAS Build (Expo Application Services)
- **Distribution:** App Store (via TestFlight)
- **Code Signing:** Apple Developer Program
- **CI/CD:** Automated via EAS

### **App Store Submission**
- **Submitted:** October 26, 2025
- **Platform:** iOS (iPhone & iPad)
- **Category:** Medical, Health & Fitness
- **Price:** Free

---

## 📊 **Project Structure**

```
RPT-APP/
├── app/
│   ├── (auth)/          # Authentication screens
│   ├── (tabs)/          # Therapist navigation
│   ├── (patient-tabs)/  # Patient navigation
│   ├── components/      # Reusable UI components
│   ├── config/          # Firebase configuration
│   ├── context/         # React Context providers
│   ├── services/        # Business logic (streaks, etc.)
│   └── types/           # TypeScript definitions
├── assets/              # Images, fonts, icons
└── eas.json             # Build configuration
```

---

##📝 **Notable Achievements**

- ✅ **Full-stack mobile application** with real-time data synchronization
- ✅ **Production deployment** to Apple's App Store ecosystem
- ✅ **Firebase integration** with authentication and cloud database
- ✅ **Role-based access control** for therapists and patients
- ✅ **Advanced streak tracking system** with calendar visualization
- ✅ **Clinic management features** with therapist invitations
- ✅ **Real-time notifications** system

---

## 👨‍💻 **Developer**

**Amit Kumar**  
- **Apple Developer Program:** Active Member
- **GitHub:** [@imklleroffire](https://github.com/imklleroffire)
- **Email:** emailmeatamit@gmail.com

---

## 📄 **License & Usage**

This application is currently in beta testing. For access or inquiries, contact the developer.

---

## 🎯 **Future Roadmap**

- [ ] Public App Store release
- [ ] Android version
- [ ] Video exercise demonstrations
- [ ] In-app messaging between therapists and patients
- [ ] Analytics dashboard for therapists
- [ ] Export progress reports (PDF)

---

**Built with ❤️ for improving rehabilitation outcomes**
