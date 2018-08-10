var mongoose = require('mongoose');

var citaSchema = mongoose.Schema({
    paciente_nombre: { type: String, required: true},
    paciente_apellidoP: { type: String },
    paciente_apellidoM: { type: String },
    fecha: { type: Date, default: Date.now }
});


citaSchema.methods.name = function() {
    return this.paciente_nombre || this.fecha;
}

var Cita = mongoose.model("Citas", citaSchema);
module.exports = Cita;