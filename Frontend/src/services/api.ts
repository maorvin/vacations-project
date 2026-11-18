const api_base_url = 'http://localhost:5001/api'


// ==========================
// REGISTER
// ==========================
export const registerUser = async (userData:{
first_name: string;
  last_name: string;
  email: string;
  password: string;
}) => {
    const response = await fetch(`${api_base_url}/register`,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
})

const data = await response.json()

if(!response.ok){
    throw new Error(data.error||'Registration faild')
}
return data
}


// ==========================
// login
// ==========================

export const loginUser = async (credentials:{
    password: string,
    email: string
}) =>{

    const response  = await fetch(`${api_base_url}/login`, {
        method: 'POST',
        headers:{
                'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
    })

    const data = await response.json()
    if(!response.ok){
        throw new Error(data.error || 'Login faild');

    }
    return data

}
