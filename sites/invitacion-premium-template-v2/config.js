// Edita SOLO este archivo para personalizar.
window.INVITACION = {
  portada: "assets/fotos/slide-6.jpeg",

  rsvpEndpoint:
    "https://script.google.com/macros/s/AKfycbwBb9wip4Ghr5vA2T_H9QfbRD9QXUFeTA-l-8jS5W-bZ21ZV2ycLWj-sPZbNu2TDmH7/exec",

  nombresHTML: `Elisama<br/><span class="amp">&amp;</span><br/>Miguel`,
  fechaTexto: "27 DE ABRIL DEL 2026",
  fechaISO: "2026-03-20T17:00:00-06:00",

  // PADRES
  padres: {
    titulo: "EN COMPAÑÍA DE NUESTROS PADRES",
    noviaTitulo: "PADRES DE LA NOVIA",
    novia: ["María del Carmen Hernández López", "José Luis Martínez Ruiz"],
    novioTitulo: "PADRES DEL NOVIO",
    novio: ["Ana Patricia García Soto", "Roberto Sánchez Díaz"],
  },

  //Itinerario
  itinerario: [
    {
      icon: "assets/icons/iglesia.png",
      titulo: "Ceremonia",
      lugar: "Iglesia",
      hora: "5:00 PM",
      mapa: "https://maps.google.com",
    },
    {
      icon: "assets/icons/mapa.png",
      titulo: "Recepción",
      lugar: "Salón",
      hora: "7:00 PM",
      mapa: "https://maps.google.com",
    },
    {
      icon: "assets/icons/comida.png",
      titulo: "Coctel",
      lugar: "Fiesta",
      hora: "8:00 PM",
      mapa: "https://maps.google.com",
    },
    {
      icon: "assets/icons/comida.png",
      titulo: "Cena",
      lugar: "Fiesta",
      hora: "9:00 PM",
      mapa: "https://maps.google.com",
    },
    {
      icon: "assets/icons/comida.png",
      titulo: "Fin Recepción",
      lugar: "Salón",
      hora: "12:00 PM",
      mapa: "https://maps.google.com",
    },
  ],

  // Galería
  galeria: [
    "assets/fotos/slide-1.jpeg",
    "assets/fotos/slide-10.jpeg",
    "assets/fotos/slide-2.jpeg",
    "assets/fotos/slide-3.jpeg",
    "assets/fotos/slide-4.jpeg",
    "assets/fotos/slide-5.jpeg",
    "assets/fotos/slide-6.jpeg",
    "assets/fotos/slide-7.jpeg",
  ],

  // Regalos
  regalosIntro:
    "Su presencia y compañía siempre será nuestro mejor regalo. Si desean obsequiarnos algo más, pueden hacerlo a través de:",
  regalo1: {
    img: "assets/icons/liverpool.png",
    link: "https://www.liverpool.com.mx/",
  },
  regalo2: {
    img: "assets/icons/amazon.png",
    link: "https://www.amazon.com.mx/",
  },
  banco: {
    linea1: "BBVA · Titular: Miguel Torres",
    linea2: "CLABE/Tarjeta · XXXX XXXX XXXX XXXX",
  },

  // Hospedaje
  hospedajeIntro: "Sugerencias de hospedaje para nuestros invitados.",
  hospedaje: [
    {
      nombre: "Hotel 1",
      texto: "A 10 min del salón.",
      link: "https://maps.google.com",
      foto: "assets/hoteles/hotel1.jpg",
      tag: "Cerca del salón", // opcional
      reserva: "https://hotel.com", // opcional
    },
    {
      nombre: "Hotel 2",
      texto: "Cerca del centro.",
      link: "https://maps.google.com",
      foto: "assets/hoteles/hotel2.jpg",
      tag: "Recomendado",
    },
    {
      nombre: "Hotel 3",
      texto: "Opción económica.",
      link: "https://maps.google.com",
      foto: "assets/hoteles/hotel3.jpg",
      tag: "Económico",
    },
  ],

  evento: {
    titulo: "Boda Elisama & Miguel",
    ubicacion: "Iglesia Santa Cruz",
    descripcion: "¡Nos encantará verte! Ceremonia y recepción.",
    startISO: "2026-04-24T17:00:00-06:00",
    endISO: "2026-04-24T23:00:00-06:00",
    timezone: "America/Mexico_City",
  },

  sage_blush: {
    colors: ["#5D6B57", "#8B957E", "#D8A0A7", "#B59B8C", "#D9C6B8"],
  },

  // agrega futuras paletas así:
  // midnight_gold: { colors: ["#111111","#1B2333","#C8A24A","#E7D8C6"] },

  titleA: "BODA",
  titleB: "atuendo",
  dressCodeLine: "CÓDIGO DE VESTIMENTA: FORMAL",
  intro:
    "ANIMAMOS A NUESTROS INVITADOS A USAR ESTOS COLORES PARA NUESTRO DÍA ESPECIAL",
  paletteId: "sage_blush",
  thanks: "Gracias!",

  vestidoImg: "assets/icons/vestido.png",
  trajeImg: "assets/icons/traje.png",

  sello: "assets/icons/sello.png",
  musica: {
    enabled: true,
    src: "assets/music/Bruno_Mars_Rest_Of_My_Life.mp3",
    title: "Rest Of My Life",
    subtitle: "Música de fondo",
    autoplay: true,
    volume: 0.8,
    remember: true,
  },

  // Footer
  footerNombres: "Elisama & Miguel",
  contactoLink: "https://wa.me/523131022416",
  footerMarca: "INVITECORP.MX",
  footerMarcaLink: "https://invitecorp.rcorpusapex.workers.dev/",

  weather: {
  enabled: true,
  cityLabel: "Monterrey, NL",
  lat: 25.6866,
  lon: -100.3161,
  timezone: "America/Mexico_City",
  ceremonyTime: "17:00",
  hideUntilDays: 16,
  theme: "auto",

  showWeek: true,
  weekWindowDays: 7,

  // (para pruebas puedes cambiar fechaISO a marzo)
   //debugNow: "2026-03-06"
},
};
