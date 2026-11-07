import { Sequelize, DataTypes } from 'sequelize';

export function crearBd(storage) {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
    define: { underscored: true },
  });

  const Usuario = sequelize.define('usuario', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    rol: {
      type: DataTypes.ENUM('usuario', 'tecnico'),
      allowNull: false,
      defaultValue: 'usuario',
    },
  });

  const Equipo = sequelize.define('equipo', {
    codigo: { type: DataTypes.STRING, allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    ubicacion: { type: DataTypes.STRING, allowNull: false },
  });

  const Incidencia = sequelize.define('incidencia', {
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    estado: {
      type: DataTypes.ENUM('abierta', 'cerrada'),
      allowNull: false,
      defaultValue: 'abierta',
    },
    cerradaEn: { type: DataTypes.DATE, allowNull: true },
  });

  Usuario.hasMany(Incidencia, { foreignKey: { name: 'usuarioId', allowNull: false } });
  Incidencia.belongsTo(Usuario, { as: 'registradaPor', foreignKey: 'usuarioId' });
  Incidencia.belongsTo(Usuario, { as: 'cerradaPor', foreignKey: 'cerradaPorId' });
  Equipo.hasMany(Incidencia, { foreignKey: { name: 'equipoId', allowNull: false } });
  Incidencia.belongsTo(Equipo, { foreignKey: 'equipoId' });

  return { sequelize, Usuario, Equipo, Incidencia };
}