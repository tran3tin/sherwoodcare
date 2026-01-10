const db = require("../config/db");

class CustomerInvoiceModel {
  static async getAll({ customerId } = {}) {
    const where = [];
    const params = [];
    let paramIndex = 1;

    if (customerId) {
      where.push(`ci.customer_id = $${paramIndex}`);
      params.push(customerId);
      paramIndex++;
    }

    const sql = `
      SELECT
        ci.invoice_id,
        ci.customer_id,
        c.full_name,
        c.rent_monthly,
        c.rent_fortnightly,
        c.da_weekly,
        c.social_fortnightly,
        ci.invoice_date,
        ci.invoice_no,
        ci.memory,
        ci.amount,
        ci.amount_due,
        ci.note,
        ci.created_at,
        ci.updated_at
      FROM customer_invoices ci
      JOIN customers c ON c.customer_id = ci.customer_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY ci.invoice_date DESC, ci.invoice_id DESC
    `;

    const { rows } = await db.query(sql, params);
    return rows;
  }

  static async getById(id) {
    const sql = `
      SELECT
        ci.invoice_id,
        ci.customer_id,
        c.full_name,
        c.rent_monthly,
        c.rent_fortnightly,
        c.da_weekly,
        c.social_fortnightly,
        ci.invoice_date,
        ci.invoice_no,
        ci.memory,
        ci.amount,
        ci.amount_due,
        ci.note,
        ci.created_at,
        ci.updated_at
      FROM customer_invoices ci
      JOIN customers c ON c.customer_id = ci.customer_id
      WHERE ci.invoice_id = $1
      LIMIT 1
    `;

    const { rows } = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO customer_invoices (
        customer_id,
        invoice_date,
        invoice_no,
        memory,
        amount,
        amount_due,
        note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING invoice_id
    `;

    const { rows } = await db.query(sql, [
      data.customer_id,
      data.invoice_date,
      data.invoice_no || null,
      data.memory || null,
      data.amount ?? 0,
      data.amount_due ?? 0,
      data.note || null,
    ]);

    const insertId = rows[0].invoice_id;
    return this.getById(insertId);
  }

  static async update(id, data) {
    const sql = `
      UPDATE customer_invoices
      SET
        customer_id = $1,
        invoice_date = $2,
        invoice_no = $3,
        memory = $4,
        amount = $5,
        amount_due = $6,
        note = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE invoice_id = $8
    `;

    await db.query(sql, [
      data.customer_id,
      data.invoice_date,
      data.invoice_no || null,
      data.memory || null,
      data.amount ?? 0,
      data.amount_due ?? 0,
      data.note || null,
      id,
    ]);

    return this.getById(id);
  }

  static async delete(id) {
    const sql = "DELETE FROM customer_invoices WHERE invoice_id = $1";
    await db.query(sql, [id]);
    return true;
  }
}

module.exports = CustomerInvoiceModel;
