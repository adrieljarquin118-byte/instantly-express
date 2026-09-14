import request from 'supertest';
import { app } from '../src/server.js';

describe('API Instantly Express', () => {
  test('responde salud', async () => {
    const respuesta = await request(app).get('/api/salud');
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.estado).toBe('activo');
  });

  test('rechaza credenciales incorrectas', async () => {
    const respuesta = await request(app).post('/api/auth/login').send({ correo: 'nadie@demo.com', contrasena: 'incorrecta' });
    expect(respuesta.statusCode).toBe(401);
  });

  test('protege monitoreo administrativo', async () => {
    const login = await request(app).post('/api/auth/login').send({ correo: 'cliente@demo.com', contrasena: '123456' });
    const respuesta = await request(app).get('/api/monitoreo/carrito').set('Authorization', `Bearer ${login.body.token}`);
    expect(respuesta.statusCode).toBe(403);
  });

  test('rechaza registro de carrito menor al mayoreo', async () => {
    const login = await request(app).post('/api/auth/login').send({ correo: 'cliente@demo.com', contrasena: '123456' });
    const respuesta = await request(app).post('/api/carrito/agregar').set('Authorization', `Bearer ${login.body.token}`).send({ idProducto: 1, cantidad: 1 });
    expect(respuesta.statusCode).toBe(422);
  });
});