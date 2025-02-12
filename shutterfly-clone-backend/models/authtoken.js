'use strict';
const {
  Model
} = require('sequelize');
const { v4 } = require('uuid');

function parseTimeDuration(duration) {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new Error('Invalid duration format');
    }

    const [, value, unit] = match;
    const numberValue = parseInt(value, 10);

    switch (unit) {
        case 's': return numberValue * 1000;
        case 'm': return numberValue * 60 * 1000;
        case 'h': return numberValue * 60 * 60 * 1000;
        case 'd': return numberValue * 24 * 60 * 60 * 1000;
        default: throw new Error('Unsupported time unit');
    }
}

module.exports = (sequelize, DataTypes) => {
    class AuthToken extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        AuthToken.belongsTo(models.User, {foreignKey: 'user', as: 'User'})
        }
    }
    AuthToken.init({
        user: DataTypes.INTEGER,
        token: DataTypes.STRING,
        expiryDate: DataTypes.DATE,
        token: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'AuthToken',
    });
    AuthToken.createToken = async function (user) {
        const expiredAt = new Date();
        expiredAt.setSeconds(expiredAt.getSeconds() +  parseTimeDuration(process.env.JWT_REFRESH_EXPIRATION || '1h'));
        let __token = v4();
        const __user = await AuthToken.findOne({
            where: {user: user.id}
        });
        if (__user) {
            await AuthToken.update({
                token: __token,
                expiryDate: expiredAt,
            }, {
                where: {
                    user: user.id
                }
            });
            return __token;
        }

        let refreshToken = await AuthToken.create({
            token: __token,
            user: user.id,
            expiryDate: expiredAt,
        });

        return refreshToken.token;
    }

    AuthToken.verifyTokenExpiration = (token) => {
        return token.expiryDate.getTime() < new Date().getTime();
    }

    return AuthToken;
};