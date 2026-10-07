package com.bookbazaar.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bookbazaar.app.ui.components.BookCover
import com.bookbazaar.app.ui.components.EmptyState
import com.bookbazaar.app.ui.components.PageHeading
import com.bookbazaar.app.ui.theme.BorderCard
import com.bookbazaar.app.ui.theme.BorderInput
import com.bookbazaar.app.ui.theme.BorderWarm
import com.bookbazaar.app.ui.theme.CardWhite
import com.bookbazaar.app.ui.theme.DmSansFontFamily
import com.bookbazaar.app.ui.theme.ForestBrand
import com.bookbazaar.app.ui.theme.ForestTitle
import com.bookbazaar.app.ui.theme.PaperBackground
import com.bookbazaar.app.ui.theme.PlayfairDisplayFontFamily
import com.bookbazaar.app.ui.theme.StatusDeliveredBg
import com.bookbazaar.app.ui.theme.StatusDeliveredText
import com.bookbazaar.app.ui.theme.TerracottaAccent
import com.bookbazaar.app.ui.theme.TextBody
import com.bookbazaar.app.ui.theme.TextMuted
import com.bookbazaar.app.viewmodel.BookBazaarViewModel

@Composable
fun CartScreen(
    viewModel: BookBazaarViewModel,
    onNavigateToShop: () -> Unit,
    onNavigateToOrderDetail: (String) -> Unit
) {
    val cart by viewModel.cart.collectAsState()
    val isPlacingOrder by viewModel.isPlacingOrder.collectAsState()
    val lastPlacedOrderId by viewModel.lastPlacedOrderId.collectAsState()

    var isCheckoutExpanded by remember { mutableStateOf(false) }

    // Checkout form fields
    var customerName by remember { mutableStateOf("Alex Reader") }
    var phone by remember { mutableStateOf("9876543210") }
    var addressLine by remember { mutableStateOf("123 Knowledge Avenue") }
    var city by remember { mutableStateOf("New Delhi") }
    var state by remember { mutableStateOf("Delhi") }
    var postalCode by remember { mutableStateOf("110001") }

    // If order was just placed, show Order Success Screen
    if (lastPlacedOrderId != null) {
        val orderId = lastPlacedOrderId!!
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(PaperBackground)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(68.dp)
                    .clip(CircleShape)
                    .background(StatusDeliveredBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = null,
                    tint = StatusDeliveredText,
                    modifier = Modifier.size(36.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "ORDER CONFIRMED",
                fontFamily = DmSansFontFamily,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = ForestBrand,
                letterSpacing = 1.5.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "That’s a wrap.\nSee you at the door.",
                fontSize = 26.sp,
                fontFamily = PlayfairDisplayFontFamily,
                fontWeight = FontWeight.Bold,
                color = ForestTitle,
                lineHeight = 32.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Your books are on their way. We’ll collect payment when they arrive.",
                fontFamily = DmSansFontFamily,
                fontSize = 13.sp,
                color = TextMuted,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(CardWhite)
                    .border(1.dp, BorderCard, RoundedCornerShape(8.dp))
                    .padding(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "ORDER #${orderId.takeLast(8).uppercase()}",
                    fontFamily = DmSansFontFamily,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = ForestTitle,
                    letterSpacing = 0.5.sp
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    viewModel.resetPlacedOrder()
                    onNavigateToOrderDetail(orderId)
                },
                colors = ButtonDefaults.buttonColors(containerColor = ForestBrand),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Track your order",
                    fontFamily = DmSansFontFamily,
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.width(6.dp))
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Keep browsing",
                fontFamily = DmSansFontFamily,
                color = ForestBrand,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable {
                    viewModel.resetPlacedOrder()
                    onNavigateToShop()
                }
            )
        }
        return
    }

    if (cart.items.isEmpty()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(PaperBackground)
                .padding(16.dp)
        ) {
            PageHeading(
                kicker = "YOUR BASKET",
                title = "A little room for books.",
                text = "The good stuff you add will appear here."
            )
            Spacer(modifier = Modifier.height(20.dp))
            EmptyState(
                title = "Your basket is waiting.",
                text = "Start with a class or subject and build your school list.",
                actionLabel = "Browse the shelves",
                onActionClick = onNavigateToShop
            )
        }
        return
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(PaperBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            PageHeading(
                kicker = "YOUR BASKET",
                title = "Books in the making.",
                text = "${cart.itemCount} ${if (cart.itemCount == 1) "book" else "books"} on your list."
            )
        }

        // Cart items list
        items(cart.items, key = { it.book.id }) { item ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(CardWhite)
                    .border(1.dp, BorderCard, RoundedCornerShape(14.dp))
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Book cover
                Box(
                    modifier = Modifier
                        .width(52.dp)
                        .height(70.dp)
                ) {
                    BookCover(
                        book = item.book,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                // Details & Quantity Stepper
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "CLASS ${item.book.classLevel} · ${item.book.subject.uppercase()}",
                        fontFamily = DmSansFontFamily,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestBrand,
                        letterSpacing = 0.5.sp
                    )
                    Text(
                        text = item.book.title,
                        fontSize = 13.sp,
                        fontFamily = PlayfairDisplayFontFamily,
                        fontWeight = FontWeight.Bold,
                        color = ForestTitle,
                        lineHeight = 16.sp
                    )
                    Text(
                        text = item.book.author,
                        fontFamily = DmSansFontFamily,
                        fontSize = 11.sp,
                        color = TextMuted
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Stepper: [-] quantity [+]
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(PaperBackground)
                            .border(1.dp, BorderWarm, RoundedCornerShape(20.dp))
                            .padding(horizontal = 4.dp, vertical = 2.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .clickable {
                                    if (item.quantity > 1) {
                                        viewModel.updateCartQuantity(item.book.id, item.quantity - 1)
                                    } else {
                                        viewModel.removeFromCart(item.book.id)
                                    }
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Remove,
                                contentDescription = "Decrease",
                                tint = ForestTitle,
                                modifier = Modifier.size(13.dp)
                            )
                        }

                        Text(
                            text = "${item.quantity}",
                            fontFamily = DmSansFontFamily,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = ForestTitle,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )

                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .clickable {
                                    viewModel.updateCartQuantity(item.book.id, item.quantity + 1)
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = "Increase",
                                tint = ForestTitle,
                                modifier = Modifier.size(13.dp)
                            )
                        }
                    }
                }

                // Price & Remove link
                Column(
                    horizontalAlignment = Alignment.End,
                    verticalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.height(70.dp)
                ) {
                    Text(
                        text = "₹${item.lineTotal}",
                        fontFamily = PlayfairDisplayFontFamily,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestTitle
                    )
                    Text(
                        text = "Remove",
                        fontFamily = DmSansFontFamily,
                        fontSize = 11.sp,
                        color = TerracottaAccent,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.clickable { viewModel.removeFromCart(item.book.id) }
                    )
                }
            }
        }

        // Continue shopping link
        item {
            Row(
                modifier = Modifier
                    .clickable { onNavigateToShop() }
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = null,
                    tint = ForestBrand,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Continue shopping",
                    fontFamily = DmSansFontFamily,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = ForestBrand
                )
            }
        }

        // Summary Card
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(CardWhite)
                    .border(1.dp, BorderCard, RoundedCornerShape(14.dp))
                    .padding(16.dp)
            ) {
                Text(
                    text = "ORDER SUMMARY",
                    fontFamily = DmSansFontFamily,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = ForestBrand,
                    letterSpacing = 1.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "Books (${cart.itemCount})", fontFamily = DmSansFontFamily, fontSize = 13.sp, color = ForestTitle)
                    Text(text = "₹${cart.subtotal}", fontFamily = DmSansFontFamily, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = ForestTitle)
                }

                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "Delivery", fontFamily = DmSansFontFamily, fontSize = 13.sp, color = ForestTitle)
                    Text(text = "On us", fontFamily = DmSansFontFamily, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = StatusDeliveredText)
                }

                Spacer(modifier = Modifier.height(10.dp))
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(BorderCard))
                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "Total", fontFamily = DmSansFontFamily, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = ForestTitle)
                    Text(text = "₹${cart.subtotal}", fontFamily = PlayfairDisplayFontFamily, fontSize = 19.sp, fontWeight = FontWeight.Bold, color = ForestTitle)
                }

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = { isCheckoutExpanded = !isCheckoutExpanded },
                    colors = ButtonDefaults.buttonColors(containerColor = ForestBrand),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = if (isCheckoutExpanded) "Hide details" else "Proceed to checkout",
                        fontFamily = DmSansFontFamily,
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(15.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = null,
                        tint = ForestBrand,
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Secure checkout · Cash on delivery",
                        fontFamily = DmSansFontFamily,
                        fontSize = 11.sp,
                        color = TextMuted
                    )
                }

                // Checkout Form
                AnimatedVisibility(visible = isCheckoutExpanded) {
                    Column(modifier = Modifier.padding(top = 16.dp)) {
                        Text(
                            text = "Where should we send them?",
                            fontSize = 16.sp,
                            fontFamily = PlayfairDisplayFontFamily,
                            fontWeight = FontWeight.Bold,
                            color = ForestTitle
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        val textFieldColors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = CardWhite,
                            unfocusedContainerColor = CardWhite,
                            focusedBorderColor = ForestBrand,
                            unfocusedBorderColor = BorderInput,
                            focusedTextColor = ForestTitle,
                            unfocusedTextColor = ForestTitle
                        )

                        OutlinedTextField(
                            value = customerName,
                            onValueChange = { customerName = it },
                            label = { Text("Full name", fontFamily = DmSansFontFamily) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = textFieldColors,
                            shape = RoundedCornerShape(12.dp)
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text("Phone number", fontFamily = DmSansFontFamily) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            modifier = Modifier.fillMaxWidth(),
                            colors = textFieldColors,
                            shape = RoundedCornerShape(12.dp)
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = addressLine,
                            onValueChange = { addressLine = it },
                            label = { Text("Street address", fontFamily = DmSansFontFamily) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = textFieldColors,
                            shape = RoundedCornerShape(12.dp)
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = city,
                                onValueChange = { city = it },
                                label = { Text("City", fontFamily = DmSansFontFamily) },
                                modifier = Modifier.weight(1f),
                                colors = textFieldColors,
                                shape = RoundedCornerShape(12.dp)
                            )
                            OutlinedTextField(
                                value = state,
                                onValueChange = { state = it },
                                label = { Text("State", fontFamily = DmSansFontFamily) },
                                modifier = Modifier.weight(1f),
                                colors = textFieldColors,
                                shape = RoundedCornerShape(12.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = postalCode,
                            onValueChange = { postalCode = it },
                            label = { Text("Postal code", fontFamily = DmSansFontFamily) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth(),
                            colors = textFieldColors,
                            shape = RoundedCornerShape(12.dp)
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        Button(
                            onClick = {
                                viewModel.placeOrder(
                                    customerName = customerName,
                                    phone = phone,
                                    addressLine = addressLine,
                                    city = city,
                                    state = state,
                                    postalCode = postalCode,
                                    onSuccess = { /* handled via state */ }
                                )
                            },
                            enabled = !isPlacingOrder && customerName.isNotBlank() && phone.isNotBlank() && addressLine.isNotBlank(),
                            colors = ButtonDefaults.buttonColors(containerColor = ForestBrand),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            if (isPlacingOrder) {
                                CircularProgressIndicator(
                                    color = Color.White,
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Placing your order…", fontFamily = DmSansFontFamily, color = Color.White)
                            } else {
                                Text(
                                    text = "Place order · ₹${cart.subtotal}",
                                    fontFamily = DmSansFontFamily,
                                    color = Color.White,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
