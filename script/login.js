async function login() {
    try {
        const inputEmail = document.querySelector(`main > .input > input[name="email"]`)
        const inputPassword = document.querySelector(`main > .input > input[name="password"]`)
    
        const email = inputEmail.value
        const password = inputPassword.value
    
        const response = await axios({
            method: 'POST',
            url: "https://api.chat.aquaco.work/member/login",
            data: {
                email,
                password
            }
        })
    
        const result = response.data
    
        if (!result.success) {
            alert(result.error)
            return
        }

        const token = localStorage.setItem("token", response.data.token)        

        location.href = "/index.html"
    } catch (error) {
        alert("unknown error!")
        console.error(error)
    }
}