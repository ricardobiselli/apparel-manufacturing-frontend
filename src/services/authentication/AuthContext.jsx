import { createContext, useState, useEffect } from 'react';
import { AuthenticationService } from './Endpoints';
import PropTypes from "prop-types";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tokenSavedInLocalStorage = localStorage.getItem('token');
        if (tokenSavedInLocalStorage) {
            const storedUserId = localStorage.getItem('userId');
            const storedFirstName = localStorage.getItem('firstName');
            const storedLastName = localStorage.getItem('lastName');
            const storedRole = localStorage.getItem('role');
            const storedMustChangePassword = localStorage.getItem('mustChangePassword');

            setToken(tokenSavedInLocalStorage);
            setUser({
                userId: storedUserId ? Number(storedUserId) : null,
                firstName: storedFirstName || '',
                lastName: storedLastName || '',
                role: storedRole || '',
                mustChangePassword: storedMustChangePassword === 'true',
            });
        }
        setLoading(false);

    }, []);


    const login = async (employeeIdNumber, password) => {
        try {
            const response = await AuthenticationService(employeeIdNumber, password);
            const token = response.token;
            if (token) {
                setToken(token);
                setUser({
                    userId: response.userId,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    role: response.role,
                    mustChangePassword: response.mustChangePassword,
                });

                localStorage.setItem('token', response.token);
                localStorage.setItem('role', response.role);
                localStorage.setItem('userId', response.userId.toString());
                localStorage.setItem('firstName', response.firstName);
                localStorage.setItem('lastName', response.lastName);
                localStorage.setItem('mustChangePassword', response.mustChangePassword.toString());

                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('login failed', error);
            return false;
        }

    }

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        localStorage.removeItem('mustChangePassword');
        console.log('user has logged out');
    };

    return (
        <AuthContext.Provider value={{ login, logout, token, user, loading }}>
            {children}
        </AuthContext.Provider>
    )

};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthContext;