const inDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export const initialProducts = [
  { id: 1,  name: 'Biscuits',    emoji: null,  image: '/biscuits.jpg',     expiryDate: null,      location: 'placard', qty: 1 },
  { id: 2,  name: 'Eponges',     emoji: null,  image: '/eponges.jpg',      expiryDate: null,      location: 'placard', qty: 2 },
  { id: 3,  name: 'Nesquick',    emoji: null,  image: '/nesquick.jpg',     expiryDate: null,      location: 'placard', qty: 4 },
  { id: 4,  name: 'Oeufs',       emoji: null,  image: '/oeufs.jpg',        expiryDate: inDays(10),location: 'frigo',   qty: 6 },
  { id: 5,  name: 'Saumon',      emoji: null,  image: '/saumon.jpg',       expiryDate: inDays(1), location: 'frigo',   qty: 1 },
  { id: 6,  name: 'Pâtes',       emoji: null,  image: '/pates.jpg',        expiryDate: null,      location: 'placard', qty: 2 },
  { id: 7,  name: 'Lait',        emoji: '🥛',  image: null,                expiryDate: inDays(7), location: 'frigo',   qty: 1 },
  { id: 8,  name: 'Baguette',    emoji: null,  image: './baguette.png',    expiryDate: inDays(2), location: 'placard', qty: 1 },
  { id: 9,  name: 'Baguette',    emoji: null,  image: './baguette.png',    expiryDate: null,      location: 'congel',  qty: 1 },
  { id: 10, name: 'Demi pain',   emoji: null,  image: '/pain.png',         expiryDate: null,      location: 'congel',  qty: 2 },
  { id: 11, name: 'Citron',      emoji: null,  image: '/citron.jpg',       expiryDate: inDays(2), location: 'frigo',   qty: 3 },
  { id: 12, name: 'Jus',         emoji: null,  image: '/jus.jpg',          expiryDate: null,      location: 'frigo',   qty: 4 },
  { id: 13, name: 'Oignons',     emoji: null,  image: '/oignons.jpg',      expiryDate: null,      location: 'placard', qty: 2 },
  { id: 14, name: 'Brumisateur', emoji: null,  image: '/brumisateur.jpg',  expiryDate: null,      location: 'placard', qty: 1 },
  { id: 15, name: 'Café',        emoji: null,  image: '/cafe.jpg',         expiryDate: inDays(10),location: 'frigo',   qty: 1 },
  { id: 16, name: 'Catsnack',    emoji: null,  image: '/catsnack.jpg',     expiryDate: null,      location: 'placard', qty: 1 },
  { id: 17, name: 'Concombre',   emoji: null,  image: '/concombre.jpg',    expiryDate: inDays(2), location: 'frigo',   qty: 1 },
  { id: 18, name: 'Abricot',     emoji: null,  image: '/abricot.jpg',      expiryDate: inDays(5), location: 'frigo',   qty: 5 },
  { id: 19, name: 'Icetea',      emoji: null,  image: '/icetea.jpg',       expiryDate: null,      location: 'frigo',   qty: 4 },
  { id: 20, name: 'Banane',      emoji: null,  image: '/bananes.jpg',      expiryDate: inDays(7), location: 'frigo',   qty: 6 },
  { id: 21, name: 'Popcorn',     emoji: null,  image: '/popcorn.jpg',      expiryDate: null,      location: 'placard', qty: 1 },
]
