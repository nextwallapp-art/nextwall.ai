import type { Locale } from "@/lib/i18n/translations";

const whatsHappeningEn: Record<string, string> = {
  AAPL: `Apple is pulling back today after a strong run in mega-cap tech. Investors are taking profits while they wait for clearer signals on iPhone demand and Services growth ahead of the next earnings report.

The move isn't isolated: when rates stay high, markets often trim the most expensive names first — and Apple trades at a premium multiple. A softer dollar or strong Services data could quickly change the tone.

For your portfolio, the story today is rotation, not panic. Apple still earns most of its money from iPhone and high-margin subscriptions — watch whether the stock holds key support levels while the broader market digests macro data.`,

  NVDA: `Nvidia is leading chip stocks higher today as AI infrastructure spending stays in focus. Headlines around data-center demand and next-gen GPU roadmaps are keeping buyers active even after the huge rally this year.

Semiconductors are highly sensitive to rate expectations and earnings revisions — when growth names lead, it usually means investors are comfortable taking risk again. Nvidia's dominance in AI accelerators makes it the bellwether for that trade.

If you hold Nvidia, today's move is about sentiment on AI capex, not a single product launch. The key question is whether cloud giants keep raising spend — that's what ultimately backs the revenue story.`,

  TSLA: `Tesla is under pressure today as EV makers compete harder on price and delivery growth slows in key markets. The stock often amplifies broader risk appetite — when growth wobbles, Tesla tends to move more than the index.

Macro matters here too: higher rates make car financing more expensive and squeeze margins on aggressive pricing. Energy storage is growing, but vehicles still drive the narrative investors trade day to day.

For context, today's dip looks more like positioning ahead of delivery data than a structural break — but Tesla remains one of the most sentiment-driven names in a beginner portfolio.`,

  SPY: `The S&P 500 is broadly flat today — investors are balancing solid mega-cap earnings against sticky inflation and Fed speakers on the calendar. SPY reflects the whole US large-cap market, so "flat" usually means mixed sector rotation underneath.

Tech and comms are doing the heavy lifting while rate-sensitive sectors lag. That pattern often appears when the market expects rates to stay higher for longer but isn't ready to sell off aggressively.

As a benchmark holding, SPY's message today is wait-and-see: no clear risk-on or risk-off signal until new CPI or jobs data lands.`,

  QQQ: `Nasdaq names are slightly green while the broader market chops sideways — a classic "growth over value" day. QQQ is concentrated in Apple, Microsoft, Nvidia and Amazon, so it moves when investors favor long-duration tech earnings.

Lower bond yields over the session are helping: when yields ease, future profits at tech giants get discounted less harshly. That's why QQQ can outperform SPY even on quiet macro days.

If you own QQQ, you're essentially betting on US tech leadership staying intact — today's tape supports that, but concentration risk remains the trade-off.`,

  GLD: `Gold is firm today as investors hedge ahead of Fed commentary and lingering inflation uncertainty. GLD tracks physical gold — it often rises when real yields stall or the dollar weakens, even if stocks don't crash.

Geopolitical headlines and central-bank buying have kept a floor under gold for months. In a portfolio with tech and crypto, gold is doing its job as the defensive sleeve when nobody wants to chase risk.

Today's move is less about a crisis and more about cautious positioning — gold holding up while equities pause is a familiar late-cycle pattern.`,

  BTC: `Bitcoin is higher today as risk appetite improves and yields ease slightly. BTC often leads crypto sentiment — when it rises, altcoins usually follow with more volatility.

ETF inflows and macro liquidity expectations are the backdrop: investors treat Bitcoin as both a risk asset and a hedge narrative depending on the week. A softer dollar and stable equities tend to support flows into digital assets.

For your crypto sleeve, today's action says markets are willing to add risk again — but crypto moves fast; the same macro headline can reverse the trade within days.`,

  ETH: `Ethereum is slightly red while Bitcoin holds gains — a common pattern when traders rotate within crypto rather than exit the asset class. ETH's story is on-chain activity: DeFi volumes, stablecoins and L2 adoption.

Network fees and staking yields matter more for ETH's medium-term narrative than a single day's price. When BTC leads and ETH lags, it often means macro flows are driving crypto, not Ethereum-specific news.

If you hold both BTC and ETH, watch whether ETH catches up — that signals broader risk-on in crypto, not just Bitcoin speculation.`,

  SOL: `Solana is outperforming today on strong retail trading activity and momentum in high-beta altcoins. SOL tends to amplify moves in crypto risk appetite — up more on good days, down harder on risk-off sessions.

Fast transaction speeds make Solana popular for DeFi and memecoin cycles; when those volumes spike, SOL often leads the altcoin board. That's what's driving today's relative strength versus ETH.

Treat SOL as the high-beta slice of a crypto allocation — great when appetite is hot, but more volatile when liquidity tightens.`,
};

