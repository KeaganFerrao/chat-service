import { DataTypes, DATE, literal, Model, Optional } from 'sequelize';
import sequelize from '../../setup/database';

export interface userChannelAttributes {
    id: string;
    baseUserId: string;
    toBaseUserId?: string;
    channelId: string;
    messageOffset?: Date;
    unreadMessageCount?: number;
}

export interface userChannelCreationAttributes extends Optional<userChannelAttributes, 'id'> { }

interface userChannelInstance
    extends Model<userChannelAttributes, userChannelCreationAttributes>,
    userChannelAttributes {
    unreadMessageCount?: number;
}

const userChannel = sequelize.define<userChannelInstance>(
    'userChannels',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: literal('gen_random_uuid()')
        },
        baseUserId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: {
                    tableName: 'baseUsers'
                },
                key: 'id'
            }
        },
        toBaseUserId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: {
                    tableName: 'baseUsers'
                },
                key: 'id'
            }
        },
        channelId: {
            type: DataTypes.UUID,
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
            allowNull: false,
            defaultValue: new Date()
        }
    },
    {
        tableName: 'userChannels',
        timestamps: false,
    }
);

export default userChannel;
