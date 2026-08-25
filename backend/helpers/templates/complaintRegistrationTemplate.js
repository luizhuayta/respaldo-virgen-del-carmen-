const complaintRegistrationTemplate = (data) => {

    const serviceTypes = Array.isArray(data.service_type)
        ? data.service_type
        : [];

    return `
    <!DOCTYPE html>
    <html lang="es">

    <head>
        <meta charset="UTF-8">
        <title>Constancia de Registro de Reclamo</title>
    </head>

    <body style="
        margin:0;
        padding:0;
        background:#f5f7fb;
        font-family:Arial, Helvetica, sans-serif;
        color:#333;
    ">

        <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 15px;">
            <tr>
                <td align="center">

                    <table width="700" cellpadding="0" cellspacing="0" style="
                        background:#ffffff;
                        border-radius:12px;
                        overflow:hidden;
                        box-shadow:0 4px 20px rgba(0,0,0,.08);
                    ">

                        <!-- Header -->
                        <tr>
                            <td style="
                                background:#323f7c;
                                color:white;
                                text-align:center;
                                padding:35px 25px;
                            ">
                                <h1 style="
                                    margin:0;
                                    font-size:26px;
                                    font-weight:700;
                                ">
                                    Libro de Reclamaciones
                                </h1>

                                <p style="
                                    margin:10px 0 0;
                                    font-size:14px;
                                    opacity:.9;
                                ">
                                    I.E.S.P.P. Virgen del Carmen
                                </p>
                            </td>
                        </tr>

                        <!-- Estado -->
                        <tr>
                            <td style="padding:25px 35px 10px;">

                                <div style="
                                    background:#fff8ef;
                                    border-left:5px solid #f28c1b;
                                    padding:18px;
                                    border-radius:8px;
                                ">
                                    <strong style="
                                        color:#323f7c;
                                        font-size:16px;
                                    ">
                                        Reclamo registrado correctamente
                                    </strong>

                                    <p style="
                                        margin:10px 0 0;
                                        line-height:1.6;
                                        font-size:14px;
                                    ">
                                        Hemos recibido su solicitud y ha sido registrada
                                        satisfactoriamente en el Libro de Reclamaciones
                                        del I.E.S.P.P. Virgen del Carmen.
                                    </p>
                                </div>

                            </td>
                        </tr>

                        <!-- Código -->
                        <tr>
                            <td style="padding:15px 35px;">

                                <div style="
                                    background:#f4f7ff;
                                    border:1px solid #dbe4ff;
                                    border-radius:10px;
                                    text-align:center;
                                    padding:20px;
                                ">
                                    <div style="
                                        color:#666;
                                        font-size:13px;
                                        margin-bottom:8px;
                                    ">
                                        Código de Seguimiento
                                    </div>

                                    <div style="
                                        color:#323f7c;
                                        font-size:24px;
                                        font-weight:bold;
                                        letter-spacing:1px;
                                    ">
                                        ${data.tracking_code}
                                    </div>

                                    <div style="
                                        margin-top:10px;
                                        color:#666;
                                        font-size:13px;
                                    ">
                                        Estado actual: <strong>Pendiente</strong>
                                    </div>

                                </div>

                            </td>
                        </tr>

                        <!-- Datos del reclamante -->
                        <tr>
                            <td style="padding:10px 35px;">

                                <h2 style="
                                    color:#323f7c;
                                    font-size:18px;
                                    margin-bottom:15px;
                                    border-bottom:2px solid #f28c1b;
                                    padding-bottom:8px;
                                ">
                                    Datos del Reclamante
                                </h2>

                                <table width="100%" cellpadding="8" cellspacing="0">

                                    <tr>
                                        <td><strong>Nombre Completo:</strong></td>
                                        <td>
                                            ${data.nombres}
                                            ${data.apellido_paterno}
                                            ${data.apellido_materno}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td><strong>Documento:</strong></td>
                                        <td>${data.doc_type} - ${data.dni}</td>
                                    </tr>

                                    <tr>
                                        <td><strong>Correo:</strong></td>
                                        <td>${data.email}</td>
                                    </tr>

                                    <tr>
                                        <td><strong>Teléfono:</strong></td>
                                        <td>${data.telefono}</td>
                                    </tr>

                                    <tr>
                                        <td><strong>Domicilio:</strong></td>
                                        <td>
                                            ${data.domicilio},
                                            ${data.district},
                                            ${data.province},
                                            ${data.department}
                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>

                        <!-- Reclamo -->
                        <tr>
                            <td style="padding:10px 35px;">

                                <h2 style="
                                    color:#323f7c;
                                    font-size:18px;
                                    margin-bottom:15px;
                                    border-bottom:2px solid #f28c1b;
                                    padding-bottom:8px;
                                ">
                                    Información del Reclamo
                                </h2>

                                <table width="100%" cellpadding="8" cellspacing="0">

                                    <tr>
                                        <td width="220">
                                            <strong>Tipo:</strong>
                                        </td>
                                        <td>${data.claim_type}</td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <strong>Servicio involucrado:</strong>
                                        </td>
                                        <td>
                                            ${serviceTypes.join(', ')}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <strong>Monto referencial:</strong>
                                        </td>
                                        <td>
                                            ${data.amount || 'No especificado'}
                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>

                        <!-- Descripción -->
                        <tr>
                            <td style="padding:10px 35px;">

                                <div style="
                                    background:#fafcff;
                                    border:1px solid #e3e8f7;
                                    border-radius:8px;
                                    padding:18px;
                                    margin-bottom:15px;
                                ">
                                    <strong style="color:#323f7c;">
                                        Descripción del Bien o Servicio
                                    </strong>

                                    <p style="
                                        margin-top:10px;
                                        line-height:1.6;
                                    ">
                                        ${data.service_description}
                                    </p>
                                </div>

                                <div style="
                                    background:#fafcff;
                                    border:1px solid #e3e8f7;
                                    border-radius:8px;
                                    padding:18px;
                                    margin-bottom:15px;
                                ">
                                    <strong style="color:#323f7c;">
                                        Detalle del Reclamo
                                    </strong>

                                    <p style="
                                        margin-top:10px;
                                        line-height:1.6;
                                    ">
                                        ${data.claim_description}
                                    </p>
                                </div>

                                <div style="
                                    background:#fafcff;
                                    border:1px solid #e3e8f7;
                                    border-radius:8px;
                                    padding:18px;
                                ">
                                    <strong style="color:#323f7c;">
                                        Pedido del Reclamante
                                    </strong>

                                    <p style="
                                        margin-top:10px;
                                        line-height:1.6;
                                    ">
                                        ${data.claim_request}
                                    </p>
                                </div>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                padding:30px 35px;
                                text-align:center;
                                background:#fafafa;
                                border-top:1px solid #ececec;
                            ">

                                <p style="
                                    margin:0 0 10px;
                                    line-height:1.6;
                                    color:#555;
                                ">
                                    Conserve este correo como constancia de registro.
                                    El seguimiento y las comunicaciones relacionadas
                                    con su reclamo serán realizadas mediante el correo
                                    electrónico registrado y el código de seguimiento.
                                </p>

                                <p style="
                                    margin:15px 0 0;
                                    color:#323f7c;
                                    font-weight:bold;
                                ">
                                    Instituto de Educación Superior Pedagógico Público
                                    Virgen del Carmen
                                </p>

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};

module.exports = complaintRegistrationTemplate;