import { BIGINT, DATE, INTEGER, JSONB, literal, QueryInterface, QueryInterfaceCreateTableOptions, TEXT, UUID } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.createTable('messages', {
            id: {
                type: UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: literal('gen_random_uuid()')
            },
            fromBaseUserId: {
                type: UUID,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'baseUsers'
                    },
                    key: 'id'
                }
            },
            channelId: {
                type: UUID,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'channels'
                    },
                    key: 'id'
                }
            },
            content: {
                type: TEXT,
                allowNull: true
            },
            attachments: {
                type: JSONB,
                allowNull: true
            },
            sentOn: {
                type: DATE,
                allowNull: false
            }
        }, {
            tableName: 'messages',
            timestamps: false
        } as QueryInterfaceCreateTableOptions)

        await queryInterface.addIndex({
            tableName: 'messages'
        }, {
            fields: ['channelId', {
                name: 'sentOn',
                order: 'DESC'
            }],
        });

        await queryInterface.addIndex({
            tableName: 'messages'
        }, {
            fields: ['fromBaseUserId'],
        });
    },


    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable({
            tableName: 'messages'
        });
    }
};