import api from "./AxiosConnection"

export const AuthenticationService = async (userNameOrEmail, password) => {
    const response = await api.post('/authentication/Authenticate',
        {
            userNameOrEmail: userNameOrEmail,
            password: password,
        },
    );
    if (response.status === 200) {
        const data = response.data;
        console.log('Login success!', data)
        return data;
    } else {
        console.log('login failed :(')
        return null;
    }

}