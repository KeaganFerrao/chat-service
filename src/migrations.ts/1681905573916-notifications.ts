import { BIGINT, BOOLEAN, DATE, ENUM, INTEGER, literal, QueryInterface, QueryInterfaceCreateTableOptions, STRING, TEXT, UUID } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.createTable('notifications', {
            id: {
                type: UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: literal('gen_random_uuid()')
            },
            baseUserId: {
                type: UUID,
                allowNull: true,
                references: {
                    model: {
                        tableName: 'baseUsers'
                    },
                    key: 'id'
                }
            },
            broadcastTo: {
                type: ENUM,
                allowNull: true,
                values: ['admin', 'user', 'all']
            },
            content: {
                type: TEXT,
                allowNull: false
            },
            sentOn: {
                type: DATE,
                allowNull: false
            },
            link: {
                type: TEXT,
                allowNull: true
            },
            isRead: {
                type: BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        }, {
            tableName: 'notifications',
            timestamps: false
        } as QueryInterfaceCreateTableOptions)

        await queryInterface.addIndex({
            tableName: 'notifications'
        }, {
            fields: ['baseUserId', {
                name: 'sentOn',
                order: 'DESC'
            }],
        });

        await queryInterface.addIndex({
            tableName: 'notifications'
        }, {
            fields: ['broadcastTo', {
                name: 'sentOn',
                order: 'DESC'
            }],
        });
    },


    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable({
            tableName: 'notifications'
        });
    }
};