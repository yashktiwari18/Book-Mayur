package com.bookbazaar.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bookbazaar.app.model.Book

@Composable
fun BookCover(
    book: Book,
    modifier: Modifier = Modifier
) {
    val (primaryColor, secondaryColor, accentColor) = when (book.subject.lowercase()) {
        "mathematics" -> Triple(Color(0xFF193B37), Color(0xFF24675C), Color(0xFFE3B45F))
        "english" -> Triple(Color(0xFF1C2C42), Color(0xFF28446B), Color(0xFFF3C28D))
        "science" -> Triple(Color(0xFF13383B), Color(0xFF1F575E), Color(0xFF86E3CE))
        "social studies" -> Triple(Color(0xFF3E2723), Color(0xFF5D382B), Color(0xFFE0A96D))
        "hindi" -> Triple(Color(0xFF422617), Color(0xFF6E3E23), Color(0xFFF0B36D))
        "physics" -> Triple(Color(0xFF1A2238), Color(0xFF2D3C66), Color(0xFF90CAF9))
        "chemistry" -> Triple(Color(0xFF2B1C38), Color(0xFF4C2F63), Color(0xFFCE93D8))
        "biology" -> Triple(Color(0xFF1B382B), Color(0xFF2D5C43), Color(0xFFA5D6A7))
        else -> Triple(Color(0xFF285B45), Color(0xFF1F4736), Color(0xFFE3B45F))
    }

    Box(
        modifier = modifier
            .shadow(4.dp, RoundedCornerShape(8.dp))
            .clip(RoundedCornerShape(8.dp))
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(primaryColor, secondaryColor),
                    start = Offset(0f, 0f),
                    end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
                )
            )
    ) {
        // Geometric vector decorations
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height

            // Book spine line shadow on left edge
            drawLine(
                color = Color.Black.copy(alpha = 0.25f),
                start = Offset(width * 0.04f, 0f),
                end = Offset(width * 0.04f, height),
                strokeWidth = 3f
            )
            drawLine(
                color = Color.White.copy(alpha = 0.15f),
                start = Offset(width * 0.06f, 0f),
                end = Offset(width * 0.06f, height),
                strokeWidth = 2f
            )

            // Center subject emblem / circles
            drawCircle(
                color = accentColor.copy(alpha = 0.12f),
                radius = width * 0.35f,
                center = Offset(width * 0.72f, height * 0.25f)
            )

            // Subject specific geometric lines
            when (book.subject.lowercase()) {
                "mathematics" -> {
                    drawLine(
                        color = accentColor.copy(alpha = 0.45f),
                        start = Offset(width * 0.25f, height * 0.65f),
                        end = Offset(width * 0.5f, height * 0.35f),
                        strokeWidth = 5f
                    )
                    drawLine(
                        color = accentColor.copy(alpha = 0.45f),
                        start = Offset(width * 0.5f, height * 0.35f),
                        end = Offset(width * 0.75f, height * 0.65f),
                        strokeWidth = 5f
                    )
                    drawLine(
                        color = accentColor.copy(alpha = 0.45f),
                        start = Offset(width * 0.35f, height * 0.53f),
                        end = Offset(width * 0.65f, height * 0.53f),
                        strokeWidth = 4f
                    )
                }
                "science", "physics" -> {
                    drawCircle(
                        color = accentColor.copy(alpha = 0.4f),
                        radius = width * 0.22f,
                        center = Offset(width * 0.5f, height * 0.48f),
                        style = Stroke(width = 3f)
                    )
                    drawCircle(
                        color = accentColor.copy(alpha = 0.7f),
                        radius = width * 0.06f,
                        center = Offset(width * 0.5f, height * 0.48f)
                    )
                }
                else -> {
                    drawCircle(
                        color = accentColor.copy(alpha = 0.3f),
                        radius = width * 0.18f,
                        center = Offset(width * 0.5f, height * 0.46f),
                        style = Stroke(width = 3f)
                    )
                }
            }

            // Accent divider line near bottom
            drawLine(
                color = accentColor.copy(alpha = 0.6f),
                start = Offset(width * 0.15f, height * 0.78f),
                end = Offset(width * 0.85f, height * 0.78f),
                strokeWidth = 2.5f
            )
        }

        // Cover Typography
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 10.dp, vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "BOOK BAZAAR",
                color = accentColor,
                fontSize = 7.5.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.2.sp
            )
            Text(
                text = "STUDY EDITION",
                color = accentColor.copy(alpha = 0.8f),
                fontSize = 6.sp,
                letterSpacing = 0.8.sp
            )

            Spacer(modifier = Modifier.weight(1f))

            Text(
                text = book.subject.uppercase(),
                color = Color(0xFFFFF8E8),
                fontSize = 12.sp,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.8.sp,
                textAlign = TextAlign.Center,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = "CLASS ${book.classLevel}",
                color = accentColor,
                fontSize = 7.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
        }
    }
}
