const digitalIntakeTemplate = (data) => {

    return `
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8">
    </head>

    <body style="
        margin:0;
        padding:0;
        background:#f4f6f9;
        font-family:Arial, Helvetica, sans-serif;
    ">

        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center">

                    <table
                        width="700"
                        cellpadding="0"
                        cellspacing="0"
                        style="
                            background:#ffffff;
                            margin:30px 0;
                            border-radius:10px;
                            overflow:hidden;
                            box-shadow:0 3px 10px rgba(0,0,0,.1);
                        "
                    >

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
                                    Mesa de Partes Virtual
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

                        <!-- TRACKING -->
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
                                        Trámite registrado correctamente
                                    </strong>

                                    <p style="
                                        margin:10px 0 0;
                                        line-height:1.6;
                                        font-size:14px;
                                    ">
                                        Hemos recibido su trámite y ha sido registrado
                                        satisfactoriamente en la Mesa de Partes Virtual
                                        del Instituto de Educacion Superior Pedagogico Publico Virgen del Carmen.
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
                                </div>

                            </td>
                        </tr>

                        <!-- DATOS -->
                        <tr>
                            <td style="padding:20px 30px;">

                                <h3
                                    style="
                                        color:#323f7c;
                                        font-size:16px;
                                    "
                                >
                                    Información del Remitente
                                </h3>

                                <table width="100%">

                                    <tr>
                                        <td><b>Nombre:</b></td>
                                        <td>${data.full_name}</td>
                                    </tr>

                                    <tr>
                                        <td><b>DNI / RUC:</b></td>
                                        <td>${data.DNI_RUC}</td>
                                    </tr>

                                    <tr>
                                        <td><b>Correo:</b></td>
                                        <td>${data.email}</td>
                                    </tr>

                                    <tr>
                                        <td><b>Teléfono:</b></td>
                                        <td>${data.phone_number}</td>
                                    </tr>

                                    <tr>
                                        <td><b>Condición:</b></td>
                                        <td>${data.c_condition}</td>
                                    </tr>

                                </table>

                            </td>
                        </tr>

                        <!-- DOCUMENTO -->
                        <tr>
                            <td style="padding:20px 30px;">

                                <h3
                                    style="
                                        color:#323f7c;
                                        font-size:16px;
                                    "
                                >
                                    Datos del Documento
                                </h3>

                                <table width="100%">

                                    <tr>
                                        <td><b>Tipo:</b></td>
                                        <td>${data.document_type}</td>
                                    </tr>

                                    <tr>
                                        <td><b>Asunto:</b></td>
                                        <td>${data.v_subject}</td>
                                    </tr>

                                    <tr>
                                        <td><b>Folios:</b></td>
                                        <td>${data.number_of_pages}</td>
                                    </tr>

                                </table>

                                <div
                                    style="
                                        margin-top:20px;
                                        background:#f8f9fa;
                                        padding:15px;
                                        border-left:4px solid #f28c1b;
                                        border-radius:5px;
                                    "
                                >
                                    ${data.v_message}
                                </div>

                            </td>
                        </tr>

                        ${data.document_url
            ? `
                            <tr>
                                <td style="padding:0 30px 20px 30px;">
                                    <b>Enlace:</b>
                                    <br><br>
                                    <a href="${data.document_url}">
                                        ${data.document_url}
                                    </a>
                                </td>
                            </tr>
                            `
            : ''
        }

                        <!-- FOOTER -->
                        <tr>
                            <td
                                style="
                                    background:#f8f9fa;
                                    color:#666;
                                    text-align:center;
                                    padding:20px;
                                    font-size:12px;
                                "
                            >
                                Este correo fue generado automáticamente
                                por la Mesa de Partes Virtual.
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

module.exports = digitalIntakeTemplate;