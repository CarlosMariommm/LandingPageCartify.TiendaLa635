// Productos y precios de referencia, los mismos que muestra la tienda.
// `dicho` (singular, plural) y `f` (femenino) son para que Tiqui los nombre
// como se dicen: "una manzana y dos Coca-Colas", no "1 Manzana y 2 Coca-Cola".
export const PRODUCTS = [
  { id: 'manzana', name: 'Manzana', cat: 'frutas', price: 5.2, img: '/img/manzana.webp', tag: 'Fresquitas', dicho: ['manzana', 'manzanas'], f: true, aliases: ['manzana', 'manzanas'] },
  { id: 'sandia', name: 'Sandía', cat: 'frutas', price: 8, img: '/img/sanda.png', dicho: ['sandía', 'sandías'], f: true, aliases: ['sandia', 'sandias'] },
  { id: 'pera', name: 'Pera', cat: 'frutas', price: 1.6, img: '/img/pera.png', dicho: ['pera', 'peras'], f: true, aliases: ['pera', 'peras'] },
  { id: 'uvas', name: 'Uvas verdes', cat: 'frutas', price: 5.2, img: '/img/uvas-verdes.webp', tag: 'Nuevo', dicho: ['racimo de uvas verdes', 'racimos de uvas verdes'], aliases: ['uvas verdes', 'uva verde', 'uvas', 'uva'] },
  { id: 'cheetos', name: 'Cheetos Crunchy', cat: 'snacks', price: 0.8, img: '/img/cheetos-crunchy.png', dicho: ['bolsa de Cheetos', 'bolsas de Cheetos'], f: true, aliases: ['cheetos', 'cheeto', 'chitos', 'chito'] },
  { id: 'takis', name: 'Takis Originales', cat: 'snacks', price: 1, img: '/img/takis-originales.png', tag: 'Nuevo', dicho: ['bolsa de Takis', 'bolsas de Takis'], f: true, aliases: ['takis', 'taki', 'taquis'] },
  { id: 'pringles', name: 'Pringles Originales', cat: 'snacks', price: 0.75, img: '/img/pringles-originales.png', dicho: ['lata de Pringles', 'latas de Pringles'], f: true, aliases: ['pringles', 'pringle'] },
  { id: 'coca', name: 'Coca-Cola', cat: 'bebidas', price: 1.25, img: '/img/coca-cola.png', zoom: 1.45, dicho: ['Coca-Cola', 'Coca-Colas'], f: true, aliases: ['coca colas', 'coca cola', 'cocacolas', 'cocacola', 'cocas', 'coca'] },
  { id: 'sprite', name: 'Sprite', cat: 'bebidas', price: 1, img: '/img/sprite.webp', dicho: ['Sprite', 'Sprites'], aliases: ['sprites', 'sprite', 'esprite'] },
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
