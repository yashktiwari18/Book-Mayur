package com.bookbazaar.app.ui.theme

import androidx.compose.ui.graphics.Color

// Warm paper / linen backgrounds directly from Book Bazaar web stylesheet
val PaperBackground = Color(0xFFF8F5EC) // body background
val LandingBackground = Color(0xFFFBF8EF) // landing section background
val CardWhite = Color(0xFFFFFDF7) // .class-tile, .book-card, .summary-card, .profile-card
val CardSurfaceWarm = Color(0xFFF2EBDD) // promo-card tone 0
val CardSurfaceSage = Color(0xFFE8EFE5) // promo-card tone 1
val CardSurfaceSand = Color(0xFFF0E3D7) // promo-card tone 2
val CardSurfaceSubtle = Color(0xFFF0EEE3) // .bundle-card background
val BannerGreen = Color(0xFF285640) // .shop-hero background

// Borders
val BorderCard = Color(0xFFE8E1D4) // .book-card, .promo-card
val BorderWarm = Color(0xFFE6DFD1) // .class-tile, .summary-card, .cart-lines
val BorderLight = Color(0xFFEEE9DE) // line dividers
val BorderInput = Color(0xFFDED8CA) // .search-form, .checkout-form input

// Brand Forest Greens
val ForestBrand = Color(0xFF285B45) // .brand-mark, .button-primary, active pills
val ForestDark = Color(0xFF204A38) // .button-primary:hover
val ForestTitle = Color(0xFF284336) // body text, headings, .brand
val ForestSubtitle = Color(0xFF314F3F)
val ForestMuted = Color(0xFF39704F) // bottom nav selected

// Brand Terracotta & Warm Accents
val TerracottaAccent = Color(0xFFBD5C45) // .brand-accent, .eyebrow, logo accent
val TerracottaHover = Color(0xFFB75F48) // em text in headings, discounts
val TerracottaBadge = Color(0xFFBD5F48) // cart count bubble, heart button
val TerracottaLightBg = Color(0xFFF6E8E3)

// Gold / Sand Accents
val GoldSand = Color(0xFFD5B978) // hero eyebrow
val GoldWarm = Color(0xFFE1B779) // promo copy eyebrow
val GoldBadgeBg = Color(0xFFF4E5C8) // book badge background
val GoldBadgeText = Color(0xFF795A29) // book badge text
val GoldStar = Color(0xFFBD8D3D) // .book-rating star

// Neutral Texts
val TextBody = Color(0xFF284336)
val TextMuted = Color(0xFF718076)
val TextLight = Color(0xFF879187)
val TextPlaceholder = Color(0xFFA1A59B)

// Status Badges
val StatusPlacedText = Color(0xFFB75F48)
val StatusPlacedBg = Color(0xFFF6E8E3)

val StatusProcessingText = Color(0xFF8A6B2D)
val StatusProcessingBg = Color(0xFFF2EBD9)

val StatusShippedText = Color(0xFF4C7188)
val StatusShippedBg = Color(0xFFE6EDF2)

val StatusDeliveredText = Color(0xFF4B7351)
val StatusDeliveredBg = Color(0xFFE8EEE3)

// Navigation
val BottomNavBg = Color(0xFFFFFDF8)
val BottomNavBorder = Color(0xFFE8E2D6)
val BottomNavUnselected = Color(0xFF9AA098)
val BottomNavSelected = Color(0xFF39704F)

// Backwards-compatible aliases mapping to exact web tokens
val ForestPrimary = ForestBrand
val CreamBackground = PaperBackground
val CreamSurface = CardWhite
val CardBorder = BorderCard
val TextDark = ForestTitle
val AccentCoral = TerracottaAccent
val StarGold = GoldStar
val GreenSuccess = StatusDeliveredText
val GreenSuccessBg = StatusDeliveredBg
val StatusPlaced = StatusPlacedText
val StatusProcessing = StatusProcessingText
val StatusShipped = StatusShippedText
val StatusDelivered = StatusDeliveredText

