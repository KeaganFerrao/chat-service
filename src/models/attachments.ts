import { DataTypes, literal, Model, Optional } from 'sequelize';
import sequelize from '../setup/database';

export interface AttachmentsAttributes {
    id: string;
    channelId: string;
    baseUserId: number;
    fileName: string;
    isUploaded?: boolean;
    isUploading?: boolean;
    hasUploadFailed?: boolean;
}

export interface AttachmentsCreationAttributes extends Optional<AttachmentsAttributes, 'id'> { }

export interface AttachmentsInstance
    extends Model<AttachmentsAttributes, AttachmentsCreationAttributes>,
    AttachmentsAttributes { }

const attachments = sequelize.define<AttachmentsInstance>(
    'attachments',
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
        fileName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        isUploaded: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        isUploading: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        hasUploadFailed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: 'attachments',
        timestamps: false,
    }
);

export default attachments;
