package com.bookbazaar.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bookbazaar.app.ui.theme.BorderCard
import com.bookbazaar.app.ui.theme.CardWhite
import com.bookbazaar.app.ui.theme.DmSansFontFamily
import com.bookbazaar.app.ui.theme.ForestBrand
import com.bookbazaar.app.ui.theme.ForestTitle
import com.bookbazaar.app.ui.theme.PaperBackground
import com.bookbazaar.app.ui.theme.PlayfairDisplayFontFamily
import com.bookbazaar.app.ui.theme.TerracottaAccent
import com.bookbazaar.app.ui.theme.TerracottaBadge

@Composable
fun BrandLogo(
    compact: Boolean = false,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier.then(
            if (onClick != null) Modifier.clickable { onClick() } else Modifier
        )
    ) {
        // Asymmetric leaf badge (13px 13px 13px 4px) matching Stitch & web stylesheet
        Box(
            modifier = Modifier
                .size(if (compact) 34.dp else 39.dp)
                .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp, bottomEnd = 12.dp, bottomStart = 4.dp))
                .background(ForestBrand),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.AutoStories,
                contentDescription = "Book Bazaar Logo",
                tint = Color(0xFFF8F1D9),
                modifier = Modifier.size(if (compact) 18.dp else 21.dp)
            )
        }

        Spacer(modifier = Modifier.width(8.dp))

        Column {
            Text(
                text = buildAnnotatedString {
                    withStyle(
                        SpanStyle(
                            color = ForestTitle,
                            fontFamily = DmSansFontFamily,
                            fontWeight = FontWeight.Bold
                        )
                    ) {
                        append("book")
                    }
                    withStyle(
                        SpanStyle(
                            color = TerracottaAccent,
                            fontFamily = DmSansFontFamily,
                            fontWeight = FontWeight.Bold
                        )
                    ) {
                        append("bazaar")
                    }
                },
                fontSize = if (compact) 19.sp else 21.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = (-0.6).sp,
                lineHeight = 20.sp
            )
            if (!compact) {
                Text(
                    text = "THE SCHOOL BOOKSHOP",
                    fontFamily = DmSansFontFamily,
                    fontSize = 7.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF78867B),
                    letterSpacing = 1.1.sp,
                    lineHeight = 9.sp
                )
            }
        }
    }
}

@Composable
fun AppHeader(
    cartCount: Int,
    userInitial: String,
    isSignedIn: Boolean,
    onLogoClick: () -> Unit,
    onCartClick: () -> Unit,
    onProfileClick: () -> Unit,
    onDeliveryClick: (() -> Unit)? = null
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(PaperBackground)
            .statusBarsPadding()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            BrandLogo(
                compact = true,
                onClick = onLogoClick
            )

            // Right Action Icons: Location Pin, Shopping Bag with Badge, User Avatar (matching Stitch)
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Location Pin button
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .clickable { onDeliveryClick?.invoke() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Place,
                        contentDescription = "Location",
                        tint = TerracottaAccent,
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Shopping Bag button with Terracotta notification badge
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(11.dp))
                        .background(Color.White.copy(alpha = 0.7f))
                        .border(1.dp, BorderCard, RoundedCornerShape(11.dp))
                        .clickable { onCartClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingBag,
                        contentDescription = "Shopping Bag",
                        tint = ForestBrand,
                        modifier = Modifier.size(19.dp)
                    )

                    if (cartCount > 0) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(top = 1.dp, end = 1.dp)
                                .size(16.dp)
                                .clip(CircleShape)
                                .background(TerracottaBadge)
                                .border(1.dp, CardWhite, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (cartCount > 99) "99+" else cartCount.toString(),
                                fontFamily = DmSansFontFamily,
                                color = Color.White,
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                // Profile Avatar Initial Pill
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFE0E7DC))
                        .border(1.dp, Color(0xFFCCD6C8), CircleShape)
                        .clickable { onProfileClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = if (isSignedIn) userInitial.uppercase().ifBlank { "B" } else "B",
                        fontFamily = PlayfairDisplayFontFamily,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestTitle
                    )
                }
            }
        }

        // Bottom border line matching Stitch border-cream-200
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(Color(0xFFEAE5D9))
        )
    }
}
