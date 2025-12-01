const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {MercadoPagoConfig, Preference} = require("mercadopago");

// 2. Configuración del Cliente
// Access Token de PRUEBA (Sandbox).
// NOTA: En producción, usar variables de entorno.
// eslint-disable-next-line max-len
const client = new MercadoPagoConfig({accessToken: "APP_USR-2255579792400627-112921-abe22f278d8afdef66417c2d424d4982-3026971474"});

exports.createPaymentPreference = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    // Desestructuramos en varias líneas para cumplir max-len
    const {
      title,
      price,
      description,
      redirectUrl,
      payerEmail,
    } = req.body;

    const body = {
      items: [
        {
          id: "servicio-medico-01",
          // Cortamos o ajustamos el título por defecto si es muy largo
          title: title || "Atención Médica - Mobility Plus",
          description: description || "Visita de enfermería",
          quantity: 1,
          currency_id: "CLP",
          unit_price: Number(price) || 25000,
        },
      ],
      payer: {
        email: payerEmail || "test_user_generico@testuser.com",
      },
      back_urls: {
        success: redirectUrl,
        failure: redirectUrl,
        pending: redirectUrl,
      },
      auto_return: "approved",
    };

    const preference = new Preference(client);
    const result = await preference.create({body});

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
