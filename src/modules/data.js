// Productos y precios de referencia, los mismos que muestra la tienda.
export const PRODUCTS = [
  { id: 'manzana', name: 'Manzana', cat: 'frutas', price: 5.2, img: '/img/manzana.webp', tag: 'Fresquitas', aliases: ['manzana', 'manzanas'] },
  { id: 'sandia', name: 'Sandía', cat: 'frutas', price: 8, img: '/img/sanda.png', aliases: ['sandia', 'sandias'] },
  { id: 'pera', name: 'Pera', cat: 'frutas', price: 1.6, img: '/img/pera.png', aliases: ['pera', 'peras'] },
  { id: 'uvas', name: 'Uvas verdes', cat: 'frutas', price: 5.2, img: '/img/uvas-verdes.webp', tag: 'Nuevo', aliases: ['uvas verdes', 'uva verde', 'uvas', 'uva'] },
  { id: 'cheetos', name: 'Cheetos Crunchy', cat: 'snacks', price: 0.8, img: '/img/cheetos-crunchy.png', aliases: ['cheetos', 'cheeto', 'chitos', 'chito'] },
  { id: 'takis', name: 'Takis Originales', cat: 'snacks', price: 1, img: '/img/takis-originales.png', tag: 'Nuevo', aliases: ['takis', 'taki', 'taquis'] },
  { id: 'pringles', name: 'Pringles Originales', cat: 'snacks', price: 0.75, img: '/img/pringles-originales.png', aliases: ['pringles', 'pringle'] },
  { id: 'coca', name: 'Coca-Cola', cat: 'bebidas', price: 1.25, img: '/img/coca-cola.png', zoom: 1.45, aliases: ['coca colas', 'coca cola', 'cocacolas', 'cocacola', 'cocas', 'coca'] },
  { id: 'sprite', name: 'Sprite', cat: 'bebidas', price: 1, img: '/img/sprite.webp', aliases: ['sprites', 'sprite', 'esprite'] },
];

export const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'frutas', label: 'Frutas' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'bebidas', label: 'Bebidas' },
];

export const CAT_LABEL = { frutas: 'Frutas', snacks: 'Snacks', bebidas: 'Bebidas' };

export const byId = (id) => PRODUCTS.find((p) => p.id === id);

export const money = (n) => `$${n.toFixed(2)}`;

export const normalize = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
