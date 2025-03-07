import { ENUM, QueryInterface, QueryInterfaceCreateTableOptions, STRING, UUID, literal } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.createTable('channels', {
            id: {
                type: UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: literal('gen_random_uuid()')
            },
            name: {
                type: STRING(100),
                allowNull: false
            },
            type: {
                type: ENUM,
                values: ['private'],
                allowNull: false,
            }
        }, {
            tableName: 'channels',
            timestamps: false
        } as QueryInterfaceCreateTableOptions)

        await queryInterface.addIndex({
            tableName: 'channels'
        }, {
            fields: ['name']
        });
    },


    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable({
            tableName: 'channels'
        });
    }
};