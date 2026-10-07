import { sql } from "drizzle-orm";
import { db, booksTable, promotionsTable } from "@workspace/db";

const coverBySubject: Record<string, string> = {
  Mathematics: "/book-covers/mathematics.svg",
  Science: "/book-covers/science.svg",
  Physics: "/book-covers/science.svg",
  Chemistry: "/book-covers/science.svg",
  Biology: "/book-covers/science.svg",
  English: "/book-covers/english.svg",
  Hindi: "/book-covers/hindi.svg",
  "Social Studies": "/book-covers/social-studies.svg",
};

const bookSeed = [
  ["math-1", "Numbers Around Us", "A. Sharma", "Mathematics", 1, 279, 349, "A playful first mathematics reader with colorful number activities.", "New"],
  ["english-2", "Little Words, Big Stories", "M. Iyer", "English", 2, 319, 399, "Build early reading confidence through short stories and guided practice.", "Bestseller"],
  ["math-3", "Maths in Motion", "R. Mehta", "Mathematics", 3, 349, 449, "A clear, activity-led mathematics book for curious young learners.", "Popular"],
  ["science-4", "Curious Science", "N. Kapoor", "Science", 4, 389, 499, "Explore everyday science through experiments, questions, and illustrations.", null],
  ["english-5", "The Story Studio", "P. Nair", "English", 5, 329, 425, "Reading, grammar, and writing practice in one lively workbook.", "Bestseller"],
  ["math-5-core", "Everyday Mathematics", "A. Kulkarni", "Mathematics", 5, 359, 449, "Build fluency with clear examples, number sense, and practical class 5 exercises.", "Popular"],
  ["math-5-practice", "Maths Practice Book: Class 5", "M. Shah", "Mathematics", 5, 249, 329, "A companion workbook with extra practice for the year's key topics.", null],
  ["social-5", "Our Living World", "S. Banerjee", "Social Studies", 5, 379, 499, "A student-friendly introduction to people, places, and the past.", null],
  ["math-6", "Mathematics: New Perspectives", "K. Desai", "Mathematics", 6, 429, 549, "Concept-first lessons and worked examples for class 6.", "Popular"],
  ["science-7", "Science Lab: Class 7", "T. Rao", "Science", 7, 449, 599, "Connect scientific ideas to the world through hands-on learning.", null],
  ["english-8", "English Literature & Language", "V. Menon", "English", 8, 419, 549, "A balanced coursebook for thoughtful reading and confident writing.", null],
  ["math-9", "Algebra & Geometry", "D. Joshi", "Mathematics", 9, 489, 649, "Step-by-step explanations and graded practice for secondary mathematics.", "Exam pick"],
  ["physics-10", "Physics: Clear Concepts", "A. Kulkarni", "Physics", 10, 529, 699, "Build strong physics fundamentals with diagrams and solved problems.", "Exam pick"],
  ["biology-11", "Life Science Illustrated", "F. Thomas", "Biology", 11, 559, 749, "A visual, detailed guide to core biology concepts and terminology.", null],
  ["chemistry-12", "Chemistry: The Complete Course", "J. Patel", "Chemistry", 12, 599, 799, "A rigorous chemistry reference designed for final-year school study.", "Exam pick"],
  ["hindi-4", "Hindi Bhasha Setu", "R. Verma", "Hindi", 4, 299, 399, "Reading and language practice for a confident Hindi foundation.", null],
];

let seedPromise: Promise<void> | undefined;

export function ensureBookstoreSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seedBookstore().catch((error: unknown) => {
      seedPromise = undefined;
      throw error;
    });
  }
  return seedPromise;
}

async function seedBookstore(): Promise<void> {
  await db
    .insert(booksTable)
    .values(
      bookSeed.map(
        ([
          id,
          title,
          author,
          subject,
          classLevel,
          price,
          originalPrice,
          description,
          badge,
        ]) => ({
          id: String(id),
          title: String(title),
          author: String(author),
          subject: String(subject),
          classLevel: Number(classLevel),
          price: Number(price),
          originalPrice: Number(originalPrice),
          imageUrl:
            coverBySubject[String(subject)] ?? "/book-covers/science.svg",
          description: String(description),
          rating: 4.6 + ((Number(classLevel) % 4) * 0.1),
          inStock: true,
          badge: badge ? String(badge) : null,
        }),
      ),
    )
    .onConflictDoNothing();

  await db
    .insert(promotionsTable)
    .values([
      {
        id: "back-to-school",
        eyebrow: "THE SCHOOL YEAR STARTS HERE",
        title: "A brighter year begins with a good book.",
        subtitle: "Save on hand-picked school essentials for every class.",
        discount: 35,
        imageUrl: "/reading-sale.jpg",
        background: "#285b45",
        sortOrder: 0,
      },
      {
        id: "study-bundles",
        eyebrow: "SMARTER STUDY, BETTER VALUE",
        title: "Build your class bundle.",
        subtitle: "Find the right reads for the year ahead.",
        discount: 25,
        imageUrl: "/reading-sale.jpg",
        background: "#596e78",
        sortOrder: 1,
      },
      {
        id: "weekend-reads",
        eyebrow: "A LITTLE EXTRA FOR CURIOUS MINDS",
        title: "More stories. More discovery.",
        subtitle: "Selected books with special savings this week.",
        discount: 20,
        imageUrl: "/reading-sale.jpg",
        background: "#e9ddc8",
        sortOrder: 2,
      },
    ])
    .onConflictDoUpdate({
      target: promotionsTable.id,
      set: {
        eyebrow: sql`excluded.eyebrow`,
        title: sql`excluded.title`,
        subtitle: sql`excluded.subtitle`,
        discount: sql`excluded.discount`,
        imageUrl: sql`excluded.image_url`,
        background: sql`excluded.background`,
        sortOrder: sql`excluded.sort_order`,
      },
    });
}
