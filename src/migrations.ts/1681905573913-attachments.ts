import { BIGINT, BOOLEAN, INTEGER, literal, QueryInterface, QueryInterfaceCreateTableOptions, STRING, UUID } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.createTable('attachments', {
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
            fileName: {
                type: STRING(100),
                allowNull: false
            },
            isUploaded: {
                type: BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isUploading: {
                type: BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            hasUploadFailed: {
                type: BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        }, {
            tableName: 'attachments',
            timestamps: false
        } as QueryInterfaceCreateTableOptions)
    },


    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable({
            tableName: 'attachments'
        });
    }
};