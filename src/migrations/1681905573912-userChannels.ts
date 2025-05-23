import { BIGINT, DATE, INTEGER, QueryInterface, QueryInterfaceCreateTableOptions, STRING, UUID, literal } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.createTable('userChannels', {
            id: {
                type: UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: literal('gen_random_uuid()')
            },
            baseUserId: {
                type: UUID,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'baseUsers'
                    },
                    key: 'id'
                }
            },
            toBaseUserId: {
                type: UUID,
                allowNull: true,
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
            messageOffset: {
                type: DATE,
                allowNull: false
            }
        }, {
            tableName: 'userChannels',
            timestamps: false
        } as QueryInterfaceCreateTableOptions)

        await queryInterface.addIndex({
            tableName: 'userChannels'
        }, {
            fields: ['baseUserId', 'channelId'],
            unique: true
        });
        
        await queryInterface.addIndex({
            tableName: 'userChannels'
        }, {
            fields: ['toBaseUserId']
        });
    },


    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable({
            tableName: 'userChannels'
        });
    }
};