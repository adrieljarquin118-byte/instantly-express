import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const cadena = process.env.MYSQL_URL;
let pool = null;

if (cadena) {
  const url = new URL(cadena);
  pool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: process.env.MYSQL_BASE_DATOS || url.pathname.replace(/^\//, '') || 'defaultdb',
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 5
  });
}

export async function fnConsultarBaseDatos(consulta, parametros = []) {
  if (!pool) return null;
  const [filas] = await pool.query(consulta, parametros);
  return filas;
}

export async function fnComprobarBaseDatos() {
  if (!pool) return { conectada: false, motivo: 'MYSQL_URL no configurada' };
  try {
    await pool.query('SELECT 1');
    return { conectada: true };
  } catch (error) {
    return { conectada: false, motivo: error.message };
  }
}

export async function fnTransaccionBaseDatos(funcion) {
  if (!pool) return null;
  const conexion = await pool.getConnection();
  try { await conexion.beginTransaction(); const resultado = await funcion(conexion); await conexion.commit(); return resultado; } catch (error) { await conexion.rollback(); throw error; } finally { conexion.release(); }
}

export { pool };
