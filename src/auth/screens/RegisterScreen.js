import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Switch, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Componente de selector
// Importaciones de Firebase necesarias
import { collection, query, orderBy, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebaseConfig'; 

// Colores definidos en tu tailwind.config.js
const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const PLACEHOLDER_COLOR = "#9ca3af"; // Color para el placeholder del Picker

const RegisterScreen = ({ navigation }) => {
  // ------------------------- ESTADOS GENERALES -------------------------
  const [isNurse, setIsNurse] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [loadingSpecialties, setLoadingSpecialties] = useState(true); 
  
  // ------------------------- ESTADOS BÁSICOS (Paciente/Enfermero) -------------------------
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [rut, setRut] = useState(''); 
  
  // ------------------------- ESTADOS ESPECÍFICOS DEL ENFERMERO -------------------------
  const [especialidad, setEspecialidad] = useState(''); // <-- Inicia vacío
  const [specialtiesList, setSpecialtiesList] = useState([]); 
  const [numRegistroMinsal, setNumRegistroMinsal] = useState('');
  const [anosExperiencia, setAnosExperiencia] = useState('');
  const [precioConsulta, setPrecioConsulta] = useState('');
  const [serviciosOfrecidos, setServiciosOfrecidos] = useState(''); 
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  
  // ------------------------- LÓGICA DE CARGA DE ESPECIALIDADES -------------------------
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        // Consultamos la colección 'Especialidades', ordenada por 'orden'
        const q = query(collection(db, 'Especialidades'), orderBy('orden'));
        const querySnapshot = await getDocs(q);
        
        const specialties = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setSpecialtiesList(specialties);
        // <-- Ya no seleccionamos el primer ítem por defecto
        
      } catch (error) {
        console.error("Error al cargar especialidades de Firestore:", error);
        setSpecialtiesList([{ id: 'error', nombre: 'Error de Carga', orden: 0 }]);
        setEspecialidad('error');
      } finally {
        setLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
  }, []); // El array de dependencias está vacío, se ejecuta solo una vez.

  // ------------------------- LÓGICA DE REGISTRO REAL -------------------------
  const handleRegister = async () => {
    // 1. Validaciones
    if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden.');
        return;
    }
    
    if (!nombre || !apellido || !email || !password || !telefono || !rut) { 
        Alert.alert('Error', 'Por favor, completa los campos básicos obligatorios (incluyendo RUT).');
        return;
    }
    
    // Validaciones exclusivas del Enfermero
    // 💡 AHORA VERIFICA SI 'especialidad' ESTÁ VACÍA
    if (isNurse && (!numRegistroMinsal || !especialidad || !aceptaTerminos)) {
        Alert.alert('Error', 'Completa todos los campos profesionales requeridos, incluyendo la especialidad.');
        return;
    }

    setLoading(true);
    
    try {
      // 2. Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;

      const role = isNurse ? 'nurse' : 'patient';

      // 3. Crear el documento en la colección "users" (para TODOS)
      const userDocRef = doc(db, "users", uid);
      const userData = {
        uid: uid,
        nombre: nombre,
        apellido: apellido,
        rut: rut,
        email: email.toLowerCase(),
        telefono: telefono,
        direccion: direccion,
        role: role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        fotoPerfil: `https://placehold.co/150x150/EBF8FF/3A86FF?text=${nombre.charAt(0)}` // Placeholder inicial
      };
      await setDoc(userDocRef, userData);

      // 4. (CONDICIONAL) Crear el documento en la colección "profesionales"
      if (isNurse) {
        const profesionalDocRef = doc(db, "profesionales", uid);

        const experienceYears = anosExperiencia ? parseInt(anosExperiencia, 10) : 0;
        const consultationPrice = precioConsulta ? parseInt(precioConsulta, 10) : 0;
        const servicesArray = serviciosOfrecidos.split(',').map(s => s.trim()).filter(s => s.length > 0);

        // 💡 Buscamos el nombre de la especialidad para guardarlo
        const selectedSpecialtyObject = specialtiesList.find(s => s.id === especialidad);
        const specialtyName = selectedSpecialtyObject ? selectedSpecialtyObject.nombre : especialidad; // Fallback

        const profesionalData = {
          uid: uid,
          nombre: nombre,
          apellido: apellido,
          rut: rut,
          email: email.toLowerCase(),
          telefono: telefono,
          direccion: direccion,
          
          especialidad: especialidad, // El ID (ej: 'kinesiologia')
          especialidadNombre: specialtyName, // El Nombre (ej: 'Kinesiología')
          
          numeroRegistroMinsal: numRegistroMinsal,
          experiencia: experienceYears,
          serviciosOfrecidos: servicesArray,
          precioConsulta: consultationPrice,
          estadoVerificacion: 'pendiente', 
          fechaRegistro: serverTimestamp(),
          disponibilidad: true,
          calificacion: 0,
          fotoPerfil: `https://placehold.co/150x150/EBF8FF/3A86FF?text=${nombre.charAt(0)}`
        };
        await setDoc(profesionalDocRef, profesionalData);
      }

      // 5. Éxito
      Alert.alert(
        '¡Registro Exitoso!',
        'Tu cuenta ha sido creada. Ahora serás dirigido al Login para iniciar sesión.'
      );
      navigation.navigate("Login"); 

    } catch (error) {
       // 6. Manejo de Errores
       console.error("Error en el registro:", error);
       let message = 'Ocurrió un error inesperado.';
       
       if (error.code === 'auth/email-already-in-use') {
           message = 'Este correo electrónico ya está registrado.';
       } else if (error.code === 'auth/weak-password') {
           message = 'La contraseña es demasiado débil (mínimo 6 caracteres).';
       } else if (error.code === 'auth/invalid-email') {
           message = 'El correo electrónico no es válido.';
       }
       
       Alert.alert('Error de Registro', message);
    } finally {
        setLoading(false);
    }
  };
  
  // ------------------------- RENDERIZADO -------------------------
  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 40 }} className="px-6">
            
            <Text className="text-2xl font-bold text-az-primario mb-6 text-center">
                Crear cuenta
            </Text>

            {/* TOGGLE DE ROL */}
            <View className="flex-row items-center justify-center mb-6 bg-gris-acento/50 p-3 rounded-lg">
                <Text className="text-gray-700 font-semibold mr-4">Registrarse como profesional</Text>
                <Switch
                    onValueChange={setIsNurse}
                    value={isNurse}
                    trackColor={{ false: "#9ca3af", true: "#DCFCE7" }}
                    thumbColor={isNurse ? "#4CAF50" : "#F3F4F6"}
                />
            </View>

            <View className="space-y-4">
                
                {/* NOMBRE Y APELLIDO */}
                <View className="flex-row justify-between space-x-2">
                    <TextInput
                        className="flex-1 border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                        placeholder="Nombre"
                        onChangeText={setNombre}
                        value={nombre}
                    />
                    <TextInput
                        className="flex-1 border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                        placeholder="Apellido"
                        onChangeText={setApellido}
                        value={apellido}
                    />
                </View>

                {/* RUT (CAMPO COMPARTIDO) */}
                <TextInput
                    className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                    placeholder="RUT (Ej: 12.345.678-9)"
                    onChangeText={setRut}
                    value={rut}
                />

                {/* EMAIL Y CONTRASEÑA */}
                <TextInput
                    className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                    placeholder="Correo electrónico"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                    value={email}
                />
                <TextInput
                    className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                    placeholder="Contraseña (mín. 6 caracteres)"
                    secureTextEntry
                    onChangeText={setPassword}
                    value={password}
                />
                 <TextInput
                    className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                    placeholder="Confirmar contraseña"
                    secureTextEntry
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                />

                {/* DATOS DE CONTACTO */}
                <TextInput
                    className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                    placeholder="Teléfono (+56 9...)"
                    keyboardType="phone-pad"
                    onChangeText={setTelefono}
                    value={telefono}
                />
                <TextInput
                    className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                    placeholder="Dirección de residencia (Opcional)"
                    onChangeText={setDireccion}
                    value={direccion}
                />

                {/* ------------------ CAMPOS ESPECÍFICOS DEL ENFERMERO ------------------ */}
                {isNurse && (
                    <View className="space-y-4 pt-4 border-t border-gris-acento">
                        <Text className="text-lg font-bold text-az-primario mt-2">Datos Profesionales</Text>
                        
                        {/* 💊 SELECTOR DE ESPECIALIDAD (MEJORADO) */}
                        <View className="w-full border border-gris-acento rounded-lg bg-white overflow-hidden">
                            {loadingSpecialties ? (
                                <ActivityIndicator color={PRIMARY_COLOR} className="my-3" />
                            ) : (
                                <Picker
                                    selectedValue={especialidad}
                                    onValueChange={(itemValue) => setEspecialidad(itemValue)}
                                    // 💡 Estilos para que se parezca a un TextInput
                                    style={{ 
                                      height: 50, 
                                      color: especialidad === "" ? PLACEHOLDER_COLOR : TEXT_DARK 
                                    }} 
                                    itemStyle={{ color: TEXT_DARK }} // (Para iOS)
                                >
                                    {/* 💡 Placeholder no seleccionable */}
                                    <Picker.Item 
                                        label="Selecciona una especialidad..." 
                                        value="" 
                                        enabled={false} 
                                    />
                                    
                                    {specialtiesList.map(item => (
                                        <Picker.Item 
                                            key={item.id} 
                                            label={item.nombre} 
                                            value={item.id} 
                                        />
                                    ))}
                                </Picker>
                            )}
                        </View>
                        {/* FIN SELECTOR DE ESPECIALIDAD */}

                        <TextInput
                            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                            placeholder="Número de Registro MINSAL (Ej: MED1A2B3)"
                            onChangeText={setNumRegistroMinsal}
                            value={numRegistroMinsal}
                        />
                         <TextInput
                            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                            placeholder="Años de Experiencia (Ej: 5)"
                            keyboardType="numeric"
                            onChangeText={setAnosExperiencia}
                            value={anosExperiencia}
                        />
                        
                        <TextInput
                            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                            placeholder="Precio de Consulta (CLP) - Ej: 25000"
                            keyboardType="numeric"
                            onChangeText={setPrecioConsulta}
                            value={precioConsulta}
                        />
                        
                        <TextInput
                            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro h-24"
                            placeholder="Servicios Ofrecidos (Separa con comas: Curación, Inyecciones...)"
                            multiline
                            textAlignVertical="top"
                            onChangeText={setServiciosOfrecidos}
                            value={serviciosOfrecidos}
                        />
                        
                        <View className="flex-row items-center mt-3">
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
                {/* -------------------------------------------------------- */}
            </View>

            <TouchableOpacity
                className="bg-az-primario rounded-full py-4 mt-6 flex-row justify-center items-center shadow-md"
                onPress={handleRegister}
                disabled={loading}
            >
                 {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-texto-claro text-center font-semibold text-base">
                        Crear cuenta
                    </Text>
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
}

export default RegisterScreen;