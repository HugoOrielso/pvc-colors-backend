import { Request, Response } from "express";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactRequestBody {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
}

export async function sendContactEmailController(
    req: Request<{}, {}, ContactRequestBody>,
    res: Response
) {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos son obligatorios",
            });
        }

        const fromEmail =
            process.env.RESEND_FROM_EMAIL ??
            "PVC Colors <onboarding@resend.dev>";

        const { data, error } = await resend.emails.send({
            from: fromEmail,

            to: ["exportacionespvc2026@gmail.com"],

            replyTo: email,

            subject: `Nuevo mensaje de ${name}`,

            html: `
                <div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
                    <tr>
                        <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(5,20,55,0.12);">
                            
                            <tr>
                            <td style="background:#061946;padding:42px 40px;text-align:left;">
                                <div style="display:inline-block;background:#f9c928;color:#061946;font-size:12px;font-weight:700;padding:7px 12px;border-radius:999px;margin-bottom:18px;">
                                NUEVO CONTACTO WEB
                                </div>

                                <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.2;font-weight:800;">
                                ${name} quiere ponerse en contacto con PVC Colors
                                </h1>

                                <p style="margin:14px 0 0;color:#dbe4ff;font-size:15px;line-height:1.7;">
                                Recibiste una nueva solicitud desde el formulario de contacto de la página web.
                                </p>
                            </td>
                            </tr>

                            <tr>
                            <td style="padding:38px 40px;">
                                <p style="margin:0 0 18px;color:#061946;font-size:17px;line-height:1.7;">
                                La persona con el nombre <strong>${name}</strong> te escribió el siguiente mensaje:
                                </p>

                                <div style="background:#f8fafc;border-left:5px solid #f9c928;border-radius:16px;padding:22px 24px;margin:24px 0;">
                                <p style="margin:0;color:#1f2937;font-size:16px;line-height:1.8;white-space:pre-line;">
                                    ${message}
                                </p>
                                </div>

                                <div style="margin-top:30px;background:#061946;border-radius:20px;padding:26px;">
                                <h2 style="margin:0 0 18px;color:#ffffff;font-size:20px;">
                                    Datos para contactar al cliente
                                </h2>

                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                    <td style="padding:12px 0;color:#f9c928;font-size:13px;font-weight:700;width:120px;">
                                        Nombre
                                    </td>
                                    <td style="padding:12px 0;color:#ffffff;font-size:15px;font-weight:600;">
                                        ${name}
                                    </td>
                                    </tr>

                                    <tr>
                                    <td style="padding:12px 0;color:#f9c928;font-size:13px;font-weight:700;">
                                        Email
                                    </td>
                                    <td style="padding:12px 0;color:#ffffff;font-size:15px;font-weight:600;">
                                        <a href="mailto:${email}" style="color:#ffffff;text-decoration:none;">
                                        ${email}
                                        </a>
                                    </td>
                                    </tr>

                                    <tr>
                                    <td style="padding:12px 0;color:#f9c928;font-size:13px;font-weight:700;">
                                        Teléfono
                                    </td>
                                    <td style="padding:12px 0;color:#ffffff;font-size:15px;font-weight:600;">
                                        <a href="tel:${phone}" style="color:#ffffff;text-decoration:none;">
                                        ${phone}
                                        </a>
                                    </td>
                                    </tr>
                                </table>
                                </div>

                                <div style="text-align:center;margin-top:34px;">
                                <a href="mailto:${email}" style="display:inline-block;background:#f9c928;color:#061946;text-decoration:none;font-weight:800;font-size:15px;padding:14px 28px;border-radius:999px;">
                                    Responder por correo
                                </a>
                                </div>
                            </td>
                            </tr>

                            <tr>
                            <td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
                                <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                                Este correo fue generado automáticamente desde el formulario de contacto de
                                <strong style="color:#061946;">PVC Colors</strong>.
                                </p>
                            </td>
                            </tr>

                        </table>
                        </td>
                    </tr>
                    </table>
                </div>
                `,
        });

        if (error) {
            console.error("❌ Error enviando correo:", error);

            return res.status(500).json({
                success: false,
                message: "No se pudo enviar el correo",
                error,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Correo enviado correctamente",
            data,
        });
    } catch (error) {
        console.error(
            "❌ Error en sendContactEmailController:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
}