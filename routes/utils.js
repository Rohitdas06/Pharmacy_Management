const db = require('../database/db');

// Function to reorder IDs sequentially for a table
async function reorderTableIDs(tableName, connection = null) {
    const shouldReleaseConnection = !connection;
    if (!connection) {
        connection = await db.getConnection();
    }
    
    try {
        // Get all records ordered by current ID
        const [rows] = await connection.query(`SELECT * FROM ${tableName} ORDER BY id`);
        
        if (rows.length === 0) {
            // If no records, reset auto-increment to 1
            await connection.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
            if (shouldReleaseConnection) {
                connection.release();
            }
            return;
        }

        // Create mapping of old ID -> new ID
        const idMapping = {};
        rows.forEach((row, index) => {
            idMapping[row.id] = index + 1;
        });

        // Temporarily disable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Delete all records and re-insert with sequential IDs
        await connection.query(`DELETE FROM ${tableName}`);
        
        // Reset auto-increment to 1
        await connection.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);

        // Re-insert records (they'll get sequential IDs 1, 2, 3, etc.)
        for (const row of rows) {
            const { id, ...data } = row;
            const columns = Object.keys(data).join(', ');
            const placeholders = Object.keys(data).map(() => '?').join(', ');
            const values = Object.values(data);
            
            await connection.query(
                `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
                values
            );
        }

        // Update foreign key references if this table is referenced by others
        if (tableName === 'patients') {
            // Update prescriptions table
            for (const [oldId, newId] of Object.entries(idMapping)) {
                if (oldId != newId) {
                    await connection.query(
                        'UPDATE prescriptions SET patient_id = ? WHERE patient_id = ?',
                        [newId, oldId]
                    );
                }
            }
        } else if (tableName === 'medicines') {
            // Update prescriptions table
            for (const [oldId, newId] of Object.entries(idMapping)) {
                if (oldId != newId) {
                    await connection.query(
                        'UPDATE prescriptions SET medicine_id = ? WHERE medicine_id = ?',
                        [newId, oldId]
                    );
                }
            }
        }

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        if (shouldReleaseConnection) {
            connection.release();
        }
    } catch (error) {
        if (shouldReleaseConnection) {
            connection.release();
        }
        throw error;
    }
}

// Function to reset auto-increment to next available number
async function resetAutoIncrement(tableName) {
    const connection = await db.getConnection();
    
    try {
        // Get the maximum ID currently in use
        const [rows] = await connection.query(`SELECT MAX(id) as maxId FROM ${tableName}`);
        const nextId = (rows[0].maxId || 0) + 1;
        
        // Reset auto-increment to next sequential number
        await connection.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = ${nextId}`);
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    reorderTableIDs,
    resetAutoIncrement
};

