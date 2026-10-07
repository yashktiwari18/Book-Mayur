package com.bookbazaar.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bookbazaar.app.model.Book
import com.bookbazaar.app.ui.theme.BorderCard
import com.bookbazaar.app.ui.theme.CardSurfaceSubtle
import com.bookbazaar.app.ui.theme.CardWhite
import com.bookbazaar.app.ui.theme.DmSansFontFamily
import com.bookbazaar.app.ui.theme.ForestBrand
import com.bookbazaar.app.ui.theme.ForestTitle
import com.bookbazaar.app.ui.theme.PaperBackground
import com.bookbazaar.app.ui.theme.PlayfairDisplayFontFamily
import com.bookbazaar.app.ui.theme.TextMuted

@Composable
fun SubjectBundlesSection(
    books: List<Book>,
    addingBundleKey: String?,
    onAddBundle: (String, List<Book>) -> Unit
) {
    val bundles = remember(books) {
        val grouped = mutableMapOf<String, MutableList<Book>>()
        books.forEach { book ->
            val key = "${book.classLevel}-${book.subject}"
            grouped.getOrPut(key) { mutableListOf() }.add(book)
        }
        grouped.entries.filter { it.value.size > 1 }.take(3)
    }

    if (bundles.isEmpty()) return

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Bottom
        ) {
            Column {
                Text(
                    text = "A FEW GOOD BOOKS, TOGETHER",
                    fontFamily = DmSansFontFamily,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = ForestBrand,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Build a subject bundle",
                    fontSize = 20.sp,
                    fontFamily = PlayfairDisplayFontFamily,
                    fontWeight = FontWeight.Bold,
                    color = ForestTitle
                )
            }
            Text(
                text = "Add the set in one go",
                fontFamily = DmSansFontFamily,
                fontSize = 11.sp,
                color = TextMuted
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            bundles.forEach { (key, items) ->
                val total = items.sumOf { it.price }
                val isAddingThis = addingBundleKey == key

                Column(
                    modifier = Modifier
                        .width(260.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(CardSurfaceSubtle)
                        .border(1.dp, BorderCard, RoundedCornerShape(16.dp))
                        .padding(16.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .clip(CircleShape)
                                    .background(PaperBackground),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.BookmarkBorder,
                                    contentDescription = null,
                                    tint = ForestBrand,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                            Text(
                                text = "CLASS ${items[0].classLevel}",
                                fontFamily = DmSansFontFamily,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = ForestBrand,
                                letterSpacing = 0.5.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "${items[0].subject}\nstarter bundle",
                            fontSize = 16.sp,
                            fontFamily = PlayfairDisplayFontFamily,
                            fontWeight = FontWeight.Bold,
                            color = ForestTitle,
                            lineHeight = 20.sp
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                            items.take(3).forEach { book ->
                                Text(
                                    text = "• ${book.title}",
                                    fontFamily = DmSansFontFamily,
                                    fontSize = 11.sp,
                                    color = TextMuted,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "₹$total",
                                fontFamily = PlayfairDisplayFontFamily,
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Bold,
                                color = ForestTitle
                            )
                            Text(
                                text = "${items.size} titles",
                                fontFamily = DmSansFontFamily,
                                fontSize = 10.sp,
                                color = TextMuted
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(ForestBrand)
                                .clickable(!isAddingThis) { onAddBundle(key, items) }
                                .padding(horizontal = 14.dp, vertical = 7.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isAddingThis) {
                                CircularProgressIndicator(
                                    color = Color.White,
                                    modifier = Modifier.size(14.dp),
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Text(
                                    text = "Add bundle +",
                                    fontFamily = DmSansFontFamily,
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
