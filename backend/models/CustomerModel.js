const db = require("../config/db");

class CustomerModel {
  // Get all customers
  static async getAll() {
    const sql = `
      SELECT 
        customer_id,
        full_name,
        rent_monthly,
        rent_monthly_email,
        rent_fortnightly,
        rent_fortnightly_email,
        da_weekly,
        da_weekly_email,
        social_fortnightly,
        social_fortnightly_email,
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
        full_name,
        rent_monthly,
        rent_monthly_email,
        rent_fortnightly,
        rent_fortnightly_email,
        da_weekly,
        da_weekly_email,
        social_fortnightly,
        social_fortnightly_email,
        created_at,
        updated_at
      FROM customers
      WHERE customer_id = ?
    `;
    const { rows } = await db.query(sql, [id]);
    return rows[0] || null;
  }

  // Create new Customer
  static async create(data) {
    const sql = `
      INSERT INTO customers (
        full_name,
        rent_monthly,
        rent_monthly_email,
        rent_fortnightly,
        rent_fortnightly_email,
        da_weekly,
        da_weekly_email,
        social_fortnightly,
        social_fortnightly_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.full_name,
      data.rent_monthly || false,
      data.rent_monthly_email || false,
      data.rent_fortnightly || false,
      data.rent_fortnightly_email || false,
      data.da_weekly || false,
      data.da_weekly_email || false,
      data.social_fortnightly || false,
      data.social_fortnightly_email || false,
    ];

    const result = await db.query(sql, values);
    const insertId =
      db.client === "mysql" ? result.insertId : result.rows[0].customer_id;
    return this.getById(insertId);
  }

  // Update Customer
  static async update(id, data) {
    const sql = `
      UPDATE customers
      SET
        full_name = ?,
        rent_monthly = ?,
        rent_monthly_email = ?,
        rent_fortnightly = ?,
        rent_fortnightly_email = ?,
        da_weekly = ?,
        da_weekly_email = ?,
        social_fortnightly = ?,
        social_fortnightly_email = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = ?
    `;
    const values = [
      data.full_name,
      data.rent_monthly || false,
      data.rent_monthly_email || false,
      data.rent_fortnightly || false,
      data.rent_fortnightly_email || false,
      data.da_weekly || false,
      data.da_weekly_email || false,
      data.social_fortnightly || false,
      data.social_fortnightly_email || false,
      id,
    ];

    await db.query(sql, values);
    return this.getById(id);
  }

  // Delete Customer
  static async delete(id) {
    const sql = "DELETE FROM customers WHERE customer_id = ?";
    await db.query(sql, [id]);
    return true;
  }
}

module.exports = CustomerModel;

