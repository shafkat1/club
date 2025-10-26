// Mock Venues Data
export interface Venue {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  type: 'bar' | 'club' | 'pub' | 'lounge'
  rating: number
  reviewCount: number
  buyersCount: number
  receiversCount: number
  distance: number
  imageUrl?: string
  hours: { open: string; close: string }
  address: string
}

export const MOCK_VENUES: Venue[] = [
  {
    id: '1',
    name: 'The Rooftop Lounge',
    description: 'Upscale rooftop bar with city views and craft cocktails',
    latitude: 40.7128,
    longitude: -74.006,
    type: 'lounge',
    rating: 4.8,
    reviewCount: 342,
    buyersCount: 12,
    receiversCount: 8,
    distance: 0.2,
    hours: { open: '5:00 PM', close: '2:00 AM' },
    address: '123 Main St, New York, NY 10001',
  },
  {
    id: '2',
    name: 'Electric Avenue',
    description: 'High-energy nightclub with DJ and dance floor',
    latitude: 40.7138,
    longitude: -74.0096,
    type: 'club',
    rating: 4.5,
    reviewCount: 589,
    buyersCount: 45,
    receiversCount: 32,
    distance: 0.6,
    hours: { open: '10:00 PM', close: '4:00 AM' },
    address: '456 Broadway, New York, NY 10013',
  },
  {
    id: '3',
    name: 'The Irish Pub',
    description: 'Classic Irish pub with Guinness and live music',
    latitude: 40.7118,
    longitude: -74.0016,
    type: 'pub',
    rating: 4.3,
    reviewCount: 267,
    buyersCount: 28,
    receiversCount: 18,
    distance: 0.3,
    hours: { open: '12:00 PM', close: '2:00 AM' },
    address: '789 5th Ave, New York, NY 10003',
  },
  {
    id: '4',
    name: 'Mixology Masters',
    description: 'Premium cocktail bar with skilled bartenders',
    latitude: 40.7145,
    longitude: -74.0075,
    type: 'bar',
    rating: 4.9,
    reviewCount: 425,
    buyersCount: 18,
    receiversCount: 14,
    distance: 0.4,
    hours: { open: '4:00 PM', close: '3:00 AM' },
    address: '321 Park Ave, New York, NY 10022',
  },
  {
    id: '5',
    name: 'Night Owl Club',
    description: 'Late-night club with underground vibe',
    latitude: 40.7095,
    longitude: -73.9965,
    type: 'club',
    rating: 4.2,
    reviewCount: 198,
    buyersCount: 35,
    receiversCount: 25,
    distance: 0.8,
    hours: { open: '11:00 PM', close: '5:00 AM' },
    address: '555 Madison Ave, New York, NY 10022',
  },
]

// Mock Groups Data
export interface Group {
  id: string
  name: string
  memberCount: number
  members: Array<{ id: string; name: string; avatar: string }>
  currentVenue?: string
  createdAt: string
}

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Weekend Warriors',
    memberCount: 5,
    members: [
      { id: 'u1', name: 'Alex', avatar: '👨' },
      { id: 'u2', name: 'Jordan', avatar: '👩' },
      { id: 'u3', name: 'Sam', avatar: '👨' },
      { id: 'u4', name: 'Casey', avatar: '👩' },
      { id: 'u5', name: 'Morgan', avatar: '👨' },
    ],
    currentVenue: '1',
    createdAt: '2025-10-20',
  },
  {
    id: 'g2',
    name: 'Night Owls',
    memberCount: 3,
    members: [
      { id: 'u6', name: 'Taylor', avatar: '👩' },
      { id: 'u7', name: 'Riley', avatar: '👨' },
      { id: 'u8', name: 'Quinn', avatar: '👩' },
    ],
    currentVenue: '2',
    createdAt: '2025-10-15',
  },
]

// Mock Orders Data
export interface Order {
  id: string
  buyerId: string
  buyerName: string
  recipientId: string
  recipientName: string
  venueId: string
  venueName: string
  items: string[]
  totalAmount: number
  status: 'pending' | 'accepted' | 'declined' | 'redeemed'
  createdAt: string
  expiresAt: string
}

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    buyerId: 'u1',
    buyerName: 'Alex',
    recipientId: 'current_user',
    recipientName: 'You',
    venueId: '1',
    venueName: 'The Rooftop Lounge',
    items: ['Mojito', 'Margarita'],
    totalAmount: 28.5,
    status: 'pending',
    createdAt: '2025-10-26T14:00:00Z',
    expiresAt: '2025-10-26T15:00:00Z',
  },
  {
    id: 'o2',
    buyerId: 'current_user',
    buyerName: 'You',
    recipientId: 'u2',
    recipientName: 'Jordan',
    venueId: '2',
    venueName: 'Electric Avenue',
    items: ['Vodka Soda'],
    totalAmount: 12.0,
    status: 'accepted',
    createdAt: '2025-10-26T13:00:00Z',
    expiresAt: '2025-10-26T14:00:00Z',
  },
  {
    id: 'o3',
    buyerId: 'u3',
    buyerName: 'Sam',
    recipientId: 'current_user',
    recipientName: 'You',
    venueId: '3',
    venueName: 'The Irish Pub',
    items: ['Guinness Pint'],
    totalAmount: 8.5,
    status: 'redeemed',
    createdAt: '2025-10-26T12:00:00Z',
    expiresAt: '2025-10-26T13:00:00Z',
  },
]
