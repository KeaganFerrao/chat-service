import { DataTypes, literal, Model, Optional } from 'sequelize';
import sequelize from '../setup/database';

export interface MessageAttributes {
    id: string;
    fromBaseUserId: number;
    channelId: string;
    content?: string | null;
    attachments?: string;
    sentOn: Date;
}

export interface MessageCreationAttributes extends Optional<MessageAttributes, 'id'> { }

interface MessageInstance
    extends Model<MessageAttributes, MessageCreationAttributes>,
    MessageAttributes { }

const message = sequelize.define<MessageInstance>(
    'messages',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: literal('gen_random_uuid()')
        },
        fromBaseUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        attachments: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        sentOn: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        tableName: 'messages',
        timestamps: false,
    }
);

export default message;
