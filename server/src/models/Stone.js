const db = require('../config/db');
const { DatabaseError } = require('../utils/errors');

class Stone {
  constructor(data) {
    this.id = data.id;
    this.stoneName = data.stone_name;
    this.stoneType = data.stone_type;
  }

  static async findAll() {
    try {
      const [rows] = await db.execute(`
        SELECT id, stone_name, stone_type 
        FROM stones 
        ORDER BY stone_type, stone_name
      `);
      return rows.map(row => new Stone(row));
    } catch (error) {
      throw new DatabaseError(`Failed to fetch stones: ${error.message}`);
    }
  }

  static async getStoneTypes() {
    try {
      const [rows] = await db.execute(`
        SELECT DISTINCT stone_type 
        FROM stones 
        ORDER BY stone_type
      `);
      return rows.map(row => row.stone_type);
    } catch (error) {
      throw new DatabaseError(`Failed to fetch stone types: ${error.message}`);
    }
  }

  static async getStoneNamesByType(stoneType = null) {
    try {
      let query = 'SELECT DISTINCT stone_name FROM stones';
      const params = [];

      if (stoneType) {
        query += ' WHERE stone_type = ?';
        params.push(stoneType);
      }

      query += ' ORDER BY stone_name';

      const [rows] = await db.execute(query, params);
      return rows.map(row => row.stone_name);
    } catch (error) {
      throw new DatabaseError(`Failed to fetch stone names: ${error.message}`);
    }
  }
}

module.exports = Stone;