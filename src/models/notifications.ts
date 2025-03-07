import { DataTypes, literal, Model, Optional } from 'sequelize';
import sequelize from '../setup/database';

export interface NotificationsAttributes {
    id: string;
    baseUserId?: number | null;
    content?: string | null;
    broadcastTo?: 'admin' | 'user' | 'all' | null;
    link?: string | null;
    sentOn: Date;
    isRead?: boolean;
}

export interface NotificationsCreationAttributes extends Optional<NotificationsAttributes, 'id'> { }

interface NotificationsInstance
    extends Model<NotificationsAttributes, NotificationsCreationAttributes>,
    NotificationsAttributes { }

const notifications = sequelize.define<NotificationsInstance>(
    'notifications',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: literal('gen_random_uuid()')
        },
        baseUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: {
                    tableName: 'baseUsers'
                },
                key: 'id'
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        broadcastTo: {
            type: DataTypes.ENUM,
            allowNull: true,
            values: ['admin', 'staff', 'doctor', 'patient', 'all']
        },
        link: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        sentOn: {
            type: DataTypes.DATE,
            allowNull: false
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: 'notifications',
        timestamps: false,
    }
);

export default notifications;
