import AdminVerificationScreen from '../screens/AdminVerificationScreen';
import AdminProfessionalDetailScreen from '../screens/AdminProfessionalDetailScreen';
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const AdminStack = () => (
    <Stack.Navigator>
        <Stack.Screen 
            name="AdminVerification" 
            component={AdminVerificationScreen} 
            options={{ headerShown: false }} 
        />
        {/* 💡 RUTA DE DETALLE */}
        <Stack.Screen 
            name="AdminProDetail" 
            component={AdminProfessionalDetailScreen} 
            options={{ headerShown: false }} 
        />
    </Stack.Navigator>
);

export default AdminStack;