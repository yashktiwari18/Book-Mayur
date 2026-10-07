package com.bookbazaar.app.data

import com.bookbazaar.app.model.Book
import com.bookbazaar.app.model.Order
import com.bookbazaar.app.model.OrderItem
import com.bookbazaar.app.model.Promotion

object BookBazaarData {
    val MOCK_BOOKS: List<Book> = listOf(
        Book(
            id = "math-1",
            title = "Numbers Around Us",
            author = "A. Sharma",
            subject = "Mathematics",
            classLevel = 1,
            price = 279,
            originalPrice = 349,
            imageUrl = "/book-covers/mathematics.svg",
            description = "A playful first mathematics reader with colorful number activities.",
            rating = 4.8,
            inStock = true,
            badge = "New"
        ),
        Book(
            id = "english-2",
            title = "Little Words, Big Stories",
            author = "M. Iyer",
            subject = "English",
            classLevel = 2,
            price = 319,
            originalPrice = 399,
            imageUrl = "/book-covers/english.svg",
            description = "Build early reading confidence through short stories and guided practice.",
            rating = 4.9,
            inStock = true,
            badge = "Bestseller"
        ),
        Book(
            id = "math-3",
            title = "Maths in Motion",
            author = "R. Mehta",
            subject = "Mathematics",
            classLevel = 3,
            price = 349,
            originalPrice = 449,
            imageUrl = "/book-covers/mathematics.svg",
            description = "A clear, activity-led mathematics book for curious young learners.",
            rating = 4.7,
            inStock = true,
            badge = "Popular"
        ),
        Book(
            id = "science-4",
            title = "Curious Science",
            author = "N. Kapoor",
            subject = "Science",
            classLevel = 4,
            price = 389,
            originalPrice = 499,
            imageUrl = "/book-covers/science.svg",
            description = "Explore everyday science through experiments, questions, and illustrations.",
            rating = 4.6,
            inStock = true,
            badge = null
        ),
        Book(
            id = "english-5",
            title = "The Story Studio",
            author = "P. Nair",
            subject = "English",
            classLevel = 5,
            price = 329,
            originalPrice = 425,
            imageUrl = "/book-covers/english.svg",
            description = "Reading, grammar, and writing practice in one lively workbook.",
            rating = 4.8,
            inStock = true,
            badge = "Bestseller"
        ),
        Book(
            id = "math-5-core",
            title = "Everyday Mathematics",
            author = "A. Kulkarni",
            subject = "Mathematics",
            classLevel = 5,
            price = 359,
            originalPrice = 449,
            imageUrl = "/book-covers/mathematics.svg",
            description = "Build fluency with clear examples, number sense, and practical class 5 exercises.",
            rating = 4.7,
            inStock = true,
            badge = "Popular"
        ),
        Book(
            id = "math-5-practice",
            title = "Maths Practice Book: Class 5",
            author = "M. Shah",
            subject = "Mathematics",
            classLevel = 5,
            price = 249,
            originalPrice = 329,
            imageUrl = "/book-covers/mathematics.svg",
            description = "A companion workbook with extra practice for the year's key topics.",
            rating = 4.5,
            inStock = true,
            badge = null
        ),
        Book(
            id = "social-5",
            title = "Our Living World",
            author = "S. Banerjee",
            subject = "Social Studies",
            classLevel = 5,
            price = 379,
            originalPrice = 499,
            imageUrl = "/book-covers/social-studies.svg",
            description = "A student-friendly introduction to people, places, and the past.",
            rating = 4.6,
            inStock = true,
            badge = null
        ),
        Book(
            id = "math-6",
            title = "Mathematics: New Perspectives",
            author = "K. Desai",
            subject = "Mathematics",
            classLevel = 6,
            price = 429,
            originalPrice = 549,
            imageUrl = "/book-covers/mathematics.svg",
            description = "Concept-first lessons and worked examples for class 6.",
            rating = 4.8,
            inStock = true,
            badge = "Popular"
        ),
        Book(
            id = "science-7",
            title = "Science Lab: Class 7",
            author = "T. Rao",
            subject = "Science",
            classLevel = 7,
            price = 449,
            originalPrice = 599,
            imageUrl = "/book-covers/science.svg",
            description = "Connect scientific ideas to the world through hands-on learning.",
            rating = 4.7,
            inStock = true,
            badge = null
        ),
        Book(
            id = "english-8",
            title = "English Literature & Language",
            author = "V. Menon",
            subject = "English",
            classLevel = 8,
            price = 419,
            originalPrice = 549,
            imageUrl = "/book-covers/english.svg",
            description = "A balanced coursebook for thoughtful reading and confident writing.",
            rating = 4.6,
            inStock = true,
            badge = null
        ),
        Book(
            id = "math-9",
            title = "Algebra & Geometry",
            author = "D. Joshi",
            subject = "Mathematics",
            classLevel = 9,
            price = 489,
            originalPrice = 649,
            imageUrl = "/book-covers/mathematics.svg",
            description = "Step-by-step explanations and graded practice for secondary mathematics.",
            rating = 4.9,
            inStock = true,
            badge = "Exam pick"
        ),
        Book(
            id = "physics-10",
            title = "Physics: Clear Concepts",
            author = "A. Kulkarni",
            subject = "Physics",
            classLevel = 10,
            price = 529,
            originalPrice = 699,
            imageUrl = "/book-covers/science.svg",
            description = "Build strong physics fundamentals with diagrams and solved problems.",
            rating = 4.8,
            inStock = true,
            badge = "Exam pick"
        ),
        Book(
            id = "biology-11",
            title = "Life Science Illustrated",
            author = "F. Thomas",
            subject = "Biology",
            classLevel = 11,
            price = 559,
            originalPrice = 749,
            imageUrl = "/book-covers/science.svg",
            description = "A visual, detailed guide to core biology concepts and terminology.",
            rating = 4.7,
            inStock = true,
            badge = null
        ),
        Book(
            id = "chemistry-12",
            title = "Chemistry: The Complete Course",
            author = "J. Patel",
            subject = "Chemistry",
            classLevel = 12,
            price = 599,
            originalPrice = 799,
            imageUrl = "/book-covers/science.svg",
            description = "A rigorous chemistry reference designed for final-year school study.",
            rating = 4.9,
            inStock = true,
            badge = "Exam pick"
        ),
        Book(
            id = "hindi-4",
            title = "Hindi Bhasha Setu",
            author = "R. Verma",
            subject = "Hindi",
            classLevel = 4,
            price = 299,
            originalPrice = 399,
            imageUrl = "/book-covers/hindi.svg",
            description = "Reading and language practice for a confident Hindi foundation.",
            rating = 4.6,
            inStock = true,
            badge = null
        )
    )

