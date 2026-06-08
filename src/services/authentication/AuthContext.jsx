import { createContext, useState } from 'react';
import { AuthenticationService } from '../../api/Endpoints';
import { jwtDecode } from 'jwt-decode'
import PropTypes from "prop-types";
import { useEffect } from 'react';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null)


    useEffect(() => {
        const tokenSavedInLocalStorage = localStorage.getItem('token');
        if (tokenSavedInLocalStorage) {
            const decodedUser = jwtDecode(tokenSavedInLocalStorage);
            setToken(tokenSavedInLocalStorage);
            setUser(decodedUser);
            //  let role = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            // setRole(decodedUser[role]);
            setRole(decodedUser["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
        }
        setLoading(false); 

    }, []); 


    const login = async (userNameOrEmail, password) => {
        try {
            const token = await AuthenticationService(userNameOrEmail, password);
            if (token) {
                setToken(token);
                const decodedUser = jwtDecode(token);
                console.log('this is the user: ', decodedUser);
                setUser(decodedUser);
                setRole(decodedUser["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                ])
                localStorage.setItem('token', token);
                return true;
            } else { return false; }


        } catch (error) {
            console.error('login failed', error);
            return false
        }

    }

    const logout = () => {
        setUser(null);
        setRole(null);
        setUser(null);
        localStorage.removeItem('token');
        console.log('user has logged out');
    };

    return (
        <AuthContext.Provider value={{ login, logout, token, user, role, loading }}>
            {children}
        </AuthContext.Provider>
    )

};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  

export default AuthContext;