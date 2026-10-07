package com.bookbazaar.app

import com.bookbazaar.app.data.BookBazaarData
import com.bookbazaar.app.model.CartItem
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class BookBazaarDataTest {

    @Test
    fun testMockBooksCatalogIntegrity() {
        val books = BookBazaarData.MOCK_BOOKS
        assertEquals(16, books.size)

        books.forEach { book ->
            assertNotNull(book.id)
            assertTrue(book.title.isNotBlank())
            assertTrue(book.author.isNotBlank())
            assertTrue(book.subject.isNotBlank())
            assertTrue(book.classLevel in 1..12)
            assertTrue(book.price > 0)
            assertTrue(book.originalPrice >= book.price)
            assertTrue(book.rating in 1.0..5.0)
        }
    }

    @Test
    fun testPromotionsData() {
        val promotions = BookBazaarData.MOCK_PROMOTIONS
        assertEquals(3, promotions.size)
        promotions.forEach { promo ->
            assertTrue(promo.discount > 0)
            assertTrue(promo.title.isNotBlank())
            assertTrue(promo.eyebrow.isNotBlank())
        }
    }

    @Test
    fun testSampleOrder() {
        val sampleOrder = BookBazaarData.getSampleOrder()
        assertEquals("ORD-92834112", sampleOrder.id)
        assertEquals("processing", sampleOrder.status)
        assertEquals(2, sampleOrder.items.size)
        assertEquals(678, sampleOrder.total)
    }

    @Test
    fun testBookFilteringByClassAndSubject() {
        val books = BookBazaarData.MOCK_BOOKS

        val class5Books = books.filter { it.classLevel == 5 }
        assertTrue(class5Books.size >= 3)
        assertTrue(class5Books.all { it.classLevel == 5 })

        val mathBooks = books.filter { it.subject.equals("Mathematics", ignoreCase = true) }
        assertTrue(mathBooks.isNotEmpty())
        assertTrue(mathBooks.all { it.subject == "Mathematics" })

        val deals = books.filter { it.price < it.originalPrice }
        assertTrue(deals.isNotEmpty())
        assertTrue(deals.all { it.price < it.originalPrice })
    }

    @Test
    fun testCartItemCalculation() {
        val book = BookBazaarData.MOCK_BOOKS.first()
        val cartItem = CartItem(
            book = book,
            quantity = 3,
            lineTotal = book.price * 3
        )
        assertEquals(book.price * 3, cartItem.lineTotal)
        assertEquals(3, cartItem.quantity)
    }
}
