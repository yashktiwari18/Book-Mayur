package com.bookbazaar.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.core.view.WindowCompat
import com.bookbazaar.app.ui.navigation.BookBazaarApp
import com.bookbazaar.app.ui.theme.BookBazaarTheme
import com.bookbazaar.app.viewmodel.BookBazaarViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: BookBazaarViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        setContent {
            BookBazaarTheme {
                BookBazaarApp(viewModel = viewModel)
            }
        }
    }
}