const whatsHappeningEs: Record<string, string> = {
  AAPL: `Apple corrige hoy tras una semana fuerte en mega caps tecnológicas. Los inversores toman beneficios mientras esperan señales más claras sobre demanda de iPhone y crecimiento de Services antes del próximo informe de resultados.

El movimiento no es aislado: con tipos altos, el mercado suele recortar primero los nombres más caros — y Apple cotiza con un múltiplo premium. Un dólar más débil o datos sólidos de Services pueden cambiar el tono rápidamente.

Para tu cartera, la historia hoy es rotación, no pánico. Apple sigue ganando sobre todo con iPhone y suscripciones de alto margen — observa si el valor se mantiene en soporte mientras el mercado digiere datos macro.`,

  NVDA: `Nvidia lidera las subidas del sector chip hoy mientras el gasto en infraestructura de IA sigue en foco. Titulares sobre demanda en data centers y la hoja de ruta de GPUs mantienen activos los compradores tras el rally del año.

Los semiconductores son muy sensibles a expectativas de tipos y revisiones de beneficios — cuando lideran los nombres de crecimiento, suele significar que el mercado acepta más riesgo. El dominio de Nvidia en aceleradores de IA la convierte en termómetro de ese trade.

Si tienes Nvidia, el movimiento de hoy va de sentimiento sobre capex en IA, no de un lanzamiento puntual. La pregunta clave es si los gigantes cloud siguen subiendo inversión — eso es lo que sostiene la historia de ingresos.`,

  TSLA: `Tesla está bajo presión hoy mientras los fabricantes de EV compiten más en precio y el crecimiento de entregas se enfría en mercados clave. La acción amplifica el apetito por riesgo — cuando el crecimiento flojea, Tesla suele moverse más que el índice.

El macro también pesa: tipos altos encarecen la financiación de coches y aprietan márgenes si hay guerra de precios. El almacenamiento de energía crece, pero los vehículos siguen mandando en el relato diario.

Como contexto, la caída de hoy parece más posicionamiento antes de datos de entregas que una ruptura estructural — pero Tesla sigue siendo de los nombres más sensibles al sentimiento.`,

  SPY: `El S&P 500 está plano hoy — los inversores equilibran resultados sólidos de mega caps con inflación persistente y comparecencias de la Fed. SPY refleja todo el mercado large-cap de EE.UU., así que "plano" suele esconder rotación sectorial.

Tech y comunicaciones tiran del carro mientras sectores sensibles a tipos van rezagados. Ese patrón aparece cuando el mercado espera tipos altos más tiempo pero no quiere vender agresivamente.

Como referencia de cartera, el mensaje de SPY hoy es esperar: sin señal clara risk-on o risk-off hasta nuevo dato de IPC o empleo.`,

  QQQ: `El Nasdaq está ligeramente verde mientras el mercado amplio va lateral — un día típico de "crecimiento vs valor". QQQ está concentrado en Apple, Microsoft, Nvidia y Amazon, así que sube cuando prima el earnings tech de largo plazo.

La caída de rendimientos bonistas en la sesión ayuda: cuando los tipos ceden, se castigan menos las ganancias futuras de las mega caps. Por eso QQQ puede batir a SPY incluso en días macro tranquilos.

Si tienes QQQ, apuestas al liderazgo tecnológico de EE.UU. — la sesión de hoy lo respalda, pero el riesgo de concentración sigue ahí.`,

  GLD: `El oro se mantiene firme hoy mientras los inversores se cubren antes de comentarios de la Fed e incertidumbre inflacionaria. GLD replica oro físico — suele subir cuando los tipos reales se estancan o el dólar se debilita, aunque las acciones no colapsen.

Titulares geopolíticos y compras de bancos centrales han puesto suelo al oro durante meses. En una cartera con tech y crypto, el oro cumple su papel defensivo cuando nadie quiere perseguir riesgo.

El movimiento de hoy es más posicionamiento cauteloso que crisis — oro firme con renta variable en pausa es un patrón habitual de ciclo avanzado.`,

  BTC: `Bitcoin sube hoy al mejorar el apetito por riesgo y ceder ligeramente los tipos. BTC suele marcar el sentimiento crypto — cuando sube, las altcoins suelen seguir con más volatilidad.

Los flujos a ETFs y las expectativas de liquidez macro son el telón de fondo: los inversores tratan Bitcoin como activo de riesgo y como relato de cobertura según la semana. Un dólar más débil y renta variable estable suelen favorecer entradas a activos digitales.

Para tu tramo crypto, la acción de hoy dice que el mercado vuelve a sumar riesgo — pero el crypto se mueve rápido; el mismo titular macro puede revertir el trade en días.`,

  ETH: `Ethereum está ligeramente rojo mientras Bitcoin mantiene ganancias — patrón habitual cuando hay rotación dentro del crypto sin salir del activo. La historia de ETH es actividad on-chain: volúmenes DeFi, stablecoins y adopción L2.

Las comisiones de red y el staking importan más para ETH a medio plazo que un solo día de precio. Cuando BTC lidera y ETH rezaga, suele ser liquidez macro la que mueve el sector, no noticias específicas de Ethereum.

Si tienes BTC y ETH, mira si ETH recupera terreno — eso señala risk-on amplio en crypto, no solo especulación en Bitcoin.`,

  SOL: `Solana está outperforming hoy con fuerte actividad retail y momentum en altcoins de alta beta. SOL amplifica el apetito por riesgo crypto — sube más en días buenos y cae más cuando se aprieta la liquidez.

Sus transacciones rápidas la hacen popular en ciclos DeFi y memecoins; cuando esos volúmenes disparan, SOL suele liderar el tablero altcoin. Eso explica la fortaleza relativa frente a ETH hoy.

Trata SOL como la parte de mayor beta de una cartera crypto — excelente con apetito caliente, pero más volátil cuando la liquidez se enfría.`,
};

export function getDemoWhatsHappening(symbol: string, locale: Locale): string | null {
  const key = symbol.toUpperCase();
  const table = locale === "es" ? whatsHappeningEs : whatsHappeningEn;
  return table[key] ?? null;
}
