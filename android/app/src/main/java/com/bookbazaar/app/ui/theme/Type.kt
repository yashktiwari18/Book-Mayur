package com.bookbazaar.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.googlefonts.Font
import androidx.compose.ui.text.googlefonts.GoogleFont
import androidx.compose.ui.unit.sp
import com.bookbazaar.app.R

val fontProvider = GoogleFont.Provider(
    providerAuthority = "com.google.android.gms.fonts",
    providerPackage = "com.google.android.gms",
    certificates = R.array.com_google_android_gms_fonts_certs
)

val DmSansName = GoogleFont("DM Sans")
val PlayfairDisplayName = GoogleFont("Playfair Display")

val DmSansFontFamily = FontFamily(
    Font(googleFont = DmSansName, fontProvider = fontProvider, weight = FontWeight.Normal),
    Font(googleFont = DmSansName, fontProvider = fontProvider, weight = FontWeight.Medium),
    Font(googleFont = DmSansName, fontProvider = fontProvider, weight = FontWeight.SemiBold),
    Font(googleFont = DmSansName, fontProvider = fontProvider, weight = FontWeight.Bold)
)

val PlayfairDisplayFontFamily = FontFamily(
    Font(googleFont = PlayfairDisplayName, fontProvider = fontProvider, weight = FontWeight.Normal),
    Font(googleFont = PlayfairDisplayName, fontProvider = fontProvider, weight = FontWeight.Medium),
    Font(googleFont = PlayfairDisplayName, fontProvider = fontProvider, weight = FontWeight.SemiBold),
    Font(googleFont = PlayfairDisplayName, fontProvider = fontProvider, weight = FontWeight.Bold)
)

val Typography = Typography(
    headlineLarge = TextStyle(
        fontFamily = PlayfairDisplayFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 32.sp,
        lineHeight = 36.sp,
        color = ForestTitle,
        letterSpacing = (-0.5).sp
    ),
    headlineMedium = TextStyle(
        fontFamily = PlayfairDisplayFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 24.sp,
        lineHeight = 28.sp,
        color = ForestTitle,
        letterSpacing = (-0.3).sp
    ),
    headlineSmall = TextStyle(
        fontFamily = PlayfairDisplayFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 20.sp,
        lineHeight = 24.sp,
        color = ForestTitle
    ),
    titleLarge = TextStyle(
        fontFamily = DmSansFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 17.sp,
        lineHeight = 22.sp,
        color = ForestTitle
    ),
    titleMedium = TextStyle(
        fontFamily = DmSansFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 14.sp,
        lineHeight = 18.sp,
        color = ForestTitle
    ),
    titleSmall = TextStyle(
        fontFamily = DmSansFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        color = ForestTitle
    ),
    bodyLarge = TextStyle(
        fontFamily = DmSansFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        color = TextBody
    ),
    bodyMedium = TextStyle(
        fontFamily = DmSansFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 17.sp,
        color = TextBody
    ),
    bodySmall = TextStyle(
        fontFamily = DmSansFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 10.sp,
        lineHeight = 14.sp,
        color = TextMuted
    ),
    labelLarge = TextStyle(
        fontFamily = DmSansFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 13.sp,
        lineHeight = 16.sp
    ),
    labelMedium = TextStyle(
        fontFamily = DmSansFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 10.sp,
        lineHeight = 13.sp,
        letterSpacing = 1.sp
    ),
    labelSmall = TextStyle(
        fontFamily = DmSansFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 8.sp,
        lineHeight = 10.sp,
        letterSpacing = 1.2.sp
    )
)
