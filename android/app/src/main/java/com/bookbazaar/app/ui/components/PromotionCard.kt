package com.bookbazaar.app.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.NorthEast
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bookbazaar.app.R
import com.bookbazaar.app.model.Promotion
import com.bookbazaar.app.ui.theme.CardSurfaceSage
import com.bookbazaar.app.ui.theme.CardSurfaceSand
import com.bookbazaar.app.ui.theme.CardWhite
import com.bookbazaar.app.ui.theme.DmSansFontFamily
import com.bookbazaar.app.ui.theme.ForestBrand
import com.bookbazaar.app.ui.theme.ForestTitle
import com.bookbazaar.app.ui.theme.GoldSand
import com.bookbazaar.app.ui.theme.PaperBackground
import com.bookbazaar.app.ui.theme.PlayfairDisplayFontFamily
import com.bookbazaar.app.ui.theme.TerracottaAccent
import com.bookbazaar.app.ui.theme.TextMuted

@Composable
fun PromotionCard(
    promo: Promotion,
    index: Int,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val bgColor = when (index % 3) {
        0 -> ForestBrand
        1 -> Color(0xFF596E78)
        else -> CardSurfaceSand
    }
    val isLight = index % 3 == 2
    val textColor = if (isLight) ForestTitle else Color.White
    val mutedColor = if (isLight) TextMuted else Color.White.copy(alpha = 0.85f)

    Box(
        modifier = modifier
            .width(280.dp)
            .height(200.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(bgColor)
            .clickable { onClick() }
    ) {
        // Editorial background image overlay
        Image(
            painter = painterResource(id = if (index % 2 == 0) R.drawable.books_editorial else R.drawable.reading_sale),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
            alpha = if (isLight) 0.12f else 0.25f
        )

        // Gradient overlay
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            bgColor.copy(alpha = 0.65f),
                            bgColor.copy(alpha = 0.95f)
                        )
                    )
                )
        )

        // Top right promo sequence number (e.g. 01, 02)
        Text(
            text = "0${index + 1}",
            color = textColor.copy(alpha = 0.22f),
            fontSize = 34.sp,
            fontFamily = PlayfairDisplayFontFamily,
            fontWeight = FontWeight.Bold,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(14.dp)
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = promo.eyebrow,
                    fontFamily = DmSansFontFamily,
                    color = if (isLight) ForestBrand else GoldSand,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp
                )
                Spacer(modifier = Modifier.height(5.dp))
                Text(
                    text = promo.title,
                    color = textColor,
                    fontSize = 18.sp,
                    fontFamily = PlayfairDisplayFontFamily,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 22.sp
                )
                Spacer(modifier = Modifier.height(5.dp))
                Text(
                    text = promo.subtitle,
                    fontFamily = DmSansFontFamily,
                    color = mutedColor,
                    fontSize = 12.sp,
                    lineHeight = 16.sp
                )
            }

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${promo.discount}% OFF",
                    fontFamily = DmSansFontFamily,
                    color = if (isLight) ForestBrand else GoldSand,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = Icons.Default.NorthEast,
                    contentDescription = null,
                    tint = if (isLight) ForestBrand else GoldSand,
                    modifier = Modifier.size(14.dp)
                )
            }
        }
    }
}

@Composable
fun FeaturedOfferBanner(
    promo: Promotion,
    onExplore: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(ForestBrand)
            .clickable { onExplore() }
    ) {
        // Background photo
        Image(
            painter = painterResource(id = R.drawable.books_editorial),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
            alpha = 0.28f
        )

        // Gradient overlay
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            Color(0xF0173C30),
                            Color(0xD0285B45),
                            Color(0x80285B45)
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            Text(
                text = promo.eyebrow,
                fontFamily = DmSansFontFamily,
                color = GoldSand,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.2.sp
            )

            Spacer(modifier = Modifier.height(5.dp))

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(GoldSand)
                    .padding(horizontal = 7.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "UP TO ${promo.discount}% OFF",
                    fontFamily = DmSansFontFamily,
                    color = ForestTitle,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = promo.title,
                color = Color.White,
                fontSize = 22.sp,
                fontFamily = PlayfairDisplayFontFamily,
                fontWeight = FontWeight.Bold,
                lineHeight = 27.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = promo.subtitle,
                fontFamily = DmSansFontFamily,
                color = Color.White.copy(alpha = 0.88f),
                fontSize = 13.sp,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(24.dp))
                    .background(PaperBackground)
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Browse the offer",
                    fontFamily = DmSansFontFamily,
                    color = ForestBrand,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.width(6.dp))
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = ForestBrand,
                    modifier = Modifier.size(14.dp)
                )
            }
        }
    }
}
