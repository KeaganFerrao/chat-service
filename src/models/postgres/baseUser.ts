import { DataTypes, literal, Model, Optional } from 'sequelize';
import sequelize from '../../setup/database';

export interface BaseUserAttributes {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    isDeleted?: boolean;
}

interface BaseUserCreationAttributes
    extends Optional<BaseUserAttributes, 'id'> { }

export interface BaseUserInstance
    extends Model<BaseUserAttributes, BaseUserCreationAttributes>,
    BaseUserAttributes {
}

const baseUser = sequelize.define<BaseUserInstance>(
    'baseUsers',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: literal('gen_random_uuid()')
        },
        role: {
            allowNull: false,
            type: DataTypes.ENUM,
            values: ['admin', 'user'],
        },
        firstName: {
            allowNull: false,
            type: DataTypes.STRING(50),
        },
        lastName: {
            allowNull: false,
            type: DataTypes.STRING(50),
        },
        email: {
            allowNull: false,
            type: DataTypes.STRING(50),
        },
        isDeleted: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        tableName: 'baseUsers',
        timestamps: false,
    }
);

export default baseUser;
