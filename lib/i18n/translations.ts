export type Locale = "en" | "es";

export const translations = {
  en: {
    header: {
      login: "Log in",
    },
    hero: {
      eyebrow: "For investors who ask why",
      headline: "The news tells you what. We tell you why.",
      subtitle:
        "Understand why your investments move — in plain language, powered by live market data.",
      cta: "Get started",
      ctaSecondary: "Try the demo",
      stat1: "Live data",
      stat1Value: "24/7",
      stat2: "Assets",
      stat2Value: "Stocks · ETFs · Crypto",
      stat3: "Analysis",
      stat3Value: "Plain language",
    },
    landing: {
      ticker: [
        "Fed rate decisions",
        "Earnings season",
        "Bitcoin sentiment",
        "Gold as macro signal",
        "ETF flows",
        "Inflation prints",
        "Tech rotation",
        "Risk-on / risk-off",
      ],
      features: {
        eyebrow: "Built different",
        title: "Finance that speaks your language",
        subtitle:
          "No neon dashboards. No jargon walls. Just clarity when markets get loud.",
        items: [
          {
            title: "Context, not noise",
            text: "Every move comes with a story — macro, sector, or company — explained like a friend who reads the news.",
            tag: "01",
          },
          {
            title: "Your portfolio, your lens",
            text: "Pick what you actually hold. NextWall filters the world through your assets, not generic headlines.",
            tag: "02",
          },
          {
            title: "Live when it matters",
            text: "Real prices and fresh analysis when sessions open, data drops, or sentiment shifts overnight.",
            tag: "03",
          },
          {
            title: "Made for first moves",
            text: "Designed for 18–25 investors learning the game — confident, calm, never condescending.",
            tag: "04",
          },
        ],
      },
      cta: {
        title: "Stop guessing. Start understanding.",
        subtitle: "Join NextWall and turn market noise into something you can act on.",
        button: "Create your account",
      },
      footer: {
        tagline: "Markets move. Now you know why.",
        rights: "All rights reserved.",
      },
    },
    cards: {
      bgLeft1: "Markets",
      bgRight1: "move.",
      bgLeft2: "Now you know",
      bgRight2: "why.",
      items: [
        {
          title: "See the why",
          text: "We explain why your assets move up or down — no jargon, just clarity.",
        },
        {
          title: "Live market data",
          text: "Real prices from across the market, connected and updated in real time.",
        },
        {
          title: "Clear analysis",
          text: "An analyst that turns the macro picture into plain, useful language.",
        },
      ],
    },
    login: {
      title: "Sign in",
      subtitle: "Access your account to continue",
      email: "Email",
      emailPlaceholder: "you@email.com",
      password: "Password",
      signIn: "Sign in",
      signingIn: "Signing in…",
      signUp: "Create account",
      creatingAccount: "Creating account…",
      backHome: "Back to home",
      accountCreated:
        "Account created. Check your email to confirm, or sign in.",
      errors: {
        emailNotConfirmed: "Confirm your email before signing in.",
        invalidCredentials: "Incorrect email or password.",
        alreadyRegistered: "An account with this email already exists. Sign in.",
      },
    },
    payment: {
      label: "Subscription",
      title: "NextWall Pro",
      price: "€4.99",
      perMonth: "/ month",
      features: [
        "Real-time market analysis",
        "Global economy impact on your assets",
        "Alerts and portfolio tracking",
      ],
      cancelled: "Payment cancelled. You can try again whenever you want.",
      trialBadge: "14-day free trial",
      trialNote: "Try free for 14 days. Cancel anytime before you're charged.",
      promoHint: "Have a beta code? Enter it on the Stripe checkout page.",
      subscribe: "Start free trial",
      redirecting: "Redirecting to Stripe…",
      processing: "Processing…",
      methods: "Accepted payment methods",
      session: "Session",
      signOut: "Sign out",
      backHome: "Back to home",
      errors: {
        checkoutFailed: "Could not start payment",
        noUrl: "No payment URL received",
        generic: "Error starting payment",
      },
    },
    dashboard: {
      success: "You're part of NextWall",
      title: "Today's markets",
      realtime: "Live",
      lastClose: "Last close data",
      updatedAt: "Updated at",
      updatedRelative: "Updated",
      editProfile: "Edit my profile",
      sourceErrorPartial:
        "We couldn't load data from {sources}. The rest of your analysis is still available.",
      sources: {
        finnhub: "Finnhub",
        coingecko: "CoinGecko",
        fred: "FRED",
      },
      refresh: "Refresh analysis",
      refreshing: "Refreshing…",
      tabs: { markets: "Markets", crypto: "Crypto", macro: "Macro" },
      learningMode: "Learning mode",
      onboardingBanner:
        "Have your investments or level changed? Update your profile →",
      onboardingBannerAction: "Update profile",
      sectionGeneral: "Overview",
      yourAssets: "Your assets",
      stocksLabel: "Stocks",
      etfsLabel: "ETFs & funds",
      noAssetsInSection: "You haven't selected any assets in this category.",
      generalEtfs:
        "ETF market snapshot — diversified funds that track sectors, themes and broad exposure.",
      generalIndex:
        "Indexed funds — passive vehicles that mirror major market benchmarks.",
      generalStocks:
        "Equities in focus — individual company performance against the broader market.",
      generalMarkets:
        "Broad market benchmarks — how indices are moving sets the tone for equities and funds.",
      generalCrypto:
        "Crypto market pulse — Bitcoin often leads sentiment for the rest of the ecosystem.",
      generalMetals:
        "Precious metals as a macro barometer — gold and silver react to rates, inflation and risk appetite.",
      generalMacro:
        "Key macro indicators that explain why markets move the way they do.",
      analysisTitle: "What's going on?",
      analyzingMarkets: "Analyzing the markets…",
      analysisUnavailable: "Analysis is not available right now.",
      noData: "no data",
      signOut: "Sign out",
      backHome: "Back to home",
      home: "Home",
      loading: "Loading…",
      errors: {
        loadFailed: "Could not load analysis",
        unexpected: "Unexpected error",
      },
    },
    demo: {
      badge: "Interactive demo",
      banner:
        "Sample portfolio and analysis for illustration — not live market data. Sign up to get daily analysis on your real holdings.",
      cta: "Start free trial",
      profileLabel: "Demo profile · Beginner · Tech, ETFs, crypto, gold",
      sampleData: "Sample data",
      footer:
        "Want this every day, personalized to your assets? Create an account — 14-day free trial, no charge until it ends.",
    },
    assetDetail: {
      badge: "Asset profile",
      title: "Asset details",
      close: "Close",
      marketCap: "Market cap",
      topProduct: "Top revenue driver",
      financials: "Financial data",
      revenueDrivers: "What makes this asset money",
      overview: "Overview",
      todayInsight: "Today's context",
      whatsHappening: "What's going on",
      loading: "Loading details…",
      unavailable: "Details unavailable right now.",
      tapHint: "Tap for details →",
    },
  },
  es: {
    header: {
      login: "Iniciar sesión",
    },
    hero: {
      eyebrow: "Para inversores que preguntan por qué",
      headline: "Las noticias te dicen el qué. Nosotros te decimos por qué.",
      subtitle:
        "Entiende por qué se mueven tus inversiones — en lenguaje claro, con datos de mercado en vivo.",
      cta: "Empieza ahora",
      ctaSecondary: "Probar la demo",
      stat1: "Datos en vivo",
      stat1Value: "24/7",
      stat2: "Activos",
      stat2Value: "Acciones · ETFs · Crypto",
      stat3: "Análisis",
      stat3Value: "Lenguaje claro",
    },
    landing: {
      ticker: [
        "Decisiones de tipos de la Fed",
        "Temporada de resultados",
        "Sentimiento del Bitcoin",
        "Oro como señal macro",
        "Flujos en ETFs",
        "Datos de inflación",
        "Rotación tech",
        "Risk-on / risk-off",
      ],
      features: {
        eyebrow: "Distinto a lo de siempre",
        title: "Finanzas que hablan tu idioma",
        subtitle:
          "Sin dashboards de neón. Sin muros de jerga. Solo claridad cuando el mercado se pone ruidoso.",
        items: [
          {
            title: "Contexto, no ruido",
            text: "Cada movimiento trae una historia — macro, sector o empresa — explicada como un amigo que lee las noticias.",
            tag: "01",
          },
          {
            title: "Tu cartera, tu enfoque",
            text: "Elige lo que realmente tienes. NextWall filtra el mundo a través de tus activos, no titulares genéricos.",
            tag: "02",
          },
          {
            title: "En vivo cuando importa",
            text: "Precios reales y análisis fresco cuando abren sesiones, salen datos o cambia el sentimiento de un día para otro.",
            tag: "03",
          },
          {
            title: "Hecho para tus primeros pasos",
            text: "Diseñado para inversores de 18–25 que aprenden el juego — con confianza, calma y sin condescendencia.",
            tag: "04",
          },
        ],
      },
      cta: {
        title: "Deja de adivinar. Empieza a entender.",
        subtitle:
          "Únete a NextWall y convierte el ruido del mercado en algo con lo que puedes actuar.",
        button: "Crea tu cuenta",
      },
      footer: {
        tagline: "Los mercados se mueven. Ahora sabes por qué.",
        rights: "Todos los derechos reservados.",
      },
    },
    cards: {
      bgLeft1: "Los mercados",
      bgRight1: "se mueven.",
      bgLeft2: "Ahora sabes",
      bgRight2: "por qué.",
      items: [
        {
          title: "Entiende el porqué",
          text: "Te explicamos por qué suben o bajan tus activos — sin jerga, con claridad.",
        },
        {
          title: "Datos en vivo",
          text: "Precios reales del mercado, conectados y actualizados en tiempo real.",
        },
        {
          title: "Análisis claro",
          text: "Un analista que convierte el panorama macro en lenguaje útil y directo.",
        },
      ],
    },
    login: {
      title: "Iniciar sesión",
      subtitle: "Accede a tu cuenta para continuar",
      email: "Correo electrónico",
      emailPlaceholder: "tu@email.com",
      password: "Contraseña",
      signIn: "Iniciar sesión",
      signingIn: "Entrando…",
      signUp: "Crear cuenta",
      creatingAccount: "Creando cuenta…",
      backHome: "Volver al inicio",
      accountCreated:
        "Cuenta creada. Revisa tu correo para confirmar o inicia sesión.",
      errors: {
        emailNotConfirmed: "Confirma tu correo antes de iniciar sesión.",
        invalidCredentials: "Correo o contraseña incorrectos.",
        alreadyRegistered:
          "Ya existe una cuenta con este correo. Inicia sesión.",
      },
    },
    payment: {
      label: "Suscripción",
      title: "NextWall Pro",
      price: "4,99€",
      perMonth: "/ mes",
      features: [
        "Análisis de mercado en tiempo real",
        "Impacto de la economía global en tus activos",
        "Alertas y seguimiento de portfolio",
      ],
      cancelled: "Pago cancelado. Puedes intentarlo de nuevo cuando quieras.",
      trialBadge: "14 días gratis",
      trialNote: "Prueba 14 días gratis. Cancela cuando quieras antes del cobro.",
      promoHint: "¿Tienes un código beta? Introdúcelo en el checkout de Stripe.",
      subscribe: "Empezar prueba gratis",
      redirecting: "Redirigiendo a Stripe…",
      processing: "Procesando…",
      methods: "Métodos de pago aceptados",
      session: "Sesión",
      signOut: "Cerrar sesión",
      backHome: "Volver al inicio",
      errors: {
        checkoutFailed: "No se pudo iniciar el pago",
        noUrl: "No se recibió URL de pago",
        generic: "Error al iniciar el pago",
      },
    },
    dashboard: {
      success: "Ya eres parte de NextWall",
      title: "Hoy en los mercados",
      realtime: "Tiempo real",
      lastClose: "Datos del último cierre",
      updatedAt: "Actualizado a las",
      updatedRelative: "Actualizado",
      editProfile: "Editar mi perfil",
      sourceErrorPartial:
        "No hemos podido cargar los datos de {sources}. El resto de tu análisis sigue disponible.",
      sources: {
        finnhub: "Finnhub",
        coingecko: "CoinGecko",
        fred: "FRED",
      },
      refresh: "Actualizar análisis",
      refreshing: "Actualizando…",
      tabs: { markets: "Mercados", crypto: "Crypto", macro: "Macro" },
      learningMode: "Modo aprendizaje",
      onboardingBanner:
        "¿Han cambiado tus inversiones o tu nivel? Actualiza tu perfil →",
      onboardingBannerAction: "Actualizar perfil",
      sectionGeneral: "General",
      yourAssets: "Tus activos",
      stocksLabel: "Acciones",
      etfsLabel: "ETFs y Fondos",
      noAssetsInSection: "No has seleccionado activos en esta categoría.",
      generalEtfs:
        "Panorama ETF — fondos diversificados que siguen sectores, temas y exposición amplia.",
      generalIndex:
        "Fondos indexados — vehículos pasivos que replican los grandes índices de mercado.",
      generalStocks:
        "Acciones en foco — rendimiento de empresas individuales frente al mercado.",
      generalMarkets:
        "Referencia del mercado amplio — cómo se mueven los índices marca el tono de acciones y fondos.",
      generalCrypto:
        "Pulso del mercado crypto — Bitcoin suele marcar el sentimiento del resto del ecosistema.",
      generalMetals:
        "Metales preciosos como termómetro macro — oro y plata reaccionan a tipos, inflación y apetito por riesgo.",
      generalMacro:
        "Indicadores macro clave que explican por qué los mercados se mueven como lo hacen.",
      analysisTitle: "¿Qué está pasando?",
      analyzingMarkets: "Analizando los mercados…",
      analysisUnavailable: "El análisis no está disponible en este momento.",
      noData: "sin dato",
      signOut: "Cerrar sesión",
      backHome: "Volver al inicio",
      home: "Inicio",
      loading: "Cargando…",
      errors: {
        loadFailed: "No se pudo cargar el análisis",
        unexpected: "Error inesperado",
      },
    },
    demo: {
      badge: "Demo interactiva",
      banner:
        "Cartera y análisis de ejemplo — no son datos en vivo. Regístrate para recibir análisis diario con tus activos reales.",
      cta: "Empezar prueba gratis",
      profileLabel: "Perfil demo · Principiante · Tech, ETFs, crypto, oro",
      sampleData: "Datos de ejemplo",
      footer:
        "¿Quieres esto cada día, personalizado a tus activos? Crea una cuenta — 14 días gratis, sin cobro hasta que termine.",
    },
    assetDetail: {
      badge: "Ficha del activo",
      title: "Detalles del activo",
      close: "Cerrar",
      marketCap: "Capitalización",
      topProduct: "Principal fuente de ingresos",
      financials: "Datos financieros",
      revenueDrivers: "De dónde sale el dinero",
      overview: "Resumen",
      todayInsight: "Contexto de hoy",
      whatsHappening: "Qué está pasando",
      loading: "Cargando detalles…",
      unavailable: "Los detalles no están disponibles ahora.",
      tapHint: "Toca para ver detalles →",
    },
  },
} as const;

export type Translations = (typeof translations)[Locale];
