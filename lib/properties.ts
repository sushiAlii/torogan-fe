export type Property = {
  id: string
  title: string
  location: string
  price: number
  image: string
  gallery: string[]
  beds: number
  baths: number
  area: number
  type: string
  description: string
  features: string[]
  landlord: {
    name: string
    initials: string
    phone: string
    email: string
    responseTime: string
  }
}

export const properties: Property[] = [
  {
    id: 'maple-house',
    title: 'Sunlit Maple Modern Home',
    location: 'Portland, OR',
    price: 2850,
    image: '/property-1.png',
    gallery: [
      '/property-1.png',
      '/property-2.png',
      '/property-4.png',
      '/property-5.png',
      '/property-8.png',
    ],
    beds: 3,
    baths: 2,
    area: 1750,
    type: 'House',
    description:
      'A bright, contemporary family home tucked into a quiet tree-lined street. Floor-to-ceiling windows fill every room with natural light, while warm wood accents and an open-plan layout make it feel instantly like home. The landscaped garden is perfect for weekend mornings.',
    features: ['In-unit laundry', 'Private garden', 'EV charger', 'Pet friendly'],
    landlord: {
      name: 'Sarah Whitman',
      initials: 'SW',
      phone: '+1 (503) 555-0142',
      email: 'sarah.w@nestlee.com',
      responseTime: 'Usually responds within 2 hours',
    },
  },
  {
    id: 'riverside-loft',
    title: 'Riverside Living Loft',
    location: 'Austin, TX',
    price: 2100,
    image: '/property-2.png',
    gallery: ['/property-2.png', '/property-4.png', '/property-5.png', '/property-7.png'],
    beds: 2,
    baths: 1,
    area: 1100,
    type: 'Apartment',
    description:
      'An airy loft with polished wood floors and oversized windows overlooking the river. The open living space flows into a sleek kitchen, ideal for entertaining or relaxing after a long day downtown.',
    features: ['Rooftop access', 'Gym', 'Dishwasher', 'Central AC'],
    landlord: {
      name: 'Marcus Reed',
      initials: 'MR',
      phone: '+1 (512) 555-0188',
      email: 'marcus.r@nestlee.com',
      responseTime: 'Usually responds within 1 day',
    },
  },
  {
    id: 'brick-row',
    title: 'Charming Brick Row Apartment',
    location: 'Brooklyn, NY',
    price: 3200,
    image: '/property-3.png',
    gallery: ['/property-3.png', '/property-2.png', '/property-5.png', '/property-7.png'],
    beds: 2,
    baths: 2,
    area: 980,
    type: 'Apartment',
    description:
      'Classic brownstone character meets modern comfort. This sun-drenched unit features a private balcony, exposed brick, and a thoughtfully updated kitchen, steps from the best cafes in the neighborhood.',
    features: ['Private balcony', 'Heating included', 'Hardwood floors', 'Doorman'],
    landlord: {
      name: 'Elena Cruz',
      initials: 'EC',
      phone: '+1 (718) 555-0167',
      email: 'elena.c@nestlee.com',
      responseTime: 'Usually responds within 3 hours',
    },
  },
  {
    id: 'garden-kitchen',
    title: 'Designer Kitchen Townhouse',
    location: 'Seattle, WA',
    price: 3600,
    image: '/property-4.png',
    gallery: ['/property-4.png', '/property-1.png', '/property-5.png', '/property-8.png'],
    beds: 4,
    baths: 3,
    area: 2200,
    type: 'Townhouse',
    description:
      'Spacious townhouse anchored by a chef-grade kitchen with a marble island and pendant lighting. Generous bedrooms, abundant storage, and a private patio make this an ideal long-term home.',
    features: ['Chef kitchen', 'Garage parking', 'Smart home', 'Patio'],
    landlord: {
      name: 'David Kim',
      initials: 'DK',
      phone: '+1 (206) 555-0119',
      email: 'david.k@nestlee.com',
      responseTime: 'Usually responds within 5 hours',
    },
  },
  {
    id: 'quiet-bedroom',
    title: 'Serene Studio Retreat',
    location: 'Denver, CO',
    price: 1650,
    image: '/property-5.png',
    gallery: ['/property-5.png', '/property-2.png', '/property-7.png'],
    beds: 1,
    baths: 1,
    area: 620,
    type: 'Studio',
    description:
      'A calm, minimalist studio with great light and a peaceful outlook. Efficiently designed with quality finishes throughout, perfect for a focused city lifestyle.',
    features: ['Utilities included', 'Bike storage', 'Quiet block', 'Pet friendly'],
    landlord: {
      name: 'Priya Nair',
      initials: 'PN',
      phone: '+1 (720) 555-0153',
      email: 'priya.n@nestlee.com',
      responseTime: 'Usually responds within 1 hour',
    },
  },
  {
    id: 'suburban-family',
    title: 'Suburban Family Residence',
    location: 'Naperville, IL',
    price: 2400,
    image: '/property-6.png',
    gallery: ['/property-6.png', '/property-2.png', '/property-4.png', '/property-8.png'],
    beds: 3,
    baths: 2,
    area: 1900,
    type: 'House',
    description:
      'A welcoming family home with a two-car garage and a roomy backyard. Close to top-rated schools and parks, with a flexible layout that grows with you.',
    features: ['2-car garage', 'Backyard', 'Basement', 'Central heating'],
    landlord: {
      name: 'Tom Fischer',
      initials: 'TF',
      phone: '+1 (630) 555-0174',
      email: 'tom.f@nestlee.com',
      responseTime: 'Usually responds within 6 hours',
    },
  },
]

export function getProperty(id: string) {
  return properties.find((p) => p.id === id)
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}
