// Mock Data for LinkCom.mx

export const categories = [
  { id: "1", name: "Ropa deportiva", icon: "🏃" },
  { id: "2", name: "Ropa de verano", icon: "☀️" },
  { id: "3", name: "Ropa de gala", icon: "✨" },
  { id: "4", name: "Accesorios", icon: "👜" },
  { id: "5", name: "Calzado", icon: "👟" },
  { id: "6", name: "Temporada", icon: "🍂" },
  { id: "7", name: "Destacados", icon: "⭐" },
  { id: "8", name: "Nuevos proveedores", icon: "🆕" },
]

export const suppliers = [
  {
    id: "1",
    name: "Deportes México Pro",
    logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
    banner: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&h=400&fit=crop",
    description: "Proveedor líder en ropa y accesorios deportivos de alta calidad para mayoristas.",
    shortDescription: "Ropa deportiva de alta calidad",
    category: "Ropa deportiva",
    location: "Ciudad de México",
    specialty: "Mayoreo deportivo",
    productsCount: 245,
    responseTime: "24 horas",
    coverage: "Nacional",
    featured: true,
    products: [
      { id: "p1", name: "Conjunto deportivo premium", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop", description: "Conjunto de alta calidad para entrenamiento", category: "Conjuntos", price: "$450 MXN" },
      { id: "p2", name: "Playera dry-fit", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop", description: "Playera transpirable para ejercicio", category: "Playeras", price: "$180 MXN" },
      { id: "p3", name: "Shorts running", image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop", description: "Shorts ligeros para correr", category: "Shorts", price: "$220 MXN" },
      { id: "p4", name: "Sudadera deportiva", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop", description: "Sudadera cómoda para entrenar", category: "Sudaderas", price: "$380 MXN" },
    ]
  },
  {
    id: "2",
    name: "Verano Textiles",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop",
    banner: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=400&fit=crop",
    description: "Especialistas en moda de verano y ropa ligera para climas cálidos. Más de 15 años de experiencia.",
    shortDescription: "Moda fresca para temporadas cálidas",
    category: "Ropa de verano",
    location: "Cancún, QR",
    specialty: "Moda verano",
    productsCount: 189,
    responseTime: "12 horas",
    coverage: "Nacional e Internacional",
    featured: true,
    products: [
      { id: "p5", name: "Vestido playero", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop", description: "Vestido ligero para playa", category: "Vestidos", price: "$320 MXN" },
      { id: "p6", name: "Bermuda casual", image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop", description: "Bermuda cómoda de verano", category: "Shorts", price: "$280 MXN" },
    ]
  },
  {
    id: "3",
    name: "Elegancia MX",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
    banner: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop",
    description: "Vestidos de gala, trajes formales y ropa elegante para eventos especiales.",
    shortDescription: "Ropa elegante para eventos especiales",
    category: "Ropa de gala",
    location: "Guadalajara, JAL",
    specialty: "Moda formal",
    productsCount: 156,
    responseTime: "48 horas",
    coverage: "Nacional",
    featured: false,
    products: [
      { id: "p7", name: "Vestido de noche", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop", description: "Vestido elegante para eventos", category: "Vestidos", price: "$1,200 MXN" },
    ]
  },
  {
    id: "4",
    name: "Accesorios Plus",
    logo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop",
    banner: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=400&fit=crop",
    description: "Todo tipo de accesorios de moda: bolsas, cinturones, joyería y más.",
    shortDescription: "Accesorios de moda para todos",
    category: "Accesorios",
    location: "Monterrey, NL",
    specialty: "Accesorios",
    productsCount: 423,
    responseTime: "24 horas",
    coverage: "Nacional",
    featured: true,
    products: [
      { id: "p8", name: "Bolso de mano", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", description: "Bolso elegante de piel", category: "Bolsos", price: "$650 MXN" },
    ]
  },
  {
    id: "5",
    name: "Calzado Nacional",
    logo: "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=100&h=100&fit=crop",
    banner: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&h=400&fit=crop",
    description: "Fábrica de calzado con más de 20 años. Zapatos, tenis y sandalias de calidad.",
    shortDescription: "Calzado de calidad mexicana",
    category: "Calzado",
    location: "León, GTO",
    specialty: "Calzado",
    productsCount: 312,
    responseTime: "36 horas",
    coverage: "Nacional",
    featured: false,
    products: [
      { id: "p9", name: "Tenis urbano", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", description: "Tenis casual de moda", category: "Tenis", price: "$890 MXN" },
    ]
  },
  {
    id: "6",
    name: "Moda Temporada",
    logo: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop",
    banner: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=400&fit=crop",
    description: "Ropa de temporada: otoño-invierno y primavera-verano. Siempre a la moda.",
    shortDescription: "Tendencias de cada temporada",
    category: "Temporada",
    location: "Puebla, PUE",
    specialty: "Moda temporal",
    productsCount: 278,
    responseTime: "24 horas",
    coverage: "Centro de México",
    featured: true,
    products: []
  },
  {
    id: "7",
    name: "Textiles del Norte",
    logo: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=100&h=100&fit=crop",
    banner: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=400&fit=crop",
    description: "Nuevos en la plataforma. Especialistas en textiles y ropa casual de calidad.",
    shortDescription: "Textiles de alta calidad",
    category: "Nuevos proveedores",
    location: "Tijuana, BC",
    specialty: "Textiles",
    productsCount: 89,
    responseTime: "48 horas",
    coverage: "Norte de México",
    featured: false,
    products: []
  },
  {
    id: "8",
    name: "Fashion Express",
    logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop",
    banner: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=400&fit=crop",
    description: "Distribución rápida de moda casual y urbana. Entregas en 24-48 horas.",
    shortDescription: "Moda rápida y accesible",
    category: "Destacados",
    location: "Ciudad de México",
    specialty: "Moda rápida",
    productsCount: 567,
    responseTime: "12 horas",
    coverage: "Nacional",
    featured: true,
    products: []
  },
]

export const banners = [
  {
    id: "1",
    title: "Nueva Temporada Otoño 2026",
    subtitle: "Descubre los mejores proveedores de moda otoñal",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&h=500&fit=crop",
    cta: "Explorar ahora"
  },
  {
    id: "2",
    title: "Proveedores Destacados",
    subtitle: "Los más valorados por nuestros usuarios",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&h=500&fit=crop",
    cta: "Ver proveedores"
  },
  {
    id: "3",
    title: "Ofertas Especiales",
    subtitle: "Precios exclusivos para mayoristas",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1400&h=500&fit=crop",
    cta: "Ver ofertas"
  }
]

export const chatConversations = [
  {
    id: "1",
    supplier: "Deportes México Pro",
    avatar: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
    lastMessage: "Claro, el pedido mínimo es de 50 piezas.",
    timestamp: "Hace 2 horas",
    unread: 2,
    messages: [
      { id: "m1", sender: "user", text: "Hola, me interesa su catálogo de playeras.", time: "10:30 AM" },
      { id: "m2", sender: "supplier", text: "¡Hola! Con gusto te ayudo. ¿Qué cantidad estás buscando?", time: "10:35 AM" },
      { id: "m3", sender: "user", text: "¿Cuál es el pedido mínimo?", time: "10:40 AM" },
      { id: "m4", sender: "supplier", text: "Claro, el pedido mínimo es de 50 piezas.", time: "10:45 AM" },
    ]
  },
  {
    id: "2",
    supplier: "Verano Textiles",
    avatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop",
    lastMessage: "Le envío la cotización por correo.",
    timestamp: "Ayer",
    unread: 0,
    messages: [
      { id: "m5", sender: "user", text: "Buenos días, necesito cotización para vestidos.", time: "Ayer 9:00 AM" },
      { id: "m6", sender: "supplier", text: "Buenos días. ¿Cuántas piezas necesita?", time: "Ayer 9:15 AM" },
      { id: "m7", sender: "user", text: "Aproximadamente 200 piezas variadas.", time: "Ayer 9:20 AM" },
      { id: "m8", sender: "supplier", text: "Le envío la cotización por correo.", time: "Ayer 9:30 AM" },
    ]
  },
  {
    id: "3",
    supplier: "Accesorios Plus",
    avatar: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop",
    lastMessage: "Perfecto, agendamos para el jueves.",
    timestamp: "Hace 3 días",
    unread: 0,
    messages: [
      { id: "m9", sender: "user", text: "¿Tienen showroom para visitar?", time: "Lun 2:00 PM" },
      { id: "m10", sender: "supplier", text: "Sí, estamos en Monterrey. ¿Cuándo le gustaría venir?", time: "Lun 2:30 PM" },
      { id: "m11", sender: "user", text: "¿El jueves está disponible?", time: "Lun 3:00 PM" },
      { id: "m12", sender: "supplier", text: "Perfecto, agendamos para el jueves.", time: "Lun 3:15 PM" },
    ]
  }
]

export const videos = [
  // Short videos (reels/tiktok style)
  { id: "v1", title: "5 tips para negociar con proveedores", description: "Aprende a conseguir mejores precios", duration: "0:45", type: "short", category: "Rápido y sencillo", thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=500&fit=crop" },
  { id: "v2", title: "Cómo elegir tu primer proveedor", description: "Lo que debes saber antes de empezar", duration: "1:00", type: "short", category: "Rápido y sencillo", thumbnail: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=300&h=500&fit=crop" },
  { id: "v3", title: "Error común al hacer pedidos", description: "Evita este error de principiante", duration: "0:30", type: "short", category: "Rápido y sencillo", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=500&fit=crop" },
  { id: "v4", title: "Revisa siempre la calidad", description: "Checklist rápido de calidad", duration: "0:50", type: "short", category: "Consejos de venta", thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&h=500&fit=crop" },
  
  // Long videos (workshops)
  { id: "v5", title: "Guía completa de envíos nacionales", description: "Todo sobre paqueterías, costos y tiempos de entrega en México", duration: "45:00", type: "long", category: "Transporte y envíos", thumbnail: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=340&fit=crop" },
  { id: "v6", title: "Importación desde Asia: paso a paso", description: "Cómo importar legalmente y sin complicaciones", duration: "1:20:00", type: "long", category: "Transporte y envíos", thumbnail: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&h=340&fit=crop" },
  { id: "v7", title: "Escala tu negocio de ropa", description: "Estrategias probadas para crecer tu negocio textil", duration: "55:00", type: "long", category: "Crecimiento y desarrollo", thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=340&fit=crop" },
  { id: "v8", title: "Finanzas para emprendedores", description: "Maneja el dinero de tu negocio como profesional", duration: "1:10:00", type: "long", category: "Crecimiento y desarrollo", thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=340&fit=crop" },
  { id: "v9", title: "Cómo iniciar tu tienda de ropa", description: "De cero a tu primera venta: guía completa", duration: "1:30:00", type: "long", category: "Emprendimiento", thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=340&fit=crop" },
  { id: "v10", title: "Marketing digital para moda", description: "Vende más con redes sociales y publicidad", duration: "50:00", type: "long", category: "Consejos de venta", thumbnail: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&h=340&fit=crop" },
  { id: "v11", title: "Organiza tu inventario", description: "Sistemas y herramientas para controlar tu stock", duration: "40:00", type: "long", category: "Organización del negocio", thumbnail: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=340&fit=crop" },
]

export const videoSections = [
  { id: "vs1", name: "Rápido y sencillo", type: "short" },
  { id: "vs2", name: "Transporte y envíos", type: "long" },
  { id: "vs3", name: "Crecimiento y desarrollo", type: "long" },
  { id: "vs4", name: "Emprendimiento", type: "long" },
  { id: "vs5", name: "Consejos de venta", type: "mixed" },
  { id: "vs6", name: "Organización del negocio", type: "long" },
]

export const userProfile = {
  name: "María García",
  email: "maria.garcia@email.com",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  business: "Boutique María",
  location: "Ciudad de México"
}

export const submissions = [
  { id: "s1", type: "extra", requester: "María García", supplier: "Deportes México Pro", product: "Playera dry-fit", quantity: 100, status: "pending", date: "2024-01-15" },
  { id: "s2", type: "custom", requester: "Carlos López", supplier: "Verano Textiles", product: "Vestido personalizado", quantity: 50, status: "approved", date: "2024-01-14" },
  { id: "s3", type: "extra", requester: "Ana Martínez", supplier: "Accesorios Plus", product: "Bolsos de mano", quantity: 200, status: "pending", date: "2024-01-13" },
]
