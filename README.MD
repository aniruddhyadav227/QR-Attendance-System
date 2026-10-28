# 🎟️ Campus QR Attendance & Event Manager

A modular, cross-platform mobile application built with **React Native** and **Expo** to streamline college events, hackathons, and club fests. It allows students to register for events and generates unique QR codes, while providing event organizers with an in-app scanner to instantly mark attendance.

## ✨ Key Features

**For Students:**
* 📅 Browse upcoming campus events and hackathons.
* 🎫 Instant registration with auto-generated unique QR Code tickets.
* 📱 Clean, intuitive UI to view event details (venue, timing).

**For Organizers (Admins):**
* 📷 Built-in QR Code Scanner using `expo-camera`.
* ⚡ Real-time ticket verification and attendance logging.
* 🛡️ Secure role-based access (Student vs Admin flows).

## 🛠️ Tech Stack
* **Frontend:** React Native, Expo
* **Navigation:** React Navigation (Stack & Bottom Tabs)
* **Components & Libraries:** `react-native-qrcode-svg`, `expo-camera`
* **Architecture:** Component-based modular architecture (15+ files)

## 📂 Folder Structure
```text
src/
├── components/      # Reusable UI elements (Buttons, Cards, QR Generator)
├── context/         # Global state management (Auth, Events)
├── navigation/      # Stack and Tab navigators
├── screens/         # App screens (Login, EventList, Ticket, Scanner)
├── services/        # Business logic and storage handlers
└── utils/           # Theme, constants, and dummy data