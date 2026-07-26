export interface Testimonial {
  name: string
  role: string
  rating: number
  text: string
  avatar?: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah Mitchell",
    role: "Self-published author",
    rating: 5,
    text: "BookConv saved me hours of manual work. I convert all my manuscript drafts to EPUB and MOBI in seconds. The quality is perfect — no formatting loss at all.",
  },
  {
    name: "James Rodriguez",
    role: "Librarian",
    rating: 5,
    text: "We use BookConv daily to help our patrons convert old LIT files to modern formats. It's fast, free, and requires no software installation. A must-have tool.",
  },
  {
    name: "Yuki Tanaka",
    role: "Digital content creator",
    rating: 4,
    text: "I've tried many converters, but BookConv is the only one that handles FB2 and AZW3 without issues. The batch conversion feature is a game-changer for my workflow.",
  },
  {
    name: "Emma Thompson",
    role: "Book blogger",
    rating: 5,
    text: "As someone who reviews books across formats, I rely on BookConv constantly. The conversion speed is incredible, and the output quality is always top-notch.",
  },
  {
    name: "Carlos Mendez",
    role: "Teacher",
    rating: 5,
    text: "I convert textbooks from PDF to EPUB so my students can read them on their tablets. No watermarks, no registration — just clean, reliable conversions.",
  },
  {
    name: "Olivia Chen",
    role: "Software developer",
    rating: 4,
    text: "Finally a converter that doesn't try to sell me anything upfront. Clean UI, fast conversions, and it even preserves my custom CSS styles. Highly recommended.",
  },
]

export const CONVERSION_COUNTER_TARGET = 150000
