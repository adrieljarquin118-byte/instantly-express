# Plan de pruebas Instantly Express

## Comandos

```bash
npm.cmd install --prefix backend
npm.cmd --prefix backend test
npm.cmd --prefix web run build
```

## Cobertura implementada

- Salud de API y estado de conexión MySQL.
- Login rechazando credenciales inválidas.
- Protección de monitoreo para clientes no administradores.
- Validación de cantidad mínima de mayoreo.
- Rate limit de 10 intentos de login por IP cada 15 minutos.
- Transiciones de pedido válidas: pendiente -> confirmado -> en_transito -> entregado.
- Cancelación desde pendiente, confirmado o en_transito.
- Rechazo de saltos de estado inválidos.
- Métodos de pago registrados sin procesar cobros reales.
- Factura PDF informativa descargable desde el navegador.

## Pendientes de producción

- Configurar proveedor SMTP para recuperación real por correo.
- Guardar carritos, pedidos, detalle y tracking en tablas MySQL dentro de transacciones.
- Configurar almacenamiento externo para fotos de perfil.
- Añadir pruebas de concurrencia con dos clientes sobre las mismas unidades.
