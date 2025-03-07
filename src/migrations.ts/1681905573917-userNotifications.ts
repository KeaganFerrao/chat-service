import { BIGINT, INTEGER, QueryInterface, QueryInterfaceCreateTableOptions, STRING, UUID, literal } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.createTable('userNotifications', {
            id: {
                type: UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: literal('gen_random_uuid()')
            },
            baseUserId: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'baseUsers'
                    },
                    key: 'id'
                }
            },
            notificationOffset: {
                type: BIGINT,
                allowNull: false,
                defaultValue: 0
            }
        }, {
            tableName: 'userNotifications',
            timestamps: false
        } as QueryInterfaceCreateTableOptions)

        await queryInterface.addIndex({
            tableName: 'userNotifications'
        }, {
            fields: ['baseUserId'],
            unique: true
        });
    },


    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable({
            tableName: 'userNotifications'
        });
    }
};