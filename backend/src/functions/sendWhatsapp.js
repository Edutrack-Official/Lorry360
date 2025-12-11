// const twilio = require("twilio");

// const client = twilio(
//   process.env.TWILIO_SID,
//   process.env.TWILIO_AUTH
// );

// async function sendWhatsapp(phone, name, note, date) {

//   const formattedPhone = phone.startsWith("+")
//     ? phone
//     : `+${phone}`;

//   const message = `Hello ${name},

// 🔔 Reminder from Luma App

// ${note}

// 🗓 ${date}

// — Luma App`;

//   try {
//     const response = await client.messages.create({
//       from: "whatsapp:+14155238886",     // Twilio Sandbox
//       to: `whatsapp:${formattedPhone}`,
//       body: message
//     });

//     console.log("✅ WhatsApp Sent:", response.sid);
//     return response;

//   } catch (error) {
//     console.error("❌ WhatsApp Error:");
//     console.error("Message:", error.message);
//     console.error("Code:", error.code);
//     throw error;
//   }
// }

// module.exports = sendWhatsapp;
