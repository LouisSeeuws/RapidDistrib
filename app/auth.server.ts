import { getUserToken, logout } from "./session.server";

export const getOptionalUser = async ({request}: {request: Request}) => {
    
    const userToken = await getUserToken({request});
    if(userToken === undefined) return null;

    try {
        const response = await fetch('http://preprod-api.rapid-distrib.fr:3000/auth', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken.access_token}`
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        throw await logout({request})
    }

};