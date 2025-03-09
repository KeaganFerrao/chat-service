import { DataTypes, literal, Model, Optional } from 'sequelize';
import sequelize from '../../setup/database';

export interface ChannelAttributes {
    id: string;
    name: string;
    type: string;
}

export interface ChannelCreationAttributes extends Optional<ChannelAttributes, 'id'> { }

interface ChannelInstance
    extends Model<ChannelAttributes, ChannelCreationAttributes>,
    ChannelAttributes { }

const channel = sequelize.define<ChannelInstance>(
    'channels',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: literal('gen_random_uuid()')
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM,
            values: ['private'],
            allowNull: false,
        }
    },
    {
        tableName: 'channels',
        timestamps: false,
    }
);

export default channel;
