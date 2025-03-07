import { BIGINT, DataTypes, literal, Model, Optional } from 'sequelize';
import sequelize from '../setup/database';

export interface userChannelAttributes {
    id: bigint;
    baseUserId: number;
    toBaseUserId?: number;
    channelId: string;
    messageOffset?: bigint;
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
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: {
                    tableName: 'baseUsers'
                },
                key: 'id'
            }
        },
        toBaseUserId: {
            type: DataTypes.INTEGER,
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
            type: BIGINT,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        tableName: 'userChannels',
        timestamps: false,
    }
);

export default userChannel;
