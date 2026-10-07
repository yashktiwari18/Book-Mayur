package com.bookbazaar.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = ForestBrand,
    onPrimary = CardWhite,
    primaryContainer = CardSurfaceWarm,
    onPrimaryContainer = ForestTitle,
    secondary = TerracottaAccent,
    onSecondary = CardWhite,
    background = PaperBackground,
    onBackground = ForestTitle,
    surface = CardWhite,
    onSurface = ForestTitle,
    surfaceVariant = CardSurfaceWarm,
    onSurfaceVariant = TextMuted,
    outline = BorderCard
)

@Composable
fun BookBazaarTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                @Suppress("DEPRECATION")
                window.statusBarColor = PaperBackground.toArgb()
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = true
            }
        }
    }

    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        content = content
    )
}
