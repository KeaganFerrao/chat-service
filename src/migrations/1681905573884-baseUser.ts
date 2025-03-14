import { literal, UUID } from 'sequelize';
import { DATE, BOOLEAN, ENUM, INTEGER, QueryInterface, QueryInterfaceCreateTableOptions, STRING } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.createTable('baseUsers', {
            id: {
                type: UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: literal('gen_random_uuid()')
            },
            role: {
                type: ENUM,
                allowNull: false,
                values: ['admin', 'user'],
            },
            firstName: {
                type: STRING(50),
                allowNull: false,
            },
            lastName: {
                type: STRING(50),
                allowNull: false,
            },
            isDeleted: {
                type: BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            email: {
                type: STRING(50),
                allowNull: false
            },
        }, {
            tableName: 'baseUsers',
            timestamps: false
        } as QueryInterfaceCreateTableOptions)
    },


    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable({
            tableName: 'baseUsers'
        });
    }
};