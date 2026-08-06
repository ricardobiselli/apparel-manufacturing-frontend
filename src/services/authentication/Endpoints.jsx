import api from "../../api/AxiosConnection"

export const AuthenticationService = async (employeeIdNumber, password) => {
    const response = await api.post('/authentication/login',
        {
            employeeNumber: employeeIdNumber,
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