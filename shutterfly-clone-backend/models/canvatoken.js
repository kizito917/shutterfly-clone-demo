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
    class CanvaToken extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        // CanvaToken.belongsTo(models.User, {foreignKey: 'user', as: 'User'})
        }
    }
    CanvaToken.init({
        claim: DataTypes.STRING,
        token: DataTypes.STRING,
        expiryDate: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'CanvaToken',
    });
    CanvaToken.createToken = async function (token, id) {
        const expiredAt = new Date();
        expiredAt.setSeconds(expiredAt.getSeconds() +  parseTimeDuration(process.env.JWT_REFRESH_EXPIRATION || '1h'));
        let refreshToken = await CanvaToken.create({
            token: token,
            claim: id,
            expiryDate: expiredAt,
        });

        return refreshToken.token;
    }

    CanvaToken.verifyTokenExpiration = (token) => {
        return token.expiryDate.getTime() < new Date().getTime();
    }

    return CanvaToken;
};