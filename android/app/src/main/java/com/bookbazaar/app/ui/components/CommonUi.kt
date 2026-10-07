package com.bookbazaar.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.LocalMall
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bookbazaar.app.ui.theme.DmSansFontFamily
import com.bookbazaar.app.ui.theme.PlayfairDisplayFontFamily
import com.bookbazaar.app.ui.theme.ForestBrand
import com.bookbazaar.app.ui.theme.ForestTitle
import com.bookbazaar.app.ui.theme.BorderCard
import com.bookbazaar.app.ui.theme.PaperBackground
import com.bookbazaar.app.ui.theme.CardWhite
import com.bookbazaar.app.ui.theme.StatusDeliveredBg
import com.bookbazaar.app.ui.theme.StatusDeliveredText
import com.bookbazaar.app.ui.theme.StatusPlacedBg
import com.bookbazaar.app.ui.theme.StatusPlacedText
import com.bookbazaar.app.ui.theme.StatusProcessingBg
import com.bookbazaar.app.ui.theme.StatusProcessingText
import com.bookbazaar.app.ui.theme.StatusShippedBg
import com.bookbazaar.app.ui.theme.StatusShippedText
import com.bookbazaar.app.ui.theme.TextMuted

fun formatMoney(amount: Int): String {
    return "₹$amount"
}

@Composable
fun PageHeading(
    title: String,
    modifier: Modifier = Modifier,
    kicker: String? = null,
    text: String? = null,
    trailingContent: (@Composable () -> Unit)? = null
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(modifier = Modifier.weight(1f)) {
                if (!kicker.isNullOrBlank()) {
                    Text(
                        text = kicker.uppercase(),
                        fontFamily = DmSansFontFamily,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestBrand,
                        letterSpacing = 1.2.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                }
                Text(
                    text = title,
                    fontSize = 26.sp,
                    fontFamily = PlayfairDisplayFontFamily,
                    fontWeight = FontWeight.Bold,
                    color = ForestTitle,
                    lineHeight = 30.sp
                )
                if (!text.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = text,
                        fontFamily = DmSansFontFamily,
                        fontSize = 13.sp,
                        color = TextMuted,
                        lineHeight = 18.sp
                    )
                }
            }
            if (trailingContent != null) {
                Spacer(modifier = Modifier.width(12.dp))
                trailingContent()
            }
        }
    }
}

@Composable
fun BusyIndicator(label: String = "Loading your books") {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(46.dp)
                .clip(CircleShape)
                .background(ForestBrand),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.AutoStories,
                contentDescription = null,
                tint = Color(0xFFF8F1D9),
                modifier = Modifier.size(24.dp)
            )
        }
        Spacer(modifier = Modifier.height(14.dp))
        Text(
            text = label,
            fontFamily = DmSansFontFamily,
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = ForestTitle
        )
        Spacer(modifier = Modifier.height(10.dp))
        CircularProgressIndicator(
            color = ForestBrand,
            modifier = Modifier.size(24.dp),
            strokeWidth = 2.5.dp
        )
    }
}

@Composable
fun EmptyState(
    title: String,
    text: String,
    actionLabel: String,
    onActionClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(CardWhite)
            .border(1.dp, BorderCard, RoundedCornerShape(16.dp))
            .padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(50.dp)
                .clip(CircleShape)
                .background(BorderCard.copy(alpha = 0.5f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.LocalMall,
                contentDescription = null,
                tint = ForestBrand,
                modifier = Modifier.size(26.dp)
            )
        }
        Spacer(modifier = Modifier.height(14.dp))
        Text(
            text = title,
            fontSize = 18.sp,
            fontFamily = PlayfairDisplayFontFamily,
            fontWeight = FontWeight.Bold,
            color = ForestTitle,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = text,
            fontFamily = DmSansFontFamily,
            fontSize = 13.sp,
            color = TextMuted,
            textAlign = TextAlign.Center,
            lineHeight = 18.sp
        )
        Spacer(modifier = Modifier.height(18.dp))
        Button(
            onClick = onActionClick,
            colors = ButtonDefaults.buttonColors(containerColor = ForestBrand),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                text = actionLabel,
                fontFamily = DmSansFontFamily,
                color = Color.White,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun StatusPill(status: String) {
    val pair: Pair<Color, Color> = when (status.lowercase()) {
        "placed" -> Pair(StatusPlacedBg, StatusPlacedText)
        "processing" -> Pair(StatusProcessingBg, StatusProcessingText)
        "shipped" -> Pair(StatusShippedBg, StatusShippedText)
        "delivered" -> Pair(StatusDeliveredBg, StatusDeliveredText)
        else -> Pair(BorderCard, ForestTitle)
    }
    val bgColor = pair.first
    val textColor = pair.second

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .padding(horizontal = 9.dp, vertical = 3.dp)
    ) {
        Text(
            text = status.replaceFirstChar { it.uppercase() },
            fontFamily = DmSansFontFamily,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.4.sp
        )
    }
}
