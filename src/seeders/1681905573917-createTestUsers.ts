import { QueryInterface } from 'sequelize';

module.exports = {
    async up(queryInterface: QueryInterface) {
        return queryInterface.bulkInsert({ tableName: 'baseUsers' }, [
            {
                role: 'user',
                firstName: 'harry',
                lastName: 'kane',
                email: 'harry@yopmail.com'
            },
            {
                role: 'user',
                firstName: 'john',
                lastName: 'smith',
                email: 'smith@yopmail.com'
            },
            {
                role: 'user',
                firstName: 'jane',
                lastName: 'doe',
                email: 'jane@yopmail.com'
            },
            {
                role: 'user',
                firstName: 'will',
                lastName: 'smith',
                email: 'will@yopmail.com'
            }
        ]);
    },

    async down(queryInterface: QueryInterface) {
        return queryInterface.bulkDelete({ tableName: 'baseUsers' }, {});
    }
};