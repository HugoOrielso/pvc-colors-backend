import express from "express";
import authRouter from "./router/private/auth.routes";
import cors from "cors";
import productsRouter from "./router/private/products.routes";
import path from "node:path";
import fs from "node:fs";
import uploadRoutes from "./router/private/uploads.routes";
import paymentsRouter from "./router/private/payments.routes";
import invoicesRouter from "./router/private/invoices.routes";
import adminRouter from "./router/private/admin.routes";
import cookieParser from "cookie-parser";
import linesRouter from "./router/private/lines.routes";
import publicLinesRouter from "./router/public/public-lines.routes";
import publicProductRouter from "./router/public/public-product.routes";

const app = express();

// ✅ Lista centralizada reutilizada en cors y csrf
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://arrozandinagroup.com",
  "https://frontend.arrozandinagroup.com",
  "https://theaceous-indorsable-lilliana.ngrok-free.dev",
];

const UPLOAD_BASE_DIR =
  process.env.UPLOAD_DIR ||
  (process.env.NODE_ENV === "production"
    ? "/data/uploads"
    : path.resolve("uploads"));

fs.mkdirSync(UPLOAD_BASE_DIR, { recursive: true });
fs.mkdirSync(path.join(UPLOAD_BASE_DIR, "products"), { recursive: true });

app.use("/uploads", express.static(UPLOAD_BASE_DIR));
app.use(cookieParser());

// ✅ CORS con lista centralizada
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ✅ CSRF — bloquea requests no GET de orígenes no permitidos
app.use((req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) return next();

  const origin = req.headers.origin;

  // sin origin = Postman, curl, server-to-server → dejar pasar
  if (!origin) return next();

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ ok: false, message: "Origen no permitido" });
  }

  next();
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/lines", linesRouter);
app.use("/api/public/lines", publicLinesRouter);
app.use("/api/public/products", publicProductRouter);
// app.use("/api/uploads", uploadRoutes);
// app.use("/api/payments", paymentsRouter);
// app.use("/api/invoices", invoicesRouter);
app.use("/api/admin", adminRouter);

export default app;