    val MOCK_PROMOTIONS: List<Promotion> = listOf(
        Promotion(
            id = "back-to-school",
            eyebrow = "THE SCHOOL YEAR STARTS HERE",
            title = "A brighter year begins with a good book.",
            subtitle = "Save on hand-picked school essentials for every class.",
            discount = 35,
            imageUrl = "books_editorial",
            background = "#285B45",
            sortOrder = 0
        ),
        Promotion(
            id = "study-bundles",
            eyebrow = "SMARTER STUDY, BETTER VALUE",
            title = "Build your class bundle.",
            subtitle = "Find the right reads for the year ahead.",
            discount = 25,
            imageUrl = "reading_sale",
            background = "#596E78",
            sortOrder = 1
        ),
        Promotion(
            id = "weekend-reads",
            eyebrow = "A LITTLE EXTRA FOR CURIOUS MINDS",
            title = "More stories. More discovery.",
            subtitle = "Selected books with special savings this week.",
            discount = 20,
            imageUrl = "books_editorial",
            background = "#E9DDC8",
            sortOrder = 2
        )
    )

    fun getSampleOrder(): Order = Order(
        id = "ORD-92834112",
        userId = "demo_user",
        status = "processing",
        paymentMethod = "cash_on_delivery",
        itemCount = 2,
        total = 678,
        customerName = "Alex Reader",
        phone = "9876543210",
        addressLine = "123 Knowledge Avenue",
        city = "New Delhi",
        state = "Delhi",
        postalCode = "110001",
        createdAt = "2026-10-04T12:00:00.000Z",
        items = listOf(
            OrderItem(
                orderId = "ORD-92834112",
                bookId = "math-5-core",
                title = "Everyday Mathematics",
                imageUrl = "/book-covers/mathematics.svg",
                unitPrice = 359,
                quantity = 1,
                lineTotal = 359
            ),
            OrderItem(
                orderId = "ORD-92834112",
                bookId = "english-2",
                title = "Little Words, Big Stories",
                imageUrl = "/book-covers/english.svg",
                unitPrice = 319,
                quantity = 1,
                lineTotal = 319
            )
        )
    )
}
