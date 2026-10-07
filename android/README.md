# Book Bazaar — Android App (Kotlin & Jetpack Compose)

This is the native Android application for **Book Bazaar**, built with 100% Kotlin and Jetpack Compose. It is an identical implementation of the Book Bazaar web frontend.

---

## 📱 Features & Screens (1:1 with Web Frontend)

1. **Welcome / Landing Screen (`LandingScreen`)**:
   - Editorial Brand Header with logo, delivery info, and Sign In action.
   - "By class" and "By subject" navigation tabs.
   - Interactive Promotional Carousel with banner art, discount tags (up to 35% off), titles, and dot indicators.
   - Horizontal Subject Rail (Mathematics, Science, English, Hindi, Social Studies) with book counts.
   - Horizontal Class Rail (Class 01 through Class 12) with book counts.
   - "Build your school list" callout banner.

2. **Storefront / Shop Screen (`ShopScreen`)**:
   - Good morning greeting with user's name and school-ready badge.
   - Editorial Hero Banner: *"Let's get your school list sorted"* + *"Browse all books"* CTA.
   - "A Good Deal on a Great Start" promotional cards carousel.
   - Interactive "Shop by class" horizontal strip ("ALL Classes", Class 01–12) with live filtering.
   - Interactive "Or browse a subject" pill chips with live filtering.
   - "Build a subject bundle" multi-pack cards with one-tap bundle addition.
   - Dynamic 2-column book grid featuring custom vector book covers, stock status, ratings, discounts, favorite heart toggles, and add-to-cart buttons with micro-interaction feedback.
   - Bottom collection note with discovery CTA.

3. **Search & Filter Screen (`SearchScreen`)**:
   - Clean search input with clear button and keyboard search action.
   - Dropdown filter by Class (Class 1–12) and Subject.
   - Deal-only filtering.
   - Real-time result counter ("X titles").
   - Filter reset ("Clear filters").
   - Empty state guidance when no matching titles are found.

4. **Cart & Checkout Screen (`CartScreen`)**:
   - Itemized basket list with book covers, subject tags, authors, and line totals.
   - Quantity stepper controls (`[-] quantity [+]`) with automatic removal when reduced below 1.
   - Order summary card (Item count, subtotal, free delivery on us, total).
   - Expandable Delivery Details checkout form (Name, Phone, Address, City, State, Postal code).
   - Cash on delivery order placement.
   - Full order confirmation screen with celebratory checkmark, order ID `#ORD-XXXXX`, tracking CTA, and continue shopping navigation.

5. **Order History Screen (`OrdersScreen`)**:
   - Complete list of placed orders.
   - Status pills with color codes (`placed`, `processing`, `shipped`, `delivered`).
   - Order date, item count, thumbnails, title preview, and total amount.
   - Tap any card to navigate to detailed order tracking.

6. **Order Details Screen (`OrderDetailScreen`)**:
   - Delivery progress stepper (`placed` → `processing` → `shipped` → `delivered`) with active step indicator and checkmarks.
   - Parcel items breakdown with unit prices and quantities.
   - Delivery address and recipient details.
   - Cash on delivery payment summary.

7. **User Profile Screen (`ProfileScreen`)**:
   - Profile avatar with user initial, full name, email, and "Verified account" badge.
   - Quick navigation shortcuts to "Your orders" and "Your basket".
   - Sign Out action.
   - Customer support / get in touch mail action.

8. **Authentication Screens (`AuthScreens`)**:
   - Sign In and Sign Up screens with Book Bazaar editorial styling and demo user credentials.

---

## 🛠️ Tech Stack & Architecture

- **Language**: Kotlin 2.0.20
- **UI Framework**: Jetpack Compose (Material 3)
- **Architecture**: MVVM with reactive StateFlows
- **Navigation**: Jetpack Navigation Compose
- **Persistence**: SharedPreferences with Gson serialization (persisting Cart, Orders, and Favorites across sessions, matching `localStorage`)
- **Build System**: Gradle 8.10.2 + Android Gradle Plugin 8.7.0
- **Target SDK**: 35 (Android 15), **Min SDK**: 26 (Android 8.0)

---

## 🚀 Building & Running

### From Android Studio
1. Open the `/android` directory in Android Studio.
2. Allow Gradle sync to complete.
3. Select an emulator or connected device and click **Run (Shift+F10)**.

### From Command Line
- **Build Debug APK**:
  ```bash
  ./gradlew assembleDebug
  ```
  The generated APK is located at:
  `app/build/outputs/apk/debug/app-debug.apk`

- **Run Unit Tests**:
  ```bash
  ./gradlew testDebugUnitTest
  ```
