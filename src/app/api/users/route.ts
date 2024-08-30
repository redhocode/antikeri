import { NextResponse } from "next/server";
import sql from "mssql";

// Konfigurasi koneksi SQL Server
const config = {
  user: "sa",
  password: "myPass123!",
  server: "localhost",
  database: "absensi",
  options: {
    encrypt: true, // Untuk koneksi SSL
    trustServerCertificate: true, // Sesuaikan dengan kebutuhan
  },
};

// Handler untuk metode GET
export async function GET() {
  let pool;
  try {
    // Buat koneksi ke SQL Server
    pool = await sql.connect(config);

    // Jalankan query
    const result = await pool.request().query("SELECT * FROM USERINFO");

    // Kirim hasil sebagai respons JSON
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  } finally {
    // Pastikan untuk menutup koneksi
    if (pool) {
      await pool.close();
    }
  }
}

// Handler untuk metode POST
export async function POST(request: Request) {
  let pool;
  try {
    // Ambil data dari request body
    const { userId, checktime } = await request.json();

    // Validasi data
    if (!userId || !checktime) {
      return NextResponse.json(
        { error: "userId and checktime are required" },
        { status: 400 }
      );
    }

    // Buat koneksi ke SQL Server
    pool = await sql.connect(config);

    // Jalankan query untuk menyisipkan data
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("checktime", sql.DateTime, new Date(checktime))
      .query(
        "INSERT INTO CHECKINOUT (userId, checktime) VALUES (@userId, @checktime)"
      );

    // Kirim respons sukses
    return NextResponse.json({
      message: "Check-in/out data inserted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to insert data" },
      { status: 500 }
    );
  } finally {
    // Pastikan untuk menutup koneksi
    if (pool) {
      await pool.close();
    }
  }
}
