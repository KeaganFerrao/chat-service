import { BIGINT, DataTypes, DATE, literal, Model, Optional } from 'sequelize';
import sequelize from '../setup/database';

export interface UserNotificationAttributes {
    id: string;
    baseUserId: number;
    notificationOffset?: Date;
}

interface UserNotificationCreationAttributes extends Optional<UserNotificationAttributes, 'id'> { }

export interface UserNotificationInstance
    extends Model<UserNotificationAttributes, UserNotificationCreationAttributes>,
    UserNotificationAttributes {
    unreadMessageCount?: number;
}

const userNotification = sequelize.define<UserNotificationInstance>(
    'userNotifications',
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
        notificationOffset: {
            type: DATE,
            allowNull: false,
        }
    },
    {
        tableName: 'userNotifications',
        timestamps: false,
    }
);

export default userNotification;
