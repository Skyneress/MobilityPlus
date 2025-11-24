import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Switch, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { collection, query, orderBy, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { auth, db } from '../../config/firebaseConfig';
import ServicePriceItem from '../../shared/screens/ServicePriceItem';

const PRIMARY_COLOR = "#3A86FF";

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const RegisterScreen = ({ navigation }) => {
  const [isNurse, setIsNurse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [rut, setRut] = useState('');

  const [especialidad, setEspecialidad] = useState('');
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [numRegistroMinsal, setNumRegistroMinsal] = useState('');
  const [anosExperiencia, setAnosExperiencia] = useState('');
  const [precioConsulta, setPrecioConsulta] = useState('');

  // ← Esta sí la dejamos
  const [servicios, setServicios] = useState([
    { id: generateId(), nombre: '', precioClp: null }
  ]);

  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // -------------------- AGREGAR / QUITAR SERVICIOS --------------------
  const handleAddService = () => {
    setServicios(prev => [
      ...prev,
      { id: generateId(), nombre: '', precioClp: null }
    ]);
  };

  const handleRemoveService = (idToRemove) => {
    setServicios(prev => prev.filter(s => s.id !== idToRemove));
  };

  const handleServiceChange = (id, data) => {
    setServicios(prev =>
      prev.map(s => (s.id === id ? { ...s, ...data } : s))
    );
  };

  // -------------------- CARGAR ESPECIALIDADES --------------------
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const q = query(collection(db, 'Especialidades'), orderBy('orden'));
        const snap = await getDocs(q);

        const list = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setSpecialtiesList(list);
      } catch (err) {
        console.log("Error cargando especialidades", err);
        setSpecialtiesList([]);
      } finally {
        setLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
  }, []);

  // -------------------- REGISTRO --------------------
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    if (!nombre || !apellido || !email || !password || !telefono || !rut) {
      Alert.alert("Error", "Faltan campos obligatorios.");
      return;
    }

    let serviciosValidos = [];
    if (isNurse) {
      serviciosValidos = servicios
        .filter(s => s.nombre.trim() !== '' && s.precioClp !== null)
        .map(({ id, ...rest }) => rest);

      if (!numRegistroMinsal || !especialidad || !aceptaTerminos) {
        Alert.alert("Error", "Faltan datos profesionales obligatorios.");
        return;
      }

      if (serviciosValidos.length === 0) {
        Alert.alert("Error", "Agrega al menos 1 servicio con precio válido.");
        return;
      }
    }

    setLoading(true);

    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      const user = credentials.user;
      const uid = user.uid;

      await updateProfile(user, {
        displayName: `${nombre} ${apellido}`.trim()
      });

      const userDoc = doc(db, "users", uid);

      await setDoc(userDoc, {
        uid,
        nombre,
        apellido,
        rut,
        email: email.toLowerCase(),
        telefono,
        direccion,
        role: isNurse ? "nurse" : "patient",
        fotoPerfil: `https://placehold.co/150x150/EBF8FF/3A86FF?text=${nombre.charAt(0)}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (isNurse) {
        const profDoc = doc(db, "profesionales", uid);

        const selected = specialtiesList.find(s => s.id === especialidad);
        const specialtyName = selected ? selected.nombre : "";

        await setDoc(profDoc, {
          uid,
          nombre,
          apellido,
          rut,
          email: email.toLowerCase(),
          telefono,
          direccion,
          especialidad,
          especialidadNombre: specialtyName,
          numeroRegistroMinsal: numRegistroMinsal,
          experiencia: parseInt(anosExperiencia, 10) || 0,
          precioConsulta: parseInt(precioConsulta, 10) || 0,
          servicios: serviciosValidos,
          disponibilidad: true,
          estadoVerificacion: "pendiente",
          fotoPerfil: `https://placehold.co/150x150/EBF8FF/3A86FF?text=${nombre.charAt(0)}`,
          fechaRegistro: serverTimestamp(),
          calificacion: 0
        });
      }

      Alert.alert("Registro exitoso", "Tu cuenta fue creada.");
      navigation.navigate("Login");

    } catch (err) {
      console.log("Error registrando:", err);

      let msg = "Ocurrió un error.";
      if (err.code === "auth/email-already-in-use") msg = "Correo ya registrado.";
      if (err.code === "auth/weak-password") msg = "Contraseña demasiado débil.";
      if (err.code === "auth/invalid-email") msg = "Correo inválido.";

      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- UI --------------------
  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      <ScrollView contentContainerStyle={{ paddingVertical: 40 }} className="px-6">

        <Text className="text-2xl font-bold text-center mb-6 text-az-primario">
          Crear cuenta
        </Text>

        {/* Switch Profesional */}
        <View className="flex-row items-center justify-center mb-6 p-3 bg-gris-acento/50 rounded-lg">
          <Text className="text-gray-700 font-semibold mr-4">
            Registrarse como profesional
          </Text>
          <Switch
            onValueChange={setIsNurse}
            value={isNurse}
            trackColor={{ false: "#9ca3af", true: "#DCFCE7" }}
            thumbColor={isNurse ? "#4CAF50" : "#F3F4F6"}
          />
        </View>

        {/* CAMPOS BÁSICOS */}
        <View className="space-y-4">

          <View className="flex-row space-x-2">
            <TextInput
              className="flex-1 border border-gris-acento bg-white rounded-lg px-4 py-3"
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              className="flex-1 border border-gris-acento bg-white rounded-lg px-4 py-3"
              placeholder="Apellido"
              value={apellido}
              onChangeText={setApellido}
            />
          </View>

          <TextInput
            className="w-full border border-gris-acento bg-white rounded-lg px-4 py-3"
            placeholder="RUT (12.345.678-9)"
            value={rut}
            onChangeText={setRut}
          />

          <TextInput
            className="w-full border border-gris-acento bg-white rounded-lg px-4 py-3"
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            className="w-full border border-gris-acento bg-white rounded-lg px-4 py-3"
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            className="w-full border border-gris-acento bg-white rounded-lg px-4 py-3"
            placeholder="Confirmar contraseña"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TextInput
            className="w-full border border-gris-acento bg-white rounded-lg px-4 py-3"
            placeholder="Teléfono"
            keyboardType="phone-pad"
            value={telefono}
            onChangeText={setTelefono}
          />

          <TextInput
            className="w-full border border-gris-acento bg-white rounded-lg px-4 py-3"
            placeholder="Dirección (opcional)"
            value={direccion}
            onChangeText={setDireccion}
          />
        </View>

        {/* PROFESIONAL */}
        {isNurse && (
          <View className="mt-6 space-y-4 border-t border-gris-acento pt-4">

            <Text className="text-lg font-bold text-az-primario">Datos Profesionales</Text>

            {/* Picker de especialidad */}
            <View className="border border-gris-acento rounded-lg bg-white">
              {loadingSpecialties ? (
                <ActivityIndicator color={PRIMARY_COLOR} style={{ margin: 12 }} />
              ) : (
                <Picker
                  selectedValue={especialidad}
                  onValueChange={v => setEspecialidad(v)}
                >
                  <Picker.Item label="Selecciona una especialidad..." value="" />
                  {specialtiesList.map(s => (
                    <Picker.Item key={s.id} label={s.nombre} value={s.id} />
                  ))}
                </Picker>
              )}
            </View>

            {/* Resto de campos */}
            <TextInput
              className="border border-gris-acento bg-white rounded-lg px-4 py-3"
              placeholder="Número MINSAL"
              value={numRegistroMinsal}
              onChangeText={setNumRegistroMinsal}
            />

            <TextInput
              className="border border-gris-acento bg-white rounded-lg px-4 py-3"
              placeholder="Años de experiencia"
              keyboardType="numeric"
              value={anosExperiencia}
              onChangeText={setAnosExperiencia}
            />

            <TextInput
              className="border border-gris-acento bg-white rounded-lg px-4 py-3"
              placeholder="Precio Consulta (CLP)"
              keyboardType="numeric"
              value={precioConsulta}
              onChangeText={setPrecioConsulta}
            />

            {/* --- SERVICIOS --- */}
            <Text className="text-lg font-bold text-az-primario mt-2">
              Tarifas de Servicios Específicos
            </Text>

            {servicios.map(item => (
              <ServicePriceItem
                key={item.id}
                id={item.id}
                onChange={handleServiceChange}
                onRemove={handleRemoveService}
              />
            ))}

            <TouchableOpacity
              className="flex-row items-center justify-center p-3 bg-az-primario/10 rounded-lg border border-az-primario/50"
              onPress={handleAddService}
            >
              <Ionicons name="add-circle-outline" size={20} color={PRIMARY_COLOR} />
              <Text className="text-az-primario font-semibold ml-2">Añadir Otro Servicio</Text>
            </TouchableOpacity>

            {/* Términos */}
            <View className="flex-row items-center mt-2">
              <Switch
                onValueChange={setAceptaTerminos}
                value={aceptaTerminos}
                trackColor={{ false: "#9ca3af", true: "#DCFCE7" }}
                thumbColor={aceptaTerminos ? "#4CAF50" : "#F3F4F6"}
              />
              <Text className="text-gray-700 ml-2">
                Acepto los <Text className="text-az-primario font-semibold">Términos y Condiciones</Text>
              </Text>
            </View>

          </View>
        )}

        {/* BOTÓN CREAR CUENTA */}
        <TouchableOpacity
          className="bg-az-primario py-4 mt-6 rounded-full items-center"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Crear Cuenta</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4 pb-10">
          <Text className="text-gray-500">¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text className="text-az-primario font-medium">Inicia sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
