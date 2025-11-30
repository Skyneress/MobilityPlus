const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
// 1. Importamos el SDK de Mercado Pago
const {MercadoPagoConfig, Preference} = require("mercadopago");

// 2. Configuración del Cliente
// Pega aquí tu ACCESS TOKEN de PRUEBA (Sandbox) que obtuviste en el Paso 1.
// NOTA: En producción, esto debería ir en variables de entorno,
// pero para el proyecto está bien aquí.
// eslint-disable-next-line max-len
const client = new MercadoPagoConfig({accessToken: "APP_USR-2255579792400627-112921-abe22f278d8afdef66417c2d424d4982-3026971474"});

// 3. Definimos la Cloud Function
exports.createPaymentPreference = onRequest(async (req, res) => {
  // Habilitar CORS para que tu App pueda llamar a esta función sin bloqueos
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    // Aquí podrías recibir datos dinámicos desde la app (req.body)
    // Por ejemplo: const { precio, titulo } = req.body;

    const body = {
      items: [
        {
          id: "servicio-medico-01",
          title: "Atención Médica a Domicilio - Mobility Plus",
          description: "Visita de enfermería general",
          // picture_url: 'https://tu-imagen.com/logo.png', // Opcional
          quantity: 1,
          currency_id: "CLP", // Pesos Chilenos
          unit_price: 25000, // El precio a cobrar (puede venir de req.body)
        },
      ],
      // 4. IMPORTANTE: Back URLs
      // Aquí es donde sucede la magia de Expo Go.
      // Cuando el pago termina, Mercado Pago intenta abrir estos links.
      // 'mobilityplus' es el 'scheme' que definimos en tu app.json
      back_urls: {
        success: "mobilityplus://payment-result",
        failure: "mobilityplus://payment-result",
        pending: "mobilityplus://payment-result",
      },
      auto_return: "approved", // Retorna automáticamente a la app si se aprueba
    };

    // 5. Crear la preferencia en Mercado Pago
    const preference = new Preference(client);
    const result = await preference.create({body});

    // 6. Devolver el link de pago a la App
    // init_point: Link para producción
    // sandbox_init_point: Link para pruebas (este usaremos)
    res.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });
  } catch (error) {
    logger.error("Error creando preferencia:", error);
    res.status(500).json({error: error.message});
  }
});
