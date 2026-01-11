const db = require("../config/db");

class CustomerModel {
  // Get all customers
  static async getAll() {
    const sql = `
      SELECT 
        customer_id,
        first_name,
        last_name,
        COALESCE(last_name || ' ' || first_name, full_name) as full_name,
        reference,
        room,
        payment_method_1,
        payment_method_2,
        note,
        created_at,
        updated_at
      FROM customers
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(sql);
    return rows;
  }

  // Get single Customer by ID
  static async getById(id) {
    const sql = `
      SELECT 
        customer_id,
        first_name,
        last_name,
        COALESCE(last_name || ' ' || first_name, full_name) as full_name,
        reference,
        room,
        payment_method_1,
        payment_method_2,
        note,
        created_at,
        updated_at
      FROM customers
      WHERE customer_id = $1
    `;
    const { rows } = await db.query(sql, [id]);
    return rows[0] || null;
  }

  // Create new Customer
  static async create(data) {
    const sql = `
      INSERT INTO customers (
        first_name,
        last_name,
        full_name,
        reference,
        room,
        payment_method_1,
        payment_method_2,
        note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING customer_id
    `;
    const full_name = `${data.last_name} ${data.first_name}`;
    const values = [
      data.first_name,
      data.last_name,
      full_name,
      data.reference || null,
      data.room || null,
      data.payment_method_1 || null,
      data.payment_method_2 || null,
      data.note || null,
    ];

    const { rows } = await db.query(sql, values);
    const insertId = rows[0].customer_id;
    return this.getById(insertId);
  }

  // Update Customer
  static async update(id, data) {
    const sql = `
      UPDATE customers
      SET
        first_name = $1,
        last_name = $2,
        full_name = $3,
        reference = $4,
        room = $5,
        payment_method_1 = $6,
        payment_method_2 = $7,
        note = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $9
    `;
    const full_name = `${data.last_name} ${data.first_name}`;
    const values = [
      data.first_name,
      data.last_name,
      full_name,
      data.reference || null,
      data.room || null,
      data.payment_method_1 || null,
      data.payment_method_2 || null,
      data.note || null,
      id,
    ];

    await db.query(sql, values);
    return this.getById(id);
  }

  // Delete Customer
  static async delete(id) {
    const sql = "DELETE FROM customers WHERE customer_id = $1";
    await db.query(sql, [id]);
    return true;
  }
}

module.exports = CustomerModel;
